# TapTignan [Academic Prototype - Non-Affiliated]

**A Pre-Payment Verification and Reporting Interface for Filipino Mobile Wallet Users**

IT 021 – Usable Security · Security Designer Group Project  
Group 7 · BSIT-IT31S4 · Technological Institute of the Philippines, Quezon City  

> ⚠️ **Academic prototype only.** TapTignan is an educational research project for IT 021 Usable Security at TIP Quezon City. It is not affiliated with, sponsored by, or endorsed by Mynt, Globe Telecom, or G-Xchange Inc. All data and transactions are simulated.

---

## The Problem

QR payments are fast, but a QR code is opaque — people can't tell what's inside it. Scammers exploit this with **quishing**: placing fake QR stickers over legitimate ones, or embedding malicious links. Today's payment flow goes straight from scan to pay, with no moment to verify *who* is being paid.

## The Idea

Add a short **security checkpoint between "confirm" and "send"** that:

1. **Guides the scan** — alignment frame and hints instead of a bare camera view
2. **Verifies before paying** — checks QR info, recipient details and security indicators
3. **Shows a clear verdict** — *Safe* or *Suspicious*, with plain-language reasons
4. **Lets users act** — continue, cancel, or report in a few taps
5. **Closes the loop** — structured reporting with an ID and a visible status

## Core Flow

```
Home → Scan QR → Confirm Payment → Security Check → ┬─ Safe ───────→ Payment Successful → Receipt
                                                    └─ Suspicious ─→ Review Details ─┬─ Cancel → Report / Other payment
                                                                                     └─ Report → Submitted → Activity
```

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | React Native with **Expo** (TypeScript) |
| Navigation | Expo Router (file-based) |
| Camera / QR | `expo-camera` |
| State | Zustand |
| Storage | AsyncStorage (local only) |
| Animation | React Native built-in `Animated` |
| Testing | Jest (`jest-expo`) — unit tests for the security engine |
| Design | Figma (high-fidelity prototype) |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start

# 3. Open on a device
#    - Scan the QR code with Expo Go (Android/iOS), or press `a` for an Android emulator
```

### Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Start Expo dev server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (security engine, report ID) |

### Demo mode

For presentations, Settings → **Demo mode** enables a "Simulate scan" button with three scenarios (Safe, Name mismatch, URL-embedded QR) so the demo never depends on camera conditions. The team prints QR codes for the same three scenarios from the payload strings in `src/data/mock/scenarios.ts`, so the live camera demo works too.

## Documentation

| File | What's inside |
|------|---------------|
| [`plan.md`](plan.md) | Phased checklist from setup to defense |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Functional/non-functional requirements + traceability matrix |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Folder structure, data models, state, theming, testing |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Threat model, risk rules, usable-security principles, limitations |
| [`docs/USABILITY_TESTING.md`](docs/USABILITY_TESTING.md) | Test plan, tasks, metrics, templates |

## Team

| Member | Role |
|--------|------|
| Quiambao, Adrian Carlo | Prototype and Technical Lead |
| Rabanzo, Francheska Ann Nicole | Security Analyst and Documentation Lead |
| Sabino, Marwan Bherooze | Documentation Lead and Security Design |
| Salamat, Mike Angelo | Project Lead and Prototype |
| Sostea, Joana Marie | User & Usability Analyst |

**Instructor:** Allan A. Burgos

> Development is handled by a single developer; the rest of the team owns design, copy, security review, usability testing and documents. See the *Division of Work* section in [`plan.md`](plan.md).

## Status

| Milestone | Status |
|-----------|--------|
| Problem, users, baseline analysis | ✅ Done |
| Figma high-fidelity prototype | ✅ Core flow done · 🔶 refinement in progress |
| React Native app | ⬜ Not started (MVP scope defined in `plan.md`) |
| Usability evaluation | ⬜ Not started |

See [`plan.md`](plan.md) for the live checklist.

## Links

- Figma prototype: _add link_
- Repository: _add link_
