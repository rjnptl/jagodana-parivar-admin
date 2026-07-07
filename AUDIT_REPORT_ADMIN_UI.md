# Audit Report — Jagodana Family Connect Admin UI

**Date:** 2026-07-04 · **Scope:** `jagodana-admin` frontend (read-only audit), with targeted verification against `jagodana-parivar-backend` route guards. No code was modified.

---

## 1. Summary

The admin app's authorization story is fundamentally sound: every admin endpoint verified in the backend is guarded server-side by `@AdminAuth()` (JWT + `tokenKind === 'admin'` check), so the UI is not relying on hidden buttons for security, and a member-level token cannot reach admin APIs. The most serious problems are **silent data loss** — the Schemes, Sponsors, and Zone Ministers pages appear fully functional but persist nothing (backend endpoints are stubs returning `[]`), and a failed initial data load renders an empty dashboard with no error shown. Session management (15-minute access token in localStorage, httpOnly `SameSite=Strict` refresh cookie, single-flight refresh-and-retry on 401) is well designed, with localStorage token storage plus an un-pinned CDN script being the main residual XSS exposure.

---

## 2. Critical Issues

### C1. Schemes, Sponsors, and Zone Ministers edits are silently lost (Critical)
- [ManageSchemes.tsx:19-42](components/admin/ManageSchemes.tsx#L19-L42), [ManageSponsors.tsx:19-38](components/admin/ManageSponsors.tsx#L19-L38), [ManageMinisters.tsx:18-37](components/admin/ManageMinisters.tsx#L18-L37) mutate only React state (`setSchemes([...schemes, scheme])` with `Date.now()` IDs). No API call is ever made.
- Backend confirms there is nothing to call: `GET /schemes`, `GET /sponsors`, `GET /zone-ministers` are hardcoded stubs returning `data: []` (`jagodana-parivar-backend/src/user/member/member.controller.ts:417-433`), and no create/update/delete endpoints exist for these resources.
- [apiService.ts:600-611](services/apiService.ts#L600-L611) — `saveAll` is a `console.warn` stub and is never even invoked.
- **Impact:** An admin adds a scheme/sponsor/minister, sees it in the list, gets no error — and it vanishes on refresh. The delete-sponsor confirmation dialog ("Are you sure…") reinforces the false impression that this is persisted data. This is textbook silent data loss.

### C2. Initial admin data load fails silently to an empty dashboard (High)
- [App.tsx:62-92](App.tsx#L62-L92) — if `ApiService.fetchAll()` or `getAllVillages()` rejects (backend down, expired session that can't refresh, 500), the only handling is `console.error`. The app then renders the dashboard with zero families/members and no error banner or retry affordance.
- Inside `fetchAll` ([apiService.ts:577-598](services/apiService.ts#L577-L598)), a failure of `getMembers()` or `getAllVillages()` rejects the whole `Promise.all`, discarding the resources that did load.
- **Impact:** An admin can be looking at "Total Families: 0" believing the registry is empty.

### C3. Member list silently truncated at 1000 records (Medium, will become High with growth)
- [apiService.ts:367-384](services/apiService.ts#L367-L384) — `getMembers()` calls `GET /api/admin/members` with no pagination params and ignores the `pagination` object the backend returns. The backend caps `limit` at 1000 (`member.service.ts:1228`).
- **Impact:** Once the community exceeds 1000 members, the Families page, dashboard counts, and blood-group registry will silently under-report with no indication of truncation.

---

## 3. Security Findings

### Done well (verified server-side)
- **Admin endpoints are genuinely protected.** Every admin route in the backend carries `@AdminAuth()` = `CustomJwtAuthGuard` + `AdminTokenGuard`, which rejects any token whose `tokenKind !== 'admin'` (`src/guards/admin-token.guard.ts:7`). A member token hitting `/admin/members`, `/admin/village/*`, `/admin/events`, or `/admin/otp-requests` gets a 403 regardless of what the UI shows. This is **not** security by obscurity.
- **CSRF is a non-issue for admin mutations.** All state-changing calls authenticate via the `Authorization: Bearer` header ([apiService.ts:163-175](services/apiService.ts#L163-L175)), not a cookie. The only cookie-authenticated endpoint (`POST /admin/auth/refresh`) uses an `httpOnly`, `SameSite=Strict` cookie (`src/security/session-cookie.helper.ts`), and refresh returns a token rather than performing a state change — CSRF-safe.
- Public backend directory endpoints strip PII: unauthenticated `GET /members` uses `toDirectoryMember()`, which deletes mobile, email, address, DOB (`member.service.ts:178-196`).

### Findings

**S1. Access token stored in localStorage — readable by any XSS (Medium)**
- [AuthContext.tsx:75](context/AuthContext.tsx#L75), [apiService.ts:118](services/apiService.ts#L118). Any injected script can exfiltrate a live 15-minute admin token plus the cached `adminUser` object. The short TTL and httpOnly refresh cookie limit the blast radius (the refresh token itself is not stealable), but in-memory-only access tokens would remove the risk entirely — the refresh-on-boot flow in `checkAuth` ([AuthContext.tsx:44-62](context/AuthContext.tsx#L44-L62)) already supports that model.

**S2. Tailwind loaded from CDN with no SRI, in the high-privilege app (Medium)**
- [index.html:9](index.html#L9) — `<script src="https://cdn.tailwindcss.com">` executes arbitrary third-party JS in the admin origin on every page load, with no Subresource Integrity hash and no CSP on the frontend. Combined with S1, a CDN compromise = admin token theft. The Tailwind CDN is also explicitly not for production use. Build Tailwind locally.

**S3. Route guarding is client-side only for *pages*, correctly backstopped by the server (Informational)**
- [App.tsx:29-42](App.tsx#L29-L42) `ProtectedAdminRoute` checks only `isLoggedIn` (truthy token + user in state). Anyone can render the admin page shells by seeding localStorage, but every data call returns 401/403, so nothing sensitive is reachable. Acceptable.

**S4. Member PII breadth in the UI (Low)**
- The admin member payload (mobile, DOB, address for every member) is loaded globally at app start and held in top-level state for all pages ([App.tsx:65-76](App.tsx#L65-L76)), rather than fetched per-view. Appropriate for an admin tool, but it means the entire community's PII sits in memory/network on every admin session, even when the admin only opens Events. Consider fetching members lazily on the pages that need them.
- The OTP WhatsApp deep link ([ManageOtpRequests.tsx:5-9](components/admin/ManageOtpRequests.tsx#L5-L9)) embeds the member's name and family code in a `wa.me` URL — inherent to the feature, but be aware it puts the family code in browser history and WhatsApp.

**No privilege-escalation path was found** from the frontend: role handling (`roleId` on `AdminUser`) is not used for UI gating decisions that the server doesn't also enforce.

---

## 4. Session Management Findings

- **Persistence:** access token + admin user in localStorage; refresh token in httpOnly `SameSite=Strict` cookie, 7-day TTL (configurable 1–30 days), re-issued on every refresh (sliding session). Access token TTL is 15 minutes (`security.module.ts:30`).
- **Expiry mid-action is handled well:** [apiService.ts:163-175](services/apiService.ts#L163-L175) retries a 401'd request exactly once after a single-flight refresh (`adminRefreshPromise` dedupes concurrent refreshes — good). If refresh fails, `clearAdminSession()` dispatches `ADMIN_AUTH_EXPIRED_EVENT`, `AuthContext` clears state ([AuthContext.tsx:32-34](context/AuthContext.tsx#L32-L34)), and `ProtectedAdminRoute` redirects to login, preserving `location.state.from` for post-login return. This is a solid pattern.
- **Logout revokes server-side:** `POST /admin/auth/logout` invalidates the access token and clears the refresh cookie; local storage is cleared even if the request fails ([apiService.ts:236-243](services/apiService.ts#L236-L243)).

**SM1. No cross-tab session sync (Low).** Logout/expiry in one tab dispatches a same-tab `window` event only; a second tab keeps stale `isLoggedIn` state until its next API call 401s. Adding a `storage` event listener in `AuthContext` would fix this.

**SM2. No idle timeout or refresh-token-expiry warning (Low).** After 7 days of cookie expiry, the first symptom is a redirect to login; mid-form work in progress (e.g., a half-filled event form) is lost. Acceptable for this app's scale; worth noting.

---

## 5. Flow Issues

**Traced journey:** login (`/admin/login` → `POST /admin/auth/login`, refresh cookie set, token to localStorage) → guarded redirect to `/admin/overview` → one-shot `fetchAll` loads members/villages/schemes/sponsors/ministers/events into `App` state → Families list (client-side search/filter over preloaded members, family-detail modal) → Blood Groups (only real member *edit* path, via `PATCH /admin/members/:id`) → OTP Requests (load/mark-sent/resend/expire) → Events (CRUD + toggle against `/admin/events`) → Villages (CRUD against `/admin/village/*`) → logout.

**Note:** the audit brief assumed an approve/reject member workflow. **No such flow exists** — there is no pending-member queue in the UI or backend; the closest analogue is the OTP Requests page. Member management is read-only apart from blood-group edits; `ApiService.deleteMember` is a stub ([apiService.ts:411-413](services/apiService.ts#L411-L413)) that is never reachable from the UI. There are no bulk actions anywhere, so bulk atomicity is N/A.

**F1. Data loaded once per login, never refreshed (Medium).** [App.tsx:85-91](App.tsx#L85-L91) gates `initApp` behind `hasLoadedAdminDataRef`. Members registered while the admin session is open never appear until logout/re-login or a hard refresh. Villages/Events pages self-refresh, but Families / Dashboard / Blood Groups don't, and there is no manual refresh button on those pages.

**F2. Dead-end deep-link routes (Low).**
- `/admin/families/:familyCode` and `/admin/members/:memberId` ([App.tsx:138-140](App.tsx#L138-L140)) are declared, but `ManageFamilies` never reads route params — deep links land on the unfiltered list with no modal opened.
- `/admin/zone-ministers/new` and `/:id/edit` ([App.tsx:155-156](App.tsx#L155-L156)) exist, but `ManageMinisters` has no edit capability and no param handling at all.

**F3. OTP action responses merged without normalization (Medium — see also §7).** `markOtpRequestSent` / `resendOtpRequest` / `expireOtpRequest` return raw `data.data` ([apiService.ts:556-575](services/apiService.ts#L556-L575)) and [ManageOtpRequests.tsx:46-57](components/admin/ManageOtpRequests.tsx#L46-L57) spreads it over the row. `getOtpRequests` defensively maps snake_case fields, but the action paths don't — if the backend returns snake_case here, `sentAt`/`status` won't visibly update even though the action succeeded.

**F4. Village hard-delete with a generic confirm (Medium).** [ManageVillages.tsx:107-121](components/admin/ManageVillages.tsx#L107-L121) calls `removeVillage` (hard delete; the backend's `archiveVillage` soft-delete is unused) after a plain `confirm()`. The dialog doesn't say how many families/members reference the village, and the UI doesn't surface what happens to them.

**Destructive-action confirmations otherwise present:** villages, events, sponsors, ministers, schemes all `confirm()` before delete. OTP "Expire Now" ([ManageOtpRequests.tsx:104](components/admin/ManageOtpRequests.tsx#L104)) has **no confirmation** — one mis-click expires a member's registration OTP (Low, recoverable via Resend).

---

## 6. UI Behavior Issues

**U1. Family search matches everything for substrings of "Jagodana" (Medium).** [ManageFamilies.tsx:53-55](components/admin/ManageFamilies.tsx#L53-L55) includes `surname.toLowerCase().includes(normalizedSearch)` in the match, and `surname` is the constant `"Jagodana"` for every row. Typing "ja", "god", "a", etc. matches all families, making search appear broken.

**U2. Blood-group save writes back the whole member (Medium).** [apiService.ts:386-409](services/apiService.ts#L386-L409) `updateMember` PATCHes name, DOB, address, relation, and photo alongside `bloodGroupId`. A blood-group edit blind-writes every round-tripped field — any normalization drift (e.g., the `middleName`/`fatherHusbandName` cross-mapping at [apiService.ts:25-26](services/apiService.ts#L25-L26)) or a concurrent edit by another admin gets silently overwritten. Send only the changed field.

**U3. Error surfacing is inconsistent.** OTP, Villages, and Events pages show inline dismissible error banners (good). Blood Groups uses a raw `alert()` ([ManageBloodGroups.tsx:70](components/admin/ManageBloodGroups.tsx#L70)) — though it does implement optimistic update **with rollback**, which is the best mutation UX in the app. The app-level load failure (C2) shows nothing.

**U4. Mojibake character in family-detail modal (Low).** [ManageFamilies.tsx:227](components/admin/ManageFamilies.tsx#L227) renders a literal `�` (U+FFFD) as a separator where its siblings use `•`.

**U5. Weak form validation (Low).**
- Schemes: `handleAdd` defaults the title to `'New Scheme'` ([ManageSchemes.tsx:23](components/admin/ManageSchemes.tsx#L23)) — an empty form "saves" successfully.
- Sponsors: no format validation on contact number or amount; the dashboard later parses amount with a digit-strip regex ([AdminDashboard.tsx:61](components/admin/AdminDashboard.tsx#L61)).
- Events: time is a free-text field with no format check ([ManageEvents.tsx:221](components/admin/ManageEvents.tsx#L221)).
- OTP WhatsApp link hardcodes the `91` prefix ([ManageOtpRequests.tsx:8](components/admin/ManageOtpRequests.tsx#L8)) — breaks if the stored number already includes a country code.

**Loading/empty states are otherwise good:** every table has an empty-state row, OTP/Villages/Events have spinners, buttons disable while saving, and the login form disables inputs during submit. No unhandled promise rejections were found — all async paths have catch handlers.

---

## 7. Backend Contract Mismatches

| # | Frontend expectation | Backend reality | Impact |
|---|---|---|---|
| B1 | Schemes/Sponsors/Zone-Ministers are manageable resources | `GET`-only stubs returning `[]`; no mutation endpoints (`member.controller.ts:417-433`) | Critical — see C1 |
| B2 | `getMembers()` gets all members | Server caps at 1000/page; pagination metadata ignored by frontend | See C3 |
| B3 | OTP action responses are camelCase (`data.data` used verbatim, [apiService.ts:560](services/apiService.ts#L560)) | List endpoint needed snake_case fallbacks, action endpoints get none | See F3 |
| B4 | `createVillage` sends 5 aliases per field (e.g. `name`/`village`/`villageName`/`village_name`, [apiService.ts:283-296](services/apiService.ts#L283-L296)); `extractVillageList` probes 13 payload shapes ([apiService.ts:81-99](services/apiService.ts#L81-L99)) | Backend has one canonical shape | Works, but the shotgun-payload pattern hides real contract errors and should be collapsed to the actual DTO |
| B5 | `getActiveEvents()` and member-`login()` helpers exist in the service | Unused by any admin component | Dead code; `login()` is a stub |
| B6 | Dev proxy rewrites `/api` → backend root ([vite.config.ts:9-15](vite.config.ts#L9-L15)) | Backend has **no** global `api` prefix | Production deployment must replicate the same rewrite (reverse proxy) or all calls 404 — worth documenting |
| B7 | Frontend never calls `GET /admin/dashboard/stats` | Endpoint exists and is admin-guarded | Dashboard recomputes stats client-side from the (truncatable, see C3) member list; using the server endpoint would also fix C3 for the KPI cards |

---

## 8. Recommended Fix Priority

1. **C1 — Stop pretending Schemes/Sponsors/Ministers save.** Either build the backend CRUD or disable/label these pages ("coming soon"). Silent loss of admin-entered data is the worst failure mode in the app and it happens on three pages today.
2. **C2 — Surface initial-load failures.** Add an error state + retry button in `App.tsx`; make `fetchAll` tolerate partial failure so villages still render if members fail. Cheap fix, removes the "empty registry" trap.
3. **C3 / B7 — Handle pagination.** Use `/admin/dashboard/stats` for KPI counts and paginate (or page-loop) `/admin/members`. Do this before the dataset grows past 1000; after that the bug is invisible.
4. **U1 — Fix family search** (drop the constant-surname match). One-line fix for a broken core admin workflow.
5. **U2 — Make blood-group updates field-scoped** to eliminate the lost-update/overwrite risk on member records (data integrity).
6. **S2 — Replace the Tailwind CDN with a local build + add SRI/CSP.** Highest-leverage XSS-surface reduction in the higher-privilege app.
7. **S1 — Move the access token out of localStorage** (in-memory + refresh-on-boot; the code structure already supports it).
8. **F3/B3 — Normalize OTP action responses**; F4 — enrich the village-delete confirmation (or switch to `archiveVillage`); add a confirm on OTP "Expire Now".
9. **F1 — Add refresh affordances** (or refetch-on-navigate) for member data; F2 — wire up or remove the dead deep-link routes.
10. **U3/U4/U5 — Polish:** consistent inline error banners (drop `alert()`), fix the `�` glyph, minimal form validation on schemes/sponsors/events, robust WhatsApp number formatting.

---

*Positives worth keeping: server-enforced admin authorization on every admin endpoint; httpOnly `SameSite=Strict` refresh cookie with sliding renewal; single-flight token refresh with one retry on 401; header-based (CSRF-immune) mutations; optimistic-update-with-rollback in Blood Groups; consistent empty states and disabled-while-saving buttons.*
