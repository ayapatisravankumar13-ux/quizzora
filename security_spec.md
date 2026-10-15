# Security Specification — QUIZZORA Quiz Competition

## 1. Data Invariants
1. Students cannot read other students' attempts or scores.
2. The global Quiz Access Code and answer keys must never be readable by unauthenticated users or normal students via client Firestore.
3. Only verified administrators can view the full marks list, export CSVs, update competition settings, or reset student attempts.
4. The primary administrator `ayapatisravankumar13@gmail.com` is bootstrapped with admin privileges.
5. Attempt documents have immutable roll numbers and emails; finalized attempts cannot be tampered with.

## 2. The "Dirty Dozen" Attack Vectors Evaluated
1. Attacker attempts to list all documents in `/attempts` to scrape college marks -> Denied unless admin.
2. Attacker attempts to read `/settings/config` to discover the secret quiz access code -> Denied unless admin.
3. Attacker attempts to forge their own score to 30/30 in `/attempts/{attemptId}` -> Denied, student cannot write directly or alter completed scores.
4. Attacker attempts to read other students' roll numbers and names in `/students` -> Denied for non-admin list queries.
5. Attacker attempts to write a fake admin document into `/admins/{attackerUid}` -> Denied, self-assignment forbidden.
6. Attacker attempts to delete or reset another student's quiz attempt -> Denied, only admins can delete/reset.
7. Attacker attempts to spoof `request.auth.token.email` without verification -> Denied, verified email checked.
8. Attacker attempts to overwrite audit logs in `/auditLogs/{logId}` -> Denied unless admin.
9. Attacker attempts to extend their timer deadline in Firestore -> Denied, deadlines are server-managed.
10. Attacker attempts to inject 1MB strings into document IDs -> Denied via `isValidId()`.
11. Attacker attempts to modify answers after status is 'submitted' -> Denied via terminal state locking.
12. Unauthenticated user attempts any read or write -> Denied by default-deny catch-all.
