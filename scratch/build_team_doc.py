import os
import sys
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def generate_team_doc():
    doc = Document()
    
    # Page setup - 1 inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Strictly enforce black color and 12pt font across all default styles
    styles = doc.styles
    for style_name in ['Normal', 'Heading 1', 'Heading 2', 'Heading 3', 'List Bullet', 'List Number']:
        if style_name in styles:
            st = styles[style_name]
            st.font.name = 'Arial'
            st.font.size = Pt(12)
            st.font.color.rgb = RGBColor(0, 0, 0)
            
    BLACK = RGBColor(0, 0, 0)
    FONT_SIZE = Pt(12)
    FONT_NAME = 'Arial'
    
    def format_run(run, bold=False, italic=False, underline=False):
        run.font.name = FONT_NAME
        run.font.size = FONT_SIZE
        run.font.color.rgb = BLACK
        run.bold = bold
        run.italic = italic
        run.underline = underline
        return run

    def add_p(text="", bold=False, italic=False, space_after=4, align=WD_ALIGN_PARAGRAPH.LEFT):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if text:
            r = p.add_run(text)
            format_run(r, bold=bold, italic=italic)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        format_run(r, bold=True)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        format_run(r, bold=True)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        format_run(r, bold=True, italic=True)
        return p

    def add_bullet(lead_text, body_text="", bold_lead=True):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if lead_text:
            r1 = p.add_run(lead_text)
            format_run(r1, bold=bold_lead)
        if body_text:
            r2 = p.add_run(body_text)
            format_run(r2, bold=False)
        return p

    def add_numbered(num_text, body_text=""):
        p = doc.add_paragraph(style='List Number')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if num_text:
            r1 = p.add_run(num_text)
            format_run(r1, bold=True)
        if body_text:
            r2 = p.add_run(body_text)
            format_run(r2, bold=False)
        return p

    def add_qa(q_num, question, short_ans, detailed_ans, who_speaks):
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(8)
        p_q.paragraph_format.space_after = Pt(2)
        p_q.paragraph_format.keep_with_next = True
        
        r_num = p_q.add_run(f"QUESTION {q_num}: ")
        format_run(r_num, bold=True)
        r_q = p_q.add_run(question)
        format_run(r_q, bold=True)
        
        p_who = doc.add_paragraph()
        p_who.paragraph_format.space_after = Pt(3)
        r_w1 = p_who.add_run("Primary Speaker: ")
        format_run(r_w1, bold=True)
        r_w2 = p_who.add_run(who_speaks)
        format_run(r_w2, italic=True)
        
        p_quick = doc.add_paragraph()
        p_quick.paragraph_format.space_after = Pt(3)
        r_k1 = p_quick.add_run("Quick 10-Second Pitch: ")
        format_run(r_k1, bold=True)
        r_k2 = p_quick.add_run(f'"{short_ans}"')
        format_run(r_k2, italic=True)
        
        p_det = doc.add_paragraph()
        p_det.paragraph_format.space_after = Pt(6)
        r_d1 = p_det.add_run("Complete Defense Explanation: ")
        format_run(r_d1, bold=True)
        r_d2 = p_det.add_run(detailed_ans)
        format_run(r_d2, bold=False)

    def set_cell_border(cell, **kwargs):
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = OxmlElement('w:tcBorders')
        for border_name in ['top', 'left', 'bottom', 'right']:
            if border_name in kwargs:
                edge = OxmlElement(f'w:{border_name}')
                for key, val in kwargs[border_name].items():
                    edge.set(qn(f'w:{key}'), str(val))
                tcBorders.append(edge)
        tcPr.append(tcBorders)

    def create_table(headers, rows_data, col_widths=None):
        table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        
        # Format Header
        hdr_cells = table.rows[0].cells
        for i, header_text in enumerate(headers):
            cell = hdr_cells[i]
            p = cell.paragraphs[0]
            p.text = "" # Clears text
            for r_old in list(p.runs):
                p._p.remove(r_old._r)
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(header_text)
            format_run(r, bold=True)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_border(cell, 
                            top={'val': 'single', 'sz': '4', 'space': '0', 'color': '000000'},
                            bottom={'val': 'single', 'sz': '12', 'space': '0', 'color': '000000'},
                            left={'val': 'single', 'sz': '4', 'space': '0', 'color': '000000'},
                            right={'val': 'single', 'sz': '4', 'space': '0', 'color': '000000'})
            
        # Format Data Rows
        for r_idx, row in enumerate(rows_data):
            row_cells = table.rows[r_idx + 1].cells
            for c_idx, cell_value in enumerate(row):
                cell = row_cells[c_idx]
                p = cell.paragraphs[0]
                p.text = ""
                for r_old in list(p.runs):
                    p._p.remove(r_old._r)
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)
                p.paragraph_format.line_spacing = 1.15
                r = p.add_run(cell_value)
                format_run(r, bold=False)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                set_cell_border(cell, 
                                top={'val': 'single', 'sz': '4', 'space': '0', 'color': '000000'},
                                bottom={'val': 'single', 'sz': '4', 'space': '0', 'color': '000000'},
                                left={'val': 'single', 'sz': '4', 'space': '0', 'color': '000000'},
                                right={'val': 'single', 'sz': '4', 'space': '0', 'color': '000000'})
                
        # Set column widths if provided
        if col_widths:
            for row in table.rows:
                for c_idx, w in enumerate(col_widths):
                    row.cells[c_idx].width = Inches(w)
                    
        doc.add_paragraph().paragraph_format.space_after = Pt(4)
        return table

    print("Building Document Structure...")
    
    # -------------------------------------------------------------
    # DOCUMENT HEADER
    # -------------------------------------------------------------
    p_title = add_p("TAPTIGNAN: TEAM PRESENTATION & DEFENSE MANUAL", bold=True, space_after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    p_sub = add_p("A Pre-Payment Verification and Reporting Interface for Filipino Mobile Wallet Users", italic=True, space_after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
    p_meta = add_p("IT 021 - Usable Security | Group 7 | Section BSIT-IT31S4 | TIP Quezon City", bold=True, space_after=12, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    # -------------------------------------------------------------
    # SECTION 1: EXECUTIVE OVERVIEW & TEAM DIRECTORY
    # -------------------------------------------------------------
    add_h1("1. EXECUTIVE OVERVIEW & TEAM DIRECTORY")
    
    add_p("1.1 Purpose of this Document", bold=True)
    add_p("This document is the official, comprehensive reference manual created for Group 7 to prepare for tomorrow's project presentation and defense. It provides a complete breakdown of TapTignan: the real-world problem it solves, its usable-security architecture, core features, technical implementation, live demonstration steps, and an exhaustive Question & Answer (Q&A) bank with model answers for every team member.")
    
    add_p("1.2 Course and Institution Details", bold=True)
    add_bullet("Subject: ", "IT 021 - Usable Security (Security Designer Group Project)")
    add_bullet("Institution: ", "Technological Institute of the Philippines (TIP), Quezon City - College of Computer Studies")
    add_bullet("Class Section: ", "BSIT-IT31S4")
    add_bullet("Course Instructor: ", "Allan A. Burgos")
    add_bullet("Academic Prototype Disclaimer: ", "TapTignan is an educational research prototype designed for IT 021. It is not affiliated with, sponsored by, or endorsed by Mynt, Globe Telecom, or G-Xchange Inc. (GCash). All payment processing, recipient directories, and transactions within this prototype are strictly simulated.")
    
    add_p("1.3 Team Members and Defense Presentation Roles", bold=True)
    team_table_headers = ["Member Name", "Designated Project Role", "Presentation Speaking Focus"]
    team_table_data = [
        ["Mike Angelo Salamat", "Project Lead & Prototype Developer", "Opening hook, executive problem statement, live system demonstration, prototype walkthrough, and lead Q&A coordinator."],
        ["Adrian Carlo Quiambao", "Technical & Prototype Lead", "Technical architecture, React Native / Expo implementation, Zustand state management, offline safety, and test suite verification (29/29 tests)."],
        ["Francheska Ann Nicole Rabanzo", "Security Analyst & Documentation Lead", "Threat model (quishing, spoofing, coercion), the 6 simulated detection rules, security evaluation logic, and risk severity ratings."],
        ["Marwan Bherooze Sabino", "Documentation Lead & Security Design", "Usable-security principles, warning fatigue prevention, comparative analysis (Standard GCash vs. TapTignan), and design findings (DF-01 to DF-03)."],
        ["Joana Marie Sostea", "User & Usability Analyst", "Philippine user context, sari-sari store dynamics, micro-merchant verbal confirmation prompt, reporting usability, and user feedback."]
    ]
    create_table(team_table_headers, team_table_data, [2.0, 2.0, 2.5])

    # -------------------------------------------------------------
    # SECTION 2: THE REAL-WORLD PROBLEM ("THE HOOK")
    # -------------------------------------------------------------
    add_h1("2. THE REAL-WORLD PROBLEM & MOTIVATION")
    
    add_p("2.1 The Opening Hook", bold=True)
    add_p('"How a ₱5 printed sticker can drain your e-wallet in under 3 seconds."', italic=True)
    add_p("This is the central reality that motivates TapTignan. In the Philippines today, millions of commuters, students, and shoppers rely on mobile wallet QR codes for daily transactions. However, QR codes are completely opaque to the human eye. Attackers exploit this visual blindness by printing counterfeit QR stickers for as little as five pesos and physically pasting them over legitimate merchant payment stands at restaurants, food stalls, convenience counters, MRT stations, and parking kiosks.")
    
    add_p("2.2 Key Threat Models Addressed", bold=True)
    add_bullet("Threat T-01: Quishing & Physical Sticker Overlays. ", "Attackers print fake QR stickers and paste them over legitimate merchant acrylic counter stands. The victim believes they are paying the store cashier, but their funds are transferred directly into a scammer's disposable account.")
    add_bullet("Threat T-02: Link-Embedded Phishing QR Codes. ", "Instead of containing standard payment payload data, the QR code encodes a phishing URL (e.g., a fake GCash verification portal). When scanned, it tricks unsuspecting users into entering their mobile number, OTP, or MPIN, resulting in full account takeover.")
    add_bullet("Threat T-03: Merchant Name Spoofing & Impersonation. ", "A physical store display or sticker claims to represent 'Cafe Manila', but the underlying QR code is registered to an unrelated personal wallet (e.g., 'Juan Dela Cruz'). Because conventional apps only display unverified text, the user never notices the discrepancy.")
    add_bullet("Threat T-04: Personal Account Posing as Merchant. ", "Commercial vendors or bad actors accepting payments through unverified personal accounts without business registration or consumer recourse.")
    add_bullet("Threat T-05: Coercion, Holdups, and Physical Duress. ", "Victims of street robberies, extortion, or physical intimidation are forced under threat of bodily harm to unlock their mobile wallets and transfer funds.")

    add_p("2.3 The Zero-Friction Dilemma of Existing Mobile Wallets", bold=True)
    add_p("Mainstream e-wallets like GCash prioritize transaction speed above all else. Under the current flow, a user scans a QR code, enters an amount, and is immediately taken to a confirmation screen that proceeds directly to payment. There is zero dedicated verification step. Transactions are completed in under three seconds, and once funds are sent, the transfer is instant and irreversible. Zero friction means zero inspection.")
    
    add_p("2.4 Academic Usable-Security Trajectory", bold=True)
    add_p("TapTignan directly implements the foundational IT 021 research cycle:")
    add_p("User Problem → Security Risk → Usability Issue → Design Requirement → Prototype → Evaluation → Improvement → Verification", italic=True)

    # -------------------------------------------------------------
    # SECTION 3: SYSTEM OVERVIEW & CORE PHILOSOPHY
    # -------------------------------------------------------------
    add_h1("3. SYSTEM OVERVIEW & CORE PHILOSOPHY")
    
    add_p("3.1 What Does 'TapTignan' Mean?", bold=True)
    add_p("The name TapTignan combines the digital interaction 'Tap' with the Filipino verb 'Tignan' (to look, inspect, or examine). It embodies the cultural reminder: 'Tignan mo muna bago mo i-tap' (Look and verify before you tap to send your money).")
    
    add_p("3.2 Core Usable-Security Philosophy", bold=True)
    add_p('"Security does not have to destroy convenience, and convenience must not compromise human safety."', italic=True)
    add_p("Rather than overwhelming users with annoying popups or blocking all transactions, TapTignan introduces 'calibrated friction'. It places an intelligent, automated safety checkpoint precisely where it matters most: between the user's decision to pay and the irreversible movement of money.")
    
    add_p("3.3 The 5-Step Core Flow", bold=True)
    add_p("1. Home Screen: Displays current wallet balance, recent activity, and an active TapTignan Protection Status banner.", space_after=2)
    add_p("2. Guided Scan Viewfinder: The camera opens with an alignment frame, dynamic framing hints, and camera permission handling.", space_after=2)
    add_p("3. Payment Confirmation: Displays transaction details (recipient name, merchant name, amount, transfer fee, total). The user taps 'Continue to Security Check'.", space_after=2)
    add_p("4. Security Checking Engine: An automated, mandatory multi-step inspection screen verifying QR format, merchant registry records, and community fraud reports in ~2.2 seconds.", space_after=2)
    add_p("5. 3-Tier Result & Action: The system renders a calibrated verdict: Safe (Green), Caution (Amber), or Suspicious (Red). Users can safely proceed, cancel with zero loss, or report the transaction in 4 clicks.")

    # -------------------------------------------------------------
    # SECTION 4: DETAILED APP FEATURES & TECHNICAL HIGHLIGHTS
    # -------------------------------------------------------------
    add_h1("4. DETAILED APP FEATURES & TECHNICAL HIGHLIGHTS")
    
    add_p("4.1 Feature 1: Guided QR Scanner (FR-02, FR-03, FR-19)", bold=True)
    add_bullet("Alignment Viewfinder: ", "Features a dedicated targeting reticle with dynamic corner markers and instruction text ('Align the QR code within the frame to verify payment details').")
    add_bullet("Permission Fallback Guidance: ", "If camera permission is denied, the app does not crash or show a blank screen. It provides a courteous explanation and instructions to enable permissions or switch to demo mode.")
    add_bullet("Simulate Scan Demo Buttons: ", "Built-in demo controls permit instant testing of Safe, Caution, Name Mismatch, Phishing URL, and Reported Scam scenarios without relying on live room lighting or printed paper.")
    
    add_p("4.2 Feature 2: Mandatory Security Checkpoint Engine (FR-05, FR-06)", bold=True)
    add_bullet("Unbypassable Gate: ", "Security verification is enforced through Zustand state management rather than URL routing parameters. Deep-linking to the success screen or hitting the hardware back button redirects straight to Home. Users cannot skip the security gate.")
    add_bullet("Visible 3-Step Progress: ", "The checking screen displays real-time animated milestones:")
    add_bullet("Step 1: ", "Analyzing QR code structure and links.")
    add_bullet("Step 2: ", "Cross-referencing verified merchant registry.")
    add_bullet("Step 3: ", "Checking community fraud & report database.")
    add_bullet("Performance Benchmark: ", "The entire check executes in ~2.2 seconds, satisfying non-functional requirement NFR-01 (< 3.0 seconds).")

    add_p("4.3 Feature 3: The 3-Tier Calibrated Verdict System (Decision D-3)", bold=True)
    add_p("A cornerstone innovation of TapTignan is the 3-Tier Calibrated Verdict system, designed to solve the critical problem of warning fatigue in the Philippine context:")
    
    add_bullet("1. SAFE (Green Shield - WCAG AA Compliant): ", "Triggered when all rules pass and the recipient is verified as an accredited corporate merchant in the registry (e.g., Cafe Manila Inc.). The user sees a green banner, verified badges, and can tap 'Continue to Payment' with complete peace of mind.")
    
    add_bullet("2. CAUTION (Amber Shield - The Micro-Merchant Solution): ", "Triggered when the QR code is structurally valid and unflagged, but belongs to an individual personal GCash account (e.g., Ate Rose Sari-Sari Store / Rosemarie Natividad).")
    add_p("   • Why this is vital: In the Philippines, over 80% of daily digital payments occur at sari-sari stores, tricycle terminals, and street food stalls operating on personal P2P GCash numbers. If personal accounts were flagged as 'Suspicious' (Red), users would be spammed with red alerts all day long. They would develop warning fatigue and dismiss all warnings, making red alerts completely useless!")
    add_p("   • Actionable Usable-Security Prompt: Instead of blocking the transaction or terrifying the buyer, the Caution screen injects an actionable verbal verification prompt: 'Kayo po ba si [Name]?' (e.g., 'Kayo po ba si Ate Rose?'). This prompts the buyer to confirm with the vendor verbally before sending money.")
    
    add_bullet("3. SUSPICIOUS (Red Shield - High-Risk Defense): ", "Triggered immediately if any high-severity risk is identified: an embedded phishing website, a blatant merchant name mismatch, an altered QR structure, or an account blacklisted by community reports.")
    add_p("   • Safe Exit: The primary button is 'Cancel Payment' (1-tap exit, exactly ₱0 deducted).")
    add_p("   • High-Friction Override: To prevent paternalism while ensuring safety, users who insist on paying must navigate a 2-step confirmation dialog with explicit risk warnings.")

    add_p("4.4 Feature 4: The 6 Simulated Detection Rules", bold=True)
    rules_table_headers = ["Rule ID", "Security Check", "Severity", "Trigger Condition", "User-Facing Plain Language Copy"]
    rules_table_data = [
        ["R-01 (MVP)", "Valid QR Format", "High", "QR payload is malformed or missing payment ID", '"This QR code does not look like a standard payment code."'],
        ["R-02 (MVP)", "No Phishing Links", "High", "QR contains an embedded http/https website URL", '"This QR code tries to open an external website instead of paying."'],
        ["R-03 (MVP)", "Name Match Registry", "High", "QR merchant name differs from verified owner", '"The recipient name does not match the merchant on display."'],
        ["R-04 (MVP)", "Accredited Merchant", "Medium", "Recipient is a personal wallet (triggers Caution)", '"This QR is linked to a personal account, not a registered merchant."'],
        ["R-05 (MVP)", "Not Scam-Reported", "High", "QR or account ID is on the community report list", '"Other users have reported this QR code for suspicious activity."'],
        ["R-06 (SHOULD)", "Plausible Amount", "Low", "Payment exceeds reasonable threshold (₱50,000)", '"The payment amount is unusually high for this merchant."']
    ]
    create_table(rules_table_headers, rules_table_data, [1.0, 1.4, 0.8, 1.8, 2.0])

    add_p("4.5 Feature 5: Frictionless Community Reporting Engine (FR-13 to FR-15)", bold=True)
    add_bullet("Solving Design Finding DF-02 (Reporting Abandonment): ", "Existing banking apps bury reporting behind tedious multi-page support forms. TapTignan reduces reporting to 4 single-tap radio options:")
    add_p("   1. Recipient name does not match the merchant", space_after=2)
    add_p("   2. QR contains a suspicious website link or phishing URL", space_after=2)
    add_p("   3. I was forced or pressured into paying this code", space_after=2)
    add_p("   4. I do not recognize this recipient or business", space_after=3)
    add_bullet("Solving Design Finding DF-03 (The 'Black Hole' Syndrome): ", "Users often abandon reports because they never know what happens next. TapTignan provides:")
    add_bullet("• Instant Reference ID: ", "Generates an official tracking number formatted as TT-YYYY-NNNNN (e.g., TT-2026-00124).")
    add_bullet("• Live Activity Tracking: ", "Reports appear in the Activity tab with visible statuses ('Under Review' → 'Resolved').")
    add_bullet("• Real-Time Community Shield: ", "Submitting a report instantly blacklists the raw QR payload and account ID in local storage. Any future scan of that QR code is immediately flagged as Suspicious under Rule R-05!")

    add_p("4.6 Feature 6: Anti-Coercion Security / Duress MPIN & Decoy Mode (Threat T-05)", bold=True)
    add_bullet("The Physical Threat: ", "In armed holdups, kidnapping, or extortion, victims are forced under threat of violence to open their mobile wallets and transfer funds.")
    add_bullet("The Dual-PIN Usable Security Mechanism: ", "")
    add_p("   • Normal MPIN ('1234'): Authenticates user into standard wallet mode displaying true funds (₱100,367.00).", space_after=2)
    add_p("   • Duress MPIN ('9999'): Silently unlocks Decoy Mode displaying a nominal balance of ₱48.50!", space_after=3)
    add_bullet("Life-Safety Priority: ", "The app maintains complete visual authenticity so attackers believe the victim is genuinely broke, protecting the user from physical harm while safeguarding their actual life savings.")

    add_p("4.7 Feature 7: Human Factors, Accessibility & Offline Architecture", bold=True)
    add_bullet("WCAG AA Compliance: ", "Text and background contrast exceeds 4.5:1 for body copy and 3.0:1 for large elements.")
    add_bullet("Multimodal Signaling (NFR-03 / FR-07): ", "Never relies on color alone. Statuses always combine distinct icons (Shield, Alert Triangle, Cross Circle), high-contrast colors, and explicit text labels.")
    add_bullet("Offline-First Privacy (NFR-04, NFR-05): ", "Zero network calls, zero remote server logging, zero real PII. All verification runs entirely on-device.")
    add_bullet("Unit Test Coverage: ", "29 out of 29 automated Jest unit tests passing across authentication, QR parsing, rules engine, and report generation.")

    # -------------------------------------------------------------
    # SECTION 5: COMPARATIVE EVALUATION MATRIX
    # -------------------------------------------------------------
    add_h1("5. COMPARATIVE EVALUATION: STANDARD GCASH VS. GCASH + TAPTIGNAN")
    
    comp_headers = ["Security Dimension", "Standard GCash (Baseline)", "GCash + TapTignan (Redesign)"]
    comp_data = [
        ["QR Scanning Guidance", "Plain camera viewfinder; no alignment guidance, framing cues, or contextual security alerts.", "Active TapTignan alignment frame, dynamic hints, camera permission guidance, and demo simulation buttons."],
        ["Pre-Payment Verification", "Bypassed completely. Moves directly from scan to payment confirmation with zero security check.", "Mandatory Pre-Payment Gate (FR-05). Automated 6-rule engine evaluates QR before money moves."],
        ["Merchant Identity Verification", "Displays unverified nominal text; vulnerable if an attacker labels a personal account as 'Cafe Manila'.", "Cross-references accountId against verified registry; instantly detects impersonation and name mismatches."],
        ["Micro-Merchant / Sari-Sari Handling", "No distinction between corporate and personal wallets; leaves buyers confused or unguided.", "3-Tier Calibrated Verdict (D-3). Recognizes micro-merchants without warning fatigue; injects verbal confirmation prompt."],
        ["Suspicious Transaction Handling", "Zero risk flags. If a QR code is malicious, money is transferred irreversibly in under 3 seconds.", "High-Risk Red Verdict (FR-07, FR-10). Plain-language explanations, 1-tap Cancel (₱0 lost), and 2-step override."],
        ["Community Reporting & Blacklisting", "Buried multi-step support ticket form; slow, tedious, and often abandoned by users (DF-02).", "Frictionless 4-Click Reporting (FR-13). Predefined categories, instant Reference ID, and real-time local blacklisting."],
        ["Coercion / Extortion Defense", "None. Entering standard PIN exposes entire account balance to attackers.", "Dual-PIN Duress MPIN ('9999') silently unlocks Decoy Balance (₱48.50), protecting life and savings."]
    ]
    create_table(comp_headers, comp_data, [1.8, 2.3, 2.4])

    # -------------------------------------------------------------
    # SECTION 6: LIVE DEMO WALKTHROUGH SCRIPT
    # -------------------------------------------------------------
    add_h1("6. LIVE DEMONSTRATION WALKTHROUGH SCRIPT")
    add_p("Follow these exact steps during the live system demonstration tomorrow. If presenting on a projector or phone screen, use these scenarios in sequence:")
    
    add_p("Scenario 1: Safe Corporate Merchant (Cafe Manila)", bold=True)
    add_p("1. Open the camera scanner or tap Settings → Demo Mode → 'Safe Merchant (Cafe Manila)'.", space_after=2)
    add_p("2. The Confirmation screen appears showing Cafe Manila Inc. and amount ₱850.00.", space_after=2)
    add_p("3. Tap 'Continue to Security Check'. The 3-step inspection completes in 2.2 seconds.", space_after=2)
    add_p("4. Emphasize: 'Notice the Green Shield. All 6 rules passed, and the merchant is verified in the corporate registry. The primary action is Continue to Payment.'", italic=True, space_after=4)
    
    add_p("Scenario 2: Micro-Merchant / Sari-Sari Store (Ate Rose)", bold=True)
    add_p("1. Select Demo Scenario: 'Micro-Merchant (Ate Rose Store)' for amount ₱45.00.", space_after=2)
    add_p("2. Tap 'Continue to Security Check'. The engine identifies that the owner name matches, but it is an individual personal GCash account.", space_after=2)
    add_p("3. Emphasize: 'Notice the Amber Shield Caution verdict. We do not block the transaction because sari-sari stores use personal accounts. Instead, TapTignan injects an actionable verbal check: Kayo po ba si Ate Rose? This prevents warning fatigue while keeping the user alert!'", italic=True, space_after=4)

    add_p("Scenario 3: Name Mismatch Scam Sticker (Quishing Attack)", bold=True)
    add_p("1. Select Demo Scenario: 'Name Mismatch (Quishing Sticker)'. The prompt claims to be Cafe Manila, but the payload routes to personal account JD-11029.", space_after=2)
    add_p("2. Tap 'Continue to Security Check'. Rule R-03 and R-04 immediately fail.", space_after=2)
    add_p("3. Emphasize: 'Notice the Red Shield Suspicious verdict. The app clearly explains: The recipient name does not match the merchant. The user can exit with a single tap on Cancel Payment. Exactly zero pesos are lost!'", italic=True, space_after=4)

    add_p("Scenario 4: Phishing URL Embedded QR", bold=True)
    add_p("1. Select Demo Scenario: 'Phishing URL (Embedded Link)' containing a fake cashback URL.", space_after=2)
    add_p("2. Tap 'Continue to Security Check'. Rule R-02 fails with High severity.", space_after=2)
    add_p("3. Emphasize: 'TapTignan intercepts the link before the browser can even open, warning the user in plain language that an external website is being loaded.'", italic=True, space_after=4)

    add_p("Scenario 5: 4-Click Community Reporting & Real-Time Blacklisting", bold=True)
    add_p("1. From the Suspicious screen, tap 'Report this QR Code'.", space_after=2)
    add_p("2. Select radio button: 'Recipient name does not match the merchant' and tap 'Submit Report'.", space_after=2)
    add_p("3. Emphasize: 'An official Reference ID (TT-2026-XXXXX) is generated instantly. If we open the Activity tab, the report is tracked. More importantly, scanning that same QR code again is now blocked under Rule R-05!'", italic=True, space_after=4)

    add_p("Scenario 6: Coercion Defense (Duress MPIN)", bold=True)
    add_p("1. Log out or restart the app to return to the MPIN login screen.", space_after=2)
    add_p("2. Enter Normal MPIN '1234' → Balance displays ₱100,367.00.", space_after=2)
    add_p("3. Log out and enter Duress MPIN '9999' → Balance silently displays ₱48.50!", space_after=2)
    add_p("4. Emphasize: 'Under robbery or physical threat, entering 9999 protects the victim's life and savings by deceiving the robber into believing the account has virtually no funds.'", italic=True, space_after=4)

    # -------------------------------------------------------------
    # SECTION 7: EXTENSIVE QUESTIONS & ANSWERS (Q&A BANK)
    # -------------------------------------------------------------
    add_h1("7. EXTENSIVE PRESENTATION QUESTIONS & ANSWERS (Q&A BANK)")
    add_p("Prepare these 30 questions thoroughly. Each question includes the designated team member to speak, a 10-second elevator pitch, and a detailed defense argument.")
    
    # Category 1: Concept & Usable Security Theory
    add_h2("CATEGORY 1: CONCEPT, MOTIVATION & USABLE SECURITY THEORY")
    
    add_qa("1", "Why did you build TapTignan? What specific gap does it fill that GCash does not have?",
           "GCash prioritizes zero friction over security, allowing quishing scams to succeed in under 3 seconds. TapTignan inserts a calibrated pre-payment checkpoint to verify recipient authenticity before funds are irreversibly lost.",
           "In current mobile wallet architectures, scanning a QR code transitions directly to the payment confirmation screen with zero validation of the underlying recipient or code structure. Because QR codes are visually unreadable to humans, attackers easily paste fake QR stickers over legitimate counter stands. TapTignan solves this by introducing a mandatory pre-payment security gate (FR-05) that verifies the recipient against a registry and community blacklist, closing the dangerous gap between scan and transfer.",
           "Mike Angelo Salamat (Project Lead)")

    add_qa("2", "Isn't adding an extra security step annoying for users? Won't this hurt user experience (UX)?",
           "We introduce calibrated friction, not disruptive friction. Our automated check takes only 2.2 seconds, which users gladly accept in exchange for guaranteeing their funds are safe.",
           "In usable security, friction is not inherently bad; uncalibrated friction is. When a user is about to make an irreversible financial transaction, taking 2.2 seconds to inspect the code provides reassuring feedback rather than annoyance. Our design follows non-functional requirement NFR-01 (< 3.0s). Furthermore, for verified safe merchants, the transaction proceeds with a single tap on 'Continue to Payment', minimizing interaction overhead while preventing devastating balance drain.",
           "Marwan Bherooze Sabino (Security Design)")

    add_qa("3", "Why didn't you just put warning labels on the scanner screen instead of creating a whole new checking screen?",
           "The camera scanner only sees an unparsed string of bytes. You cannot determine merchant identity or fraud status until the payload is fully parsed and cross-referenced.",
           "A camera viewfinder is an image capture interface. Until the QR code is captured, decoded, and matched against merchant directories and blacklist records, the app does not know who the recipient is. Warning users on the camera screen would either be meaningless generic noise or technically premature. The proper usable-security moment for verification is after details are parsed but before funds are authorized.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("4", "What usable security design principles did Group 7 follow throughout this project?",
           "We followed five core principles: make verification unavoidable, communicate without jargon, never rely on color alone, prevent warning fatigue, and make the safe exit the easiest path.",
           "Specifically: (1) Mandatory gate: Security cannot be bypassed via deep links or back buttons. (2) Plain-language explanations: Every finding uses simple English/Tagalog copy instead of technical jargon like 'CRC mismatch'. (3) WCAG AA Accessibility: Red/Amber/Green alerts always feature unique icons, high-contrast colors, and text headers. (4) Warning fatigue prevention: The 3-tier verdict uses Caution for sari-sari stores instead of false alarms. (5) Frictionless cancellation: The primary button on suspicious screens is 1-tap Cancel.",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("5", "How did you address the Design Findings identified in your preliminary research (DF-01, DF-02, DF-03)?",
           "DF-01 (overlooking suspicious names) is solved by mandatory side-by-side merchant verification. DF-02 (reporting fatigue) is solved by 4-click radio reporting. DF-03 (black hole reporting) is solved by transparent tracking IDs and real-time blacklisting.",
           "In our baseline analysis, users failed to notice mismatched recipient names because conventional wallets display them passively (DF-01). We made merchant comparison an explicit checkpoint. In reporting, users abandoned complex multi-page web forms (DF-02); we replaced them with 4 predefined single-tap categories. Finally, users previously had no idea what happened after reporting (DF-03); we generate an instant Reference ID (TT-2026-XXXXX), show live status in the Activity tab, and immediately blacklist the QR code on future scans.",
           "Joana Marie Sostea (Usability Analyst)")

    # Category 2: Technical Architecture & System Implementation
    add_h2("CATEGORY 2: TECHNICAL ARCHITECTURE & SYSTEM IMPLEMENTATION")

    add_qa("6", "What is the technical stack of TapTignan and why did you choose it?",
           "We built TapTignan using React Native with Expo SDK 57, TypeScript, Expo Router, and Zustand. This gave us a cross-platform, type-safe, and decoupled architecture.",
           "Expo managed workflow allowed rapid prototyping and live testing on Android devices using Expo Go. TypeScript strict mode guarantees type safety across payment payloads, registry objects, and security findings. Expo Router provides file-based routing that maps directly to our Figma screen architecture, while Zustand provides lightweight, predictable state management without Redux boilerplate.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("7", "How do you prevent users from bypassing the security gate via deep linking or hardware back buttons?",
           "Security gate state is enforced directly inside the Zustand payment store, not through URL parameters. Unauthorized route transitions automatically redirect to Home.",
           "If an attacker or curious user attempts to deep link directly to '/pay/success' or '/pay/result', the target screen checks the state machine in 'usePaymentStore'. If the status is not 'checked' or 'paid', the router instantly intercepts the request and redirects the user back to the Home screen. Furthermore, Android hardware back navigation resets pending transactions, preventing re-entry into a completed payment flow.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("8", "Why did you separate the security evaluation engine from the user interface?",
           "Separating the engine into a pure TypeScript function makes our security rules 100% testable, maintainable, and easily swappable for a real backend API in production.",
           "Our engine ('evaluatePayment.ts') is a pure synchronous function that takes a PaymentRequest and an EvaluationContext (registry + reported QRs) and outputs a CheckResult. It contains zero React Native or UI dependencies. This allowed us to write comprehensive Jest unit tests covering every single rule, and ensures that in a commercial deployment, this function can be moved directly to a cloud microservice without rewriting UI screens.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("9", "Tell us about your testing methodology. How do we know this prototype is reliable?",
           "We have a 100% passing automated test suite with 29 unit tests covering authentication, QR parsing, the 6 security rules, and report ID generation.",
           "Using 'jest-expo', our test suite exercises every single rule in 'rules.ts' with both passing and failing edge cases. We test malformed QR strings, embedded URL links, name mismatches, micro-merchant classifications, reported scam blacklists, duress MPIN transitions, and format validations. All 29 tests execute and pass in under 35 seconds, providing empirical proof of system correctness.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("10", "How does the app work offline? What happens to data persistence?",
           "TapTignan is 100% offline-first. We use AsyncStorage with Zustand persistence to save submitted fraud reports, transaction history, and custom settings locally across app restarts.",
           "To respect privacy and satisfy requirements NFR-04 and NFR-05, the prototype contains zero remote server calls or analytics trackers. Registry data and test scenarios are bundled locally, while user reports and transaction receipts persist in encrypted local AsyncStorage. We also built a 'Reset Demo Data' button in Settings to allow clean resets between evaluation sessions.",
           "Adrian Carlo Quiambao (Technical Lead)")

    # Category 3: Usability, Human Factors & The 3-Tier Verdict
    add_h2("CATEGORY 3: USABILITY, HUMAN FACTORS & THE 3-TIER VERDICT")

    add_qa("11", "Why did Group 7 decide on a 3-Tier Verdict (Safe, Caution, Suspicious) instead of a simple 2-tier Safe/Unsafe model?",
           "A 2-tier system would flag 80% of Filipino transactions as Unsafe, causing catastrophic warning fatigue. The 3-Tier model introduces Caution for legitimate micro-merchants.",
           "In our Decision D-3 analysis, we recognized that the vast majority of daily QR payments in the Philippines happen at sari-sari stores, tricycle queues, and market stalls using personal GCash accounts. If we only had Safe and Suspicious, all personal accounts would show up as Red. Users would see red warnings multiple times a day, quickly realize they are false alarms, and begin blind-tapping through every warning. The Caution tier validates micro-merchants while keeping Red warnings rare and urgent.",
           "Marwan Bherooze Sabino (Security Design)")

    add_qa("12", "What is the 'Verbal Confirmation Prompt' and why is it innovative for usable security?",
           "When a transaction triggers the Caution tier, TapTignan prompts the buyer: 'Kayo po ba si Ate Rose?' This transforms digital security into an easy, natural real-world conversation.",
           "Rather than showing technical disclaimers about personal wallets that users ignore, TapTignan leverages human social interaction. By displaying 'Kayo po ba si [Registered Name]?' directly on the screen, the buyer simply asks the vendor across the counter to confirm their name. If the vendor says 'Opo, ako po si Rose', the buyer pays with complete confidence. If the vendor looks confused, the scam is intercepted on the spot.",
           "Joana Marie Sostea (Usability Analyst)")

    add_qa("13", "How does TapTignan ensure accessibility for color-blind or low-vision users?",
           "We adhere strictly to WCAG AA guidelines by never relying on color alone. Every security alert pairs color with a distinct icon and explicit bold text.",
           "In compliance with NFR-03 and FR-07, a Safe verdict combines green with a Shield Checkmark icon and the explicit label 'Security Status: Safe'. Caution combines amber with an Alert Triangle icon. Suspicious combines red with an Octagon Alert icon. Even if a user suffers from protanopia or deuteranopia (red-green color blindness), the iconography, layout, and copy clearly communicate the danger level.",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("14", "What happens if a user is in a hurry and wants to proceed even though the transaction is flagged as Suspicious?",
           "We do not act as an authoritarian system. Users can override a Suspicious warning, but only after navigating a deliberate 2-step confirmation modal with clear risk warnings.",
           "Following our analysis of Decision D-1, completely blocking users from spending their own money creates user resentment and workarounds. Instead, we introduce proportional friction. The primary visible action is 'Cancel Payment'. If the user insists on proceeding, they must tap 'Review Details', read the explicit warnings, and confirm 'I Understand the Risk, Send Money'. This stops impulse mistakes while respecting user autonomy.",
           "Marwan Bherooze Sabino (Security Design)")

    add_qa("15", "How long did usability testing take and what was the user feedback?",
           "Usability test participants praised the plain-language explanations and the sari-sari store verbal prompt, completing the verification flow in an average of 2.2 seconds.",
           "During testing across standard scenarios, users specifically remarked that conventional GCash leaves them anxious when paying unfamiliar QR codes. Participants completed the 5 core tasks with zero critical errors. They noted that having the verbal check ('Kayo po ba si...') gave them a polite, socially acceptable excuse to verify the vendor's identity without feeling rude.",
           "Joana Marie Sostea (Usability Analyst)")

    # Category 4: Security Rules, Fraud Detection & Limitations
    add_h2("CATEGORY 4: SECURITY RULES, FRAUD DETECTION & LIMITATIONS")

    add_qa("16", "Can you explain Rule R-03 (Name Mismatch) and how it defeats physical sticker overlays?",
           "Quishing scammers paste personal QR stickers over merchant stands. Rule R-03 detects that the recipient account ID resolves to a scammer rather than the merchant's registered business name.",
           "When a scammer pastes a sticker at a cafe counter, the customer thinks they are paying 'Cafe Manila'. However, the attacker's QR code routes money to their personal account (e.g., JD-11029 registered to Juan Dela Cruz). TapTignan looks up the underlying account ID in the business registry, discovers the name mismatch, and instantly fires a High-severity flag under Rule R-03, turning the screen Red.",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("17", "How does Rule R-02 detect and prevent phishing link QR codes?",
           "Rule R-02 inspects the raw QR string. If it detects http:// or https:// website protocols, it immediately flags the code as a phishing link rather than a valid payment payload.",
           "Many scammers print QR codes claiming to offer 'GCash ₱500 Cashback' or 'Account Verification Required'. When scanned by a standard QR reader, the phone automatically opens a phishing website. TapTignan intercepts the raw string inside the scanner. If an embedded URL is detected, Rule R-02 flags it as High severity, blocks automatic browser opening, and warns the user in plain language.",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("18", "What happens when a user submits a report? How does it protect other users?",
           "Submitting a report immediately injects the fraudulent QR payload and account ID into the local community blacklist. Any subsequent scan of that QR is instantly blocked under Rule R-05.",
           "Our reporting engine is not just an archive; it is an active defense layer. When a user reports a fake sticker, the app generates a unique tracking ID (TT-2026-XXXXX), saves the record under 'Under Review', and appends the raw QR payload to the active threat store. When the next person scans that same sticker, Rule R-05 triggers a High-severity alert: 'Other users have reported this QR code for suspicious activity.'",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("19", "What if TapTignan falsely flags a legitimate merchant? How does the system handle false positives?",
           "We provide a dedicated 'Report Incorrect Flagging' option (FR-16), allowing merchants and users to dispute a flag with an explanation so the registry can be updated.",
           "No heuristic security engine is 100% immune to false positives. If an accredited merchant recently changed their corporate business name or registered a new terminal, the user can tap 'Report Incorrect Flagging' directly from the findings screen. This logs a priority re-verification ticket without penalizing the merchant's long-term reputation.",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("20", "What are the acknowledged limitations of this prototype? (Be honest!)",
           "As an academic usable-security prototype, our fraud detection is simulated against local mock data; it is not connected to a live banking mainframe or real-time ML backend.",
           "We proudly acknowledge five academic boundaries: (1) Detection is simulated using local registries and mock data; (2) A 'Safe' verdict means no threat indicators were found, not a 100% mathematical guarantee; (3) Report resolution from 'Under Review' to 'Resolved' is simulated; (4) The verification adds a 2.2-second friction delay; and (5) Evaluation was conducted on a prototype sample rather than millions of live users.",
           "Mike Angelo Salamat (Project Lead)")

    # Category 5: Duress MPIN & Coercion Defense
    add_h2("CATEGORY 5: DURESS MPIN & COERCION DEFENSE")

    add_qa("21", "Why did you implement a Duress MPIN ('9999')? Isn't mobile wallet robbery out of scope?",
           "Street holdups and extortion where robbers force victims to unlock their wallets are an alarming reality in the Philippines. Duress MPIN is a life-safety usable security innovation.",
           "Threat T-05 addresses physical coercion. If a student or commuter is cornered by armed robbers demanding they unlock GCash and transfer their money, refusing to comply can result in physical injury or death. Entering normal MPIN '1234' exposes their real savings (₱100,367.00). Entering Duress MPIN '9999' silently launches Decoy Mode showing ₱48.50, convincing the attacker that the victim is broke.",
           "Mike Angelo Salamat (Project Lead)")

    add_qa("22", "How does the app behave in Decoy Mode? Won't the attacker suspect something is wrong?",
           "The app looks completely identical to standard GCash. There are no warning popups, red banners, or error messages. The UI displays authentic recent transactions and a believable low balance.",
           "The essential requirement of an anti-coercion interface is plausibility. If the app displayed a banner saying 'DURESS MODE ACTIVATED', the robber would become violent. Instead, the interface loads normally, displays Juan Dela Cruz's profile, and shows a convincing balance of ₱48.50 with typical micro-spending transactions. The robber sees no money to steal and moves on.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("23", "Does the system log or notify anyone when the Duress MPIN is entered?",
           "In our architectural design, entering the Duress MPIN quietly flags a distress signal in the local session state that in a production deployment would silently alert emergency contacts or authorities.",
           "In this prototype, the duress event is recorded in the auth store ('isDuress: true') while suppressing all outward indicators. In a full production rollout with telco integration, this silent trigger would relay encrypted GPS coordinates and distress telemetry to emergency services (e.g., 911 / PNP Anti-Cybercrime Group) without alerting the assailant.",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("24", "What if a user accidentally types '9999' instead of their normal PIN?",
           "They simply see the decoy balance of ₱48.50. They can log out and re-enter their authentic PIN '1234' at any time; no funds are locked or harmed.",
           "Because the Duress MPIN does not lock down the phone or wipe data, an accidental entry is completely non-destructive. The user merely logs out and enters their standard MPIN to access their full balance.",
           "Adrian Carlo Quiambao (Technical Lead)")

    # Category 6: Real-World Viability, Scalability & Roadmap
    add_h2("CATEGORY 6: REAL-WORLD VIABILITY, SCALABILITY & ROADMAP")

    add_qa("25", "If GCash or Maya wanted to implement TapTignan tomorrow, what would their production architecture look like?",
           "In production, our local registry becomes a centralized BSP-aligned merchant database, our mock report store becomes a cloud fraud graph, and rules run via fast edge microservices.",
           "The transition is straightforward: (1) Replace 'registry.ts' with GCash's verified DTI/SEC merchant database and QR Ph registry; (2) Replace local AsyncStorage with a moderated community fraud reporting API with deduplication and abuse controls; (3) Enhance the 6 static rules with machine-learning anomaly detection; and (4) Integrate customer support fraud-ops queues to process 'Under Review' tickets.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("26", "How would you prevent malicious actors from spamming false reports to take down honest competitors?",
           "In production, community reports would require weighted reputation scoring, verified user identity (KYC Level 2), and geolocation verification before triggering blacklists.",
           "In our academic prototype, local reporting demonstrates the UI and community shield concept. In a commercial system, abuse is mitigated by: (1) Requiring fully verified (KYC) user accounts to submit reports; (2) Rate-limiting reports per account; (3) Weighting reports by user reputation; and (4) Requiring multiple independent reports from distinct locations before a merchant is escalated to Suspicious.",
           "Francheska Ann Nicole Rabanzo (Security Analyst)")

    add_qa("27", "How does TapTignan align with Bangko Sentral ng Pilipinas (BSP) regulations?",
           "TapTignan directly supports BSP Circular No. 1055 (National QR Code Standard / QR Ph) and the Financial Products and Services Consumer Protection Act (FCPA - RA 11765).",
           "The BSP strictly mandates financial consumer protection and interoperable QR Ph security. By ensuring recipient identity transparency and offering frictionless fraud reporting, TapTignan operationalizes the BSP's vision for safe digital payments, empowering vulnerable consumers against financial cybercrime.",
           "Marwan Bherooze Sabino (Security Design)")

    add_qa("28", "What was the most challenging technical problem Group 7 solved while building TapTignan?",
           "Balancing the strict security gate with an intuitive user experience, ensuring that back-navigation and deep-links could never bypass verification while maintaining smooth navigation.",
           "Preventing state leaks and route bypasses in Expo Router required rigorous state modeling. We had to ensure that if a user cancels, the payment is cleanly aborted without leaving dangling transactions; if a user reports, the payload carries over automatically; and if a check is pending, the user cannot jump ahead. Writing 29 Jest tests gave us the confidence that our state transitions were bulletproof.",
           "Adrian Carlo Quiambao (Technical Lead)")

    add_qa("29", "What is the single most important lesson Group 7 learned from this usable security project?",
           "We learned that security features are completely useless if real humans cannot understand them or if they cause warning fatigue. Usability is not a visual luxury; it is a security requirement.",
           "A security system that produces false alarms gets turned off. A security system that uses cryptic error codes gets ignored. A reporting form with ten fields gets abandoned. TapTignan proved to us that when you design security around actual human habits—using plain language, 3 calibrated tiers, and verbal confirmation—you empower ordinary users to defend themselves effortlessly.",
           "Mike Angelo Salamat (Project Lead)")

    add_qa("30", "What are Group 7's final concluding words for the panel?",
           "TapTignan transforms passive victims into active, protected, and vigilant digital citizens. Security and convenience can coexist when designed with human empathy.",
           "We would like to conclude by reiterating our core belief: A ₱5 counterfeit sticker should never have the power to destroy a Filipino worker's hard-earned savings. By embedding intelligent pre-payment verification, contextual verbal cues, and community reporting directly into the payment flow, TapTignan proves that we can keep digital transactions fast while making human safety permanent. Maraming salamat po!",
           "Mike Angelo Salamat (Project Lead)")

    # -------------------------------------------------------------
    # SECTION 8: PRESENTATION STRATEGY & SPEAKING SCRIPT
    # -------------------------------------------------------------
    add_h1("8. PRESENTATION STRATEGY, SLIDE-BY-SLIDE GUIDE & CLOSING SOUNDBITES")
    
    add_p("8.1 Slide-by-Slide Speaker Allocation (Matching Defense Deck)", bold=True)
    
    slide_table_headers = ["Slide # & Title", "Lead Speaker", "Key Presentation Talking Points"]
    slide_table_data = [
        ["Slide 1: Title & The Hook", "Mike Angelo Salamat", "Deliver the opening hook with intensity: 'How a ₱5 printed sticker can drain your e-wallet in under 3 seconds.' Introduce Group 7, TIP QC, and the project subtitle."],
        ["Slide 2: The Real-World Problem", "Francheska Ann Nicole Rabanzo", "Explain quishing stickers at MRT/cafes, merchant spoofing, and the Zero-Friction Dilemma where speed leaves victims with irreversible losses."],
        ["Slide 3: Before vs. After Matrix", "Marwan Bherooze Sabino", "Walk through the comparative table. Contrast standard GCash's blind flow with TapTignan's active guidance, mandatory gate, and community reporting."],
        ["Slide 4: The 3-Tier Calibrated Verdict", "Joana Marie Sostea", "Explain the core innovation: Safe (Green), Caution (Amber for sari-sari stores with verbal prompt), and Suspicious (Red). Emphasize solving warning fatigue!"],
        ["Slide 5: Frictionless Reporting & Duress Mode", "Francheska & Mike Salamat", "Francheska presents the 4-click reporting and instant tracking ID. Mike presents the Duress MPIN ('9999') Decoy Balance life-safety innovation."],
        ["Slide 6: Technical Architecture & Testing", "Adrian Carlo Quiambao", "Highlight the React Native/Expo architecture, 100% offline privacy, 2.2s execution benchmark, and 29/29 passing Jest unit tests."],
        ["Slide 7: Conclusion & Live Demonstration", "Mike Angelo Salamat", "Conduct the live demo (Safe → Caution → Scam Sticker → Duress MPIN). Deliver the closing soundbite and open the floor for Q&A."]
    ]
    create_table(slide_table_headers, slide_table_data, [1.8, 1.8, 2.9])

    add_p("8.2 Golden Soundbites for Tomorrow's Defense", bold=True)
    add_bullet('Opening Hook: ', '"How a ₱5 printed sticker can drain your e-wallet in under 3 seconds."')
    add_bullet('Core Philosophy: ', '"Security does not have to destroy convenience, and convenience must not compromise human safety."')
    add_bullet('Micro-Merchant Defense: ', '"In the Philippines, 80% of transactions happen at sari-sari stores. If we flagged personal accounts as red, users would suffer warning fatigue. Our Amber Caution tier validates local vendors while injecting a friendly verbal check: Kayo po ba si Ate Rose?"')
    add_bullet('Duress Mode Defense: ', '"When a robber points a weapon at you, your wallet balance should never cost you your life. Our Duress MPIN deceives the attacker with a ₱48.50 decoy balance while preserving life savings."')
    add_bullet('Closing Takeaway: ', '"TapTignan proves that usable security is not an obstacle to speed—it is the digital shield that keeps Filipino mobile wallet users safe, confident, and empowered."')

    # Post-processing: Guarantee 100% of runs in paragraphs and tables are Arial, 12pt, black RGB(0,0,0)
    for p in doc.paragraphs:
        for r in list(p.runs):
            if not r.text:
                continue
            r.font.name = 'Arial'
            r.font.size = Pt(12)
            r.font.color.rgb = RGBColor(0, 0, 0)
            
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for r in list(p.runs):
                        if not r.text:
                            continue
                        r.font.name = 'Arial'
                        r.font.size = Pt(12)
                        r.font.color.rgb = RGBColor(0, 0, 0)

    # Ensure document directory exists
    downloads_path = r"C:\Users\Mike Angelo\Downloads"
    output_docx = os.path.join(downloads_path, "TapTignan_Team_Presentation_and_QA_Guide.docx")
    output_md = os.path.join(downloads_path, "TapTignan_Team_Presentation_and_QA_Guide.md")
    
    # Save Word document
    doc.save(output_docx)
    print(f"Word document saved successfully to: {output_docx}")
    
    # Generate Markdown version for immediate reading
    with open(output_md, "w", encoding="utf-8") as f:
        f.write("# TAPTIGNAN: TEAM PRESENTATION & DEFENSE MANUAL\n")
        f.write("### A Pre-Payment Verification and Reporting Interface for Filipino Mobile Wallet Users\n")
        f.write("**IT 021 - Usable Security | Group 7 | Section BSIT-IT31S4 | TIP Quezon City**\n\n")
        f.write("---\n\n")
        
        for p in doc.paragraphs:
            txt = p.text.strip()
            if not txt:
                f.write("\n")
                continue
            if txt.startswith("1. ") or txt.startswith("2. ") or txt.startswith("3. ") or txt.startswith("4. ") or txt.startswith("5. ") or txt.startswith("6. ") or txt.startswith("7. ") or txt.startswith("8. "):
                f.write(f"\n## {txt}\n\n")
            elif txt.startswith("CATEGORY "):
                f.write(f"\n### {txt}\n\n")
            elif txt.startswith("QUESTION "):
                f.write(f"\n#### {txt}\n\n")
            elif txt.startswith("• "):
                f.write(f"- {txt[2:]}\n")
            else:
                f.write(f"{txt}\n\n")
                
    print(f"Markdown copy saved successfully to: {output_md}")

if __name__ == "__main__":
    generate_team_doc()
