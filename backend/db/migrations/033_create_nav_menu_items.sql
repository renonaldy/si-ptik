-- +goose Up
-- +goose StatementBegin

-- Admin-managed public navbar. `path` is the route for type='link', or the
-- active-highlight prefix ("base") for type='dropdown'. `items` (only used by
-- type='dropdown') is a JSONB array of {label, to, external} leaves.
CREATE TABLE nav_menu_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'link',
    label TEXT NOT NULL DEFAULT '',
    path TEXT NOT NULL DEFAULT '',
    external BOOLEAN NOT NULL DEFAULT FALSE,
    items JSONB NOT NULL DEFAULT '[]',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_nav_menu_items_updated_at
    BEFORE UPDATE ON nav_menu_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed the navbar as it exists today (PublicLayout.tsx's hardcoded NAV) so
-- nothing changes on deploy until an admin edits it.
INSERT INTO nav_menu_items (id, type, label, path, external, items, order_index) VALUES
('nav-beranda', 'link', 'Beranda', '/', FALSE, '[]', 0),
('nav-tentang', 'dropdown', 'Tentang', '/tentang', FALSE, '[
    {"label": "Sambutan", "to": "/tentang/sambutan", "external": false},
    {"label": "Profil Program Studi", "to": "/tentang/profil", "external": false},
    {"label": "Visi, Misi & Tujuan", "to": "/visi-misi", "external": false},
    {"label": "Logo", "to": "/tentang/logo", "external": false},
    {"label": "Akreditasi", "to": "/tentang/akreditasi", "external": false},
    {"label": "Dosen", "to": "/tentang/dosen", "external": false},
    {"label": "Lokasi Kampus", "to": "/tentang/lokasi", "external": false},
    {"label": "Media Sosial", "to": "/tentang/media-sosial", "external": false}
]', 1),
('nav-akademik', 'dropdown', 'Akademik', '/akademik', FALSE, '[
    {"label": "Informasi Akademik", "to": "/akademik", "external": false},
    {"label": "Kurikulum", "to": "/akademik/kurikulum", "external": false},
    {"label": "Kegiatan Ujian", "to": "/akademik/ujian", "external": false},
    {"label": "Profil Lulusan", "to": "/akademik/profil-lulusan", "external": false},
    {"label": "Prospek Kerja", "to": "/akademik/prospek-kerja", "external": false}
]', 2),
('nav-pengembangan', 'dropdown', 'Pengembangan', '/pelatihan-microsoft', FALSE, '[
    {"label": "Pelatihan Microsoft", "to": "/pelatihan-microsoft", "external": false},
    {"label": "Kurikulum OBE", "to": "/kurikulum-obe", "external": false},
    {"label": "Kewirausahaan", "to": "https://kewirausahaanptik.my.id/", "external": true},
    {"label": "Hattatik", "to": "https://hattatik.com/", "external": true},
    {"label": "Challenge", "to": "/challenge", "external": false}
]', 3),
('nav-promosi', 'dropdown', 'Promosi', '/promosi', FALSE, '[
    {"label": "Flyer", "to": "/promosi/flyer", "external": false},
    {"label": "Video Promosi", "to": "/promosi/video", "external": false}
]', 4),
('nav-berita', 'link', 'Berita', '/berita', FALSE, '[]', 5),
('nav-galeri', 'link', 'Galeri', '/galeri', FALSE, '[]', 6),
('nav-kontak', 'link', 'Kontak', '/kontak', FALSE, '[]', 7);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_nav_menu_items_updated_at ON nav_menu_items;
DROP TABLE IF EXISTS nav_menu_items;
-- +goose StatementEnd
