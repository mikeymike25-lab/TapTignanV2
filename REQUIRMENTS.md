# Requirements & Traceability

Follows the course principle:
`User Problem → Security Risk → Usability Issue → Design Requirement → Prototype → Evaluation → Improvement → Verification`

---

## 1. Baseline Issues (from Submission 2, §3)

| ID | Baseline issue | Security risk | Usability problem |
|----|----------------|---------------|-------------------|
| B-01 | QR payments proceed with no dedicated verification step | Money sent to suspicious recipients | Little chance to review details before paying |
| B-02 | QR scanner gives limited guidance | Malicious/replaced QR scanned unnoticed | Hard to position the QR; no situational alerts |
| B-03 | No dedicated recipient/merchant verification before confirmation | Suspicious recipient/merchant overlooked | Key payment info not emphasized |

## 2. Design Findings so far (from Submission 2)

| ID | Issue | Severity |
|----|-------|----------|
| DF-01 | Users may not notice when recipient/QR looks suspicious | High |
| DF-02 | Reporting has too many steps → users abandon | Medium |
| DF-03 | Users don't know what happens after reporting | Medium |

> New findings from usability testing continue at **DF-04** (see `USABILITY_TESTING.md`).

---

## 3. Requirements

Priority: **M** = must (**MVP**) · **S** = should · **C** = could.  
The MVP is every **M** item — see `plan.md` §0. Cut order if time runs short: C first, then S.

### 3.1 Functional

| ID | Requirement | Pri | Addresses |
|----|-------------|-----|-----------|
| FR-01 | Home screen shows a TapTignan protection status banner | S | B-01 |
| FR-02 | Scanner shows an alignment frame and hint text | M | B-02 |
| FR-03 | Scanner handles camera-permission denial with an explanation and a path forward | M | B-02 |
| FR-04 | Confirmation screen shows recipient, merchant, amount, fee, total, payment method | M | B-03 |
| FR-05 | A security check is **mandatory** before funds are sent; it cannot be skipped via back-navigation or deep link | M | B-01 |
| FR-06 | Security check displays progress for: QR information, recipient details, security indicators | M | B-01, B-03 |
| FR-07 | Check result is **Safe** or **Suspicious**, shown with icon + color + text (never color alone) | M | DF-01 |
| FR-08 | Result screen lists findings, each with a plain-language explanation | M | DF-01 |
| FR-09 | **Safe** result offers *Continue to Payment* and *Report this Transaction* | M | B-01 |
| FR-10 | **Suspicious** result offers *This doesn't look right* (view details), *Cancel Payment*, and *Report* | M | DF-01 |
| FR-11 | ⚠️ Proceeding despite a Suspicious result (if allowed) requires an explicit extra confirmation | S | DF-01 |
| FR-12 | Cancellation screen explains why the payment was flagged and offers *Report this QR code* / *Proceed to another payment* | M | DF-01, DF-03 |
| FR-13 | Report form offers 4 predefined reasons (Wrong recipient name, Suspicious link, Forced to pay, I don't recognize this QR) + optional details; at least one reason required | M | DF-02 |
| FR-14 | Submitting a report shows a Report ID (`TT-YYYY-NNNNN`) and status *Under Review* | M | DF-03 |
| FR-15 | Activity tab lists reports with status *Under Review* / *Resolved* | M | DF-03 |
| FR-16 | User can mark a flag as incorrect (false positive) with a reason | S | DF-01 |
| FR-17 | Successful payment shows a confirmation screen | M | — |
| FR-17b | A viewable receipt is available after a successful payment | S | — |
| FR-18 | Reports persist across app restarts (needed for Activity and for test sessions) | M | DF-03 |
| FR-19 | Demo mode offers "Simulate scan" with Safe / Name-mismatch / URL scenarios — **never cut**: it is the demo and usability-test fallback | M | (defense) |
| FR-20 | Scanner supports flash toggle and gallery import | C | B-02 |
| FR-21 | "Reset demo data" clears reports and history between sessions | S | (testing) |

### 3.2 Non-functional

| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-01 | Security check completes in ≈ 3 s or less; time cost is measured in testing | M |
| NFR-02 | Tap targets ≥ 44×44 pt | M |
| NFR-03 | Text contrast meets WCAG AA (4.5:1 body, 3:1 large text) | M |
| NFR-04 | Works fully offline (all logic and data local) | M |
| NFR-05 | No real PII, real account numbers, or real payment calls anywhere in the project | M |
| NFR-06 | All interactive elements have accessibility labels; supports system font scaling | C |
| NFR-07 | Android is the primary target (Expo Go/APK); iOS best-effort | S |
| NFR-08 | All user-facing strings live in one module so a Filipino/Tagalog version can be added | C |

---

## 4. Traceability Matrix

Fill the **Evidence** and **Result** columns as testing progresses.

| Baseline | Requirement(s) | Screen(s) | Prototype evidence | Test task | Result |
|----------|----------------|-----------|--------------------|-----------|--------|
| B-01 | FR-05, FR-06, FR-09 | Security Checking, Result: Safe, Result: Suspicious | EV-01, EV-02 | T1, T2 | _TBD_ |
| B-02 | FR-02, FR-03 | Scan QR | EV-01 | T1 | _TBD_ |
| B-03 | FR-04, FR-08 | Payment Confirmation, Result: Suspicious | EV-02 | T1, T2 | _TBD_ |
| DF-01 | FR-07, FR-08, FR-10, FR-12 | Result: Suspicious, Report Details, Payment Cancelled | EV-03 | T2, T3 | _TBD_ |
| DF-02 | FR-13 | Report Reason, Report Submitted | EV-04 | T4 | _TBD_ |
| DF-03 | FR-14, FR-15 | Report Submitted, Activity | EV-05 | T5 | _TBD_ |

**Result values:** Passed · Partially met · Not met — add a one-line reason each.

---

## 5. Open Decisions

| # | Question | Options | Owner | Decision |
|---|----------|---------|-------|----------|
| D-1 | Can users proceed after a Suspicious result? — **needed before Result screens (plan 4.3)** | (a) No — cancel/report only · (b) Yes, after extra confirm | Rabanzo / Sabino | _TBD_ |
| D-2 | Bottom-nav labels — **needed before app setup (plan 3.3)** | Home · Activity · QR · Settings (recommended) vs. Home · Inbox · QR · Profile | Salamat | _TBD_ |
| D-3 | Two verdict levels or three (add *Caution*)? | Two vs. three (Safe · Caution · Suspicious) | Rabanzo / Salamat | **Decided: Three levels** — Prevents warning fatigue on legitimate sari-sari stores & personal GCash micro-merchants while keeping high-risk red warnings effective. |
| D-4 | Report lifecycle simulation | Auto-resolve after N seconds vs. hidden dev toggle | Quiambao | _TBD_ |