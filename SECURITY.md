# Security Design

Owner: Rabanzo (Security Analyst) · Co-owner: Sabino (Security Design) · Implemented by: the developer

This document answers: **what are we protecting, from whom, how does the prototype detect it, and how do we communicate it without overwhelming users?**

> **Scope note:** TapTignan is a *usable-security interface prototype*. The checks below are **simulated** against local mock data. The research contribution is the *interaction design* (when, how, and how clearly we warn), not production-grade fraud detection.

---

## 1. Assets & Actors

| Item | Description |
|------|-------------|
| **Asset** | User's wallet balance and trust in QR payments |
| **Legitimate user** | E-wallet / online-banking user paying merchants by QR |
| **Attacker** | Scammer using fake or tampered QR codes |
| **Honest merchant** | Displays a genuine QR (printed or on a stand) |

## 2. Threat Model

| ID | Threat | Example | How it reaches the user |
|----|--------|---------|-------------------------|
| T-01 | **QR overlay ("quishing")** | Fake sticker pasted over a genuine QR at a parking meter/café | Physical, public places |
| T-02 | **Link-embedded QR** | QR opens a phishing site instead of a payment | Posters, flyers, messages |
| T-03 | **Merchant name spoofing** | QR shows "Cafe Manila" but pays a personal account | Name looks right at a glance |
| T-04 | **Personal account posing as merchant** | Merchant QR resolves to an individual's wallet | Informal sellers, stickers |
| T-05 | **Coercion / social engineering** | "Pay now or else" pressure | In person or via chat |
| T-06 | **Warning habituation** | Users tap through warnings that appear too often | Over time, from our own design |
| T-07 | **False reassurance** | "Safe" read as "guaranteed legitimate" | Our own wording |

Out of scope: malware on the device, network interception, account takeover, backend/wallet compromise.

---

## 3. Security Goals → Design Response

| Goal | Design response | Req |
|------|-----------------|-----|
| Make verification **unavoidable** | Mandatory check between *confirm* and *send* | FR-05 |
| Make recipient identity **visible** | Recipient/merchant/amount shown on confirm *and* result | FR-04, FR-08 |
| Make risk **obvious** | Safe/Suspicious verdict with icon + color + text | FR-07 |
| Make reasons **understandable** | Plain-language explanation per finding | FR-08, FR-12 |
| Make the safe action **easy** | Cancel and Report each a single tap | FR-10 |
| Capture community intelligence | Structured report with ID and tracked status | FR-13–15 |
| Handle our own mistakes | "Report incorrect flagging" | FR-16 |

---

## 4. Simulated Risk Rules

All rules run inside `evaluatePayment()`. Each returns a `Finding` (passed or failed) with a plain-language explanation.

**Tiers:** R-01 … R-05 are **MVP**. R-06 is SHOULD. R-07 is COULD. Wording of the "Example user-facing text" column is reviewed by the team (no jargon) and then handed to the developer for `copy.ts`.

| Rule | Check | Severity if failed | Maps to | Example user-facing text |
|------|-------|--------------------|---------|--------------------------|
| **R-01** (MVP) | QR payload parses as a valid payment QR | High | T-01 | "This QR code doesn't look like a standard payment code." |
| **R-02** (MVP) | QR contains **no embedded URL** | High | T-02 | "This QR code tries to open a website instead of paying a merchant." |
| **R-03** (MVP) | Recipient name **matches** the merchant name in the registry | High | T-03 | "The recipient name doesn't match the merchant this QR claims to be." |
| **R-04** (MVP) | Recipient exists in the registry **and is a merchant account**, not a personal wallet | Medium | T-04 | "This QR is linked to a personal account, not a registered merchant." |
| **R-05** (MVP) | QR has not been **reported** previously (local report list) | High | T-01, T-02 | "Other users have reported this QR code." |
| **R-06** (SHOULD) | Amount is within a plausible range for this merchant | Low | T-03 | "The amount is much higher than usual for this merchant." |
| **R-07** (COULD) | (Stretch) CRC/checksum valid on QR Ph / EMVCo payload | High | T-01 | "This QR code looks altered." |

> **R-07 caveat:** verify field layout and CRC method against the official QR Ph specification before implementing. If uncertain, skip it — don't present guessed validation as real.

### Verdict logic (3-Tier Usable Security System — Decision D-3)

```
if any failed finding is HIGH (URL embedded, name mismatch, invalid format, reported) → Suspicious (Red)
else if recipient is a personal GCash account / micro-merchant (R-04)               → Caution (Amber)
else                                                                                  → Safe (Green)
```

**Why 3 tiers?** In the Philippines, over 80% of daily QR transactions occur at sari-sari stores, tricycle terminals, and street vendors using personal P2P GCash accounts. If personal accounts are flagged as "Suspicious" (red), users experience severe **warning fatigue** and learn to dismiss all alerts. The **Caution** level validates legitimate micro-merchants while providing an actionable verbal check (*"Kayo po ba si [Name]?"*) before payment.

### Demo scenarios (fixtures)

The developer defines one payload string per scenario in `scenarios.ts`; the team turns each into a printed QR code for the camera demo and usability sessions.

| Scenario | Triggers | Verdict |
|----------|----------|---------|
| **Safe — Cafe Manila** | All pass | Safe |
| **Name mismatch** | R-03 (+ R-04) | Suspicious |
| **URL-embedded QR** | R-01/R-02 | Suspicious |

---

## 5. Usable-Security Design Decisions

| Principle | Applied as | Watch for |
|-----------|-----------|-----------|
| **Warn only when it matters** | Warning UI appears only for actual failed findings | Habituation (T-06) |
| **Explain, don't just alarm** | Every flag has a reason in plain Filipino-English-friendly language | Jargon like "CRC", "payload" |
| **Don't rely on color** | Icon + label + color | Color-blind users |
| **Make the secure path the easy path** | Primary button on Suspicious = *This doesn't look right*; Cancel one tap away | Hiding "continue" entirely feels paternalistic |
| **Don't over-promise** | Safe copy: *"No suspicious indicators found"*, never "100% safe" | T-07 |
| **Keep the time cost small** | Check ≈ 1.5–3 s with visible progress | Report §7 acknowledges added time — measure it in T1 |
| **Offer a way out of mistakes** | Report incorrect flagging; Cancel at every step | — |

### ⚠️ Decision D-1: proceeding after a Suspicious verdict

The Figma Suspicious screen offers *This doesn't look right* and *Cancel Payment* — no direct "continue". The report text, however, says it is "up to users to decide whether to proceed". Pick one and document it:

| Option | Pros | Cons |
|--------|------|------|
| **A. No proceed path** | Strongest protection | Blocks legit payments on false positives; no autonomy |
| **B. Proceed behind an extra confirm** (e.g., "I understand the risk" + countdown/typing) | Respects autonomy; adds friction proportional to risk | Some users will click through anyway |

Recommended: **B**, with friction scaled to severity. Whichever is chosen, test it in task T3.

---

## 6. Prototype Safeguards (engineering)

- [ ] Payment gate enforced by **store state**, not URL params (deep link to `/pay/success` must redirect Home)
- [ ] Back navigation can't re-enter a completed payment or skip the check
- [ ] No real account numbers, names, or phone numbers in the repo; use obviously fake data (`+63 9XX XXX XXXX` style)
- [ ] No network calls; no analytics SDKs
- [ ] Reports stored locally only; "Reset demo data" clears them
- [ ] Mask recipient number in the UI where Figma does (e.g., `+63 912 *** 6789`) — verify with design

---

## 7. Limitations (state these in the defense)

1. **Simulated detection.** Without a real backend, merchant registry, or fraud database, the app can't verify real QR codes. It demonstrates the *experience*.
2. **"Safe" ≠ guaranteed.** A scammer with a clean-looking QR linked to a mule account may pass. Copy and docs must not imply otherwise.
3. **False positives/negatives.** Handled by the incorrect-flagging flow, but not eliminated.
4. **Reports aren't actually reviewed.** *Under Review → Resolved* is simulated.
5. **Added friction.** A new step adds seconds; the trade-off is argued in the report (§7) and must be validated with users.
6. **Small-sample usability data.** 5–8 participants reveal problems; they don't prove effectiveness.

## 8. Path to a Real System (for Q&A)

| Prototype | Production equivalent |
|-----------|----------------------|
| Local registry | Wallet-provider merchant directory / BSP-aligned verification |
| Local reported-QR list | Shared, moderated report database with abuse controls |
| Heuristic rules | Rules + ML + reputation (domain age, blocklists) |
| Simulated review | Real fraud-ops triage workflow with SLAs |

## 9. Quick Reference — Defense Answers

| Likely question | Short answer |
|-----------------|--------------|
| *Why not just warn on the scanner?* | The scanner only sees an opaque string; the confirmation screen is where recipient identity is known. |
| *Won't users ignore the screen?* | Warnings only appear for real findings; we test click-through behavior in T2/T3. |
| *Is "Safe" reliable?* | It means "no indicators found", not a guarantee — wording reflects that. |
| *What if the check is wrong?* | Users can cancel, report, or flag the result as incorrect. |