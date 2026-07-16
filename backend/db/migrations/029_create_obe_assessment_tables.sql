-- +goose Up
-- +goose StatementBegin

-- ── OBE Assessment & Achievement ─────────────────────────────────────────────
-- Measures CPMK/CPL/IK attainment from student scores. Flow:
--   assessment → CPMK → CPL → IK (each via explicit mappings)
-- There is NO students/classes master data in this system (verified: users only
-- carries login accounts), so the module keeps its own per-class roster
-- (obe_classes + obe_class_students). Lecturers reuse the existing dosens table.

-- Default attainment threshold (%) per curriculum. A CPMK's own `target` column
-- (e.g. "80%") wins when set; CPL/IK statuses always use this curriculum value.
ALTER TABLE obe_curriculums ADD COLUMN threshold INTEGER NOT NULL DEFAULT 70;

-- Indikator Kinerja (performance indicators), children of a CPL (1 CPL → many IK).
CREATE TABLE obe_indicators (
    id         TEXT PRIMARY KEY,                        -- uuid as text, minted in Go
    cpl_id     TEXT NOT NULL REFERENCES obe_cpl(id) ON DELETE CASCADE,
    kode       TEXT NOT NULL DEFAULT '',                -- e.g. "IK-1.1"
    deskripsi  TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_indicators_cpl ON obe_indicators (cpl_id);

CREATE TRIGGER trg_obe_indicators_updated_at
    BEFORE UPDATE ON obe_indicators
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- IK ↔ CPMK mapping (many-to-many): which CPMKs evidence an indicator. This is
-- what lets two IKs under one CPL show different achievement values.
CREATE TABLE obe_ik_cpmk (
    ik_id      TEXT NOT NULL REFERENCES obe_indicators(id) ON DELETE CASCADE,
    cpmk_id    TEXT NOT NULL REFERENCES obe_cpmk(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ik_id, cpmk_id)
);

CREATE INDEX idx_obe_ik_cpmk_cpmk ON obe_ik_cpmk (cpmk_id);

-- A class (rombongan belajar) of a course in an academic year.
CREATE TABLE obe_classes (
    id             TEXT PRIMARY KEY,
    course_id      TEXT NOT NULL REFERENCES obe_courses(id) ON DELETE CASCADE,
    nama           TEXT NOT NULL,                       -- e.g. "A", "B"
    tahun_akademik TEXT NOT NULL DEFAULT '',            -- e.g. "2024/2025"
    periode        TEXT NOT NULL DEFAULT 'ganjil',      -- ganjil | genap
    dosen_id       TEXT REFERENCES dosens(id) ON DELETE SET NULL,  -- pengampu (nullable)
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_classes_course ON obe_classes (course_id);
-- Backs dosen_id ON DELETE SET NULL (avoids a seq scan when a dosen is removed).
CREATE INDEX idx_obe_classes_dosen ON obe_classes (dosen_id);

CREATE TRIGGER trg_obe_classes_updated_at
    BEFORE UPDATE ON obe_classes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Per-class student roster (module-local; no global student master data exists).
CREATE TABLE obe_class_students (
    id         TEXT PRIMARY KEY,
    class_id   TEXT NOT NULL REFERENCES obe_classes(id) ON DELETE CASCADE,
    npm        TEXT NOT NULL DEFAULT '',
    nama       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_class_students_class ON obe_class_students (class_id);
-- Same NPM may not appear twice in one class (blank NPMs are allowed to repeat).
CREATE UNIQUE INDEX uq_obe_class_students_npm ON obe_class_students (class_id, npm) WHERE npm <> '';

CREATE TRIGGER trg_obe_class_students_updated_at
    BEFORE UPDATE ON obe_class_students
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Assessment components of a course (Tugas/UTS/UAS/…). Weights are percentages;
-- the service enforces that a course+tahun_akademik totals at most 100 and the
-- achievement engine reports when the total is not exactly 100.
CREATE TABLE obe_assessments (
    id             TEXT PRIMARY KEY,
    course_id      TEXT NOT NULL REFERENCES obe_courses(id) ON DELETE CASCADE,
    nama           TEXT NOT NULL,
    jenis          TEXT NOT NULL DEFAULT 'tugas',       -- tugas|quiz|praktikum|project|uts|uas|presentasi
    bobot          INTEGER NOT NULL DEFAULT 0,          -- weight in percent
    semester       TEXT NOT NULL DEFAULT '',            -- optional label, e.g. "Ganjil"
    tahun_akademik TEXT NOT NULL DEFAULT '',            -- e.g. "2024/2025"
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_obe_assessments_course ON obe_assessments (course_id);

CREATE TRIGGER trg_obe_assessments_updated_at
    BEFORE UPDATE ON obe_assessments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Assessment ↔ CPMK mapping (many-to-many): which CPMKs an assessment measures.
CREATE TABLE obe_assessment_cpmk (
    assessment_id TEXT NOT NULL REFERENCES obe_assessments(id) ON DELETE CASCADE,
    cpmk_id       TEXT NOT NULL REFERENCES obe_cpmk(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (assessment_id, cpmk_id)
);

CREATE INDEX idx_obe_assessment_cpmk_cpmk ON obe_assessment_cpmk (cpmk_id);

-- One score per student per assessment (0..100).
CREATE TABLE obe_student_scores (
    id            TEXT PRIMARY KEY,
    student_id    TEXT NOT NULL REFERENCES obe_class_students(id) ON DELETE CASCADE,
    assessment_id TEXT NOT NULL REFERENCES obe_assessments(id) ON DELETE CASCADE,
    score         NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, assessment_id)
);

-- The UNIQUE(student_id, assessment_id) covers student-side lookups; this one
-- backs the assessment-side (cascade deletes from obe_assessments).
CREATE INDEX idx_obe_student_scores_assessment ON obe_student_scores (assessment_id);

CREATE TRIGGER trg_obe_student_scores_updated_at
    BEFORE UPDATE ON obe_student_scores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Materialized achievement results ─────────────────────────────────────────
-- Recomputed (wipe + insert per student) by the achievement engine on every
-- score save and on results reads, so they never go stale. Kept as tables (not
-- views) so external tools/reports can query them directly.

CREATE TABLE obe_cpmk_results (
    id         TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES obe_class_students(id) ON DELETE CASCADE,
    cpmk_id    TEXT NOT NULL REFERENCES obe_cpmk(id) ON DELETE CASCADE,
    nilai      NUMERIC(5,2) NOT NULL DEFAULT 0,         -- attainment in percent
    status     TEXT NOT NULL DEFAULT 'belum_tercapai',  -- tercapai | belum_tercapai
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, cpmk_id)
);

CREATE INDEX idx_obe_cpmk_results_cpmk ON obe_cpmk_results (cpmk_id);

CREATE TABLE obe_cpl_results (
    id         TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES obe_class_students(id) ON DELETE CASCADE,
    cpl_id     TEXT NOT NULL REFERENCES obe_cpl(id) ON DELETE CASCADE,
    nilai      NUMERIC(5,2) NOT NULL DEFAULT 0,
    status     TEXT NOT NULL DEFAULT 'belum_tercapai',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, cpl_id)
);

CREATE INDEX idx_obe_cpl_results_cpl ON obe_cpl_results (cpl_id);

CREATE TABLE obe_ik_results (
    id         TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES obe_class_students(id) ON DELETE CASCADE,
    ik_id      TEXT NOT NULL REFERENCES obe_indicators(id) ON DELETE CASCADE,
    nilai      NUMERIC(5,2) NOT NULL DEFAULT 0,
    status     TEXT NOT NULL DEFAULT 'belum_tercapai',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, ik_id)
);

CREATE INDEX idx_obe_ik_results_ik ON obe_ik_results (ik_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS obe_ik_results;
DROP TABLE IF EXISTS obe_cpl_results;
DROP TABLE IF EXISTS obe_cpmk_results;
DROP TABLE IF EXISTS obe_student_scores;
DROP TABLE IF EXISTS obe_assessment_cpmk;
DROP TABLE IF EXISTS obe_assessments;
DROP TABLE IF EXISTS obe_class_students;
DROP TABLE IF EXISTS obe_classes;
DROP TABLE IF EXISTS obe_ik_cpmk;
DROP TABLE IF EXISTS obe_indicators;
ALTER TABLE obe_curriculums DROP COLUMN IF EXISTS threshold;
-- +goose StatementEnd
