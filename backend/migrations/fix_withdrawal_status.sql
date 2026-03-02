-- Fix corrupted status values from escaped-quote bug in old finance.js
-- This cleanses any rows where status was stored as literal 'PENDING' (with quotes)
UPDATE withdrawal_requests SET status = 'PENDING'    WHERE status = '''PENDING''';
UPDATE withdrawal_requests SET status = 'APPROVED'   WHERE status = '''APPROVED''';
UPDATE withdrawal_requests SET status = 'REJECTED'   WHERE status = '''REJECTED''';
UPDATE transactions SET status = 'PENDING'           WHERE status = '''PENDING''';
UPDATE transactions SET type   = 'WITHDRAWAL'        WHERE type   = '''WITHDRAWAL''';
