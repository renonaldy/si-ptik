-- +goose Up
-- +goose StatementBegin
-- Repurpose `microsofts` from an admin-managed list into a public training
-- registration awaiting admin approval: registrants submit nama + npm + jenis +
-- bukti pembayaran; admin/super_admin approve or reject.
ALTER TABLE microsofts
    ADD COLUMN npm TEXT NOT NULL DEFAULT '',
    ADD COLUMN bukti_pembayaran TEXT NOT NULL DEFAULT '',
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE microsofts
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS tanggal_pelatihan;

CREATE INDEX idx_microsofts_status ON microsofts (status);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_microsofts_status;

ALTER TABLE microsofts
    ADD COLUMN email TEXT NOT NULL DEFAULT '',
    ADD COLUMN tanggal_pelatihan TEXT NOT NULL DEFAULT '';

ALTER TABLE microsofts
    DROP COLUMN IF EXISTS npm,
    DROP COLUMN IF EXISTS bukti_pembayaran,
    DROP COLUMN IF EXISTS status;
-- +goose StatementEnd
