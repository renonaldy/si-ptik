package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	_ "time/tzdata" // embed zoneinfo (Alpine has none)

	"ptik/internal/config"
	"ptik/internal/domain/administrasi"
	"ptik/internal/domain/alumni"
	"ptik/internal/domain/auth"
	"ptik/internal/domain/berita"
	"ptik/internal/domain/content"
	"ptik/internal/domain/dosen"
	"ptik/internal/domain/download"
	"ptik/internal/domain/galeri"
	"ptik/internal/domain/menuaccess"
	"ptik/internal/domain/microsoft"
	"ptik/internal/domain/pendaftaran"
	"ptik/internal/domain/penelitian"
	"ptik/internal/domain/sempro"
	"ptik/internal/domain/skripsi"
	"ptik/internal/domain/skripsialumni"
	"ptik/internal/domain/sumbangan"
	"ptik/internal/domain/ujian"
	"ptik/internal/domain/user"
	"ptik/internal/domain/wisudawan"
	"ptik/internal/handler"
	mw "ptik/internal/handler/middleware"
	pgRepo "ptik/internal/repository/postgres"
	"ptik/pkg/jwtutil"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ── Config ──
	cfg, err := config.Load()
	if err != nil {
		slog.Error("config load failed", "err", err)
		os.Exit(1)
	}

	// ── Database (pgxpool) ──
	poolCfg, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		slog.Error("db config parse failed", "err", err)
		os.Exit(1)
	}
	poolCfg.MaxConns = 25
	poolCfg.MinConns = 5
	poolCfg.MaxConnLifetime = time.Hour
	poolCfg.MaxConnIdleTime = 30 * time.Minute
	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		slog.Error("db pool init failed", "err", err)
		os.Exit(1)
	}
	if err := pool.Ping(ctx); err != nil {
		slog.Error("db ping failed", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	// ── JWT ──
	jwt := jwtutil.New(jwtutil.Config{
		Secret:          []byte(cfg.JWTSecret),
		AccessTokenTTL:  cfg.AccessTokenTTL,
		RefreshTokenTTL: cfg.RefreshTokenTTL,
	})

	// ── Repositories ──
	userRepo := pgRepo.NewUserRepository(pool)
	refreshTokenRepo := pgRepo.NewRefreshTokenRepository(pool)
	dosenRepo := pgRepo.NewDosenRepository(pool)
	alumniRepo := pgRepo.NewAlumniRepository(pool)
	administrasiRepo := pgRepo.NewAdministrasiRepository(pool)
	penelitianRepo := pgRepo.NewPenelitianRepository(pool)
	skripsiRepo := pgRepo.NewSkripsiRepository(pool)
	skripsiAlumniRepo := pgRepo.NewSkripsiAlumniRepository(pool)
	semproRepo := pgRepo.NewSemproRepository(pool)
	wisudawanRepo := pgRepo.NewWisudawanRepository(pool)
	sumbanganRepo := pgRepo.NewSumbanganRepository(pool)
	microsoftRepo := pgRepo.NewMicrosoftRepository(pool)
	beritaRepo := pgRepo.NewBeritaRepository(pool)
	galeriRepo := pgRepo.NewGaleriRepository(pool)
	downloadRepo := pgRepo.NewDownloadRepository(pool)
	pendaftaranRepo := pgRepo.NewPendaftaranRepository(pool)
	contentRepo := pgRepo.NewContentRepository(pool)
	ujianRepo := pgRepo.NewUjianRepository(pool)
	menuAccessRepo := pgRepo.NewMenuAccessRepository(pool)

	// ── Services ──
	userSvc := user.NewService(userRepo)
	authSvc := auth.NewService(userRepo, refreshTokenRepo, jwt, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)
	dosenSvc := dosen.NewService(dosenRepo)
	alumniSvc := alumni.NewService(alumniRepo)
	administrasiSvc := administrasi.NewService(administrasiRepo)
	penelitianSvc := penelitian.NewService(penelitianRepo)
	skripsiSvc := skripsi.NewService(skripsiRepo)
	skripsiAlumniSvc := skripsialumni.NewService(skripsiAlumniRepo)
	ujianSvc := ujian.NewService(ujianRepo)
	semproSvc := sempro.NewService(semproRepo, ujianSvc) // sempro auto-syncs into Jadwal Ujian
	wisudawanSvc := wisudawan.NewService(wisudawanRepo)
	sumbanganSvc := sumbangan.NewService(sumbanganRepo)
	microsoftSvc := microsoft.NewService(microsoftRepo)
	beritaSvc := berita.NewService(beritaRepo)
	galeriSvc := galeri.NewService(galeriRepo)
	downloadSvc := download.NewService(downloadRepo)
	pendaftaranSvc := pendaftaran.NewService(pendaftaranRepo)
	contentSvc := content.NewService(contentRepo)
	menuAccessSvc := menuaccess.NewService(menuAccessRepo)

	// ── Handlers ──
	authHandler := handler.NewAuthHandler(authSvc)
	userHandler := handler.NewUserHandler(userSvc)
	dosenHandler := handler.NewDosenHandler(dosenSvc)
	alumniHandler := handler.NewAlumniHandler(alumniSvc)
	administrasiHandler := handler.NewAdministrasiHandler(administrasiSvc)
	penelitianHandler := handler.NewPenelitianHandler(penelitianSvc)
	skripsiHandler := handler.NewSkripsiHandler(skripsiSvc)
	skripsiAlumniHandler := handler.NewSkripsiAlumniHandler(skripsiAlumniSvc)
	semproHandler := handler.NewSemproHandler(semproSvc)
	wisudawanHandler := handler.NewWisudawanHandler(wisudawanSvc)
	sumbanganHandler := handler.NewSumbanganHandler(sumbanganSvc)
	microsoftHandler := handler.NewMicrosoftHandler(microsoftSvc)
	beritaHandler := handler.NewBeritaHandler(beritaSvc)
	galeriHandler := handler.NewGaleriHandler(galeriSvc)
	downloadHandler := handler.NewDownloadHandler(downloadSvc)
	pendaftaranHandler := handler.NewPendaftaranHandler(pendaftaranSvc)
	contentHandler := handler.NewContentHandler(contentSvc)
	ujianHandler := handler.NewUjianHandler(ujianSvc)
	menuAccessHandler := handler.NewMenuAccessHandler(menuAccessSvc)
	uploadHandler := handler.NewUploadHandler(cfg.UploadDir, cfg.PublicBaseURL)

	// ── Router ──
	authMiddleware := mw.NewAuthMiddleware(jwt)

	r := chi.NewRouter()
	r.Use(mw.CORS(cfg.AllowedOrigins))
	r.Use(mw.RequestID)
	r.Use(mw.Logger)
	r.Use(mw.Recover)
	r.Use(chimw.RealIP)

	// Health — no auth
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if err := pool.Ping(r.Context()); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"unhealthy","db":"%s"}`, err.Error())
			return
		}
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"ok"}`)
	})

	// Uploaded files — public read (served from local disk)
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.UploadDir))))

	r.Route("/api/v1", func(r chi.Router) {
		// Public — no auth
		r.Route("/auth", authHandler.Routes)

		// Public site content (read) + inbound submissions — no auth
		r.Route("/public", func(r chi.Router) {
			r.Get("/berita", beritaHandler.List)
			r.Get("/berita/{id}", beritaHandler.Get)
			r.Get("/galeri", galeriHandler.List)
			r.Get("/dosen", dosenHandler.PublicList)
			r.Get("/download", downloadHandler.List)
			r.Get("/content", contentHandler.List)
			r.Get("/ujian", ujianHandler.List)
			r.Get("/ujian/{id}", ujianHandler.Get)
			r.Post("/pendaftaran", pendaftaranHandler.Create)          // Daftar / Kontak forms
			r.Post("/pelatihan-microsoft", microsoftHandler.PublicCreate) // public training registration
			r.Post("/upload", uploadHandler.Upload)                    // public upload (e.g. bukti pembayaran)
		})

		// Protected — requires a valid access token. Reads are open to any
		// authenticated user; writes need an admin role OR a per-menu CRUD grant
		// (dosen/mahasiswa), resolved from the menu-access config by CRUDGuard.
		canWrite := func(ctx context.Context, role, menuKey string) (bool, error) {
			if menuKey == "upload" { // shared endpoint: allow if the role can write anything
				return menuAccessSvc.HasAnyWrite(ctx, role)
			}
			return menuAccessSvc.CanWrite(ctx, role, menuKey)
		}
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.Authenticate)
			r.Use(mw.CRUDGuard([]string{"super_admin", "admin"}, canWrite))
			r.Route("/users", userHandler.Routes)
			r.Post("/upload", uploadHandler.Upload)
			r.Route("/dosen", dosenHandler.Routes)
			r.Route("/alumni", alumniHandler.Routes)
			r.Route("/administrasi", administrasiHandler.Routes)
			r.Route("/penelitian", penelitianHandler.Routes)
			r.Route("/skripsi", skripsiHandler.Routes)
			r.Route("/skripsi-alumni", skripsiAlumniHandler.Routes)
			r.Route("/sempro", semproHandler.Routes)
			r.Route("/wisudawan", wisudawanHandler.Routes)
			r.Route("/sumbangan", sumbanganHandler.Routes)
			r.Route("/microsoft", microsoftHandler.Routes)
			r.Route("/berita", beritaHandler.Routes)
			r.Route("/galeri", galeriHandler.Routes)
			r.Route("/download", downloadHandler.Routes)
			r.Route("/pendaftaran", pendaftaranHandler.Routes)
			r.Route("/content", contentHandler.Routes)
			r.Route("/ujian", ujianHandler.Routes)
			r.Route("/menu-access", menuAccessHandler.Routes)
		})
	})

	// ── Server + graceful shutdown ──
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}
	go func() {
		slog.Info("server starting", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	slog.Info("shutting down...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("server shutdown error", "err", err)
	}
	slog.Info("server stopped")
}
