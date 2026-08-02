# Security Specification - Newsletter Subscribers

## 1. Data Invariants
- A subscriber must have a valid email.
- `subscribedAt` must be a server timestamp.
- `status` must be one of ['active', 'unsubscribed'].
- `email` must be unique (checked by using email as document ID or a query, but for simple creation we'll use auto-gen ID and trust the admin view can handle duplicates or we can use email as ID). Using email as ID is safer for uniqueness.

## 2. The "Dirty Dozen" Payloads
1. **Ghost Field**: `{"email": "test@example.com", "status": "active", "isVerified": true}` -> REJECTED (Strict keys).
2. **Invalid Email**: `{"email": "not-an-email", "status": "active"}` -> REJECTED (Regex/Format).
3. **Modified Timestamp**: `{"email": "test@example.com", "subscribedAt": "2020-01-01T00:00:00Z"}` -> REJECTED (Must be request.time).
4. **Unauthorized Read**: `get(/subscribers/someone@example.com)` from non-admin -> REJECTED (PII protection).
5. **Unauthorized List**: `list(/subscribers)` from non-authenticated user -> REJECTED.
6. **Unauthorized Delete**: `delete(/subscribers/someone@example.com)` from non-admin -> REJECTED.
7. **Bypass Validation**: `{"email": "test@example.com"}` (missing required field) -> REJECTED.
8. **Malicious ID**: `create(/subscribers/VERY_LONG_ID_OR_MALICIOUS_CHARS)` -> REJECTED (isValidId).
9. **Status Hijack**: `update(/subscribers/my@email.com, {"status": "active"})` from owner without admin -> REJECTED (Updates restricted to admins).
10. **Shadow Key**: `{"email": "a@b.com", "secret": "hack"}` -> REJECTED.
11. **Type Poisoning**: `{"email": 123, "status": "active"}` -> REJECTED.
12. **Insecure List**: `list(/subscribers)` as non-owner (Users shouldn't list anyway).

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would verify these.
