-- +goose Up
-- +goose StatementBegin

-- ── Kurikulum OBE (Outcome-Based Education) ──────────────────────────────────
-- A self-contained set of tables for the OBE module. `obe_courses` is the module's
-- own "mata kuliah" table (none existed before — the legacy Kelola Kurikulum page
-- stores courses as text lines in site_contents, which cannot carry the relations
-- OBE needs). All tables are curriculum-scoped and cascade on curriculum delete.

CREATE TABLE obe_curriculums (
    id              TEXT PRIMARY KEY,                  -- uuid as text, minted in Go
    nama            TEXT NOT NULL,
    tahun           TEXT NOT NULL DEFAULT '',          -- academic year, e.g. "2024"
    nomor_sk        TEXT NOT NULL DEFAULT '',
    tanggal_berlaku TEXT NOT NULL DEFAULT '',          -- ISO date string (matches ujians' text-date convention)
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    deskripsi       TEXT NOT NULL DEFAULT '',
    buku_url        TEXT NOT NULL DEFAULT '',          -- Buku Kurikulum document (URL from /upload)
    struktur_url    TEXT NOT NULL DEFAULT '',          -- Struktur Kurikulum document (URL from /upload)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- At most one active curriculum at a time (partial unique index on the true rows).
CREATE UNIQUE INDEX uq_obe_curriculums_active ON obe_curriculums (is_active) WHERE is_active;

CREATE TRIGGER trg_obe_curriculums_updated_at
    BEFORE UPDATE ON obe_curriculums
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Mata kuliah, scoped to a curriculum and placed in a semester (1..8).
CREATE TABLE obe_courses (
    id            TEXT PRIMARY KEY,
    curriculum_id TEXT NOT NULL REFERENCES obe_curriculums(id) ON DELETE CASCADE,
    kode          TEXT NOT NULL DEFAULT '',
    nama          TEXT NOT NULL,
    sks           INTEGER NOT NULL DEFAULT 0,
    semester      INTEGER NOT NULL DEFAULT 1,          -- 1..8
    deskripsi     TEXT NOT NULL DEFAULT '',
    rps_url       TEXT NOT NULL DEFAULT '',            -- optional RPS document download
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_courses_curriculum ON obe_courses (curriculum_id, semester);

CREATE TRIGGER trg_obe_courses_updated_at
    BEFORE UPDATE ON obe_courses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Capaian Pembelajaran Lulusan (Program Learning Outcomes), scoped to a curriculum.
CREATE TABLE obe_cpl (
    id            TEXT PRIMARY KEY,
    curriculum_id TEXT NOT NULL REFERENCES obe_curriculums(id) ON DELETE CASCADE,
    kode          TEXT NOT NULL DEFAULT '',
    deskripsi     TEXT NOT NULL,
    kategori      TEXT NOT NULL DEFAULT 'pengetahuan', -- sikap | pengetahuan | keterampilan_umum | keterampilan_khusus
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_cpl_curriculum ON obe_cpl (curriculum_id);

CREATE TRIGGER trg_obe_cpl_updated_at
    BEFORE UPDATE ON obe_cpl
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Capaian Pembelajaran Mata Kuliah (Course Learning Outcomes); 1 course → many CPMK.
CREATE TABLE obe_cpmk (
    id          TEXT PRIMARY KEY,
    course_id   TEXT NOT NULL REFERENCES obe_courses(id) ON DELETE CASCADE,
    kode        TEXT NOT NULL DEFAULT '',
    deskripsi   TEXT NOT NULL,
    level_bloom TEXT NOT NULL DEFAULT '',              -- Bloom level, e.g. C1..C6
    target      TEXT NOT NULL DEFAULT '',              -- target achievement, e.g. "80%"
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_cpmk_course ON obe_cpmk (course_id);

CREATE TRIGGER trg_obe_cpmk_updated_at
    BEFORE UPDATE ON obe_cpmk
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CPL ↔ CPMK mapping (many-to-many). Pure join table; no updated_at needed.
CREATE TABLE obe_cpl_cpmk (
    cpl_id     TEXT NOT NULL REFERENCES obe_cpl(id) ON DELETE CASCADE,
    cpmk_id    TEXT NOT NULL REFERENCES obe_cpmk(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cpl_id, cpmk_id)
);

CREATE INDEX idx_obe_cpl_cpmk_cpmk ON obe_cpl_cpmk (cpmk_id);

-- Rencana Pembelajaran Semester: weekly plan rows for a course, optionally tied to a CPMK.
CREATE TABLE obe_rps (
    id         TEXT PRIMARY KEY,
    course_id  TEXT NOT NULL REFERENCES obe_courses(id) ON DELETE CASCADE,
    minggu     INTEGER NOT NULL DEFAULT 1,
    cpmk_id    TEXT REFERENCES obe_cpmk(id) ON DELETE SET NULL,  -- nullable
    materi     TEXT NOT NULL DEFAULT '',
    metode     TEXT NOT NULL DEFAULT '',
    assessment TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_rps_course ON obe_rps (course_id, minggu);

CREATE TRIGGER trg_obe_rps_updated_at
    BEFORE UPDATE ON obe_rps
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS obe_rps;
DROP TABLE IF EXISTS obe_cpl_cpmk;
DROP TABLE IF EXISTS obe_cpmk;
DROP TABLE IF EXISTS obe_cpl;
DROP TABLE IF EXISTS obe_courses;
DROP TABLE IF EXISTS obe_curriculums;
-- +goose StatementEnd
