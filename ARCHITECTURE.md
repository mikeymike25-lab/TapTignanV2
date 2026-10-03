# Architecture

Goal: a small, readable React Native codebase where the **security logic is separate from the UI**, so it can be tested, explained in the defense, and swapped for a real backend later.

---

## 1. Principles

1. **Local-first & simulated** — no network, no real payments, mock data only.
2. **UI is dumb, engine is pure** — screens call `evaluatePayment()`; they don't contain rules.
3. **State is the source of truth for the payment flow** — screens read from stores, not URL params (prevents bypassing the security gate).
4. **One place for copy, tokens, and mock data** — easy to tweak after usability testing.
5. **Built by one person** — fewer files, fewer dependencies, build the thinnest working path first (see `plan.md` Phase 4.1).

---

## 2. Tech Stack

| Concern | Library | Why |
|---------|---------|-----|
| App framework | Expo (managed) + TypeScript | Fast setup, Expo Go for testing on phones |
| Routing | `expo-router` | File-based routes map 1:1 to the Figma screens (§3) |
| Camera + QR | `expo-camera` (`CameraView`, barcode scanning) | Built-in QR detection |
| Gallery QR *(COULD)* | `expo-image-picker` + camera `scanFromURLAsync` | Matches the "Gallery" button — skip unless time allows; verify API against current Expo docs |
| State | `zustand` | Minimal boilerplate |
| Persistence | `@react-native-async-storage/async-storage` | Keep reports/history across restarts |
| Animation | Built-in `Animated` | Enough for the check animation; no extra native setup |
| Icons | `@expo/vector-icons` or `lucide-react-native` | Shield, warning, check, QR |
| Tests | `jest-expo` | Unit tests for the engine; component tests are optional |
| Lint/format | ESLint, Prettier, `tsc` | Run locally — no CI needed |

> Check versions with `npx expo install` so packages match the installed Expo SDK.

---

## 3. Folder Structure

```
taptignan/
├── app/                          # Expo Router (routes only — thin files)
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # tab bar (center QR button)
│   │   ├── index.tsx             # Home
│   │   ├── activity.tsx          # Activity (reports list)
│   │   ├── scan.tsx              # Scan QR
│   │   └── settings.tsx
│   ├── pay/
│   │   ├── _layout.tsx
│   │   ├── confirm.tsx           # Payment Confirmation
│   │   ├── check.tsx             # Security Checking
│   │   ├── result.tsx            # Result: Safe / Suspicious
│   │   ├── cancelled.tsx         # Payment Cancelled
│   │   ├── success.tsx           # Payment Successful
│   │   └── receipt.tsx           # View Receipt (SHOULD)
│   └── report/
│       ├── _layout.tsx
│       ├── details.tsx           # Report Details (SHOULD)
│       ├── reason.tsx            # Report Reason
│       ├── submitted.tsx         # Report Submitted
│       └── incorrect.tsx         # Report Incorrect Flagging (SHOULD)
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Card, Header, ScreenContainer…
│   │   └── taptignan/            # StatusBanner, CheckStep, FindingItem, DetailRow, RadioCard…
│   ├── features/
│   │   ├── scanner/              # camera wrapper, permission hook, frame overlay, Simulate scan
│   │   ├── security/             # ★ the engine
│   │   │   ├── parseQr.ts
│   │   │   ├── rules.ts          # R-01…R-05 (MVP); R-06/R-07 later
│   │   │   ├── evaluatePayment.ts
│   │   │   └── __tests__/
│   │   ├── payment/              # payment store + helpers
│   │   └── reports/              # report store, id generator, lifecycle
│   ├── data/
│   │   ├── mock/
│   │   │   ├── registry.ts       # known merchants/recipients
│   │   │   ├── scenarios.ts      # Safe / Mismatch / URL payload strings (team prints QR from these)
│   │   │   └── user.ts           # "Juan Dela Cruz", balance, recent activity
│   │   └── copy.ts               # all user-facing strings
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── types/                    # shared TS types
│   └── utils/                    # formatCurrency, formatDate, id…
│
├── assets/                       # icons, fonts, splash
├── docs/
├── plan.md
└── README.md
```

**Rule of thumb:** files in `app/` should be ~20 lines — import a screen component and render it. Real UI lives in `src/`.

**Solo-dev tip:** don't create folders/components ahead of need. Start with the files the vertical slice requires (`plan.md` Phase 4.1) and add the rest as screens are built.

---

## 4. Flow Architecture

```
Scan (camera)
   │  raw QR string
   ▼
parseQr() ───────────────► QrPayload
   │
   ▼
usePaymentStore.startPayment(payload)      ← creates PaymentRequest, status = "pending_confirm"
   │
   ▼  user taps "Continue to Security Check"
evaluatePayment(request, registry, reportedQrs) ──► CheckResult { status, findings[] }
   │
   ▼
usePaymentStore.setResult(result)           ← status = "checked"
   │
   ├─ safe ─────────► Continue → status = "paid" → success/receipt
   └─ suspicious ───► Cancel → status = "cancelled"   |   Report → useReportStore.create()
```

**Gate enforcement:** `result.tsx` and `success.tsx` redirect to Home if the store status isn't `checked` / `paid` respectively.

---

## 5. Data Models

```ts
export type Verdict = 'safe' | 'suspicious';
export type Severity = 'high' | 'medium' | 'low';

export interface QrPayload {
  raw: string;
  merchantName?: string;
  merchantCity?: string;
  accountId?: string;         // mock account / number
  amount?: number;
  containsUrl: boolean;
  url?: string;
  crcValid?: boolean;         // stretch (QR Ph / EMVCo)
}

export interface PaymentRequest {
  id: string;
  qr: QrPayload;
  recipientName: string;
  merchantName: string;
  recipientNumber: string;    // masked in UI
  amount: number;
  fee: number;
  method: 'GCash Wallet';
  createdAt: string;          // ISO
}

export interface Finding {
  ruleId: string;             // 'R-03'
  severity: Severity;
  title: string;              // "Recipient doesn't match the merchant"
  explanation: string;        // plain-language, shown in "Why was this flagged?"
  passed: boolean;            // true = shown as ✓ in Safe results
}

export interface CheckResult {
  verdict: Verdict;
  findings: Finding[];
  checkedAt: string;
}

export type ReportReason =
  | 'wrong_recipient_name'
  | 'suspicious_link'
  | 'forced_to_pay'
  | 'unrecognized_qr';

export type ReportStatus = 'under_review' | 'resolved';

export interface Report {
  id: string;                 // 'TT-2026-00124'
  paymentId?: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface Transaction {
  id: string;                 // reference no.
  payment: PaymentRequest;
  result: CheckResult;
  outcome: 'paid' | 'cancelled';
  completedAt: string;
}
```
v
### Engine signature

```ts
// pure, synchronous, no I/O — UI adds the simulated delay
export function evaluatePayment(
  request: PaymentRequest,
  ctx: { registry: RegistryEntry[]; reportedQrs: string[] },
): CheckResult;
```

---

## 6. State Management

| Store | Holds | Persisted |
|-------|-------|-----------|
| `usePaymentStore` | current `PaymentRequest`, `CheckResult`, flow `status`, `Transaction[]` | transactions only |
| `useReportStore` | `Report[]`, `create()`, `setStatus()` | ✅ |
| `useSettingsStore` | `demoMode`, `protectionEnabled` | ✅ |

Use Zustand's `persist` middleware with AsyncStorage for the persisted slices. Provide `resetDemoData()` for clean runs before each test session / defense.

---

## 7. Theming & Design Tokens

Extract exact values from Figma (Phase 2.3). Starting points read from the screenshots:

| Token | Approx. value | Use |
|-------|---------------|-----|
| `primary` | deep blue (~`#2D3FB0`) | Buttons, header card, QR frame |
| `safe` | green (~`#16A34A`) on light green bg | Safe banner, check icons |
| `warning` | amber/orange | Suspicious icon, warnings |
| `danger` | red on light red bg | "Security Status: Suspicious" chip |
| `surface` / `background` | white / very light blue-grey | Cards / screen |
| Radius | 12–16 | Cards, buttons |
| Spacing scale | 4 · 8 · 12 · 16 · 24 · 32 | Layout |

> These are eyeballed — replace with Figma's actual values. Always pair color with **icon + text** (NFR-03/FR-07).

---

## 8. Testing Strategy

Keep it proportionate: the engine is small and is the heart of the project, so test it well; test the UI by hand.

| Level | Tool | What | Tier |
|-------|------|------|------|
| Unit | Jest | Each MVP rule: one pass case + one fail case; `parseQr` edge cases (empty, URL, malformed); report ID generator | **MVP** |
| Store | Jest | Payment gate transitions; report create / status change | SHOULD |
| Component | RNTL | Suspicious screen shows all actions; Report submit disabled until a reason is chosen | COULD |
| Manual | Real phone | Camera permission flows, Back-button behavior, deep-link attempt to `/pay/success` redirects Home | **MVP** |
| Usability | Sessions | `USABILITY_TESTING.md` | **MVP** |

**Target:** every rule in `rules.ts` has a passing and a failing test. No coverage percentage needed.

---

## 9. Conventions

- **TypeScript strict**; no `any` without a comment
- Components: `PascalCase.tsx`, hooks: `useThing.ts`, one component per file
- All strings through `src/data/copy.ts`
- No inline colors/spacing — use `theme`
- Add `accessibilityLabel` to interactive elements where time allows (COULD); never rely on color alone (MVP)
- Prefer `StyleSheet.create` (keeps dependencies low)

---

## 10. Known Constraints

- Expo Go can't test every native module; this stack avoids ones that need a custom dev build.
- Camera QR scanning depends on lighting/screen glare — keep **Simulate scan** in demo mode.
- Gallery QR decode and flash are COULD — drop them first if time runs short.
- Single developer: keep a working build on `main` at all times so the team can test and demo it.