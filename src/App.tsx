import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChatbotWidget } from "@/components/chat/ChatbotWidget";
import { getStoredToken } from "@/features/auth/useAuth";
import { useMe } from "@/features/auth/useMe";
import { clearTokens } from "@/lib/api/client";
import { applyTheme, loadTheme } from "@/lib/theme";

// Public site
import HomePage from "./pages/public/HomePage";
import ProfilPage from "./pages/public/ProfilPage";
import TopicPage from "./pages/public/TopicPage";
import { TENTANG_TOPICS, AKADEMIK_TOPICS } from "./pages/public/topicSections";
import BeritaPublicPage from "./pages/public/BeritaPublicPage";
import BeritaDetailPage from "./pages/public/BeritaDetailPage";
import GaleriPublicPage from "./pages/public/GaleriPublicPage";
import PromosiFlyerPage from "./pages/public/PromosiFlyerPage";
import PromosiVideoPage from "./pages/public/PromosiVideoPage";
import ChallengePublicPage from "./pages/public/ChallengePublicPage";
import ChallengeDetailPage from "./pages/public/ChallengeDetailPage";
import VisiMisiPage from "./pages/public/VisiMisiPage";
import KewirausahaanPage from "./pages/public/KewirausahaanPage";
import PelatihanMicrosoftPage from "./pages/public/PelatihanMicrosoftPage";
import KurikulumObePage from "./pages/public/KurikulumObePage";
import DownloadPublicPage from "./pages/public/DownloadPublicPage";
import UjianDetailPage from "./pages/public/UjianDetailPage";
import KontakPage from "./pages/public/KontakPage";
import DaftarPage from "./pages/public/DaftarPage";
import KegiatanUjianPage from "./pages/public/KegiatanUjianPage";
import AkademikPage from "./pages/AkademikPage";

import LoginPage from "./pages/LoginPage";

// Internal app
import DashboardPage from "./pages/DashboardPage";
import DosenPage from "./pages/dosen/DosenPage";
import AlumniPage from "./pages/alumni/AlumniPage";
import AdministrasiPage from "./pages/administrasi/AdministrasiPage";
import PenelitianPage from "./pages/penelitian/PenelitianPage";
import SkripsiPage from "./pages/skripsi/SkripsiPage";
import SkripsiAlumniPage from "./pages/skripsi-alumni/SkripsiAlumniPage";
import SemproPage from "./pages/sempro/SemproPage";
import WisudawanPage from "./pages/wisudawan/WisudawanPage";
import SumbanganPage from "./pages/sumbangan/SumbanganPage";
import MicrosoftPage from "./pages/microsoft/MicrosoftPage";
// Admin content modules
import BeritaPage from "./pages/berita/BeritaPage";
import GaleriPage from "./pages/galeri/GaleriPage";
import PromosiPage from "./pages/promosi/PromosiPage";
import ChallengePage from "./pages/challenge/ChallengePage";
import DownloadPage from "./pages/download/DownloadPage";
import PendaftaranPage from "./pages/pendaftaran/PendaftaranPage";
import KurikulumPage from "./pages/kurikulum/KurikulumPage";
import KontenBerandaPage from "./pages/beranda/KontenBerandaPage";
import PengaturanSitusPage from "./pages/pengaturan/PengaturanSitusPage";
import PenggunaPage from "./pages/pengguna/PenggunaPage";
import AksesMenuPage from "./pages/akses/AksesMenuPage";
import NavMenuPage from "./pages/navMenu/NavMenuPage";
import UjianPage from "./pages/ujian/UjianPage";
// Kurikulum OBE module
import ObeDashboardPage from "./pages/obe/ObeDashboardPage";
import ObeKurikulumPage from "./pages/obe/ObeKurikulumPage";
import ObeCplPage from "./pages/obe/ObeCplPage";
import ObeCpmkPage from "./pages/obe/ObeCpmkPage";
import ObeMappingPage from "./pages/obe/ObeMappingPage";
import ObeRpsPage from "./pages/obe/ObeRpsPage";
import ObeLaporanPage from "./pages/obe/ObeLaporanPage";
import ObeIkPage from "./pages/obe/ObeIkPage";
import ObeAssessmentPage from "./pages/obe/ObeAssessmentPage";
import ObeNilaiPage from "./pages/obe/ObeNilaiPage";
import ObeAchievementPage from "./pages/obe/ObeAchievementPage";
import NotFound from "./pages/NotFound";
import { RouteAccess } from "./components/auth/RouteAccess";

// Route guard (layout route via <Outlet/>)
function RequireAuth() {
  if (!getStoredToken()) return <Navigate to="/admin/ptik/login" replace />;
  return <AuthGuard />;
}

function AuthGuard() {
  const { isLoading, isError, data } = useMe();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (isError || data === null) {
    clearTokens();
    return <Navigate to="/admin/ptik/login" replace />;
  }
  return <Outlet />;
}

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    applyTheme(loadTheme());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <ErrorBoundary>
            <Routes>
              {/* Public website */}
              <Route path="/" element={<HomePage />} />
              <Route path="/profil" element={<ProfilPage />} />
              <Route path="/tentang/:topic" element={<TopicPage topics={TENTANG_TOPICS} basePath="/tentang" />} />
              <Route path="/akademik/:topic" element={<TopicPage topics={AKADEMIK_TOPICS} basePath="/akademik" />} />
              <Route path="/berita" element={<BeritaPublicPage />} />
              <Route path="/berita/:id" element={<BeritaDetailPage />} />
              <Route path="/galeri" element={<GaleriPublicPage />} />
              <Route path="/promosi/flyer" element={<PromosiFlyerPage />} />
              <Route path="/promosi/video" element={<PromosiVideoPage />} />
              <Route path="/challenge" element={<ChallengePublicPage />} />
              <Route path="/challenge/:id" element={<ChallengeDetailPage />} />
              <Route path="/visi-misi" element={<VisiMisiPage />} />
              <Route path="/akademik" element={<AkademikPage />} />
              <Route path="/akademik/ujian" element={<KegiatanUjianPage />} />
              <Route path="/akademik/ujian/:id" element={<UjianDetailPage />} />
              <Route path="/kewirausahaan" element={<KewirausahaanPage />} />
              <Route path="/pelatihan-microsoft" element={<PelatihanMicrosoftPage />} />
              <Route path="/kurikulum-obe" element={<KurikulumObePage />} />
              <Route path="/download" element={<DownloadPublicPage />} />
              <Route path="/kontak" element={<KontakPage />} />
              <Route path="/daftar" element={<DaftarPage />} />
              <Route path="/admin/ptik/login" element={<LoginPage />} />
              <Route path="/login" element={<Navigate to="/admin/ptik/login" replace />} />

              {/* Internal app — requires auth. RouteAccess gates each page by
                  role/menu config (admins bypass; dosen/mahasiswa are limited). */}
              <Route element={<RequireAuth />}>
                <Route path="/dashboard" element={<RouteAccess menu="dashboard"><DashboardPage /></RouteAccess>} />
                <Route path="/dosen" element={<RouteAccess menu="dosen"><DosenPage /></RouteAccess>} />
                <Route path="/alumni" element={<RouteAccess menu="alumni"><AlumniPage /></RouteAccess>} />
                <Route path="/administrasi" element={<RouteAccess menu="administrasi"><AdministrasiPage /></RouteAccess>} />
                <Route path="/penelitian" element={<RouteAccess menu="penelitian"><PenelitianPage /></RouteAccess>} />
                <Route path="/skripsi" element={<RouteAccess menu="skripsi"><SkripsiPage /></RouteAccess>} />
                <Route path="/skripsi-alumni" element={<RouteAccess menu="skripsi-alumni"><SkripsiAlumniPage /></RouteAccess>} />
                <Route path="/sempro" element={<RouteAccess menu="sempro"><SemproPage /></RouteAccess>} />
                <Route path="/wisudawan" element={<RouteAccess menu="wisudawan"><WisudawanPage /></RouteAccess>} />
                <Route path="/sumbangan" element={<RouteAccess menu="sumbangan"><SumbanganPage /></RouteAccess>} />
                <Route path="/microsoft" element={<RouteAccess menu="microsoft"><MicrosoftPage /></RouteAccess>} />
                <Route path="/kelola/ujian" element={<RouteAccess menu="ujian"><UjianPage /></RouteAccess>} />
                <Route path="/kelola/berita" element={<RouteAccess menu="berita"><BeritaPage /></RouteAccess>} />
                <Route path="/kelola/galeri" element={<RouteAccess menu="galeri"><GaleriPage /></RouteAccess>} />
                <Route path="/kelola/promosi" element={<RouteAccess menu="promosi"><PromosiPage /></RouteAccess>} />
                <Route path="/kelola/challenge" element={<RouteAccess menu="challenge"><ChallengePage /></RouteAccess>} />
                <Route path="/kelola/download" element={<RouteAccess menu="download"><DownloadPage /></RouteAccess>} />
                <Route path="/kelola/pendaftaran" element={<RouteAccess menu="pendaftaran"><PendaftaranPage /></RouteAccess>} />
                <Route path="/kelola/kurikulum" element={<RouteAccess menu="kurikulum"><KurikulumPage /></RouteAccess>} />
                {/* Kurikulum OBE — nested; RouteAccess menu keys mirror the sidebar */}
                <Route path="/kelola/obe" element={<RouteAccess menu="obe"><ObeDashboardPage /></RouteAccess>} />
                <Route path="/kelola/obe/kurikulum" element={<RouteAccess menu="obe-kurikulum"><ObeKurikulumPage /></RouteAccess>} />
                <Route path="/kelola/obe/cpl" element={<RouteAccess menu="obe-cpl"><ObeCplPage /></RouteAccess>} />
                <Route path="/kelola/obe/ik" element={<RouteAccess menu="obe-ik"><ObeIkPage /></RouteAccess>} />
                <Route path="/kelola/obe/cpmk" element={<RouteAccess menu="obe-cpmk"><ObeCpmkPage /></RouteAccess>} />
                <Route path="/kelola/obe/mapping" element={<RouteAccess menu="obe-mapping"><ObeMappingPage /></RouteAccess>} />
                <Route path="/kelola/obe/assessment" element={<RouteAccess menu="obe-assessment"><ObeAssessmentPage /></RouteAccess>} />
                <Route path="/kelola/obe/rps" element={<RouteAccess menu="obe-rps"><ObeRpsPage /></RouteAccess>} />
                <Route path="/kelola/obe/nilai" element={<RouteAccess menu="obe-nilai"><ObeNilaiPage /></RouteAccess>} />
                <Route path="/kelola/obe/achievement" element={<RouteAccess menu="obe-achievement"><ObeAchievementPage /></RouteAccess>} />
                <Route path="/kelola/obe/laporan" element={<RouteAccess menu="obe-laporan"><ObeLaporanPage /></RouteAccess>} />
                <Route path="/kelola/beranda" element={<RouteAccess menu="beranda"><KontenBerandaPage /></RouteAccess>} />
                <Route path="/kelola/pengguna" element={<RouteAccess adminOnly><PenggunaPage /></RouteAccess>} />
                <Route path="/kelola/akses" element={<RouteAccess adminOnly><AksesMenuPage /></RouteAccess>} />
                <Route path="/kelola/navigasi" element={<RouteAccess adminOnly><NavMenuPage /></RouteAccess>} />
                <Route path="/kelola/pengaturan" element={<RouteAccess adminOnly><PengaturanSitusPage /></RouteAccess>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatbotWidget />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
