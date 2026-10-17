import os
import qrcode
from PIL import Image, ImageDraw, ImageFont

def get_font(name, size, bold=False):
    font_file = "segoeuib.ttf" if bold else "segoeui.ttf"
    path = os.path.join("C:/Windows/Fonts", font_file)
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    alt = "arialbd.ttf" if bold else "arial.ttf"
    path_alt = os.path.join("C:/Windows/Fonts", alt)
    if os.path.exists(path_alt):
        return ImageFont.truetype(path_alt, size)
    return ImageFont.load_default()

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=int(width))

SCENARIOS = [
    {
        "id": "0_My_GCash_QR_JuanDelaCruz",
        "flag_type": "PERSONAL",
        "flag_badge": "MY GCASH QR (RECEIVE MONEY)",
        "badge_bg": "#dbeafe",
        "badge_fg": "#1d4ed8",
        "theme_color": "#0073f6",
        "title": "My GCash QR: Juan Dela Cruz",
        "subtitle": "Personal Wallet (+63 908 345 6789)",
        "raw_qr": "TAPTIGNAN:PAY:JD-11029:Juan Dela Cruz:100.00",
        "amount": "PHP 100.00 (Standard)",
        "account": "JD-11029 (Juan Dela Cruz)",
        "verdict_text": "VERDICT: CAUTION (Micro-Merchant / Personal Wallet)",
        "check_details": [
            "[PASS] R-01 Valid payment QR structure",
            "[PASS] R-02 No malicious links detected",
            "[PASS] R-03 Recipient matches Juan Dela Cruz",
            "[FLAG] R-04 Personal wallet (Triggers Usable Security verbal check)",
            "[PASS] R-05 No prior fraudulent reports"
        ],
        "presentation_tip": "Demo Story: User generates their own QR code to receive money. When scanned by another user, it prompts a verbal confirmation check."
    },
    {
        "id": "1_Safe_Merchant_CafeManila",
        "flag_type": "SAFE",
        "flag_badge": "FLAG 1: SAFE (VERIFIED MERCHANT)",
        "badge_bg": "#dcfce7",
        "badge_fg": "#15803d",
        "theme_color": "#16a34a",
        "title": "Safe Merchant: Cafe Manila Inc.",
        "subtitle": "Accredited Corporate GCash Business Merchant",
        "raw_qr": "TAPTIGNAN:PAY:CM-98231:Cafe Manila Inc.:850.00",
        "amount": "PHP 850.00",
        "account": "CM-98231 (Cafe Manila Inc.)",
        "verdict_text": "VERDICT: SAFE (Passes All Checks)",
        "check_details": [
            "[PASS] R-01 Valid payment QR structure",
            "[PASS] R-02 No malicious embedded hyperlinks",
            "[PASS] R-03 Recipient matches verified merchant registry",
            "[PASS] R-04 Verified accredited business merchant account",
            "[PASS] R-05 No prior fraudulent reports in database"
        ],
        "presentation_tip": "Demo Story: Customer pays Cafe Manila. TapTignan verifies the business registry. User proceeds directly to pay."
    },
    {
        "id": "2_Caution_MicroMerchant_AteRose",
        "flag_type": "CAUTION",
        "flag_badge": "FLAG 2: CAUTION (MICRO-MERCHANT)",
        "badge_bg": "#fef3c7",
        "badge_fg": "#b45309",
        "theme_color": "#d97706",
        "title": "Micro-Merchant: Ate Rose Store",
        "subtitle": "Personal Wallet (Sari-Sari Store / Local Vendor)",
        "raw_qr": "TAPTIGNAN:PAY:RN-33210:Rosemarie Natividad:45.00",
        "amount": "PHP 45.00",
        "account": "RN-33210 (Rosemarie Natividad)",
        "verdict_text": "VERDICT: CAUTION (Usable Security Verbal Check)",
        "check_details": [
            "[PASS] R-01 Valid payment QR structure",
            "[PASS] R-02 No malicious embedded hyperlinks",
            "[PASS] R-03 Recipient matches registered wallet owner",
            "[FLAG] R-04 Unaccredited personal GCash wallet (Not a registered corp)",
            "[PASS] R-05 No prior fraud complaints on record"
        ],
        "presentation_tip": "Demo Story: Customer pays at sari-sari store. TapTignan shows amber badge and prompts verbal confirmation: 'Is this Rosemarie Natividad?'"
    },
    {
        "id": "3_Suspicious_NameMismatch_Quishing",
        "flag_type": "SUSPICIOUS",
        "flag_badge": "FLAG 3: SUSPICIOUS (NAME MISMATCH / QUISHING)",
        "badge_bg": "#fee2e2",
        "badge_fg": "#b91c1c",
        "theme_color": "#ea580c",
        "title": "Quishing Sticker: Impersonation Attack",
        "subtitle": "Claimed: Cafe Manila | Resolves: Juan Dela Cruz",
        "raw_qr": "TAPTIGNAN:PAY:JD-11029:Cafe Manila Inc.:650.00",
        "amount": "PHP 650.00",
        "account": "JD-11029 (Juan Dela Cruz - Personal Wallet)",
        "verdict_text": "VERDICT: SUSPICIOUS (High Risk - Quishing Detected)",
        "check_details": [
            "[PASS] R-01 Valid payment QR structure",
            "[PASS] R-02 No embedded URL detected",
            "[FAIL] R-03 CRITICAL: Claimed Cafe Manila != Account owner Juan Dela Cruz",
            "[FAIL] R-04 Personal unaccredited wallet disguised as store",
            "[WARN] Usable Security overrides enabled with double confirmation"
        ],
        "presentation_tip": "Demo Story: Attacker pasted personal QR sticker over Cafe Manila counter. TapTignan exposes the hidden recipient name before payment."
    },
    {
        "id": "4_Suspicious_Phishing_URL",
        "flag_type": "SUSPICIOUS",
        "flag_badge": "FLAG 4: SUSPICIOUS (MALICIOUS PHISHING URL)",
        "badge_bg": "#fee2e2",
        "badge_fg": "#991b1b",
        "theme_color": "#dc2626",
        "title": "Phishing QR: Fake Rewards Portal",
        "subtitle": "Disguised Hyperlink Redirect (Credential Harvesting)",
        "raw_qr": "https://gcash-verification-portal.ph/claim-reward?promo=cashback",
        "amount": "PHP 500.00 (Simulated)",
        "account": "External URL Redirect (Non-Wallet Endpoint)",
        "verdict_text": "VERDICT: SUSPICIOUS (High Risk - Phishing Blocked)",
        "check_details": [
            "[FAIL] R-01 CRITICAL: Payload is a web URL, not a financial payment QR",
            "[FAIL] R-02 CRITICAL: Malicious external domain redirection",
            "[FAIL] R-03 Cannot verify legitimate financial recipient",
            "[SEC] TapTignan prevents automatic browser launch and intercepts link",
            "[ACTION] Prompts immediate reporting to protect community"
        ],
        "presentation_tip": "Demo Story: Commuter scans 'Free Cashback' QR. Standard apps open a browser phishing site; TapTignan halts the redirect and warns user."
    },
    {
        "id": "5_Suspicious_Reported_Scam",
        "flag_type": "SUSPICIOUS",
        "flag_badge": "FLAG 5: SUSPICIOUS (COMMUNITY BLACKLISTED)",
        "badge_bg": "#fee2e2",
        "badge_fg": "#991b1b",
        "theme_color": "#991b1b",
        "title": "Reported Quishing: MRT-3 Shaw Station",
        "subtitle": "Community Flagged Fake Sticker (Blacklisted)",
        "raw_qr": "TAPTIGNAN:PAY:SCAM-9901:Juana Fake:350.00",
        "amount": "PHP 350.00",
        "account": "SCAM-9901 (Juana Fake - Flagged Entity)",
        "verdict_text": "VERDICT: SUSPICIOUS (High Risk - Known Threat)",
        "check_details": [
            "[PASS] R-01 Valid format structure",
            "[PASS] R-02 No URL detected",
            "[FAIL] R-03 Unregistered recipient not in merchant directory",
            "[FAIL] R-05 CRITICAL: Previously reported by users at MRT-3 Shaw Booth",
            "[BLOCK] Hard-flagged by TapTignan Community Threat Intelligence"
        ],
        "presentation_tip": "Demo Story: A commuter reported a fake sticker yesterday. Today, when any other commuter scans it, TapTignan blocks it immediately."
    }
]

def make_card(scenario):
    width = 900
    height = 1180
    img = Image.new("RGB", (width, height), "#ffffff")
    draw = ImageDraw.Draw(img)

    theme = scenario["theme_color"]

    # Outer border & header banner
    draw_rounded_rect(draw, (18, 18, width - 18, height - 18), radius=28, fill="#ffffff", outline="#cbd5e1", width=3)
    
    # Top Accent Header Bar
    draw_rounded_rect(draw, (20, 20, width - 20, 110), radius=26, fill="#0a1e4a")
    draw.rectangle((20, 75, width - 20, 110), fill="#0a1e4a") # flatten bottom corners of header

    font_app_title = get_font("segoeuib.ttf", 26, bold=True)
    font_app_sub = get_font("segoeui.ttf", 15)
    
    draw.text((45, 36), "TAPTIGNAN", fill="#ffffff", font=font_app_title)
    draw.text((45, 72), "Usable Security Pre-Payment Verification Prototype", fill="#93c5fd", font=font_app_sub)

    # Flag Badge Pill (top right)
    badge_text = scenario["flag_type"]
    font_badge = get_font("segoeuib.ttf", 20, bold=True)
    badge_w = draw.textlength(badge_text, font=font_badge) + 36
    badge_x = width - 45 - badge_w
    draw_rounded_rect(draw, (badge_x, 42, width - 45, 88), radius=16, fill=scenario["badge_bg"], outline=theme, width=2)
    draw.text((badge_x + 18, 51), badge_text, fill=scenario["badge_fg"], font=font_badge)

    # Sub-header Card: Scenario Title & Subtitle
    font_title = get_font("segoeuib.ttf", 28, bold=True)
    font_sub = get_font("segoeui.ttf", 17)
    draw.text((45, 130), scenario["title"], fill="#0f172a", font=font_title)
    draw.text((45, 170), scenario["subtitle"], fill="#64748b", font=font_sub)

    # QR Code Generation
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(scenario["raw_qr"])
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0a1e4a", back_color="#ffffff").convert("RGB")
    qr_w, qr_h = qr_img.size

    # Viewfinder box around QR
    box_x = int((width - 430) / 2)
    box_y = 210
    draw_rounded_rect(draw, (box_x, box_y, box_x + 430, box_y + 430), radius=22, fill="#f8fafc", outline="#e2e8f0", width=2)

    # Paste QR in center of viewfinder
    paste_x = box_x + int((430 - qr_w) / 2)
    paste_y = box_y + int((430 - qr_h) / 2)
    img.paste(qr_img, (paste_x, paste_y))

    # Corner brackets like GCash scanner
    corner_len = 28
    corner_thick = 4
    # TL
    draw.line((box_x + 15, box_y + 15, box_x + 15 + corner_len, box_y + 15), fill=theme, width=corner_thick)
    draw.line((box_x + 15, box_y + 15, box_x + 15, box_y + 15 + corner_len), fill=theme, width=corner_thick)
    # TR
    draw.line((box_x + 415 - corner_len, box_y + 15, box_x + 415, box_y + 15), fill=theme, width=corner_thick)
    draw.line((box_x + 415, box_y + 15, box_x + 415, box_y + 15 + corner_len), fill=theme, width=corner_thick)
    # BL
    draw.line((box_x + 15, box_y + 415 - corner_len, box_x + 15, box_y + 415), fill=theme, width=corner_thick)
    draw.line((box_x + 15, box_y + 415, box_x + 15 + corner_len, box_y + 415), fill=theme, width=corner_thick)
    # BR
    draw.line((box_x + 415 - corner_len, box_y + 415, box_x + 415, box_y + 415), fill=theme, width=corner_thick)
    draw.line((box_x + 415, box_y + 415 - corner_len, box_x + 415, box_y + 415), fill=theme, width=corner_thick)

    # Scannable Prompt Pill
    prompt_text = "SCAN THIS CODE WITH TAPTIGNAN APP"
    font_prompt = get_font("segoeuib.ttf", 13, bold=True)
    pw = draw.textlength(prompt_text, font=font_prompt) + 28
    px = int((width - pw) / 2)
    draw_rounded_rect(draw, (px, box_y + 395, px + pw, box_y + 424), radius=10, fill="#ffffff", outline=theme, width=2)
    draw.text((px + 14, box_y + 401), prompt_text, fill=theme, font=font_prompt)

    # Raw Payload Box
    raw_box_y = 660
    draw_rounded_rect(draw, (45, raw_box_y, width - 45, raw_box_y + 60), radius=12, fill="#f1f5f9", outline="#cbd5e1", width=1)
    font_mono = get_font("segoeui.ttf", 14)
    draw.text((60, raw_box_y + 10), "RAW QR PAYLOAD:", fill="#475569", font=get_font("segoeuib.ttf", 12, bold=True))
    payload_disp = scenario["raw_qr"]
    if len(payload_disp) > 75:
        payload_disp = payload_disp[:72] + "..."
    draw.text((60, raw_box_y + 32), payload_disp, fill="#0f172a", font=font_mono)

    # Verdict & Rule Findings Box
    verdict_y = 735
    draw_rounded_rect(draw, (45, verdict_y, width - 45, verdict_y + 280), radius=16, fill="#f8fafc", outline="#e2e8f0", width=1.5)

    # Left colored accent bar
    draw.line((48, verdict_y + 12, 48, verdict_y + 268), fill=theme, width=6)

    # Verdict Headline
    font_vhead = get_font("segoeuib.ttf", 19, bold=True)
    draw.text((68, verdict_y + 16), scenario["verdict_text"], fill=theme, font=font_vhead)

    # Rule checks list
    font_rule = get_font("segoeui.ttf", 14)
    font_rule_bold = get_font("segoeuib.ttf", 14, bold=True)
    rule_y = verdict_y + 55
    for item in scenario["check_details"]:
        is_pass = item.startswith("[PASS]")
        is_fail = item.startswith("[FAIL]")
        is_flag = item.startswith("[FLAG]")
        bullet_color = "#15803d" if is_pass else ("#dc2626" if is_fail else ("#d97706" if is_flag else "#2563eb"))
        draw.text((68, rule_y), item, fill=bullet_color, font=font_rule_bold if (is_fail or is_flag) else font_rule)
        rule_y += 24

    # Presentation Demo Tip
    demo_box_y = rule_y + 8
    draw_rounded_rect(draw, (65, demo_box_y, width - 65, demo_box_y + 60), radius=10, fill="#ffffff", outline="#e2e8f0", width=1)
    font_tip_bold = get_font("segoeuib.ttf", 12, bold=True)
    font_tip = get_font("segoeui.ttf", 12)
    draw.text((78, demo_box_y + 8), "PRESENTER GUIDE:", fill="#0073f6", font=font_tip_bold)
    
    # Wrap presentation tip text if long
    tip = scenario["presentation_tip"]
    draw.text((78, demo_box_y + 28), tip, fill="#334155", font=font_tip)

    # Footer
    font_footer = get_font("segoeui.ttf", 13)
    draw.text((45, height - 55), "TapTignan: A Pre-Payment Verification and Reporting Interface for Filipino Mobile Wallet Users", fill="#94a3b8", font=font_footer)
    draw.text((width - 230, height - 55), "Academic Prototype - Group 7", fill="#64748b", font=font_footer)

    return img

def make_grid_poster():
    # 2 rows x 3 columns presentation poster (1920 x 1350)
    poster_w = 1380
    poster_h = 1460
    poster = Image.new("RGB", (poster_w, poster_h), "#0a1e4a")
    draw = ImageDraw.Draw(poster)

    # Header
    font_hdr = get_font("segoeuib.ttf", 36, bold=True)
    font_sub = get_font("segoeui.ttf", 20)
    draw.text((50, 35), "TapTignan - Live Presentation & Defense QR Code Deck", fill="#ffffff", font=font_hdr)
    draw.text((50, 85), "6 Scannable QR Codes: Personal Wallet & Threat Detection Flags", fill="#93c5fd", font=font_sub)

    card_w = 400
    card_h = 580
    gap_x = 30
    start_x = 50
    start_y = 140

    # 6 cards layout: 2 rows of 3 cards
    positions = [
        (start_x, start_y),
        (start_x + (card_w + gap_x), start_y),
        (start_x + (card_w + gap_x) * 2, start_y),
        (start_x, start_y + card_h + 30),
        (start_x + (card_w + gap_x), start_y + card_h + 30),
        (start_x + (card_w + gap_x) * 2, start_y + card_h + 30),
    ]

    for idx, sc in enumerate(SCENARIOS):
        pos_x, pos_y = positions[idx]
        theme = sc["theme_color"]
        
        # Card Background
        draw_rounded_rect(draw, (pos_x, pos_y, pos_x + card_w, pos_y + card_h), radius=20, fill="#ffffff", outline=theme, width=3)

        # Flag Badge Top Bar
        draw_rounded_rect(draw, (pos_x + 16, pos_y + 16, pos_x + card_w - 16, pos_y + 54), radius=10, fill=sc["badge_bg"], outline=theme, width=1.5)
        font_b = get_font("segoeuib.ttf", 15, bold=True)
        draw.text((pos_x + 28, pos_y + 24), sc["flag_badge"][:32], fill=sc["badge_fg"], font=font_b)

        # Card Title
        font_ct = get_font("segoeuib.ttf", 18, bold=True)
        draw.text((pos_x + 16, pos_y + 68), sc["title"][:30], fill="#0f172a", font=font_ct)
        font_csub = get_font("segoeui.ttf", 13)
        draw.text((pos_x + 16, pos_y + 92), sc["subtitle"][:42], fill="#64748b", font=font_csub)

        # QR code
        qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=7, border=2)
        qr.add_data(sc["raw_qr"])
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="#0a1e4a", back_color="#ffffff").convert("RGB")
        qr_img = qr_img.resize((260, 260), Image.Resampling.NEAREST)

        # Viewfinder box
        draw_rounded_rect(draw, (pos_x + 50, pos_y + 120, pos_x + 330, pos_y + 400), radius=14, fill="#f8fafc", outline="#cbd5e1", width=1.5)
        poster.paste(qr_img, (pos_x + 60, pos_y + 130))

        # Verdict text
        font_vt = get_font("segoeuib.ttf", 15, bold=True)
        draw.text((pos_x + 16, pos_y + 415), sc["verdict_text"], fill=theme, font=font_vt)

        # Key check
        font_chk = get_font("segoeui.ttf", 12.5)
        font_chk_b = get_font("segoeuib.ttf", 12.5, bold=True)
        draw.text((pos_x + 16, pos_y + 440), f"Amount: {sc['amount']}", fill="#334155", font=font_chk_b)
        
        # 3 bullets
        b_y = pos_y + 465
        for b in sc["check_details"][:3]:
            is_good = b.startswith("[PASS]")
            c = "#15803d" if is_good else "#dc2626"
            draw.text((pos_x + 16, b_y), b[:46], fill=c, font=font_chk)
            b_y += 20

        # Live demo tip
        draw_rounded_rect(draw, (pos_x + 14, pos_y + 530, pos_x + card_w - 14, pos_y + 568), radius=8, fill="#eff6ff", outline="#bfdbfe", width=1)
        font_tip = get_font("segoeuib.ttf", 11, bold=True)
        draw.text((pos_x + 22, pos_y + 539), "SCAN WITH TAPTIGNAN TO TEST", fill="#1d4ed8", font=font_tip)

    # Footer note
    draw.text((60, poster_h - 45), "Group 7 - Usable Security Research Prototype | Point smartphone camera at any code to trigger live evaluation.", fill="#94a3b8", font=get_font("segoeui.ttf", 16))

    return poster

def main():
    downloads_dir = "C:/Users/Mike Angelo/Downloads"
    assets_dir = "c:/Users/Mike Angelo/OneDrive/Documents/TapTignanV2/TapTignanV2/assets/presentation-qrs"
    os.makedirs(downloads_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)

    print(f"Generating presentation QR cards in: {downloads_dir}")
    print(f"Generating bundled QR assets in: {assets_dir}")

    # Generate each scenario card
    for sc in SCENARIOS:
        card = make_card(sc)
        
        # Save high-res card to Downloads
        dl_path = os.path.join(downloads_dir, f"{sc['id']}.png")
        card.save(dl_path, "PNG", dpi=(300, 300))
        print(f"Saved card: {dl_path}")

        # Save card to assets directory as well
        asset_card_path = os.path.join(assets_dir, f"{sc['id']}.png")
        card.save(asset_card_path, "PNG")

        # Also generate pure scannable QR image for in-app display
        qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=2)
        qr.add_data(sc["raw_qr"])
        qr.make(fit=True)
        pure_qr = qr.make_image(fill_color="#0a1e4a", back_color="#ffffff").convert("RGB")
        pure_qr_path = os.path.join(assets_dir, f"{sc['id']}_qr_only.png")
        pure_qr.save(pure_qr_path, "PNG")

    # Generate grid poster
    poster = make_grid_poster()
    poster_dl_path = os.path.join(downloads_dir, "TapTignan_All_Presentation_QRs_Grid.png")
    poster.save(poster_dl_path, "PNG", dpi=(300, 300))
    print(f"Saved master grid poster: {poster_dl_path}")

    poster_asset_path = os.path.join(assets_dir, "TapTignan_All_Presentation_QRs_Grid.png")
    poster.save(poster_asset_path, "PNG")

    print("All presentation QR codes generated successfully!")

if __name__ == "__main__":
    main()
