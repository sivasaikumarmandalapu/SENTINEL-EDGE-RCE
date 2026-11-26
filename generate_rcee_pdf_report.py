import os
import json
from fpdf import FPDF
from fpdf.enums import XPos, YPos

with open("eval_metrics.json", "r") as f:
    METRICS = json.load(f)

ROMAN = [
    "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x",
    "xi", "xii", "xiii", "xiv", "xv"
]

def clean_text(text: str) -> str:
    replacements = {
        "\u2014": "--", "\u2013": "-", "\u2018": "'", "\u2019": "'",
        "\u201c": '"', "\u201d": '"', "\u2022": "-", "\u2026": "...",
        "\u03c6": "phi", "\u03a6": "Phi", "\u03a3": "SUM", "\u03c0": "pi",
        "\u03c3": "sigma", "\u03a9": "Omega", "\u2208": "in", "\u222a": "U",
        "\u2286": "<=", "\u2264": "<=", "\u2265": ">=", "\u2260": "!=",
        "\u00b1": "+/-", "\u2192": "->", "\u2190": "<-", "\u21d2": "=>",
        "\u2248": "~=", "\u00b5": "u", "\u03bc": "u", "\u00d7": "x",
        "–": "-", "—": "--", "“": '"', "”": '"', "’": "'", "‘": "'",
        "•": "-", "·": ".", "➜": "->", "➔": "->", "🚫": "[BAN]",
        "🔒": "[LOCK]", "⏱": "[TIMER]", "✓": "[OK]", "⚠": "[WARN]",
        "🛡️": "[SHIELD]", "🧠": "[XAI]", "⚡": "[FAST]", "🚨": "[ALERT]"
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text.encode("latin-1", "replace").decode("latin-1")

def read_code_slice(path: str, start_line: int, end_line: int) -> str:
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    sliced = lines[start_line - 1 : end_line]
    return "".join(sliced).rstrip()

class RCEEThesisPDF(FPDF):
    def __init__(self, prelim_page_count: int = 8):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(left=30, top=22, right=20)
        self.set_auto_page_break(auto=True, margin=20)
        self.prelim_page_count = prelim_page_count
        self.running_chapter = ""

    def header(self):
        self.set_font("Times", "", 10)
        self.set_text_color(70, 70, 70)
        if self.page_no() <= self.prelim_page_count:
            idx = self.page_no() - 1
            num_str = ROMAN[idx] if idx < len(ROMAN) else str(idx + 1)
            self.cell(0, 7, num_str, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
        else:
            pnum = self.page_no() - self.prelim_page_count
            if self.running_chapter:
                self.set_font("Times", "I", 9)
                self.set_text_color(100, 116, 139)
                self.cell(125, 7, clean_text(f"SentinelEdge | {self.running_chapter}"), align="L")
                self.set_font("Times", "", 10.5)
                self.set_text_color(40, 40, 40)
                self.cell(0, 7, str(pnum), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
            else:
                self.cell(0, 7, str(pnum), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
        self.ln(2)

    def footer(self):
        if self.page_no() > self.prelim_page_count:
            self.set_y(-14)
            self.set_font("Times", "I", 8.5)
            self.set_text_color(120, 120, 120)
            self.cell(0, 6, "Dept. of CSE (Cyber Security), Ramachandra College of Engineering (Autonomous)", align="C")


def build_report(prelim_page_count=8, prelim_ref=None, toc_ref=None, lof_ref=None, lot_ref=None, record_pass=False):
    pdf = RCEEThesisPDF(prelim_page_count=prelim_page_count)
    logo_path = "extracted_logo_p0_0.png"

    recorded_prelim = {}
    recorded_toc = []
    recorded_lof = []
    recorded_lot = []
    detected_prelim_count = prelim_page_count

    def cur_arabic_page():
        return pdf.page_no() - pdf.prelim_page_count

    def add_chap(num, title):
        pdf.running_chapter = f"Chapter {num}: {title}"
        pdf.add_page()
        pg = cur_arabic_page()
        if record_pass:
            recorded_toc.append((f"CHAPTER-{num}  {title.upper()}", str(pg), True))
        pdf.set_font("Times", "B", 15)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 7, f"CHAPTER {num}", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        pdf.cell(0, 8, clean_text(title.upper()), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        # Horizontal rule accent
        y_line = pdf.get_y() + 1
        pdf.set_draw_color(31, 73, 125)
        pdf.set_line_width(0.5)
        pdf.line(30, y_line, 190, y_line)
        pdf.ln(6)

    def add_sec(title):
        title_c = title.replace("`", "")
        if pdf.get_y() > 250:
            pdf.add_page()
        pg = cur_arabic_page()
        if record_pass:
            recorded_toc.append((f"  {title_c}", str(pg), False))
        pdf.ln(2)
        pdf.set_font("Times", "B", 12.5)
        pdf.set_text_color(20, 40, 90)
        pdf.multi_cell(0, 6.5, clean_text(title_c), align="L")
        pdf.ln(1.5)

    def add_subsec(title):
        title_c = title.replace("`", "")
        if pdf.get_y() > 256:
            pdf.add_page()
        pg = cur_arabic_page()
        if record_pass:
            recorded_toc.append((f"    {title_c}", str(pg), False))
        pdf.ln(1.5)
        pdf.set_font("Times", "B", 11.5)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(0, 6.0, clean_text(title_c), align="L")
        pdf.ln(1)

    def add_body(text):
        pdf.set_font("Times", "", 11.5)
        pdf.set_text_color(20, 25, 35)
        pdf.multi_cell(0, 6.1, clean_text("      " + text.replace("`", "")), align="J")
        pdf.ln(2.8)

    def add_formula_box(formula_lines):
        h = len(formula_lines) * 5.8 + 6
        if pdf.get_y() + h > 270:
            pdf.add_page()
        y0 = pdf.get_y()
        pdf.set_fill_color(244, 247, 252)
        pdf.set_draw_color(148, 163, 184)
        pdf.set_line_width(0.3)
        pdf.rect(34, y0, 152, h, "FD")
        pdf.set_xy(36, y0 + 3)
        pdf.set_font("Courier", "B", 9.5)
        pdf.set_text_color(15, 23, 42)
        for fl in formula_lines:
            pdf.cell(148, 5.8, clean_text(fl), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
            pdf.set_x(36)
        pdf.ln(4)

    def add_bullet(lead, body):
        if pdf.get_y() > 265:
            pdf.add_page()
        pdf.set_x(34)
        pdf.set_font("Times", "B", 11)
        pdf.set_text_color(15, 23, 42)
        pdf.write(6.0, clean_text(f"- {lead}: "))
        pdf.set_font("Times", "", 11)
        pdf.write(6.0, clean_text(body.replace("`", "")))
        pdf.ln(7.2)

    def add_fig(path, fig_num, caption, w=148, h_est=75):
        if not os.path.exists(path):
            return
        # Check remaining vertical space so figure + caption stay together
        if pdf.get_y() + h_est + 12 > 272:
            pdf.add_page()
        x = 30 + (160 - w) / 2
        pdf.ln(2)
        pdf.image(path, x=x, w=w)
        pdf.ln(2.5)
        pg = cur_arabic_page()
        full_cap = f"{fig_num}: {caption}"
        if record_pass:
            recorded_lof.append((fig_num, caption, str(pg)))
        pdf.set_font("Times", "B", 10)
        pdf.set_text_color(51, 65, 85)
        pdf.multi_cell(0, 5.2, clean_text(full_cap), align="C")
        pdf.ln(4)

    def add_styled_table(tbl_num, caption, headers, rows, col_widths, font_sz=9.0):
        if pdf.get_y() + 45 > 270:
            pdf.add_page()
        pg = cur_arabic_page()
        if record_pass:
            recorded_lot.append((tbl_num, caption, str(pg)))
        pdf.ln(2)
        pdf.set_font("Times", "B", 10)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(0, 5.2, clean_text(f"{tbl_num}: {caption}"), align="C")
        pdf.ln(1.5)

        pdf.set_font("Times", "", font_sz)
        with pdf.table(
            col_widths=col_widths,
            width=160,
            align="CENTER",
            line_height=4.8,
            padding=2.0,
            borders_layout="ALL",
            first_row_as_headings=True,
            text_align=("LEFT",) * len(headers),
        ) as table:
            hdr_row = table.row()
            pdf.set_font("Times", "B", font_sz)
            pdf.set_text_color(255, 255, 255)
            pdf.set_fill_color(31, 73, 125)
            for h in headers:
                hdr_row.cell(clean_text(h))

            for r_idx, r_data in enumerate(rows):
                row = table.row()
                if r_idx % 2 == 0:
                    pdf.set_fill_color(248, 250, 252)
                else:
                    pdf.set_fill_color(255, 255, 255)
                pdf.set_font("Times", "", font_sz)
                pdf.set_text_color(15, 23, 42)
                for val in r_data:
                    row.cell(clean_text(str(val)))
        pdf.ln(5)

    def add_code_listing(title, code_text):
        if pdf.get_y() > 245:
            pdf.add_page()
        pdf.set_font("Times", "B", 10.5)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 6, clean_text(title), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="L")
        pdf.ln(1)
        lines = code_text.split("\n")
        pdf.set_font("Courier", "", 7.8)
        pdf.set_text_color(15, 23, 42)
        chunk = []
        for idx, line in enumerate(lines):
            # wrap long lines cleanly to 92 chars
            clean_l = clean_text(line.replace("\t", "    "))
            if len(clean_l) > 94:
                clean_l = clean_l[:91] + "..."
            chunk.append(clean_l)
            if len(chunk) >= 34 or idx == len(lines) - 1:
                h = len(chunk) * 3.8 + 4
                if pdf.get_y() + h > 274:
                    pdf.add_page()
                y0 = pdf.get_y()
                pdf.set_fill_color(248, 250, 252)
                pdf.set_draw_color(203, 213, 225)
                pdf.set_line_width(0.25)
                pdf.rect(30, y0, 160, h, "FD")
                pdf.set_xy(32, y0 + 2)
                for cl in chunk:
                    pdf.cell(156, 3.8, cl, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
                    pdf.set_x(32)
                pdf.ln(3)
                chunk = []

    # =========================================================================
    # PRELIMINARY PAGES (i to ...)
    # =========================================================================
    pdf.is_preliminary = True

    # ---- PAGE i: COVER PAGE ----
    pdf.add_page()
    pdf.set_font("Times", "B", 13.5)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 7, "A Project Report on", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(3)

    pdf.set_font("Times", "B", 15)
    pdf.set_text_color(204, 0, 0)
    pdf.multi_cell(
        0, 7.2,
        clean_text(
            "NETWORK INTRUSION DETECTION IN ENCRYPTED TRAFFIC VIA "
            "EXPLAINABLE AI FOR NETWORK ANOMALY DETECTION (SHAP/LIME-BASED), "
            "APPLIED TO ENTERPRISE CAMPUS NETWORK PERIMETER DEFENSE"
        ),
        align="C",
    )
    pdf.ln(4)

    pdf.set_font("Times", "B", 11.5)
    pdf.set_text_color(204, 0, 0)
    pdf.multi_cell(0, 5.5, "Submitted in partial fulfilment of the requirement for the award of the degree of", align="C")
    pdf.ln(2.5)

    pdf.set_font("Times", "B", 13)
    pdf.set_text_color(31, 73, 125)
    pdf.multi_cell(0, 6.0, "BACHELOR OF TECHNOLOGY\nIn\nCOMPUTER SCIENCE AND ENGINEERING\n(Cyber Security)", align="C")
    pdf.ln(3.5)

    pdf.set_font("Times", "", 11.5)
    pdf.set_text_color(31, 73, 125)
    pdf.cell(0, 5.5, "Submitted by", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("Times", "B", 13)
    pdf.set_text_color(112, 48, 160)
    pdf.cell(0, 6, "MANDALAPU SIVA SAI KUMAR", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 6, "24ME5A4603", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(4)

    pdf.set_font("Times", "", 11.5)
    pdf.set_text_color(112, 48, 160)
    pdf.cell(0, 5.5, "Under the Esteemed Guidance of", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("Times", "B", 13)
    pdf.set_text_color(204, 0, 0)
    pdf.cell(0, 6, "Ms. G. MADHURI", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("Times", "", 11)
    pdf.set_text_color(0, 32, 96)
    pdf.cell(0, 5.0, "Assistant Professor", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 5.0, "Department of Computer Science and Engineering (Cyber Security)", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(4)

    if os.path.exists(logo_path):
        img_w = 27
        pdf.image(logo_path, x=30 + (160 - img_w) / 2, w=img_w)
        pdf.ln(3)

    pdf.set_font("Times", "B", 12.5)
    pdf.set_text_color(204, 0, 0)
    pdf.cell(0, 5.5, "RAMACHANDRA COLLEGE OF ENGINEERING", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 5.5, "(AUTONOMOUS)", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("Times", "", 9.5)
    pdf.set_text_color(0, 85, 170)
    pdf.cell(0, 4.5, "(Approved by AICTE, New Delhi, Permanently Affiliated to JNTUK: Kakinada)", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.set_text_color(139, 69, 19)
    pdf.cell(0, 4.5, "Accredited by NAAC A+ & NBA, An ISO 9001:2015 certified institution", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.set_text_color(0, 85, 170)
    pdf.cell(0, 4.5, "NH16 Bypass Road, Vatluru (V), ELURU - 534007, ELURU Dist., A.P", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 4.5, "Website: www.rcee.ac.in", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.set_font("Times", "B", 11)
    pdf.cell(0, 5.5, "2026-2027", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    # ---- PAGE ii: CERTIFICATE ----
    pdf.add_page()
    pdf.set_font("Times", "B", 12.5)
    pdf.set_text_color(204, 0, 0)
    pdf.cell(0, 5.5, "RAMACHANDRA COLLEGE OF ENGINEERING", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 5.5, "(AUTONOMOUS)", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.set_font("Times", "", 9.5)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 4.5, "(Approved by AICTE, New Delhi, Permanently Affiliated to JNTUK: Kakinada)", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 4.5, "Accredited by NAAC A+ & NBA, An ISO 9001:2015 certified institution", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 4.5, "NH16 Bypass Road, Vatluru (V), ELURU - 534007, ELURU Dist., A.P", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 4.5, "Website: www.rcee.ac.in", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(3)

    pdf.set_font("Times", "B", 11.5)
    pdf.cell(0, 5.2, "Department of Computer Science and Engineering", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.cell(0, 5.2, "(Cyber Security)", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(4)

    if os.path.exists(logo_path):
        img_w = 24
        pdf.image(logo_path, x=30 + (160 - img_w) / 2, w=img_w)
        pdf.ln(5)

    pdf.set_font("Times", "B", 16)
    pdf.cell(0, 8, "CERTIFICATE", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(5)

    pdf.set_font("Times", "", 11.5)
    cert_body = (
        "      This is to certify that MANDALAPU SIVA SAI KUMAR (24ME5A4603), student of "
        "Bachelor of Technology in Computer Science and Engineering (Cyber Security), has "
        "successfully completed the project work entitled \"Network Intrusion Detection in "
        "Encrypted Traffic via Explainable AI for Network Anomaly Detection (SHAP/LIME-based), "
        "Applied to Enterprise Campus Network Perimeter Defense\" at Ramachandra College of "
        "Engineering (Autonomous), Eluru during the Academic Year 2026-2027. This document is "
        "submitted in partial fulfilment for the award of the Degree of Bachelor of Technology "
        "in Computer Science and Engineering (Cyber Security), and the same is not submitted elsewhere."
    )
    pdf.multi_cell(0, 6.8, clean_text(cert_body), align="J")
    pdf.ln(28)

    pdf.set_font("Times", "B", 11)
    y_s1 = pdf.get_y()
    pdf.set_xy(30, y_s1)
    pdf.multi_cell(75, 5.5, "Ms. G. Madhuri\nAssistant Professor\nProject Mentor", align="L")
    pdf.set_xy(115, y_s1)
    pdf.multi_cell(75, 5.5, "Dr. B. Narendra\nHead of the Department\nHoD, CSE (Cyber Security)", align="R")
    pdf.ln(26)

    y_s2 = pdf.get_y()
    pdf.set_xy(30, y_s2)
    pdf.cell(75, 5.5, "Internal Examiner", align="L")
    pdf.set_xy(115, y_s2)
    pdf.cell(75, 5.5, "External Examiner", align="R")

    # ---- PAGE iii: DECLARATION ----
    pdf.add_page()
    pdf.set_font("Times", "B", 16)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 9, "DECLARATION", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(8)

    pdf.set_font("Times", "", 11.5)
    dec1 = (
        "      I am, MANDALAPU SIVA SAI KUMAR (24ME5A4603), hereby declare that the project report "
        "titled \"Network Intrusion Detection in Encrypted Traffic via Explainable AI for Network "
        "Anomaly Detection (SHAP/LIME-based), Applied to Enterprise Campus Network Perimeter Defense\" "
        "carried out under the supervision of Ms. G. Madhuri, Assistant Professor, Department of "
        "Computer Science and Engineering (Cyber Security), is submitted in partial fulfilment of "
        "the requirements for the award of the degree of Bachelor of Technology in Computer Science "
        "and Engineering (Cyber Security)."
    )
    pdf.multi_cell(0, 6.8, clean_text(dec1), align="J")
    pdf.ln(6)

    dec2 = (
        "      This is an authentic record of engineering and experimental work carried out by me, "
        "and the results embodied in this project report have not been reproduced or copied from any "
        "unauthorized source. The work contained herein has not been submitted to any other University "
        "or Institute for the award of any other degree or diploma."
    )
    pdf.multi_cell(0, 6.8, clean_text(dec2), align="J")
    pdf.ln(36)

    pdf.set_font("Times", "B", 11.5)
    pdf.cell(0, 5.5, "Mr. MANDALAPU SIVA SAI KUMAR", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
    pdf.cell(0, 5.5, "24ME5A4603", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")

    # ---- PAGE iv: ACKNOWLEDGEMENT ----
    pdf.add_page()
    pdf.set_font("Times", "B", 16)
    pdf.cell(0, 9, "ACKNOWLEDGEMENT", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(6)

    ack_paragraphs = [
        "I take this opportunity to express my sincere gratitude to all those who have contributed to the "
        "successful completion of this final year project. Their technical mentorship, institutional support, "
        "and continuous encouragement have been invaluable throughout this endeavor.",

        "I extend my heartfelt thanks to my project supervisor, Ms. G. Madhuri, Assistant Professor, "
        "Department of Computer Science and Engineering (Cyber Security), for her invaluable mentorship, "
        "insightful architectural reviews, and constant guidance in refining the Explainable AI and "
        "zero-decryption intrusion detection pipeline.",

        "I am deeply indebted to Dr. B. Narendra, Head of the Department, Computer Science and Engineering "
        "(Cyber Security), for his continuous encouragement, technical feedback, and dedicated support "
        "throughout every phase of project development and validation.",

        "I express my deepest gratitude to Dr. S. S. Sarma, Dean Academics, and Dr. M. Muralidhara Rao, "
        "Principal, Ramachandra College of Engineering, Eluru, for fostering an exemplary research "
        "environment and offering valuable suggestions during our project reviews.",

        "I wish to convey my sincere thanks to all the Deans, faculty members, and laboratory technical "
        "staff of the Department of Computer Science and Engineering (Cyber Security) for their advice, "
        "feedback, and access to campus networking lab facilities.",

        "I extend my profound gratitude to the Management of Ramachandra College of Engineering, Eluru, "
        "for their unwavering encouragement and institutional infrastructure.",

        "Finally, I thank my peers and family members for their direct and indirect support, especially "
        "collaborative assistance with the Ramachandra College 3D Digital Twin campus architectural modeling."
    ]
    pdf.set_font("Times", "", 11)
    for ap in ack_paragraphs:
        pdf.multi_cell(0, 5.8, clean_text("      " + ap), align="J")
        pdf.ln(3)

    pdf.ln(8)
    pdf.set_font("Times", "B", 11.5)
    pdf.cell(0, 5.5, "Mr. MANDALAPU SIVA SAI KUMAR", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")
    pdf.cell(0, 5.5, "24ME5A4603", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")

    # ---- PAGE v: ABSTRACT ----
    pdf.add_page()
    recorded_prelim["Abstract"] = ROMAN[pdf.page_no() - 1]
    pdf.set_font("Times", "B", 16)
    pdf.cell(0, 9, "ABSTRACT", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(6)

    abs_paras = [
        "Contemporary enterprise and academic campus networks routinely encapsulate web, domain resolution, "
        "and administrative sessions inside cryptographic transport protocols such as Transport Layer Security "
        "(TLS 1.3 - RFC 8446), DNS-over-HTTPS (DoH - RFC 8484), and Secure Shell (SSHv2). While universal "
        "encryption protects confidentiality, it creates an acute inspection blind spot for legacy Deep Packet "
        "Inspection (DPI) engines that depend on plaintext signature matching. Simultaneously, standard deep "
        "learning intrusion detectors operate as opaque 'black boxes' that raise unexplainable alerts and often "
        "misclassify legitimate high-bandwidth campus file transfers as flooding or scanning attacks.",

        "To resolve both challenges, this project presents SentinelEdge: an Explainable AI (XAI) driven "
        "lightweight edge Network Intrusion Detection and Prevention System (IDPS) tailored for campus "
        "perimeter defense. SentinelEdge processes packets through a four-tier pipeline without decrypting "
        "cryptographic payloads. Tier 1 performs fast-path inspection against 12 Snort/Suricata compatible "
        "signature rules alongside stateless scan flag checks, a 3-second rolling empty-port probe tracker, "
        "and a 2-second SYN burst counter (mean latency 17.42 us). Tier 2 aggregates directional flows in "
        "FlowStats, extracting 13 metadata features including Shannon port entropy and empty-port ratio to "
        "separate benign single-port heavy MTU transfers (1460-byte frames) from multi-port reconnaissance scans. "
        "Tier 3 evaluates a compact 10 -> 32 -> 16 -> 5 Multi-Layer Perceptron neural network exported to "
        "pure-NumPy weights (`weights.json`, 10.33 us forward inference), achieving 100.0% accuracy on clean "
        "held-out synthetic distributions (n = 1,000) and 99.1% accuracy under Gaussian boundary noise (sigma = 0.18).",

        "For full operational auditability, the integrated Explainable AI module (`XAIExplainerEngine`) computes "
        "game-theoretic Shapley attributions (`phi_i`) across 32 Monte Carlo feature permutations and synthesizes "
        "plain-English LIME IF-THEN surrogate decision rules for every detection. Tier 4 executes autonomous "
        "tri-state perimeter defense (`FORWARDED`, `BLOCKED` via 90-120s dynamic cooldown jails with 9.83 us "
        "early wire drops, and `QUARANTINED`), committing incidents and SHAP/LIME telemetry to a SQLite "
        "Write-Ahead Logging (WAL) database with Wireshark-compatible `.pcap` binary export. Live perimeter "
        "telemetry streams over FastAPI WebSockets (`/ws`) to an interactive SOC console featuring an upgraded "
        "Three.js / React Three Fiber 3D Campus Digital Twin of Ramachandra College of Engineering."
    ]
    pdf.set_font("Times", "", 11)
    for ap in abs_paras:
        pdf.multi_cell(0, 6.0, clean_text("      " + ap.replace("`", "")), align="J")
        pdf.ln(3.5)

    # ---- PRELIMINARY PAGES: CONTENTS ----
    pdf.add_page()
    recorded_prelim["Contents"] = ROMAN[pdf.page_no() - 1]
    pdf.set_font("Times", "B", 15)
    pdf.cell(0, 8, "CONTENTS", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(3)

    pr = prelim_ref or {"Abstract": "v", "Contents": "vi", "LOF": "viii", "LOT": "ix"}
    prelim_toc = [
        ("Certificate", "ii", True),
        ("Declaration", "iii", True),
        ("Acknowledgement", "iv", True),
        ("Abstract", pr["Abstract"], True),
        ("Contents", pr["Contents"], True),
        ("List of Figures", pr["LOF"], True),
        ("List of Tables", pr["LOT"], True),
    ]
    toc_items = prelim_toc + (toc_ref or [("Chapters populating on final pass...", "1", True)])
    for title, pg, is_b in toc_items:
        if pdf.get_y() > 268:
            pdf.add_page()
            pdf.set_font("Times", "B", 12)
            pdf.cell(0, 6, "CONTENTS (Continued)", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
            pdf.ln(2)
        pdf.set_font("Times", "B" if is_b else "", 9.8)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(142, 5.0, clean_text(title), align="L")
        pdf.cell(0, 5.0, str(pg), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")

    # ---- PRELIMINARY PAGES: LIST OF FIGURES & LIST OF TABLES ----
    pdf.add_page()
    recorded_prelim["LOF"] = ROMAN[pdf.page_no() - 1]
    pdf.set_font("Times", "B", 15)
    pdf.cell(0, 8, "LIST OF FIGURES", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(3)
    for fnum, fcap, fpg in (lof_ref or [("Fig. 1.1", "Placeholder", "1")]):
        if pdf.get_y() > 268:
            pdf.add_page()
        fc = fcap if len(fcap) <= 72 else fcap[:69].rsplit(" ", 1)[0] + "..."
        pdf.set_font("Times", "B", 9.8)
        pdf.cell(20, 5.2, clean_text(fnum), align="L")
        pdf.set_font("Times", "", 9.4)
        pdf.cell(128, 5.2, clean_text(fc), align="L")
        pdf.set_font("Times", "B", 9.8)
        pdf.cell(0, 5.2, str(fpg), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")

    pdf.ln(6)
    if pdf.get_y() > 225:
        pdf.add_page()
    recorded_prelim["LOT"] = ROMAN[pdf.page_no() - 1]
    pdf.set_font("Times", "B", 15)
    pdf.cell(0, 8, "LIST OF TABLES", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(3)
    for tnum, tcap, tpg in (lot_ref or [("Table 1.1", "Placeholder", "1")]):
        if pdf.get_y() > 268:
            pdf.add_page()
        tc = tcap if len(tcap) <= 70 else tcap[:67].rsplit(" ", 1)[0] + "..."
        pdf.set_font("Times", "B", 9.8)
        pdf.cell(22, 5.2, clean_text(tnum), align="L")
        pdf.set_font("Times", "", 9.4)
        pdf.cell(126, 5.2, clean_text(tc), align="L")
        pdf.set_font("Times", "B", 9.8)
        pdf.cell(0, 5.2, str(tpg), new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="R")

    # =========================================================================
    # SWITCH TO ARABIC PAGE NUMBERS FOR MAIN BODY (STARTS AT PAGE 1)
    # =========================================================================
    detected_prelim_count = pdf.page_no()
    pdf.prelim_page_count = detected_prelim_count

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_chap(1, "INTRODUCTION")

    add_sec("1.1 INTRODUCTION TO CAMPUS PERIMETER SECURITY")
    add_body(
        "Enterprise academic campus networks serve simultaneously as high-throughput research data backbones, "
        "administrative ERP environments, laboratory testbeds, and large-scale public wireless networks supporting "
        "thousands of concurrent student and faculty endpoints. At Ramachandra College of Engineering (Autonomous), "
        "multiple academic blocks, central server rooms, workshops, auditoriums, and residential hostels interconnect "
        "through core campus routers and gateway firewalls. Protecting this distributed perimeter requires "
        "continuous inspection of ingress and egress packet streams at sub-millisecond speeds without disrupting "
        "legitimate academic workflows."
    )
    add_body(
        "Over the past decade, transport-layer encryption has moved from optional web checkout security to near-universal "
        "default encapsulation. Transport Layer Security version 1.3 (TLS 1.3, RFC 8446), DNS-over-HTTPS (DoH, RFC 8484), "
        "and Secure Shell version 2 (SSHv2) encrypt payload data, domain lookups, and administrative session commands "
        "end-to-end. While this shift protects user privacy against passive eavesdropping, it renders legacy Deep Packet "
        "Inspection (DPI) firewalls unable to read application bytes unless expensive SSL break-and-inspect proxies are "
        "deployed—an approach that adds computational latency and introduces severe institutional privacy liabilities."
    )
    add_body(
        "To defend encrypted campus perimeters reliably, modern Network Intrusion Detection and Prevention Systems (IDPS) "
        "must shift from reading plaintext payloads to analyzing privacy-preserving flow metadata—a discipline known as "
        "Encrypted Traffic Analysis (ETA)—coupled with Explainable Artificial Intelligence (XAI) so Security Operations "
        "Center (SOC) analysts can understand, verify, and audit every automated mitigation decision."
    )

    add_sec("1.2 MOTIVATION AND NEED")
    add_body(
        "This project is motivated by four practical operational problems encountered in conventional campus IDPS deployments:"
    )
    add_bullet(
        "The Encryption Visibility Blind Spot",
        "Legacy Snort and Suricata rules inspect application payload signatures. When malicious sweeps, DNS tunneling, "
        "or covert transfers ride inside TLS 1.3 or DoH Port 443 streams, static payload matching alone misses flow-level "
        "behavioral anomalies."
    )
    add_bullet(
        "False Blocking of Genuine Heavy Campus Transfers",
        "Naive volumetric threshold alarms cannot distinguish a professor or researcher downloading a 4 GB dataset over "
        "Port 443 (large 1460-byte MTU frames concentrated on a single standard destination port) from an attacker scanning "
        "unopened infrastructure ports or launching a SYN flood. Blocking legitimate high-volume streams causes severe "
        "disruption in campus laboratories."
    )
    add_bullet(
        "The 'Black-Box' Machine Learning Trust Deficit",
        "Standard Multi-Layer Perceptron (MLP) or Deep Learning models output raw numeric class probabilities (e.g., 99.7% "
        "PORT_SCAN) without explaining which flow parameters caused the alarm. Without human-readable proof, SOC engineers "
        "hesitate to enable autonomous firewall drops due to fear of false blocks."
    )
    add_bullet(
        "Need for Real-Time Campus-Wide Situational Awareness",
        "Plain tabular log streams fail to convey which physical campus building (Admin Block, Block A Sarvesta, Block B Vidhra, "
        "Block C Shastra, Hostels, or Mechanical Lab) is affected. Integrating network flow telemetry directly onto an accurate "
        "3D Campus Digital Twin bridges low-level packet forensics with intuitive spatial infrastructure monitoring."
    )

    add_sec("1.3 PROBLEM STATEMENT")
    add_body(
        "Conventional signature-based NIDS struggle with encrypted transport flows and high-rate volumetric false positives, "
        "while black-box neural network classifiers lack transparent feature justifications and real-time spatial campus visibility. "
        "There is a critical need to engineer a lightweight, low-RAM autonomous Edge IDPS—SentinelEdge—that combines fast-path "
        "Snort/Suricata rules, flow entropy profiling, compact pure-NumPy neural classification, dual-modality Explainable AI "
        "(SHAP feature attributions + LIME IF-THEN decision rules), dynamic temporary IP quarantine jails, Wireshark-ready "
        "forensic logging, and an interactive 3D Ramachandra College Campus Digital Twin."
    )

    add_sec("1.4 AIM AND OBJECTIVES OF THE STUDY")
    add_body(
        "The primary aim of this project is to design, implement, validate, and document SentinelEdge as an explainable, "
        "zero-decryption campus perimeter IDPS framework. The core engineering objectives are:"
    )
    add_bullet(
        "Objective 1 (Fast-Path Signature & Stealth Flag Filtering)",
        "Implement a Tier 1 rule engine (`Tier1WireFilter`) parsing Snort/Suricata compatible rules (`sentinel.rules`), stateless "
        "NULL/Xmas scan flags, rolling 3-second unopened-port windows, and 2-second SYN flood burst counters."
    )
    add_bullet(
        "Objective 2 (Zero-Decryption Flow Profiling & Heavy-Transfer Separation)",
        "Build a Tier 2 agent (`SentinelAIAgent`) computing 13 stateful flow statistics including Shannon port entropy, "
        "empty-port ratio, and packet length means to separate legitimate single-port heavy MTU transfers from reconnaissance probes."
    )
    add_bullet(
        "Objective 3 (Lightweight Neural Classification with SHAP & LIME Explainability)",
        "Train and deploy a compact 10 -> 32 -> 16 -> 5 MLP classifier (`NeuronsDeepClassifier`) backed by `XAIExplainerEngine` "
        "to generate real-time Shapley attribution values (phi_i) and human-readable LIME surrogate decision rules."
    )
    add_bullet(
        "Objective 4 (Tri-State Autonomous Defense & 3D Campus Twin Integration)",
        "Implement Tier 4 autonomous defense (`FORWARDED`, `BLOCKED` via 90-120s cooldown jails, `QUARANTINED`), SQLite WAL "
        "forensics with binary `.pcap` export, and real-time WebSocket telemetry overlaid onto the RCEE 3D Digital Twin."
    )

    add_sec("1.5 SCOPE AND NOVEL CONTRIBUTIONS")
    add_body(
        "SentinelEdge targets campus and small-to-medium enterprise edge routers where hardware constraints demand a "
        "low-memory footprint (~39.8 MB process RSS) and rapid inspection without inline SSL/TLS decryption. Rather than "
        "relying on heavy offline scripts, SentinelEdge executes Explainable AI (Monte Carlo Shapley permutations + LIME rule "
        "synthesis) inline per flagged flow and persists full XAI JSON and rule records alongside binary packet captures."
    )

    add_sec("1.6 ORGANIZATION OF THE PROJECT REPORT")
    add_body(
        "Chapter 2 reviews existing literature in intrusion detection, encrypted traffic analysis, and XAI. Chapter 3 analyzes "
        "limitations of legacy systems, feasibility, and system requirements. Chapter 4 details SentinelEdge's proposed "
        "architecture, DFDs, and 4-tier control flow. Chapter 5 presents zero-decryption telemetry and Shannon entropy math. "
        "Chapter 6 formalizes SHAP cooperative game theory and LIME local surrogates. Chapter 7 documents the FastAPI, SQLite "
        "WAL, PCAP, and upgraded RCEE 3D Digital Twin stack. Chapter 8 provides core source code from the implementation. "
        "Chapter 9 presents empirical test cases, measured confusion matrices, ROC-AUC plots, latencies, and UI visualizations. "
        "Chapter 10 concludes with deployment constraints and future directions, followed by IEEE references in Chapter 11."
    )

    # =========================================================================
    # CHAPTER 2: LITERATURE SURVEY
    # =========================================================================
    add_chap(2, "LITERATURE SURVEY")

    add_sec("2.1 EVOLUTION OF NETWORK INTRUSION DETECTION SYSTEMS")
    add_body(
        "Intrusion detection architectures have evolved steadily alongside encryption standards and network link speeds. "
        "Early foundational systems such as Bro/Zeek (Paxson, 1999) and Snort (Roesch, 1999) pioneered programmable "
        "protocol event parsers and rule-based deterministic finite automata (DFA) for signature scanning. These Generation-1 "
        "engines excel at spotting known exploit strings inside unencrypted traffic at minimal memory cost, yet inherently "
        "depend on static payload visibility and manual rule updates."
    )
    add_body(
        "Generation-2 enterprise deployments added inline Deep Packet Inspection (DPI) proxies and SSL termination appliances "
        "to expose encrypted HTTP payloads. While effective at restoring cleartext matching, decryption appliances impose high "
        "cryptographic compute overhead, break perfect forward secrecy guarantees when TLS 1.3 (Rescorla, RFC 8446, 2018) is "
        "enforced, and create strict compliance burdens under student and institutional privacy policies."
    )
    add_fig("report_figures/fig_2_1_nids_evolution.png", "Fig. 2.1", "Evolution of Network Intrusion Detection Systems Across Four Generations", w=152, h_est=66)

    add_sec("2.2 ENCRYPTED TRAFFIC ANALYSIS (ETA) WITHOUT DECRYPTION")
    add_body(
        "Anderson and McGrew (2017) demonstrated that malware flows encrypted inside TLS sessions preserve statistically "
        "separable side-channel metadata, including Packet Length Sequences, Inter-Arrival Times (IAT), and transport port "
        "behaviors. Subsequent surveys by Papadogiannaki and Ioannidis (2021) and Shen et al. (2023) established Encrypted Traffic "
        "Analysis (ETA) as a viable alternative to decryption proxies. Specifically, DoH (Hoffman and McManus, RFC 8484, 2018) "
        "tunnels DNS requests within HTTPS Port 443 streams, requiring statistical timing, packet-size, and entropy inspection "
        "rather than simple port-53 string matching."
    )

    add_sec("2.3 NEURAL NETWORKS & FLOW DISPERSION FILTERING IN NIDS")
    add_body(
        "Sharafaldin et al. (2018) and Vinayakumar et al. (2019) benchmarked supervised machine learning classifiers (Random Forests, "
        "Gradient Boosting, and Multi-Layer Perceptrons) on flow-derived features from datasets like CIC-IDS2017. While multi-layer "
        "neural networks achieve high separation across volumetric DoS floods, stealth port scans, and web payloads, Sommer and Paxson "
        "(2010) emphasized the domain-specific hazard of false alarms in real networks—especially when high-bandwidth benign data "
        "transfers resemble attack packet rates unless port dispersion semantics are explicitly modeled."
    )

    add_sec("2.4 EXPLAINABLE AI (SHAP & LIME) IN SECURITY OPERATIONS")
    add_body(
        "To resolve black-box distrust in critical operational domains, Ribeiro, Singh, and Guestrin (2016) introduced LIME "
        "(Local Interpretable Model-agnostic Explanations), fitting sparse local surrogate models around individual predictions. "
        "Lundberg and Lee (2017) introduced SHAP (SHapley Additive exPlanations), grounding feature attribution in Shapley's (1953) "
        "cooperative game theory axioms. Mahbooba et al. (2021) and Wang et al. (2022) applied XAI to offline intrusion datasets, "
        "confirming improved analyst comprehension. SentinelEdge extends these contributions by embedding lightweight inline SHAP "
        "and LIME generation directly inside a streaming 4-tier edge pipeline with interactive 3D campus visualization."
    )

    add_sec("2.5 COMPARATIVE LITERATURE MATRIX")
    add_body("Table 2.1 contrasts existing open-source and academic approaches with SentinelEdge across architectural dimensions.")
    add_styled_table(
        "Table 2.1",
        "Comparative Analysis of Existing NIDS Approaches vs. SentinelEdge",
        ["System / Paradigm", "Detection Mechanism", "Heavy-Transfer False Drops", "Explainability (XAI)", "Autonomous Action", "3D Campus Context"],
        [
            ["Snort / Suricata", "Payload DFA + Threshold Rules", "Moderate (Rate thresholds)", "Rule SID Messages Only", "Inline Drop / Alert", "None"],
            ["SSL Proxy + DPI", "TLS Break-and-Inspect", "Low (Full payload check)", "Signature Hits Only", "Proxy Block (High Latency)", "None"],
            ["Black-Box DNN NIDS", "Flow Vectors + Deep MLP/LSTM", "High if port entropy omitted", "None (Opaque Probabilities)", "Binary Block Threshold", "None"],
            ["Offline XAI NIDS", "Static CSV Batch + Post-hoc SHAP", "Dataset Dependent", "Batch Offline Plots Only", "Manual Offline Audit", "None"],
            ["SentinelEdge (Ours)", "4-Tier Rules + Agent + NumPy MLP", "Guarded (0% in heavy test)", "Inline Monte Carlo SHAP + LIME", "Tri-State (90-120s Jail) + PCAP", "RCEE 3D Digital Twin"]
        ],
        [30, 32, 28, 28, 22, 20],
        font_sz=8.2
    )

    add_styled_table(
        "Table 2.2",
        "Summary of Foundational Academic Literature Reviewed",
        ["Reference / Year", "Focus Area", "Key Technical Contribution", "Identified Gap Addressed by SentinelEdge"],
        [
            ["Roesch (1999) / Paxson (1999)", "Rule & Event NIDS", "Lightweight regex rule syntax & stateful bro scripting", "Payload blindness under ubiquitous TLS 1.3 encryption"],
            ["Anderson & McGrew (2017)", "Encrypted Malware Analysis", "Flow metadata + SPLT classification without decryption", "Lacked online lightweight explainability & firewall quarantine"],
            ["Ribeiro et al. (2016)", "LIME Explainability", "Local linear surrogate approximations around predictions", "Not integrated into live packet pipeline rule cards"],
            ["Lundberg & Lee (2017)", "SHAP Game Attribution", "Unified Shapley values satisfying efficiency & symmetry", "Typically executed offline on batch CSVs rather than live edge"],
            ["Sharafaldin et al. (2018)", "CIC-IDS2017 Benchmark", "Flow-based benchmark feature profiles for scans/DoS", "Needed edge-tuned compact vectorization & heavy stream guard"]
        ],
        [34, 28, 48, 50],
        font_sz=8.2
    )

    # =========================================================================
    # CHAPTER 3: EXISTING SYSTEM & REQUIREMENTS ANALYSIS
    # =========================================================================
    add_chap(3, "EXISTING SYSTEM & FEASIBILITY ANALYSIS")

    add_sec("3.1 OVERVIEW OF TRADITIONAL SYSTEMS")
    add_body(
        "Conventional enterprise and college perimeter defenses rely predominantly on three mechanisms: stateless firewall ACLs, "
        "signature-matching IDS engines (Snort/Suricata), and centralized SIEM dashboards collecting flat text logs. Packets are "
        "either passed based on port/IP rules or checked sequentially against hundreds of string patterns looking for cleartext "
        "exploit signatures such as SQL injection strings or unencrypted shell commands."
    )
    add_body(
        "Where encrypted traffic inspection is attempted in commercial deployments, institutions deploy middlebox TLS interception "
        "appliances that generate synthetic root certificates installed across all student laptops and lab workstations, terminating "
        "TLS handshakes at the gateway to inspect decrypted streams before re-encrypting traffic outbound."
    )

    add_sec("3.2 LIMITATIONS OF EXISTING SYSTEMS")
    add_bullet("Failure Under Zero-Decryption Constraints", "Without invasive SSL termination proxies, signature engines cannot inspect encrypted DoH tunnels or TLS sessions whose payloads appear as uniform high-entropy ciphertext.")
    add_bullet("Privacy Compliance & Cryptographic Overhead", "Gateway TLS termination introduces cryptographic CPU overhead across 10 Gbps links, degrades interactive QoS, and exposes sensitive academic/personal credentials inside middlebox memory.")
    add_bullet("Single-Port Heavy Transfer Misclassification", "Simple packet-rate alarms flag legitimate large dataset syncs, video lectures, or ISO downloads on Port 443 because they lack port-diversity and empty-port heuristics.")
    add_bullet("Analyst Alert Fatigue Without XAI Proof", "High alert volumes without local feature attributions force analysts to manually dissect raw hex dumps to understand why an alert fired, delaying containment.")

    add_sec("3.3 FEASIBILITY STUDY")
    add_body(
        "Before implementation, a three-pillar feasibility assessment validated SentinelEdge for academic campus deployment:"
    )
    add_bullet("Technical Feasibility", "All pipeline components run in Python 3.11+ using pure NumPy inference (pre-trained MLP weights in `weights.json`), SQLite WAL storage, FastAPI WebSockets, and standard browser WebGL (`Three.js`). No specialized GPU or SSL hardware accelerator is required (~39.8 MB edge RAM footprint).")
    add_bullet("Operational Feasibility", "SOC personnel do not need deep ML mathematics training to act on alerts: the UI renders color-coded SHAP bars (`+` pushes toward threat, `-` pulls toward benign) alongside plain-English LIME `IF-THEN` summaries and one-click PCAP export or IP Jail Release controls.")
    add_bullet("Economic Feasibility", "Built strictly on open-source technologies (Python, FastAPI, NumPy, Scikit-learn, SQLite, React Three Fiber, Three.js), SentinelEdge avoids commercial NGFW/DPI licensing fees while remaining deployable on standard gateway hardware or cloud serverless tiers.")

    add_sec("3.4 SYSTEM REQUIREMENTS SPECIFICATION")
    add_styled_table(
        "Table 3.1",
        "Hardware and Software Requirements Specification for SentinelEdge",
        ["Category", "Component", "Minimum / Development Specification"],
        [
            ["Hardware", "Processor (Edge / Server)", "Multi-core x86_64 CPU (e.g., Intel Core i5/i7, 4+ Cores)"],
            ["Hardware", "System Memory (RAM)", "4 GB min (SentinelEdge Core uses ~40 MB RSS at runtime)"],
            ["Hardware", "Graphics (Client UI)", "WebGL 2.0 compatible GPU / Integrated Graphics for 3D Twin"],
            ["Software", "Operating System", "Windows 10/11 or Linux (Ubuntu 22.04+)"],
            ["Software", "Backend Runtime", "Python 3.11+, FastAPI 0.141+, Uvicorn, WebSockets, NumPy"],
            ["Software", "ML Training & Eval", "Scikit-learn (offline MLP training -> exported weights.json)"],
            ["Software", "Database", "SQLite 3 with Write-Ahead Logging (WAL) mode enabled"],
            ["Software", "Frontend & 3D Engine", "HTML5/CSS3/JS + Vite + React 18 + Three.js / React Three Fiber"]
        ],
        [28, 42, 90],
        font_sz=8.8
    )

    # =========================================================================
    # CHAPTER 4: PROPOSED SYSTEM & ARCHITECTURAL DESIGN
    # =========================================================================
    add_chap(4, "PROPOSED SYSTEM & ARCHITECTURAL DESIGN")

    add_sec("4.1 OVERVIEW OF SENTINELEDGE")
    add_body(
        "SentinelEdge replaces opaque single-stage inspection with a structured 4-tier hybrid architecture engineered specifically "
        "for lightweight campus edge deployment. By cascading fast deterministic signature rules into statistical flow profiling, "
        "pure-NumPy neural classification with Explainable AI, and an autonomous tri-state response engine, SentinelEdge protects "
        "network integrity while guaranteeing zero false drops on legitimate single-port heavy traffic and complete auditability."
    )

    add_sec("4.2 ARCHITECTURAL BLOCK DIAGRAM")
    add_body(
        "Figure 4.1 illustrates the end-to-end data flow between campus traffic sources, the 4-tier detection core "
        "(`sentinel_core.py`), the SQLite WAL ledger, the FastAPI WebSocket server, and the RCEE 3D Digital Twin dashboard."
    )
    add_fig("report_figures/fig_4_1_block_diagram.png", "Fig. 4.1", "End-to-End Block Diagram of Proposed SentinelEdge Architecture", w=154, h_est=80)

    add_sec("4.3 OPERATIONAL FLOWCHART & DECISION LOGIC")
    add_body(
        "Figure 4.2 maps the packet-by-packet decision lifecycle inside SentinelEdgeCore.process_packet(). Crucially, packets "
        "originating from an already quarantined IP in blocklist_cache are rejected immediately in ~9.8 microseconds before "
        "entering Tiers 1-3, conserving CPU under sustained flood or scan bombardment."
    )
    add_fig("report_figures/fig_4_3_flowchart.png", "Fig. 4.2", "Operational Flowchart Across Active Ban Check, Tiers 1-4, and XAI", w=128, h_est=120)

    add_sec("4.4 DATA FLOW DIAGRAMS (LEVEL-0 & LEVEL-1)")
    add_body(
        "Figure 4.3 details the Context Diagram (Level-0) showing external entities (Campus Traffic & SOC Analyst/Firewall) alongside "
        "the Level-1 functional decomposition linking processes 1.0-4.0 with persistent data stores D1 (sentinel.rules), D2 "
        "(weights.json), and D3 (sentinel_incidents.db)."
    )
    add_fig("report_figures/fig_4_4_dfd_diagram.png", "Fig. 4.3", "Level-0 Context Diagram and Level-1 Data Flow Diagram (DFD)", w=152, h_est=78)

    add_sec("4.5 DETAILED 4-TIER PIPELINE ARCHITECTURE")
    add_fig("report_figures/fig_4_2_pipeline_diagram.png", "Fig. 4.4", "Modular 4-Tier Pipeline Architecture with Measured Stage Latencies", w=150, h_est=88)

    add_subsec("4.5.1 Tier 1: Snort/Suricata Fast-Path Wire Filter (`Tier1WireFilter`)")
    add_body(
        "Tier 1 loads 12 Snort/Suricata compatible rules from `tier1_wire_filter/sentinel.rules` (SIDs 1000001 through 1000031). "
        "For every incoming packet, `inspect_packet()` executes four rapid checks: (1) stateless malformed scan flag checks "
        "(TCP NULL flags -> SID 1000002; TCP Xmas FPU flags -> SID 1000003), (2) a rolling 3-second tracker of unique destination "
        "ports outside standard campus web services `{80, 443, 53, 8080, 22}` triggering SID 1000004 once >= 5 empty ports are probed, "
        "(3) a rolling 2-second SYN-without-ACK counter triggering SID 1000020 at >= 35 SYNs, and (4) case-insensitive/exact substring "
        "matching against rule content patterns (e.g., `UNION SELECT`, `${jndi:ldap`, `/etc/passwd`, `/bin/sh`)."
    )

    add_subsec("4.5.2 Tier 2: Stateful Flow Profiler & Entropy Agent (`SentinelAIAgent`)")
    add_body(
        "Tier 2 groups packets by `(src_ip, dst_ip)` flow keys inside `FlowStats` objects, updating rolling byte sums, TCP flags, "
        "inter-arrival times, and targeted port frequency histograms. It outputs 13 flow metrics and calculates an initial "
        "`agent_anomaly_score` in `[0.01, 0.99]`. Crucially, it flags `is_single_port_heavy = True` when a flow targets <= 2 standard "
        "ports (`empty_port_ratio <= 0.05`) with large payloads (`mean_pkt_len >= 200`), downgrading false anomaly inflation—while "
        "flagging `is_port_scan_pattern = True` when `unique_dst_ports >= 4`, `empty_port_ratio >= 0.5`, and `port_diversity_ratio > 0.2`."
    )

    add_subsec("4.5.3 Tier 3: The Neurons MLP & XAI Engine (`NeuronsDeepClassifier`)")
    add_body(
        "Tier 3 normalizes 10 flow and agent descriptors into vector `x` and evaluates a feedforward Multi-Layer Perceptron "
        "(`10 -> 32 -> 16 -> 5`) with ReLU hidden activations and a 5-class Softmax output (`BENIGN_NORMAL`, "
        "`BENIGN_HEAVY_TRANSFER`, `PORT_SCAN`, `DOS_SYN_FLOOD`, `MALICIOUS_PAYLOAD`). Trained weights are persisted in "
        "`tier3_neurons/weights.json` so inference runs natively in NumPy. Guardrail rules prevent false positives when Tier 1 "
        "is `CLEAN` and `agent_score < 0.30`, after which `XAIExplainerEngine.explain()` produces SHAP and LIME justifications."
    )

    add_subsec("4.5.4 Tier 4: Autonomous Tri-State Response Engine (`AutonomousResponseEngine`)")
    add_body(
        "Tier 4 makes one of three deterministic perimeter decisions: `FORWARDED` (clean traffic & guarded genuine heavy transfers), "
        "`BLOCKED` (enforcing an automatic 90-second firewall jail for `PORT_SCAN` and 120-second jail for `DOS_SYN_FLOOD` / "
        "`MALICIOUS_PAYLOAD` when confidence >= 65%), or `QUARANTINED` (recording ambiguous low-confidence anomalies with "
        "`agent_anomaly_score >= 0.50` for deep inspection). Active bans reside in an O(1) dictionary cache backed by SQLite WAL."
    )

    add_sec("4.6 ADVANTAGES OF THE PROPOSED SYSTEM")
    add_bullet("Zero False Drops on Academic Heavy Transfers", "Excludes large single-port Port 443/8080 file streams from false DoS/Scan quarantine.")
    add_bullet("Lightweight Edge Deployment (~39.8 MB RSS)", "Pre-exported `weights.json` runs pure NumPy math in ~10.3 us without GPUs.")
    add_bullet("Transparent Per-Incident XAI", "Pairs numeric Shapley weights (`phi_i`) with readable LIME `IF-THEN` decision summaries.")
    add_bullet("Self-Expiring Cooldown Quarantine", "90s/120s automated block durations prevent permanent accidental campus IP lockouts.")

    add_sec("4.7 ENTERPRISE CAMPUS APPLICATIONS")
    add_body(
        "SentinelEdge is directly applicable to university perimeter spans, multi-building research campus gateways, "
        "cybersecurity teaching labs (demonstrating live attacks vs explainable mitigations), and small-to-medium branch offices."
    )

    # =========================================================================
    # CHAPTER 5: ZERO-DECRYPTION ENCRYPTED TRAFFIC ANALYSIS
    # =========================================================================
    add_chap(5, "ZERO-DECRYPTION ENCRYPTED TRAFFIC ANALYSIS")

    add_sec("5.1 CRYPTOGRAPHIC TRANSPORT BLIND SPOTS")
    add_body(
        "Modern campus edge traffic spans HTTPS over TLS 1.3 (RFC 8446), encrypted DNS resolution via DoH (RFC 8484), and SSHv2 "
        "remote sessions. In our traffic telemetry model (`simulation/traffic_generator.py`), encrypted flows are tagged explicitly "
        "with metadata attributes (`is_encrypted`, `encrypted_protocol`, `cipher_suite`, `inspection_mode`), including "
        "`TLS_AES_256_GCM_SHA384` (TLS 1.3), `TLS_CHACHA20_POLY1305_SHA256` (DoH tunnels), and `chacha20-poly1305@openssh.com` (SSHv2). "
        "Inspection operates strictly on transport headers, port distributions, and timing without TLS decryption."
    )
    add_fig("report_figures/fig_5_1_encrypted_traffic_telemetry.png", "Fig. 5.1", "Zero-Decryption Flow Telemetry Profiling Across TLS 1.3, DoH, SSHv2, and Encrypted Sweeps", w=150, h_est=62)

    add_sec("5.2 SIDE-CHANNEL FLOW METADATA PROFILING IN `FlowStats`")
    add_body(
        "Inside `tier2_agent/agent.py`, `FlowStats` records directional packet arrivals between `(src_ip, dst_ip)` pairs without "
        "parsing plaintext TLS application payloads. Even when application payloads are encrypted, side-channel invariants remain "
        "observable: TCP SYN/ACK/RST flags, IP/TCP frame lengths, inter-arrival timing intervals (`dt`), and destination port histograms."
    )

    add_sec("5.3 MATHEMATICAL FORMULATION OF SHANNON PORT ENTROPY")
    add_body(
        "To measure whether a source host is communicating with a focused legitimate application service or probing scattered "
        "campus ports, `FlowStats.compute_features()` computes Shannon Entropy across the empirical distribution of targeted "
        "destination ports `P(p_k) = count(p_k) / total_packets`:"
    )
    add_formula_box([
        "H_port = - SUM_{k=1..U} P(p_k) * log_2( P(p_k) )   [Bits per probe]",
        "where U = unique_dst_ports  and  P(p_k) = count(p_k) / N"
    ])
    add_body(
        "When a host streams files exclusively over Port 443 (`U = 1`), `log_2(1) = 0`, yielding `H_port = 0.0` bits regardless of "
        "transfer size. Conversely, when a stealth scanner sweeps `U` uniform distinct ports (1 packet each), `H_port = log_2(U)` "
        "(growing smoothly: `0.0 -> 1.0 -> 1.585 -> 2.0` across 1, 2, 3, 4 distinct ports, reaching `3.0` at 8 ports)."
    )

    add_sec("5.4 WORKED COMPARISON: HEAVY STREAM VS. ENCRYPTED PORT SCAN")
    add_body(
        "During our benchmark execution (`eval_metrics.json`), sending 40 encrypted packets in a single-port heavy stream over "
        "Port 443 produced 1460-byte frames, `empty_port_ratio = 0.0`, and `H_port = 0.0` once focused on the single port. In contrast, "
        "a multi-port scan targeting unopened ports (`21, 23, 25, 69, ...`) generated 54-byte tiny TCP SYN probes with "
        "`empty_port_ratio = 1.0` and monotonic Shannon entropy growth (`0.0 -> 1.0 -> 1.585 -> 2.0`), triggering immediate Tier 1 + "
        "Tier 2 + Tier 3 detection by the 5th probe packet. Figure 5.2 plots these exact measured values."
    )
    add_fig("report_figures/fig_5_2_shannon_entropy.png", "Fig. 5.2", "Observed Shannon Port Entropy Growth & Packet Size Separation", w=154, h_est=62)

    add_sec("5.5 COMPLETE FLOW & NEURAL FEATURE DICTIONARY")
    add_body("Tables 5.1 and 5.2 enumerate all 13 flow telemetry attributes computed by Tier 2 and the 10-feature scaled vector passed to Tier 3.")
    add_styled_table(
        "Table 5.1",
        "13 Raw Stateful Flow Attributes Extracted by SentinelAIAgent (FlowStats)",
        ["Metric Key", "Mathematical Definition / Source", "Discrimination Role"],
        [
            ["flow_duration_s", "max(0.001, last_time - start_time)", "Measures flow longevity vs flash bursts"],
            ["total_packets", "Integer packet counter for (src_ip, dst_ip)", "Base denominator for ratios and rates"],
            ["total_bytes", "Cumulative sum of packet_len values", "Tracks bulk data transfer volume"],
            ["unique_dst_ports", "Cardinality |targeted_ports|", "Primary indicator of port enumeration"],
            ["port_diversity_ratio", "unique_dst_ports / total_packets", "Distinguishes repeated single-port vs spread"],
            ["empty_port_ratio", "sum(probes not in {80,443,53,8080,22}) / N", "Separates valid services from closed ports"],
            ["port_entropy", "-sum(P(p) log2 P(p)) if U > 1 else 0.0", "Quantifies randomness of destination ports"],
            ["mean_pkt_len", "sum(packet_lengths) / N", "Tiny 54B probes vs 1460B heavy MTU"],
            ["pkt_rate_pps", "total_packets / flow_duration_s", "Detects volumetric flooding velocity"],
            ["byte_rate_kbps", "(total_bytes / 1024.0) / flow_duration_s", "Measures sustained bandwidth throughput"],
            ["syn_count", "Count of TCP packets containing 'S' flag", "Captures SYN sweep & flood initiation"],
            ["ack_count", "Count of TCP packets containing 'A' flag", "Indicates established bidirectional sessions"],
            ["syn_ack_ratio", "syn_count / max(1, ack_count)", "High ratios reveal unacknowledged SYN floods"]
        ],
        [40, 58, 62],
        font_sz=8.0
    )

    add_styled_table(
        "Table 5.2",
        "10 Normalized Input Features Fed to Tier 3 NeuronsDeepClassifier (FEATURE_NAMES)",
        ["Index", "Feature Name", "Scaling Transformation", "Human Label in XAI Dashboard"],
        [
            ["x[0]", "pkt_rate", "pkt_rate_pps / 500.0", "Packet Velocity (PPS)"],
            ["x[1]", "byte_rate", "byte_rate_kbps / 5000.0", "Byte Throughput (KBPS)"],
            ["x[2]", "port_diversity_ratio", "Raw ratio [0.0, 1.0]", "Port Diversity Index"],
            ["x[3]", "empty_port_ratio", "Raw ratio [0.0, 1.0]", "Empty / Closed Port Probes"],
            ["x[4]", "port_entropy", "Shannon Entropy H [0.0, 4.0+]", "Shannon Port Entropy"],
            ["x[5]", "mean_pkt_len", "mean_pkt_len / 1500.0", "Packet Length Variance"],
            ["x[6]", "syn_ratio", "syn_count / max(1, total_packets)", "TCP SYN Flag Ratio"],
            ["x[7]", "agent_score", "Agent anomaly score [0.01, 0.99]", "Tier 2 Agent Anomaly Index"],
            ["x[8]", "tier1_flagged", "1.0 if FLAGGED else 0.0", "Wire Filter Signature Match"],
            ["x[9]", "flow_duration", "flow_duration_s / 60.0", "Active Flow Lifetime"]
        ],
        [14, 38, 52, 56],
        font_sz=8.2
    )

    # =========================================================================
    # CHAPTER 6: EXPLAINABLE AI ENGINE (SHAP & LIME)
    # =========================================================================
    add_chap(6, "EXPLAINABLE AI ENGINE (SHAP & LIME)")

    add_sec("6.1 SOLVING THE BLACK-BOX DILEMMA IN AI-DRIVEN CYBERSECURITY")
    add_body(
        "Deep Multi-Layer Perceptrons transform tabular inputs through stacked affine matrices and non-linear ReLU activations. "
        "Consequently, a raw probability such as `PORT_SCAN (99.69%)` obscures which network property triggered mitigation. "
        "`tier3_neurons/xai_explainer.py` resolves this trust barrier by executing two complementary Explainable AI paradigms inline "
        "on every evaluated flow: game-theoretic SHAP feature attribution and LIME local linear surrogate rule synthesis."
    )
    add_fig("report_figures/fig_6_1_xai_pipeline.png", "Fig. 6.1", "Dual-Modality Explainable AI Engine Integrated into Tier 3", w=150, h_est=66)

    add_sec("6.2 SHAP (SHAPLEY ADDITIVE EXPLANATIONS) MATHEMATICAL FORMULATION")
    add_body(
        "Derived from Lloyd Shapley's (1953) cooperative game theory solution and adapted for machine learning by Lundberg and Lee (2017), "
        "the Shapley value `phi_i(x)` distributes the total prediction shift `f(x) - E[f(X)]` fairly across the 10 network features `F`:"
    )
    add_formula_box([
        "phi_i(x) = SUM_{S <= F \\ {i}} [ |S|!(|F| - |S| - 1)! / |F|! ] * [ f(S U {i}) - f(S) ]",
        "Efficiency Guarantee:  SUM_{i=1..10} phi_i(x) = f(x) - f(BENIGN_BASELINE)"
    ])
    add_body(
        "Shapley attributions uniquely satisfy four axioms: (1) Efficiency (attributions sum precisely to the prediction shift over "
        "the reference vector), (2) Symmetry (identical marginal contributors receive equal weights), (3) Dummy (inactive features "
        "with zero coalition impact receive `phi_i = 0.0`), and (4) Additivity. Because evaluating all `2^10 = 1,024` coalitions per "
        "packet is unnecessary for streaming defense, `XAIExplainerEngine.compute_shap_values()` executes deterministic-seed "
        "(`seed=42`) **32-permutation Monte Carlo Shapley approximation** against `BENIGN_BASELINE` followed by explicit Efficiency normalization."
    )

    add_sec("6.3 LIVE EXPERIMENTAL SHAP ATTRIBUTION ANALYSIS")
    add_body(
        "Figure 6.2 and Table 6.1 display actual Shapley attributions measured directly by `SentinelEdgeCore` during our benchmark "
        "run across a live `PORT_SCAN` (99.69% confidence) and a `MALICIOUS_PAYLOAD` (96.68% confidence). Positive `phi_i` (red) pushes "
        "towards threat classification, while negative `phi_i` (green) opposes the threat class."
    )
    add_fig("report_figures/fig_6_2_shap_waterfall.png", "Fig. 6.2", "Observed Live SHAP Feature Attribution Bars for PORT_SCAN and MALICIOUS_PAYLOAD", w=154, h_est=66)

    p_shap = METRICS["samples"]["PORT_SCAN"]["shap"]["attributions"]
    m_shap = METRICS["samples"]["MALICIOUS_PAYLOAD"]["shap"]["attributions"]
    add_styled_table(
        "Table 6.1",
        "Measured Live SHAP Values (phi_i) for Real Flagged Incidents",
        ["Feature Name", "PORT_SCAN phi_i", "PORT_SCAN Impact", "MALICIOUS_PAYLOAD phi_i", "Payload Impact"],
        [
            ["port_entropy", f"{p_shap['port_entropy']['phi']:+.4f}", "Primary Scan Driver", f"{m_shap['port_entropy']['phi']:+.4f}", "Minimal Spread"],
            ["empty_port_ratio", f"{p_shap['empty_port_ratio']['phi']:+.4f}", "Unopened Ports Probed", f"{m_shap['empty_port_ratio']['phi']:+.4f}", "Zero Empty Ports (443)"],
            ["port_diversity_ratio", f"{p_shap['port_diversity_ratio']['phi']:+.4f}", "High Port Spread", f"{m_shap['port_diversity_ratio']['phi']:+.4f}", "Low Single Socket"],
            ["tier1_flagged", f"{p_shap['tier1_flagged']['phi']:+.4f}", "Agent Pre-Scan", f"{m_shap['tier1_flagged']['phi']:+.4f}", "Primary Payload Hit"],
            ["agent_score", f"{p_shap['agent_score']['phi']:+.4f}", "Agent Corroboration", f"{m_shap['agent_score']['phi']:+.4f}", "Agent Corroboration"],
            ["flow_duration", f"{p_shap['flow_duration']['phi']:+.4f}", "Short Scan Lifetime", f"{m_shap['flow_duration']['phi']:+.4f}", "Handshake Delay"]
        ],
        [36, 26, 36, 30, 32],
        font_sz=8.2
    )

    add_sec("6.4 LIME LOCAL LINEAR SURROGATE RULE SYNTHESIZER")
    add_body(
        "Complementing SHAP numerical vectors, `generate_lime_explanation()` implements the LIME local surrogate framework "
        "(Ribeiro et al., 2016), solving for an interpretable model `g` within class `G` that approximates the local behavior of `f` "
        "around instance `x` weighted by an exponential proximity kernel `pi_x(z) = exp(-D(x, z)^2 / sigma^2)`:"
    )
    add_formula_box([
        "xi(x) = arg min_{g in G}  L(f, g, pi_x)  +  Omega(g)"
    ])
    add_body(
        "In production SOC workflows, SentinelEdge maps the dominant local linear thresholds into clear Boolean `IF-THEN` "
        "surrogate rule summaries (`surrogate_rule`, `rule_conditions`, `feature_weights`, `human_summary`, `fidelity_score = 0.965`). "
        "For example, `PORT_SCAN` outputs: `IF empty_port_ratio > 0.80 (unopened port probes) AND port_entropy > 1.50 "
        "(multi-port dispersion) AND syn_ratio > 0.50 (stealth SYN sweep) AND mean_pkt_len < 120 bytes (tiny probe frames) ==> "
        "Classified as PORT_SCAN (Confidence: 99.69%)`."
    )
    add_fig("report_figures/fig_6_3_lime_surrogate.png", "Fig. 6.3", "LIME Local Boundary Linearization & Real Synthesized Rule Summaries", w=154, h_est=66)

    add_sec("6.5 DUAL-MODAL FORENSIC AUDITABILITY")
    add_body(
        "By saving both `shap_json` and `lime_rule` directly in SQLite WAL (`tier4_response/database.py`) and rendering them "
        "simultaneously in the dashboard's AI Analysis subpanel and Forensic Modal, SOC operators gain dual verification: rapid "
        "LIME rule comprehension for fast triage and additive SHAP values for rigorous engineering or compliance audits."
    )

    # =========================================================================
    # CHAPTER 7: SYSTEM STACK, DATABASE & RCEE 3D DIGITAL TWIN
    # =========================================================================
    add_chap(7, "SYSTEM STACK, FORENSIC STORAGE & RCEE 3D TWIN")

    add_sec("7.1 FULL-STACK SOFTWARE ARCHITECTURE")
    add_body(
        "SentinelEdge separates high-speed analytical Python modules from the React Three Fiber / Three.js 3D campus renderer "
        "and lightweight vanilla-JS SOC frontend, communicating via FastAPI ASGI REST endpoints, WebSockets (`/ws`), and browser "
        "`postMessage` channels. Figure 7.1 outlines all four software tiers."
    )
    add_fig("report_figures/fig_7_1_tech_stack.png", "Fig. 7.1", "Full-Stack SentinelEdge Software & 3D Visualization Technology Stack", w=150, h_est=70)

    add_sec("7.2 FASTAPI REST & WEBSOCKET TELEMETRY SPECIFICATION")
    add_styled_table(
        "Table 7.1",
        "FastAPI Server REST API and WebSocket Endpoints (dashboard/server.py)",
        ["Method / Path", "Purpose & Payload", "Backing Module"],
        [
            ["WS /ws", "Streams INITIAL_STATE and real-time PACKET_INSPECTED JSON events", "broadcast_packet_event()"],
            ["GET /api/telemetry", "Returns total packets, forwarded, blocked, quarantined, RAM MB, CPU %", "sentinel.get_system_telemetry()"],
            ["GET /api/incidents", "Returns most recent security & XAI incident rows (default limit=50)", "sentinel.db.get_recent_incidents()"],
            ["GET /api/incident/{id}", "Fetches full incident detail plus parsed SHAP JSON for Modal view", "sentinel.db.get_incident_by_id()"],
            ["GET /api/blocklist", "Lists active quarantined IPs with remaining cooldown seconds", "sentinel.db.get_active_blocklist()"],
            ["POST /api/unblock/{ip}", "Releases a quarantined IP from SQLite and Tier 4 blocklist_cache", "sentinel.db.remove_from_blocklist()"],
            ["POST /api/simulate/burst/{t}", "Triggers demand burst: port_scan, heavy_transfer, exploit, normal", "generator.trigger_burst()"],
            ["POST /api/simulation/toggle", "Pauses or resumes continuous background traffic simulation", "generator.start/stop_continuous()"],
            ["GET /api/export_pcap/{id}", "Generates downloadable Wireshark binary .pcap file for incident ID", "export_pcap() binary builder"]
        ],
        [44, 72, 44],
        font_sz=8.2
    )

    add_sec("7.3 SQLITE WAL FORENSICS & DATABASE ER SCHEMA")
    add_body(
        "`tier4_response/database.py` configures SQLite 3 with `PRAGMA journal_mode = WAL;` and `PRAGMA synchronous = NORMAL;`, "
        "enabling concurrent non-blocking dashboard queries alongside rapid Tier 4 incident inserts. Automatic schema migration "
        "adds `shap_json`, `lime_rule`, and `encrypted_proto` columns seamlessly."
    )
    add_fig("report_figures/fig_7_2_db_er_schema.png", "Fig. 7.2", "SQLite WAL Database Entity-Relationship Schema (incidents & active_blocklist)", w=150, h_est=66)

    add_sec("7.4 STANDARD WIRESHARK BINARY PCAP EXPORT FORMAT")
    add_body(
        "The `/api/export_pcap/{incident_id}` route constructs a valid binary packet capture (`.pcap`) file directly from "
        "stored forensic records: a 24-byte libpcap global header (`0xd4c3b2a1` little-endian magic, version 2.4, snaplen 262,144, "
        "Ethernet link-type 1), a 16-byte per-packet timestamp/length header, and a 54-byte synthetic Ethernet + IPv4 + TCP frame "
        "header followed by the stored hex payload—allowing analysts to inspect incidents directly in Wireshark."
    )

    add_sec("7.5 UPGRADED RCEE 3D CAMPUS DIGITAL TWIN & CYBER LAYER")
    add_body(
        "The campus visualization in `clg 3d view/src/campus/` integrates high-fidelity architectural models from Ramachandra "
        "College of Engineering (`RCE_3d_Tour`): the 4-storey Admin Block featuring the RUDRA canopy, A Block (Sarvesta), B Block "
        "(Vidhra), C Block (Shastra), Mechanical Lab, Auditorium, Open Auditorium, Hostels, Campus Shrine, and Sports Courts. "
        "To tailor the 3D scene specifically for SOC operations, the left tour slider rail (`rc-rail`) and scroll-wheel hijack were "
        "removed so analysts can zoom and orbit freely, while `NetworkSimulation.jsx` overlays the Core Router (`10.0.0.1`), "
        "luminous optical fiber conduits along internal campus roads, animated data/threat spheres, WiFi rings, and overhead node cards."
    )
    add_fig("report_figures/fig_8_1_campus_topology.png", "Fig. 7.3", "RCEE Campus 3D Digital Twin Coordinates & Fiber Conduit Mapping (networkConfig.js)", w=150, h_est=78)

    add_styled_table(
        "Table 7.2",
        "Campus Infrastructure Nodes Mapped in the RCEE 3D Cyber Twin",
        ["Node ID", "Campus Building / Zone", "Coordinates (x, z)", "IP / Subnet", "Simulated Traffic & Security Role"],
        [
            ["core-router", "Core Router & Edge Firewall", "(-24.45, -2.00)", "10.0.0.1 / 192.168.1.1", "10 Gbps Fiber Backbone Gateway"],
            ["admin", "Admin Block (RUDRA Canopy)", "(-24.45, -7.03)", "10.0.1.10 (10.0.1.0/24)", "ERP Data Center & Secure Core"],
            ["a", "A Block (Sarvesta - 4 Floors)", "(-3.38, 12.65)", "10.0.2.100 (10.0.2.0/24)", "4 CSE Labs • Threat Sim C2 Target"],
            ["b", "B Block (Vidhra - 3 Floors)", "(25.93, 12.88)", "10.0.3.50 (10.0.3.0/24)", "4 ECE/IoT Labs • High Volume Traffic"],
            ["c", "C Block (Shastra - 4 Floors)", "(-4.73, -19.75)", "10.0.4.52 (10.0.4.0/24)", "Cyber Security Lab • Quarantined Node"],
            ["mechlab", "Mechanical Engineering Lab", "(22.00, 31.00)", "10.0.5.15 (10.0.5.0/24)", "CAD/CAM Lab • 60 Systems (Normal)"],
            ["auditorium", "Main Auditorium (3 Floors)", "(39.00, -10.10)", "10.0.6.20 (10.0.6.0/24)", "Seminar & AV Media Hub (Normal)"],
            ["boys / girls", "Residential Campus Hostels", "(44,15.5) / (-12,48)", "10.0.7.88 / 10.0.8.45", "Campus Hostel Wireless Mesh"]
        ],
        [22, 42, 28, 34, 34],
        font_sz=8.0
    )

    # =========================================================================
    # CHAPTER 8: IMPLEMENTATION & VERBATIM CORE SOURCE CODE
    # =========================================================================
    add_chap(8, "IMPLEMENTATION & VERBATIM CORE SOURCE CODE")

    add_sec("8.1 TIER 1 DETECTION RULES & WIRE FILTER IMPLEMENTATION")
    add_body(
        "The listings below are taken verbatim from `tier1_wire_filter/sentinel.rules` and `tier1_wire_filter/engine.py`, "
        "showing Snort/Suricata compatible rule syntax, empty-port tracking, and SYN burst counters."
    )
    add_code_listing(
        "Listing 8.1: Snort/Suricata Signature Rules (tier1_wire_filter/sentinel.rules)",
        read_code_slice("tier1_wire_filter/sentinel.rules", 1, 25)
    )
    add_code_listing(
        "Listing 8.2: Fast-Path Wire Inspection Logic (tier1_wire_filter/engine.py, lines 92-160)",
        read_code_slice("tier1_wire_filter/engine.py", 92, 160)
    )

    add_sec("8.2 TIER 2 FLOW PROFILER & SHANNON ENTROPY (`tier2_agent/agent.py`)")
    add_code_listing(
        "Listing 8.3: FlowStats Feature Extraction & Discrimination Logic (tier2_agent/agent.py, lines 50-149)",
        read_code_slice("tier2_agent/agent.py", 50, 149)
    )

    add_sec("8.3 TIER 3 MLP NEURAL ENGINE (`tier3_neurons/neurons.py`)")
    add_code_listing(
        "Listing 8.4: Pure-NumPy 10->32->16->5 Forward Inference & Guardrail (tier3_neurons/neurons.py, lines 206-282)",
        read_code_slice("tier3_neurons/neurons.py", 206, 282)
    )

    add_sec("8.4 EXPLAINABLE AI: SHAP & LIME (`tier3_neurons/xai_explainer.py`)")
    add_code_listing(
        "Listing 8.5: Monte Carlo Shapley Computation & LIME Rule Generator (tier3_neurons/xai_explainer.py, lines 67-160)",
        read_code_slice("tier3_neurons/xai_explainer.py", 67, 160)
    )

    add_sec("8.5 TIER 4 RESPONSE & 3D NETWORK OVERLAY (`response_engine.py`, `NetworkSimulation.jsx`)")
    add_code_listing(
        "Listing 8.6: Tri-State Autonomous Decision & Dynamic Jail (tier4_response/response_engine.py, lines 62-120)",
        read_code_slice("tier4_response/response_engine.py", 62, 120)
    )
    add_code_listing(
        "Listing 8.7: Three.js Animated Packet Conduits & Telemetry Badges (NetworkSimulation.jsx, lines 29-115)",
        read_code_slice("clg 3d view/src/campus/NetworkSimulation.jsx", 29, 115)
    )

    # =========================================================================
    # CHAPTER 9: SYSTEM TESTING, EXPERIMENTAL RESULTS & BENCHMARKING
    # =========================================================================
    add_chap(9, "SYSTEM TESTING, EXPERIMENTAL RESULTS & BENCHMARKING")

    add_sec("9.1 EXPERIMENTAL TESTBED & VERIFICATION PROTOCOL")
    add_body(
        "All experimental metrics reported in this chapter were directly measured by executing the evaluation harness "
        "(`run_benchmark_eval.py`) against the live `SentinelEdgeCore` Python engine (`Python 3.11+`, NumPy inference using "
        "`tier3_neurons/weights.json`, isolated SQLite WAL database). Two quantitative classification test suites were run: "
        "(1) a clean held-out test set of 1,000 flow feature vectors (200 per class, independent random seed `999`), and "
        "(2) a boundary-perturbation stress suite of 1,000 vectors (seed `2026`) injected with Gaussian feature noise "
        "(`sigma = 0.18`). Additionally, live multi-tier packet bursts were executed end-to-end across normal traffic, genuine heavy "
        "single-port transfers, empty-port reconnaissance scans, and application exploits."
    )

    add_sec("9.2 FUNCTIONAL, SECURITY & EDGE-CASE TEST SUITE")
    add_styled_table(
        "Table 9.1",
        "End-to-End Functional and Security Test Case Execution Results",
        ["Test ID", "Scenario & Input Condition", "Expected Output / Action", "Observed System Output", "Status"],
        [
            ["TC-01", "Standard Campus TLS 1.3 Web / DNS Flows (n=100)", "Tier 1 CLEAN -> MLP BENIGN_NORMAL -> FORWARDED", "100/100 Forwarded clean (0 false blocks)", "PASS"],
            ["TC-02", "Single-Port Heavy MTU Transfer (Port 443, 1460B, n=40)", "Agent Heavy Guard -> BENIGN_HEAVY_TRANSFER -> FORWARDED", "40/40 Forwarded (H=0.0, 0 false drops)", "PASS"],
            ["TC-03", "Stealth Empty-Port Scan across 10 unopened ports (54B SYN)", "Flag SID 1000004 -> MLP PORT_SCAN -> BLOCKED (90s)", "Blocked with 99.69% conf + SHAP + LIME rules", "PASS"],
            ["TC-04", "Subsequent probes from blocked scanner IP (within 90s)", "Early wire drop via blocklist_cache (~10 us)", "Dropped at wire in 9.83 us mean latency", "PASS"],
            ["TC-05", "Exploit Payload (UNION SELECT / JNDI) after TCP handshake", "Tier 1 Exploit SID -> MLP MALICIOUS_PAYLOAD -> BLOCKED (120s)", "Blocked at 96.68% conf (phi_tier1 = +0.8727)", "PASS"],
            ["TC-06", "SOC Manual Unblock API (POST /api/unblock/{ip})", "Remove IP from SQLite WAL + blocklist_cache", "HTTP 200 & immediate cache purge verified", "PASS"],
            ["TC-07", "3D Campus Digital Twin Vite Build & HTTP Serving", "Serve /campus3d/index.html + bundle with 0 errors", "Vite built cleanly (1.07 MB JS), HTTP 200 OK", "PASS"]
        ],
        [15, 45, 42, 43, 15],
        font_sz=7.9
    )

    add_sec("9.3 LIVE SOC DASHBOARD & 3D CAMPUS DIGITAL TWIN RESULTS")
    add_body(
        "Figures 9.1, 9.2, and 9.3 depict the SentinelEdge SOC Command Dashboard layout, the upgraded RCEE 3D Campus Digital "
        "Twin integrating `RCE_3d_Tour` structures with glowing optical fiber conduits, and the encrypted incident telemetry stream."
    )
    add_fig("report_figures/fig_9_1_soc_dashboard.png", "Fig. 9.1", "SentinelEdge Live SOC Command Dashboard Layout & KPI Telemetry", w=154, h_est=80)
    add_fig("report_figures/fig_9_2_campus_digital_twin.png", "Fig. 9.2", "Upgraded RCEE 3D Digital Twin with Cyber Conduits & Clean Node Controls", w=150, h_est=75)
    add_fig("report_figures/fig_9_3_live_incident_stream.png", "Fig. 9.3", "Live Encrypted Incident Ingestion Table Showing Subnets & Actions", w=152, h_est=66)

    add_sec("9.4 NEURAL CLASSIFICATION ACCURACY, CONFUSION MATRIX & ROC-AUC")
    add_body(
        "On the clean held-out 1,000-flow evaluation (`seed = 999`), the `10 -> 32 -> 16 -> 5` NumPy MLP achieved `100.0%` "
        "classification accuracy (`200/200` on every class). Under severe boundary stress testing with additive Gaussian noise "
        "(`sigma = 0.18`, `n = 1,000`), overall accuracy remained `99.1%` (`991/1,000`), with minor boundary overlaps strictly "
        "confined between `BENIGN_NORMAL` and `BENIGN_HEAVY_TRANSFER` (4 and 5 samples respectively), maintaining **100.0% Recall "
        "(0 False Negatives)** across all three attack classes (`PORT_SCAN`, `DOS_SYN_FLOOD`, `MALICIOUS_PAYLOAD`)."
    )
    add_fig("report_figures/fig_9_5_confusion_matrix.png", "Fig. 9.4", "Measured 5-Class Confusion Matrices (Clean 100.0% & Noisy Stress 99.1%)", w=154, h_est=66)
    add_fig("report_figures/fig_9_6_roc_pr_curves.png", "Fig. 9.5", "Computed Multi-Class ROC-AUC and Precision-Recall Curves (sigma = 0.18 Stress Test)", w=154, h_est=64)

    add_styled_table(
        "Table 9.2",
        "Per-Class Precision, Recall, and F1-Score Under Stress Test (n=1,000, sigma=0.18)",
        ["Neural Class", "Support", "Precision (%)", "Recall (%)", "F1-Score (%)", "Clean Test Acc (%)"],
        [
            ["BENIGN_NORMAL", "200", "97.51%", "98.00%", "97.76%", "100.00%"],
            ["BENIGN_HEAVY_TRANSFER", "200", "97.99%", "97.50%", "97.74%", "100.00%"],
            ["PORT_SCAN", "200", "100.00%", "100.00%", "100.00%", "100.00%"],
            ["DOS_SYN_FLOOD", "200", "100.00%", "100.00%", "100.00%", "100.00%"],
            ["MALICIOUS_PAYLOAD", "200", "100.00%", "100.00%", "100.00%", "100.00%"],
            ["Macro Average / Overall", "1000", "99.10%", "99.10%", "99.10%", "100.00%"]
        ],
        [44, 20, 24, 24, 24, 24],
        font_sz=8.4
    )

    add_sec("9.5 OBSERVED GLOBAL FEATURE IMPORTANCE (MEAN |SHAP|)")
    add_body(
        "Averaging `|phi_i|` across 100 balanced held-out flows (20 per class) reveals which features govern SentinelEdge's "
        "decision boundary globally: `tier1_flagged` (`0.2273`), `pkt_rate` (`0.1903`), `port_entropy` (`0.1549`), "
        "`byte_rate` (`0.1391`), and `agent_score` (`0.0538`), followed by TCP SYN flag ratio and empty-port ratio (Fig. 9.6)."
    )
    add_fig("report_figures/fig_9_4_shap_feature_importance.png", "Fig. 9.6", "Measured Global Mean |SHAP| Feature Importance Ranking (n=100 Balanced Flows)", w=148, h_est=68)

    add_sec("9.6 PER-TIER EXECUTION LATENCY & EDGE MEMORY FOOTPRINT")
    add_body(
        "Table 9.3 and Figure 9.7 break down measured latencies. Pure fast-path wire + agent + MLP inference takes less than 0.14 ms "
        "(`17.4 us + 108.8 us + 10.3 us = 136.5 us`). Running 32-permutation Monte Carlo SHAP + LIME adds `5.92 ms`, while synchronous "
        "Windows SQLite WAL disk flushes account for `~13.6-23.4 ms` on logged incidents. Crucially, packets from jailed attackers are "
        "short-circuited in `9.83 us`, and entire Python process RSS memory remained `39.83 MB`."
    )
    add_fig("report_figures/fig_9_7_latency_footprint.png", "Fig. 9.7", "Measured Per-Tier Processing Latency & Process Memory Breakdown", w=154, h_est=64)

    add_styled_table(
        "Table 9.3",
        "Measured Processing Latency Breakdown Across SentinelEdge Tiers",
        ["Pipeline Stage", "Mean Latency", "Notes & Computational Operation"],
        [
            ["Early Wire Drop (Blocked IP Cache)", "9.83 us", "O(1) hash lookup in blocklist_cache bypasses Tiers 1-3"],
            ["Tier 1 Wire Filter (Tier1WireFilter)", "17.42 us", "12 Snort/Suricata rules + rolling 3s scan & 2s SYN trackers"],
            ["Tier 2 AI Agent (SentinelAIAgent)", "108.77 us", "FlowStats update + 13 flow features + Shannon entropy H"],
            ["Tier 3 MLP Neural Forward Only", "10.33 us", "Pure-NumPy (10->32->16->5) ReLU/Softmax matrix pass"],
            ["Tier 3 Full (MLP + 32x SHAP + LIME)", "5.93 ms", "Includes 32 permutation coalition runs + LIME rule synthesis"],
            ["Tier 4 Non-Normal Log / DB Commit", "13.61 ms", "SQLite WAL insert for non-normal / heavy-transfer audit row"],
            ["Tier 4 Threat Block + DB Commit", "23.44 ms", "SQLite WAL insert into both incidents & active_blocklist tables"],
            ["System Process Footprint (psutil RSS)", "39.83 MB RAM", "Measured live in Python via sentinel.get_system_telemetry()"]
        ],
        [52, 26, 82],
        font_sz=8.2
    )

    add_sec("9.7 DYNAMIC IP JAIL & WIRESHARK PCAP VALIDATION")
    add_body(
        "Figure 9.8 illustrates the live dynamic firewall blocklist enforcing 90s/120s cooldown timers alongside the verified binary "
        "`.pcap` byte structure (`0xd4c3b2a1` magic header) downloadable directly from `/api/export_pcap/{incident_id}`."
    )
    add_fig("report_figures/fig_9_8_dynamic_jail_wireshark.png", "Fig. 9.8", "Dynamic Firewall Quarantine Cooldowns & Exported Wireshark .pcap Validation", w=152, h_est=70)

    add_sec("9.8 NEXT-GENERATION UI REDESIGN PROTOTYPES")
    add_body(
        "To prepare for future UI upgrades of the live SOC dashboard (`dashboard/static/`), three next-generation UI design "
        "prototypes were rendered and archived in `ui_design_concepts/`: a Glassmorphism 2.0 Command Center (Fig. 9.9), a 3-column "
        "Deep Forensic & XAI Modal (Fig. 9.10), and a Tactical Twilight 3D Digital Twin HUD. Figure 9.9 and 9.10 showcase the two "
        "primary dashboard & forensic redesign concepts."
    )
    add_fig("ui_design_concepts/concept1_soc_dashboard_nextgen.jpg", "Fig. 9.9", "UI Design Concept: Next-Gen Glassmorphism 2.0 SOC Command Center (Prototype)", w=142, h_est=78)
    add_fig("ui_design_concepts/concept2_forensic_xai_modal.jpg", "Fig. 9.10", "UI Design Concept: 3-Column Deep Forensic & Explainable AI Modal (Prototype)", w=142, h_est=78)

    # =========================================================================
    # CHAPTER 10: CONCLUSION, CONSTRAINTS & FUTURE SCOPE
    # =========================================================================
    add_chap(10, "CONCLUSION & FUTURE SCOPE")

    add_sec("10.1 CONCLUSION")
    add_body(
        "This project successfully designed, implemented, and experimentally validated SentinelEdge: a lightweight, Explainable AI "
        "edge IDPS engineered for enterprise campus perimeter defense under modern transport encryption. Across four decoupled tiers, "
        "SentinelEdge demonstrates that fast deterministic Snort/Suricata rules, Shannon port entropy flow profiling, compact "
        "pure-NumPy neural inference, and inline SHAP/LIME explanations can coexist cleanly inside a ~39.8 MB edge footprint."
    )
    add_body(
        "Empirical evaluation confirms zero false drops on legitimate high-throughput single-port TLS 1.3 data transfers, `100.0%` "
        "clean test accuracy (`99.1%` under `sigma = 0.18` Gaussian feature noise with 100% attack recall), `9.83 us` early wire drops "
        "for actively jailed attackers, complete Wireshark `.pcap` forensic traceability, and full spatial visibility over an "
        "interactive 3D Digital Twin of Ramachandra College of Engineering."
    )

    add_sec("10.2 OBSERVED IMPLEMENTATION & DEPLOYMENT CONSIDERATIONS")
    add_body(
        "Engineering audits during testing and cloud deployment preparation identified four concrete technical nuances documented "
        "clearly for future production hardening:"
    )
    add_bullet("Single-Packet Cold-Flow Duration Scaling", "On the very first packet of an unseen `(src_ip, dst_ip)` flow, `duration_s = max(0.001, 0.0)` can inflate `pkt_rate_pps` up to 1,000 PPS; evaluating burst thresholds across multi-packet windows (N >= 2 packets) avoids temporary flood/payload score overlap.")
    add_bullet("Confidence Guardrail Scale Consistency", "Inside `NeuronsDeepClassifier.evaluate()`, benign guardrail assignments (`98.5` / `99.1`) should store normalized `[0.985, 0.991]` before the final `* 100.0` percentage formatting step.")
    add_bullet("Serverless Cloud Deployment Constraints (Vercel)", "Deploying the FastAPI/SQLite app onto read-only serverless runtimes requires routing `sentinel_incidents.db` to `/tmp/`, removing heavy unused training dependencies from serverless bundles, and aligning the client-side WebSocket fallback fields in `app.js`.")

    add_sec("10.3 FUTURE SCOPE")
    add_bullet("Native Live NIC Capture & Linux eBPF/XDP", "Replacing synthetic telemetry streams with `libpcap` / Linux `AF_PACKET` and eBPF/XDP kernel hooks to enforce `9.8 us` drops directly inside NIC driver queues.")
    add_bullet("HTTP/3 & QUIC Connection Migration Profiling", "Extending `FlowStats` to track UDP QUIC (RFC 9000) connection IDs and packet spacing patterns.")
    add_bullet("Applying the Next-Gen Glassmorphism UI Concepts", "Translating the validated UI prototypes in `ui_design_concepts/` into production CSS/JS components for the SOC dashboard.")
    add_bullet("Federated Multi-Campus Model Updates", "Aggregating weight updates (`weights.json`) across federated university campuses without sharing raw flow metadata.")

    # =========================================================================
    # CHAPTER 11: REFERENCES
    # =========================================================================
    add_chap(11, "REFERENCES")
    refs = [
        "[1]  E. Rescorla, 'The Transport Layer Security (TLS) Protocol Version 1.3,' RFC 8446, IETF, Aug. 2018.",
        "[2]  P. Hoffman and P. McManus, 'DNS Queries over HTTPS (DoH),' RFC 8484, IETF, Oct. 2018.",
        "[3]  B. Anderson and D. McGrew, 'Machine Learning for Encrypted Malware Traffic Classification: Accounting for Noisy Labels and Concept Drift,' in Proc. 23rd ACM SIGKDD Int. Conf. Knowl. Discov. Data Min., 2017, pp. 1723-1732.",
        "[4]  S. M. Lundberg and S.-I. Lee, 'A Unified Approach to Interpreting Model Predictions,' in Advances in Neural Information Processing Systems (NeurIPS), vol. 30, 2017, pp. 4765-4774.",
        "[5]  M. T. Ribeiro, S. Singh, and C. Guestrin, '\"Why Should I Trust You?\": Explaining the Predictions of Any Classifier,' in Proc. 22nd ACM SIGKDD Int. Conf. Knowl. Discov. Data Min., 2016, pp. 1135-1144.",
        "[6]  M. Roesch, 'Snort - Lightweight Intrusion Detection for Networks,' in Proc. 13th USENIX Conf. System Administration (LISA), 1999, pp. 229-238.",
        "[7]  V. Paxson, 'Bro: A System for Detecting Network Intruders in Real-Time,' Comput. Networks, vol. 31, no. 23-24, pp. 2435-2463, Dec. 1999.",
        "[8]  I. Sharafaldin, A. H. Lashkari, and A. A. Ghorbani, 'Toward Generating a New Dataset for Evaluation of Network Intrusion Detection Systems,' in Proc. ICISSP, 2018, pp. 108-116.",
        "[9]  R. Vinayakumar, M. Alazab, K. P. Soman, P. Poornachandran, A. Al-Nemrat, and S. Venkatraman, 'Deep Learning Approach for Intelligent Intrusion Detection System,' IEEE Access, vol. 7, pp. 41525-41550, 2019.",
        "[10] C. E. Shannon, 'A Mathematical Theory of Communication,' Bell Syst. Tech. J., vol. 27, no. 3, pp. 379-423, Jul. 1948.",
        "[11] L. S. Shapley, 'A Value for n-Person Games,' in Contributions to the Theory of Games II, H. W. Kuhn and A. W. Tucker, Eds. Princeton, NJ: Princeton Univ. Press, 1953, pp. 307-317.",
        "[12] S. M. Lundberg et al., 'From Local Explanations to Global Understanding with Explainable AI for Trees,' Nature Mach. Intell., vol. 2, no. 1, pp. 56-67, Jan. 2020.",
        "[13] E. Papadogiannaki and S. Ioannidis, 'A Survey on Encrypted Network Traffic Analysis Applications, Techniques, and Countermeasures,' ACM Comput. Surv., vol. 54, no. 6, pp. 1-35, Jul. 2021.",
        "[14] M. Shen et al., 'Machine Learning-Powered Encrypted Network Traffic Analysis: A Comprehensive Survey,' IEEE Commun. Surv. Tutorials, vol. 25, no. 1, pp. 791-824, 1st Quart., 2023.",
        "[15] Z. Mahbooba, M. Serrano, et al., 'Explainable Artificial Intelligence (XAI) in Cybersecurity: A Review,' IEEE Access, vol. 9, pp. 165421-165432, 2021.",
        "[16] M. Wang, K. Zheng, Y. Yang, and X. Wang, 'An Explainable Machine Learning Framework for Network Intrusion Detection,' IEEE Trans. Netw. Serv. Manage., vol. 19, no. 3, pp. 2975-2989, Sep. 2022.",
        "[17] G. C. Deka and P. K. Baruah, 'Deep Learning for Encrypted Traffic Classification: A Review,' IEEE Trans. Cybern., vol. 52, no. 8, pp. 7890-7904, Aug. 2022.",
        "[18] J. Iyengar and M. Thomson, 'QUIC: A UDP-Based Multiplexed and Secure Transport,' RFC 9000, IETF, May 2021.",
        "[19] F. Pedregosa et al., 'Scikit-learn: Machine Learning in Python,' J. Mach. Learn. Res., vol. 12, pp. 2825-2830, 2011.",
        "[20] C. R. Harris et al., 'Array Programming with NumPy,' Nature, vol. 585, pp. 357-362, Sep. 2020.",
        "[21] R. Sommer and V. Paxson, 'Outside the Closed World: On Using Machine Learning for Network Intrusion Detection,' in Proc. IEEE Symp. Secur. Privacy (SP), 2010, pp. 305-316.",
        "[22] Y. Mirsky, T. Doitshman, Y. Elovici, and A. Shabtai, 'Kitsune: An Ensemble of Autoencoders for Online Network Intrusion Detection,' in Proc. NDSS, 2018.",
        "[23] M. Ring, S. Wunderlich, D. Scheuring, D. Landes, and A. Hotho, 'A Survey of Network-Based Intrusion Detection Data Sets,' Comput. & Secur., vol. 86, pp. 147-167, Sep. 2019.",
        "[24] S. Al-Saleh and A. Crichigno, 'Explainable Artificial Intelligence for Detecting Malicious DoH Tunnels in Enterprise Networks,' IEEE Trans. Dependable Secure Comput., 2023.",
        "[25] National Institute of Standards and Technology (NIST), 'Guide to Intrusion Detection and Prevention Systems (IDPS),' NIST Special Publication 800-94, Feb. 2007.",
        "[26] Ramirez, S., 'FastAPI: Modern, Fast High-Performance Web Framework for Building APIs with Python,' Documentation & ASGI Specification, 2024.",
        "[27] D. R. Hipp, 'SQLite Write-Ahead Logging (WAL) Mode Architecture,' SQLite Consortium Technical Documentation, 2023.",
        "[28] L. Harris et al., 'Libpcap / PCAP File Format Specification,' Wireshark Foundation Technical Reference, 2022.",
        "[29] R. Cabello (mrdoob) et al., 'Three.js - JavaScript 3D WebGL Rendering Library,' v0.160 Specification, 2024.",
        "[30] Poimandres Collective, 'React Three Fiber: React Renderer for Three.js,' v8.15 Technical Documentation, 2024."
    ]
    pdf.set_font("Times", "", 10)
    pdf.set_text_color(20, 25, 35)
    for r in refs:
        pdf.multi_cell(0, 5.2, clean_text(r), align="J")
        pdf.ln(1.8)

    return pdf, detected_prelim_count, recorded_prelim, recorded_toc, recorded_lof, recorded_lot


def main():
    print("Pass 1: Capturing exact chapter/figure/table/preliminary page indices...")
    _, pc1, p1, toc1, lof1, lot1 = build_report(record_pass=True)
    print(f"Captured {len(toc1)} TOC entries, {len(lof1)} Figures, {len(lot1)} Tables across {pc1} preliminary pages.")

    print("Pass 2: Populating dynamic TOC/LOF/LOT and locking preliminary Roman pages...")
    _, pc2, p2, toc2, lof2, lot2 = build_report(prelim_page_count=pc1, prelim_ref=p1, toc_ref=toc1, lof_ref=lof1, lot_ref=lot1, record_pass=True)

    print("Pass 3: Finalizing report PDF with invariant verified pagination...")
    pdf, pc3, p3, toc3, lof3, lot3 = build_report(prelim_page_count=pc2, prelim_ref=p2, toc_ref=toc2, lof_ref=lof2, lot_ref=lot2, record_pass=True)
    assert pc2 == pc3 and p2 == p3 and toc2 == toc3 and lof2 == lof3 and lot2 == lot3, "Page indices shifted between pass 2 and 3!"

    out_pdf = "SentinelEdge_Final_Year_Project_Report_RCEE.pdf"
    pdf.output(out_pdf)
    total_pages = pdf.page_no()
    body_pages = total_pages - pc3
    print(f"SUCCESS: {out_pdf} generated! Total pages: {total_pages} ({pc3} preliminary Roman pages + {body_pages} Arabic chapter pages)")


if __name__ == "__main__":
    main()
