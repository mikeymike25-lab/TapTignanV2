# TapTignan — Project Plan (Solo Developer Edition)

> A Pre-Payment Verification and Reporting Interface for Filipino Mobile Wallet Users
> IT 021 Usable Security · Group 7 · BSIT-IT31S4 · TIP Quezon City · Instructor: Allan A. Burgos

**Guiding principle (from the course):**
`User Problem → Security Risk → Usability Issue → Design Requirement → Prototype → Evaluation → Improvement → Verification`

**Legend:** `[x]` done · `[ ]` to do · 🔶 in progress · ⚠️ decision needed
**Owner tags:** `DEV` = the single developer (you) · `TEAM` = the other four members (non-code work)
**Tier tags:** **MVP** = must ship · **SHOULD** = ship if time allows · **COULD** = only if everything else is done

---

## 0. How This Plan Works With One Developer

You are the bottleneck, so the plan does three things:

1. **MVP cut line** — a defined, demo-able app that fully covers the problem → verification story. Everything else is optional.
2. **Delegation** — everything that isn't code (copy, rules wording, QR printing, usability sessions, documents, slides) is `TEAM` work so you can stay in the editor.
3. **Vertical slice first** — get one path working end-to-end *before* polishing any screen.

### MVP definition (what "done enough" means)

| Area | In MVP | Deferred (SHOULD/COULD) |
|------|--------|-------------------------|
| Screens | Home · Scan QR (+ Simulate scan) · Payment Confirmation · Security Checking · Result Safe · Result Suspicious · Payment Cancelled · Payment Successful · Report Reason · Report Submitted · Activity | View Receipt · Report Details · Report Incorrect Flagging · Settings (beyond a reset button) |
| Security engine | Rules R-01 … R-05, verdict logic, plain-language findings | R-06 amount check · R-07 CRC (QR Ph) |
| Data | Local mock registry, 3 demo scenarios, persisted reports | — |
| Scanner | Live camera with frame + **Simulate scan** fallback | Gallery import · Flash |
| Tests | Unit tests for the engine and report ID generator | Component tests |
| Polish | Loading / error states on Scan + Check | Full accessibility pass · Tagalog strings |

> If time runs short, cut from the bottom of each SHOULD list first. **Never cut:** the mandatory security gate, the Suspicious flow, structured reporting, Activity status, or the Simulate-scan fallback.

---

## 1. Status Snapshot

| # | Phase | Status | Primary |
|---|-------|--------|---------|
| 0 | Foundation & Governance | 🔶 In progress | DEV + TEAM |
| 1 | Problem Definition & Research | ✅ Done (1 follow-up) | TEAM |
| 2 | Design (Figma) | 🔶 Flow done, refinement in progress | TEAM |
| 3 | App Setup & Architecture | 🔶 Phone verification pending | DEV |
| 4 | Vertical Slice → Full MVP | ⬜ To do | DEV |
| 5 | Security Logic & Data | ⬜ To do | DEV (rules content: TEAM) |
| 6 | Usability Evaluation | ⬜ To do | TEAM (app support: DEV) |
| 7 | Iteration & Verification | ⬜ To do | DEV + TEAM |
| 8 | Final Package & Defense | ⬜ To do | TEAM (demo build: DEV) |

> **Deadlines:** the course says "exact date as posted in Canvas". Add real dates here once confirmed → `TBD`.
> **Effort key** used below: **S** ≈ under 2 hrs · **M** ≈ half a day · **L** ≈ a day or more.

---

## Phase 0 — Foundation & Governance

### 0.1 Setup
- [ ] `DEV` Create GitHub repo; push straight to `main` (no PR reviews needed) — **S**
- [ ] `DEV` Commit the docs set (`plan.md`, `README.md`, `docs/*`) — **S**
- [ ] `TEAM` Create a shared task board; one card per `TEAM` item below — **S**
- [ ] `TEAM` Put Figma link + repo link in `README.md` — **S**

### 0.2 Report cleanup
- [x] Submission 2 — Post-Midterm Progress Report drafted
- [ ] `TEAM` Fix gaps in the report (see [Known Report Gaps](#known-report-gaps)) — **S**

---

## Phase 1 — Problem Definition & Research ✅

- [x] Scope, target users, security-related tasks
- [x] Baseline issues mapped to risks and usability problems
- [ ] `TEAM` Collect 3–5 credible sources on QR phishing / e-wallet scams in the Philippines (BSP advisories, bank/wallet advisories, news) — **M**
- [ ] `TEAM` Write a 1-paragraph "why this matters" for the final report using those sources — **S**

---

## Phase 2 — Design (Figma)

> Mostly `TEAM`. The developer needs these resolved **before** building the affected screens — see "Needed by DEV" notes.

### 2.1 Core flow
- [x] Full flow designed (Home → Scan → Confirm → Check → Safe/Suspicious → Report → Activity, plus Cancel / Success / Receipt / Incorrect flagging)

### 2.2 Refinement 🔶
- [ ] ⚠️ `TEAM` Pick one bottom-nav: **Home · Activity · QR · Settings** (recommended) vs. Home · Inbox · QR · Profile — *Needed by DEV before Phase 3.3*
- [ ] ⚠️ `TEAM` Decide whether "Proceed anyway" exists on the Suspicious screen (see `docs/SECURITY.md` §5, decision D-1) — *Needed by DEV before Phase 4.3*
- [ ] ⚠️ `TEAM` Confirm demo amounts: Safe ₱850.00 vs. Suspicious ₱650.00 — keep or unify
- [ ] `TEAM` Improve warning labels, copy and clarity (the "In Progress" item in report §9)
- [ ] `TEAM` Add Figma frames for missing states: camera permission denied, unreadable QR, check failed, no reports yet
- [ ] `TEAM` Check contrast and tap-target sizes in Figma

### 2.3 Handoff to DEV
- [ ] `TEAM` Write all UI strings into one shared sheet/doc (screen → string) — becomes `src/data/copy.ts` — **M**
- [ ] `TEAM` Write the plain-language explanation for every risk rule (see `docs/SECURITY.md` §4) — **M**
- [ ] `TEAM` Export icons (shield, warning, check, QR) as SVG/PNG — **S**
- [ ] `TEAM` Extract exact color / type / spacing values from Figma into a short table — **S**

---

## Phase 3 — App Setup & Architecture (DEV)

### 3.1 Scaffold — **M** total
- [x] `DEV` Create Expo app with TypeScript template
- [x] `DEV` Install Expo Router
- [ ] `DEV` Verify the app runs in Expo Go on a **real phone**
- [x] `DEV` ESLint + Prettier + `tsc --noEmit` scripts (local only — no CI)
- [x] `DEV` Path alias `@/` → `src/`

### 3.2 Dependencies — **S**
- [x] `DEV` Camera / barcode: `expo-camera`
- [x] `DEV` State: `zustand` + `@react-native-async-storage/async-storage`
- [x] `DEV` Icons: `@expo/vector-icons`
- [x] `DEV` Tests: `jest-expo` (engine tests only)
- [ ] `DEV` *(SHOULD)* `expo-image-picker` for gallery import — skip unless time allows
- [x] Animation: use React Native's built-in `Animated` for the check animation; add Reanimated only if needed

### 3.3 Structure — **S**
- [x] `DEV` Create folder layout from `ARCHITECTURE.md` §3
- [x] `DEV` Add initial `src/theme/` tokens; replace placeholder values with the final Figma table during refinement
- [x] `DEV` Add placeholder route files for every screen listed in `ARCHITECTURE.md` §3

---

## Phase 4 — Vertical Slice → Full MVP (DEV)

> **Order matters.** Build the thin working path first (4.1–4.2), prove it on a phone, *then* widen.

### 4.1 Vertical slice 🎯 — get this working before anything else — **L**
Goal: a person can go **Home → Simulate scan → Confirm → Security Check → Result → Success**, with the Safe scenario, using real navigation and real store state. Ugly is fine.

- [ ] `DEV` Navigation shell: tabs + `pay/` stack
- [ ] `DEV` `usePaymentStore` with the flow states (`pending_confirm → checked → paid/cancelled`)
- [ ] `DEV` Hard-coded Safe scenario → Confirm → Check (fake delay) → Safe → Success
- [ ] `DEV` Gate enforcement: `result` and `success` redirect Home if store state is wrong
- [ ] `DEV` Run on a phone; fix anything broken before moving on

### 4.2 Real engine behind the slice — **L**
- [ ] `DEV` Replace the hard-coded result with `evaluatePayment()` (Phase 5.1–5.2)
- [ ] `DEV` Add the **Suspicious** scenario end-to-end (Name mismatch)

### 4.3 Remaining MVP screens — **L**
- [ ] `DEV` Shared components (build only what screens need): `Button`, `Card`, `Header`, `StatusBanner`, `DetailRow`, `CheckStep`, `FindingItem`, `RadioCard`, `StatusBadge`
- [ ] `DEV` **Home** — balance, quick actions, TapTignan banner, recent activity
- [ ] `DEV` **Scan QR** — camera, frame overlay, hint text, permission-denied state, **Simulate scan** (demo mode)
- [ ] `DEV` **Payment Confirmation** — details + "Continue to Security Check" + Cancel
- [ ] `DEV` **Security Checking** — 3 animated steps + summary
- [ ] `DEV` **Result: Safe** and **Result: Suspicious** — findings, actions per FR-09/FR-10
- [ ] `DEV` **Payment Cancelled** — with "Why was this flagged?" panel
- [ ] `DEV` **Payment Successful**
- [ ] `DEV` **Report Reason** (4 options + optional details; submit disabled until a reason is picked)
- [ ] `DEV` **Report Submitted** (ID + *Under Review*)
- [ ] `DEV` **Activity** — report list with status chips + empty state

### 4.4 SHOULD
- [ ] `DEV` View Receipt
- [ ] `DEV` Report Details (pre-report summary)
- [ ] `DEV` Report Incorrect Flagging
- [ ] `DEV` Settings: Demo mode toggle + **Reset demo data**
- [ ] `DEV` Back-button behavior: stack reset after success so Back can't re-enter a paid flow

### 4.5 COULD
- [ ] `DEV` Gallery QR import · Flash toggle
- [ ] `DEV` Accessibility labels on every element, font-scaling check
- [ ] `TEAM` Tagalog strings for `copy.ts`

---

## Phase 5 — Security Logic & Data

> Everything is **simulated and local**. Be explicit about this in the defense.
> Rule definitions and wording → `TEAM` (Rabanzo/Sabino). Implementation → `DEV`.

### 5.1 Engine core (DEV) — **M**
- [ ] `DEV` Types: `QrPayload`, `PaymentRequest`, `Finding`, `CheckResult`, `Report` (`docs/ARCHITECTURE.md` §5)
- [ ] `DEV` `parseQr()` — turn a QR string into a `QrPayload`; handle empty/malformed input
- [ ] `DEV` `evaluatePayment()` as a **pure function**
- [ ] `DEV` Verdict logic: any failed HIGH or MEDIUM finding ⇒ Suspicious; LOW findings are shown as notes only (`docs/SECURITY.md` §4)

### 5.2 Rules (DEV, content from TEAM)
- [ ] `DEV` **MVP:** R-01 valid payment QR · R-02 no embedded URL · R-03 name matches registry · R-04 merchant (not personal) account · R-05 not previously reported
- [ ] `DEV` *(SHOULD)* R-06 plausible amount
- [ ] `DEV` *(COULD)* R-07 CRC / QR Ph validation — verify spec first; otherwise skip
- [ ] `TEAM` Review each rule's user-facing text for clarity (no jargon)

### 5.3 Mock data & demo scenarios
- [ ] `DEV` `registry.ts` (fake merchants/recipients) and `scenarios.ts` with **three payload strings**: Safe · Name mismatch · URL-embedded — **M**
- [ ] `TEAM` Generate the three QR codes from those strings with any online/offline QR generator; print them (A5, matte if possible) for the camera demo and usability tests — **S**
- [ ] `DEV` "Simulate scan" button in demo mode (fallback if camera fails during defense)

### 5.4 State & persistence (DEV) — **M**
- [ ] `useReportStore` (persisted) · `usePaymentStore` · `useSettingsStore`
- [ ] Report ID generator `TT-YYYY-NNNNN`
- [ ] Report lifecycle: *Under Review → Resolved* via a hidden dev toggle or timer (decision D-4)
- [ ] **Reset demo data** action — needed before every test session

### 5.5 Tests (DEV) — **M**
- [ ] One unit test per MVP rule (pass **and** fail case)
- [ ] `parseQr` edge cases (empty, URL, malformed)
- [ ] Report ID generator
- [ ] *(COULD)* component tests

### 5.6 Security review
- [ ] `TEAM` (Rabanzo) Walk the threat model in `docs/SECURITY.md` against the finished app and sign off — **M**
- [ ] `DEV` Confirm the gate can't be skipped via Back or deep link
- [ ] `DEV` Confirm no real personal data, secrets, or network calls in the repo

---

## Phase 6 — Usability Evaluation (TEAM-led)

> Protocol in `docs/USABILITY_TESTING.md`. This fills the biggest evidence gap in Submission 2.
> **The developer should not moderate sessions** (bias); take the note-taker/observer role or stay out.

### 6.1 Prepare
- [ ] `TEAM` Finalize tasks T1–T6, consent script, questionnaires, observation sheet — **M**
- [ ] `TEAM` Print the 3 QR codes (from 5.3)
- [ ] `DEV` Provide a **stable test build** (Expo Go on the test phone, or an APK) and a one-page "how to reset between sessions" note — **S**
- [ ] ⚠️ **Fallback:** if the app isn't ready, run the first sessions on the **Figma prototype** and say so in the report

### 6.2 Recruit & pilot
- [ ] `TEAM` Recruit 5–8 e-wallet users; schedule ~20 min sessions
- [ ] `TEAM` Run 1 pilot; `DEV` fixes any blocking bugs the pilot exposes

### 6.3 Sessions & analysis
- [ ] `TEAM` Run sessions (moderator + note-taker; DEV may observe)
- [ ] `TEAM` Compute completion, time, errors, SEQ, SUS
- [ ] `TEAM` Log findings DF-04+ with severity; add evidence rows EV-06+

---

## Phase 7 — Iteration & Verification

### 7.1 Improve
- [ ] `TEAM` Prioritize findings by severity × frequency; hand `DEV` a **short** list (max ~5 fixes)
- [ ] `DEV` Implement the top fixes in the app — **L**
- [ ] `TEAM` Update Figma to match; log before/after for each change (needed for "Improvement" in the report)

### 7.2 Verify
- [ ] `TEAM` Re-test failed tasks with 2–3 participants
- [ ] `TEAM` Update the traceability matrix (`docs/REQUIREMENTS.md` §4): Passed / Partially met / Not met + reason

### 7.3 Polish (only if time remains)
- [ ] `DEV` Remove debug UI; keep a discreet demo-mode switch
- [ ] `DEV` Quick accessibility pass (contrast, font scaling, labels)

---

## Phase 8 — Final Package & Defense

### 8.1 Deliverables
- [ ] `TEAM` Final report PDF (correct filename pattern, date, ticked checklist)
- [ ] `DEV` Demo build: Expo Go link or installable Android build (EAS) — **M**
- [ ] `TEAM` Figma prototype link with "anyone with link" view access
- [ ] `DEV` Repo cleaned, `README.md` setup steps verified on a fresh clone — **S**
- [ ] `TEAM` Screen recording of the full flow (backup for the demo)

### 8.2 Defense prep
- [ ] `TEAM` 5-minute demo script: Safe → Suspicious → Report → Activity
- [ ] `TEAM` Slide deck structured by the project principle (Problem → … → Verification)
- [ ] `TEAM` Prepare Q&A (use `docs/SECURITY.md` §9) — *Why a pre-payment screen? Warning fatigue? What does "Safe" guarantee? Real backend?*
- [ ] `DEV` Be able to explain the engine and the gate (what's simulated vs. real)
- [ ] All: full rehearsal ×2, timed; backup plan = recording + **Simulate scan**

### 8.3 Final checks
- [ ] Every checkbox in the report's Progress Checklist can be ticked honestly
- [ ] Names, roles, dates, filename correct
- [ ] Submit before the Canvas deadline; keep proof

---

## Known Report Gaps

Spotted while analyzing the Submission 2 PDF — `TEAM` to fix before the final package:

- [ ] **Date Submitted** is blank
- [ ] **Progress Checklist (§10)** boxes are all unticked
- [ ] **Uploaded filename** differs from the required `S4_Group7_UsableSecurity_ProgressReport.pdf`
- [ ] **§5 Tools** lists only Figma — add React Native/Expo, GitHub, Jest once used
- [ ] **§6 Evidence** is prototype observation only — add real user-test evidence (Phase 6)
- [ ] **Figures vs. screens:** §4 tables only Figures 4.1–4.7; cancel, success, receipt, report details and incorrect-flagging are missing
- [ ] **Bottom-nav labels** differ between screens (see 2.2)
- [ ] **§9 statuses:** "Finalizing verification flow" is *Completed* while "Improving the UI" is *In Progress* — keep these consistent

---

## Division of Work

| Who | Role (from report) | In this plan |
|-----|--------------------|--------------|
| **Developer (you)** | — | Phases 3, 4, 5 (code), test builds, demo build |
| Salamat, Mike Angelo | Project lead & Prototype | Task board, Figma refinement, decisions D-1/D-2 |
| Quiambao, Adrian Carlo | Prototype & Technical lead | Figma handoff (tokens, icons), on-device QA, help review the engine logic |
| Rabanzo, Francheska Ann Nicole | Security Analyst & Documentation | Rule wording, threat-model sign-off, security review |
| Sabino, Marwan Bherooze | Documentation & Security Design | UI strings (`copy.ts` source), final report, defense deck |
| Sostea, Joana Marie | User & Usability Analyst | Usability sessions, findings log, SUS analysis |

> Role names come from the report; adjust if one of them is your developer.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Single developer** (illness, exams, burnout) | Whole app stalls | MVP cut line; vertical slice first; commit daily; Figma prototype is the fallback for testing |
| Waiting on design decisions (nav, "proceed anyway") | Rework | Get D-1/D-2 settled before Phase 3.3 / 4.3 |
| Scope creep (backend, real QR Ph validation, gallery import) | Missed deadline | Everything simulated; SHOULD/COULD items go last |
| Camera fails in demo (glare, permissions, projector) | Demo breaks | **Simulate scan** + screen recording |
| App not ready when testing must start | No user evidence | Start sessions on the Figma prototype; re-test key tasks on the app |
| Too few usability participants | Weak evidence | Start recruiting during Phase 3 |
| "Safe" read as a guarantee | False reassurance | Copy: "No suspicious indicators found" + limitations in `docs/SECURITY.md` |
| Warning fatigue | Users ignore alerts | Warn only on real findings; test in T2/T3 |
| Time added by security step | Users find it annoying | Measure in T1; keep check ≈ 3 s or less |