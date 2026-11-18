"""
Script to generate the complete, publication-grade Final Year Project Report PDF:
"Network Intrusion Detection in Encrypted Traffic via Explainable AI for Network Anomaly Detection (SHAP/LIME-based), Applied to Enterprise Campus Network Perimeter Defense"

Matches the exact visual style, layout, font hierarchy, margins, and design of the user's document.
"""

import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

def clean_text(text: str) -> str:
    """Replaces Unicode characters not supported by standard PDF core fonts."""
    replacements = {
        "\u2014": " - ",  # em-dash
        "\u2013": "-",    # en-dash
        "\u2018": "'",    # left single quote
        "\u2019": "'",    # right single quote
        "\u201c": '"',    # left double quote
        "\u201d": '"',    # right double quote
        "\u2022": chr(149), # bullet
        "\u03c6": "phi",  # greek phi
        "\u0394": "Delta",# greek delta
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text

class FinalYearReportPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=15)
        self.set_margins(16, 14, 16)

    def footer(self):
        # Page number centered at the bottom
        self.set_y(-12)
        self.set_font("helvetica", "", 9)
        self.set_text_color(30, 41, 59)
        self.cell(0, 8, str(self.page_no()), align="C")

    def section_heading(self, title: str):
        self.ln(2.5)
        self.set_font("helvetica", "B", 10.0)
        self.set_text_color(15, 23, 42)
        self.cell(0, 5.5, clean_text(title), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(0.8)

    def sub_heading(self, title: str):
        self.ln(1.2)
        self.set_font("helvetica", "B", 9.0)
        self.set_text_color(30, 41, 59)
        self.cell(0, 4.8, clean_text(title), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(0.4)

    def body_paragraph(self, text: str):
        self.set_font("helvetica", "", 8.8)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 4.3, clean_text(text))
        self.ln(1.2)

    def bullet_item(self, bold_prefix: str, text: str):
        self.set_font("helvetica", "", 8.8)
        self.set_text_color(30, 41, 59)
        # Bullet dot
        self.cell(4, 4.3, chr(149), border=0)
        
        # Text with bold prefix if provided
        if bold_prefix:
            self.set_font("helvetica", "B", 8.8)
            self.write(4.3, clean_text(bold_prefix) + " ")
            self.set_font("helvetica", "", 8.8)
            self.write(4.3, clean_text(text))
            self.ln(4.3)
        else:
            self.multi_cell(self.w - self.l_margin - self.r_margin - 4, 4.3, clean_text(text))
        self.ln(0.8)

def build_pdf(output_path: str):
    pdf = FinalYearReportPDF()
    pdf.add_page()

    # Document Header Title
    pdf.set_font("helvetica", "B", 12.0)
    pdf.set_text_color(15, 23, 42)
    title_text = (
        "NETWORK INTRUSION DETECTION IN ENCRYPTED TRAFFIC VIA EXPLAINABLE AI "
        "FOR NETWORK ANOMALY DETECTION (SHAP/LIME-BASED), APPLIED TO ENTERPRISE "
        "CAMPUS NETWORK PERIMETER DEFENSE"
    )
    pdf.multi_cell(0, 5.8, clean_text(title_text), align="C")
    
    pdf.set_font("helvetica", "I", 9.5)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 5.0, clean_text("Implementation Architecture: SentinelEdge Autonomous Edge IDPS with Real-Time Incident Forensics"), align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    # 1. ABSTRACT
    pdf.section_heading("1. ABSTRACT")
    abstract_text = (
        "The pervasive adoption of end-to-end encryption protocols (TLS 1.3, HTTPS, and DNS-over-HTTPS) has rendered "
        "conventional Deep Packet Inspection (DPI) obsolete at enterprise and university campus network perimeters, as security "
        "appliances cannot inspect encrypted payloads without violating user privacy or incurring costly hardware decryption overhead. "
        "Simultaneously, modern deep learning-based Network Intrusion Detection Systems (NIDS) suffer from the \"black-box\" dilemma, "
        "preventing Security Operations Center (SOC) analysts from verifying why an autonomous mitigation was executed. "
        "To resolve these dual challenges, this project presents SentinelEdge, an autonomous, lightweight edge IDPS engineered for "
        "enterprise campus perimeter defense. The framework operates on an administrative gateway or mirrored switch SPAN port using a "
        "hierarchical four-tier inspection pipeline. Rather than attempting plaintext payload decryption, the system performs "
        "Encrypted Traffic Analysis (ETA) by extracting statistical, privacy-preserving flow-level metadata, including inter-arrival "
        "time distributions, packet length variance, flow duration, directional byte velocities, and Shannon port entropy.\n\n"
        "Ambiguous and high-risk encrypted flows are evaluated by a tuned deep neural network (The Neurons) to detect stealth reconnaissance, "
        "DoS floods, and encrypted data exfiltration tunnels. To ensure complete auditability, the system incorporates an Explainable AI (XAI) "
        "engine integrating SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations). SHAP computes exact "
        "game-theoretic feature attribution values across all flow metrics, while LIME constructs local linear surrogate models to generate "
        "human-auditable decision rules for SOC operators. An autonomous tri-state response engine executes micro-targeted firewall jails for "
        "confirmed threats while preserving legitimate, high-bandwidth single-port transfers. Evaluated within a 3D digital twin perimeter model "
        "of Ramachandra College of Engineering (RCEE), the system achieves sub-0.4 ms inspection latency, under 35 MB edge memory utilization, "
        "and digital forensic reproducibility through automated Wireshark-compatible PCAP evidence generation."
    )
    pdf.body_paragraph(abstract_text)

    # 2. KEYWORDS
    pdf.section_heading("2. KEYWORDS")
    pdf.body_paragraph(
        "Network Intrusion Detection (NIDS); Encrypted Traffic Analysis (ETA); Explainable AI (XAI); "
        "SHAP (Shapley Additive Explanations); LIME (Local Interpretable Model-agnostic Explanations); "
        "Campus Perimeter Defense; Deep Neural Network; Port Entropy; Anomaly Detection; Edge Security; Real-Time Forensics."
    )

    # 3. INTRODUCTION
    pdf.section_heading("3. INTRODUCTION")
    intro_text = (
        "Modern enterprise and university campus networks interconnect diverse digital assets—including student computing laboratories, "
        "research servers, administrative databases, and Internet-of-Things (IoT) infrastructure—through shared edge gateways. Traditional "
        "perimeter defenses face two existential challenges: first, over 85% of contemporary network traffic is encrypted via TLS 1.3 and "
        "HTTPS, concealing malicious reconnaissance and exfiltration inside legitimate communication channels. Second, proprietary enterprise "
        "security hardware (e.g., Palo Alto, Cisco Firepower) is prohibitively expensive and resource-heavy, while emerging deep-learning "
        "detectors operate as opaque black boxes that SOC teams cannot audit. SentinelEdge introduces a lightweight, hierarchically triaged "
        "edge IDPS that combines statistical Encrypted Traffic Analysis (ETA), cooperative game-theoretic feature attribution (SHAP/LIME), "
        "and an autonomous micro-firewall jail to deliver verifiable perimeter security directly at edge routing interfaces."
    )
    pdf.body_paragraph(intro_text)

    # 4. PROBLEM STATEMENT
    pdf.section_heading("4. PROBLEM STATEMENT")
    prob_text = (
        "How can a resource-constrained campus or enterprise edge gateway detect network reconnaissance, DoS floods, and malicious activity "
        "concealed within encrypted traffic, distinguish legitimate high-throughput transfers from stealth attacks without decrypting payloads, "
        "and provide mathematically explainable, auditable automated mitigation without depending on expensive proprietary appliances?"
    )
    pdf.body_paragraph(prob_text)

    # 5. AIM
    pdf.section_heading("5. AIM")
    aim_text = (
        "To design, implement, and evaluate a lightweight, autonomous edge IDPS that couples Encrypted Traffic Analysis (ETA) and fast signature "
        "filtering with Explainable AI (SHAP/LIME-based neural anomaly detection), autonomous dynamic jail mitigation, and digital forensic logging "
        "tailored for enterprise campus perimeter defense."
    )
    pdf.body_paragraph(aim_text)

    # 6. OBJECTIVES
    pdf.section_heading("6. OBJECTIVES")
    pdf.bullet_item("", "Capture and inspect authorized perimeter and inter-subnet network traffic at an administrative gateway SPAN mirror.")
    pdf.bullet_item("", "Apply wire-speed signature and TCP-flag filtering to eliminate known commodity threats with sub-microsecond overhead.")
    pdf.bullet_item("", "Perform zero-decryption Encrypted Traffic Analysis (ETA) by evaluating flow metadata, packet length variance, and Shannon port entropy.")
    pdf.bullet_item("", "Classify complex multi-port reconnaissance and DoS anomalies using a compact deep neural network trained on benchmark distributions.")
    pdf.bullet_item("", "Implement an Explainable AI (XAI) framework integrating SHAP feature attribution and LIME local linear surrogate rules.")
    pdf.bullet_item("", "Execute autonomous tri-state mitigation (allow, quarantine, dynamic firewall jail) with automatic IP unblocking.")
    pdf.bullet_item("", "Persist incident metadata in SQLite WAL mode and generate standard Wireshark-compatible PCAP evidence files.")
    pdf.bullet_item("", "Provide a real-time SOC monitoring dashboard featuring system telemetry and an interactive 3D digital twin of the campus perimeter.")

    # 7. SCOPE OF THE PROJECT
    pdf.section_heading("7. SCOPE OF THE PROJECT")
    pdf.bullet_item("Deployment Environment:", "Authorized university campus gateways, research centers, departmental switches, and mid-sized enterprise perimeters (modeled on Ramachandra College of Engineering).")
    pdf.bullet_item("Threat Vectors in Scope:", "Encrypted reconnaissance, multi-port sweeps, SYN flood DoS, brute-force access attempts, and anomalous encrypted exfiltration channels.")
    pdf.bullet_item("Explainability Scope:", "Real-time mathematical SHAP waterfall plots and LIME decision rules for every neural anomaly decision.")
    pdf.bullet_item("Forensic Assurance:", "Automated generation of native binary PCAP files containing reconstructed raw frames for Wireshark inspection.")
    pdf.bullet_item("Regulatory & Compliance:", "Zero-decryption flow metadata analysis ensures strict adherence to student and employee data privacy standards (GDPR / Indian DPDP Act).")

    # 8. OVERALL ARCHITECTURE
    pdf.section_heading("8. OVERALL ARCHITECTURE")
    pdf.body_paragraph(
        "The architecture implements a 4-tier triage workflow. Routine clean packets exit immediately via the fast path, "
        "while ambiguous or encrypted flows progress through contextual flow profiling, neural classification, and XAI feature explanation."
    )
    
    arch_data = [
        ["Layer", "Function & Technical Scope"],
        ["Traffic Observation", "Gateway / SPAN port tap capturing Layer 3/4 headers and encrypted flow dynamics."],
        ["Tier 1 - Fast Wire Filter", "Snort/Suricata-compatible rule parser; immediate line-rate TCP-flag anomaly filtering."],
        ["Tier 2 - Sentinel Flow Agent", "Stateful flow aggregator computing Shannon port entropy, packet length variance, and PDR."],
        ["Tier 3 - The Neurons & XAI", "10-input MLP neural classifier coupled with SHAP/LIME explainability engine."],
        ["Tier 4 - Autonomous Jail", "Tri-state decision engine executing temporary micro-firewall iptables jails (60-120s)."],
        ["Forensics & SOC Services", "SQLite WAL storage, native PCAP synthesis, WebSocket telemetry, and 3D digital twin."]
    ]
    with pdf.table(col_widths=(45, 129), borders_layout="ALL") as table:
        for i, row in enumerate(arch_data):
            row_cells = table.row()
            for j, cell in enumerate(row):
                pdf.set_font("helvetica", "B" if i == 0 else "", 8.5)
                row_cells.cell(clean_text(cell))

    # 9. MODULE DESCRIPTION
    pdf.section_heading("9. MODULE DESCRIPTION")
    mod_data = [
        ["Module Name", "Core Functionality"],
        ["Fast Wire Filter", "Evaluates signature rules and flags malformed TCP control flags at wire speed."],
        ["Encrypted Flow Context Agent", "Computes statistical metrics (Port Diversity Ratio, Shannon Entropy, Packet Length Delta)."],
        ["Neural Anomaly Classifier", "Evaluates normalized 10-dimensional flow feature vectors across 5 distinct traffic classes."],
        ["Explainable AI (SHAP/LIME)", "Calculates exact Shapley feature attributions and generates human-readable decision rules."],
        ["Autonomous Jail Engine", "Applies micro-targeted IP restrictions with configurable automated decay and auto-release."],
        ["Digital Forensic Engine", "Synthesizes standard binary PCAP captures and logs tamper-evident SQLite WAL events."],
        ["Interactive SOC & 3D Twin", "Visualizes real-time perimeter nodes, animated flow conduits, and interactive XAI charts."]
    ]
    with pdf.table(col_widths=(45, 129), borders_layout="ALL") as table:
        for i, row in enumerate(mod_data):
            row_cells = table.row()
            for j, cell in enumerate(row):
                pdf.set_font("helvetica", "B" if i == 0 else "", 8.5)
                row_cells.cell(clean_text(cell))

    # 10. TECHNOLOGY STACK
    pdf.section_heading("10. TECHNOLOGY STACK")
    tech_data = [
        ["Layer", "Selected Technologies & Libraries"],
        ["Core Runtime", "Python 3.11+, asyncio, uvicorn, psutil"],
        ["Encrypted Flow Analysis", "NumPy, SciPy (Shannon Entropy, inter-arrival variance, statistical distributions)"],
        ["Neural Network & XAI", "Scikit-Learn (MLP Neural Classifier), Custom SHAP Kernel Engine, LIME Local Explainer"],
        ["Forensic Storage & PCAP", "SQLite (WAL journal mode), Native Binary PCAP Synthesizer (Libpcap compatible)"],
        ["Backend Web Server", "FastAPI (High-performance asynchronous REST & WebSocket framework)"],
        ["Frontend SOC Interface", "HTML5 Canvas, CSS Grid, Modern Vanilla JavaScript (ES6+ modular)"],
        ["3D Campus Visualization", "Three.js, React Three Fiber, React Three Drei, WebGL (Hardware Accelerated)"],
        ["Network Evaluation Benchmarks", "CIC-IDS2017, NF-UQ-NIDS, Snort Community Ruleset, Suricata Emerging Threats"]
    ]
    with pdf.table(col_widths=(45, 129), borders_layout="ALL") as table:
        for i, row in enumerate(tech_data):
            row_cells = table.row()
            for j, cell in enumerate(row):
                pdf.set_font("helvetica", "B" if i == 0 else "", 8.5)
                row_cells.cell(clean_text(cell))

    # 11. RESEARCH METHODOLOGY
    pdf.section_heading("11. RESEARCH METHODOLOGY")
    
    pdf.sub_heading("11.1 Encrypted Flow Ingestion & Traffic Collection")
    pdf.body_paragraph(
        "Ingests live raw frames via gateway SPAN mirrors or raw packet taps. Packets are parsed into Layer 3/4 headers "
        "and flow records without accessing encrypted payload bytes, preserving end-to-end communication confidentiality."
    )

    pdf.sub_heading("11.2 Zero-Decryption Contextual Feature Engineering")
    pdf.body_paragraph(
        "A sliding-window flow profiler extracts a 10-dimensional behavioral feature vector: packet rate (PPS), byte velocity (KBPS), "
        "port diversity ratio (unique ports / total packets), empty port probe ratio, Shannon port entropy, mean packet length, "
        "SYN packet ratio, agent anomaly score, wire-filter flag, and active flow duration."
    )

    pdf.sub_heading("11.3 Neural Classification & Explainable AI (SHAP/LIME) Engine")
    pdf.body_paragraph(
        "A 10 -> 32 -> 16 -> 5 multilayer perceptron classifies flows into Benign Normal, Benign Heavy Transfer, Port Scan, DoS Flood, "
        "or Malicious Exploit. The prediction immediately triggers the XAI engine: SHAP calculates exact Shapley values (phi_i) "
        "depicting individual feature impact, while LIME generates rule-based local surrogate boundaries for analyst validation."
    )

    pdf.sub_heading("11.4 Autonomous Perimeter Mitigation & Digital Forensics")
    pdf.body_paragraph(
        "Confirmed anomalies execute a non-disruptive, 90-second temporary dynamic firewall jail. The system generates Libpcap-compliant "
        "binary PCAP files and writes structured JSON event telemetry to SQLite in Write-Ahead Logging (WAL) mode."
    )

    pdf.sub_heading("11.5 Real-Time SOC & 3D Digital Twin Integration")
    pdf.body_paragraph(
        "Telemetry and incident streams broadcast over WebSockets to an interactive SOC dashboard featuring a 3D digital twin "
        "of Ramachandra College of Engineering, allowing operators to monitor building-level subnet traffic in real time."
    )

    # 12. EXPERIMENTAL PLAN
    pdf.section_heading("12. EXPERIMENTAL PLAN")
    exp_data = [
        ["Experiment", "Experimental Purpose", "Primary Evaluation Metrics"],
        ["A. Wire Filter Latency", "Benchmark fast-path rule parsing overhead", "Microseconds/packet, peak wire throughput"],
        ["B. Encrypted Flow Profiling", "Evaluate separation of heavy data from port sweeps", "False-positive rate, Shannon entropy curve"],
        ["C. Neural Classification", "Validate classification accuracy on test sets", "Accuracy, Precision, Recall, F1-Score"],
        ["D. SHAP/LIME Fidelity", "Quantify XAI explanation accuracy and consistency", "Explanation latency, Shapley convergence"],
        ["E. Dynamic Jail Mitigation", "Validate firewall actuation and auto-release", "Block actuation latency, auto-expiry correctness"],
        ["F. Edge Footprint", "Measure resource constraints on edge hardware", "RAM consumption (MB), CPU utilization (%)"]
    ]
    with pdf.table(col_widths=(40, 75, 59), borders_layout="ALL") as table:
        for i, row in enumerate(exp_data):
            row_cells = table.row()
            for j, cell in enumerate(row):
                pdf.set_font("helvetica", "B" if i == 0 else "", 8.5)
                row_cells.cell(clean_text(cell))

    # 13. EVALUATION METRICS
    pdf.section_heading("13. EVALUATION METRICS")
    pdf.bullet_item("Detection Accuracy:", "Classification accuracy, precision, recall, F1-score, and ROC-AUC curves across attack categories.")
    pdf.bullet_item("XAI Explanation Quality:", "SHAP attribution consistency, feature importance stability, and LIME rule fidelity.")
    pdf.bullet_item("System Latency:", "Per-packet wire inspection latency (< 0.4 ms target) and inference overhead.")
    pdf.bullet_item("Edge Efficiency:", "Resident memory footprint (< 35 MB RAM target) and processor utilization (< 3% CPU load).")
    pdf.bullet_item("Forensic Integrity:", "Wireshark compatibility and completeness of synthesized binary PCAP evidence.")

    # 14. EXPECTED OUTCOME
    pdf.section_heading("14. EXPECTED OUTCOME")
    pdf.body_paragraph(
        "A fully functional, defense-ready edge IDPS prototype that successfully detects network intrusions inside encrypted traffic "
        "without payload decryption, provides transparent, mathematically rigorous SHAP and LIME explanations for every alert, distinguishes "
        "legitimate high-throughput campus data from malicious sweeps, and visualizes perimeter health through an interactive 3D digital twin."
    )

    # 15. LIMITATIONS AND RISKS
    pdf.section_heading("15. LIMITATIONS AND RISKS")
    pdf.bullet_item("Zero-Day Obfuscation:", "Highly novel, slow-rate low-volume stealth attacks require calibrated sliding-window thresholds.")
    pdf.bullet_item("Hardware Adaptation:", "Optimal wire latency requires deployment on dedicated gateway interfaces supporting SPAN or eBPF taps.")
    pdf.bullet_item("XAI Computation Overhead:", "Shapley value approximations must maintain microsecond bounds to avoid queuing latency.")

    # 16. CONCLUSION
    pdf.section_heading("16. CONCLUSION")
    pdf.body_paragraph(
        "SentinelEdge demonstrates a breakthrough paradigm for enterprise campus perimeter security by bridging the gap between "
        "encrypted traffic privacy, neural anomaly detection, and explainable artificial intelligence. By combining zero-decryption "
        "flow metadata profiling, cooperative game-theoretic SHAP/LIME interpretations, and autonomous edge firewall actuation, "
        "the system delivers an auditable, lightweight, and mathematically grounded defense framework tailored for university and "
        "enterprise campus networks."
    )

    # 17. REFERENCES / SOURCE BASIS
    pdf.section_heading("17. REFERENCES / SOURCE BASIS")
    pdf.bullet_item("[1]", "S. M. Lundberg and S.-I. Lee, 'A Unified Approach to Interpreting Model Predictions,' in Advances in Neural Information Processing Systems (NeurIPS), vol. 30, 2017. (Foundational SHAP Formulation).")
    pdf.bullet_item("[2]", "M. T. Ribeiro, S. Singh, and C. Guestrin, '\"Why Should I Trust You?\": Explaining the Predictions of Any Classifier,' in Proc. ACM SIGKDD, 2016, pp. 1135-1144. (LIME Framework).")
    pdf.bullet_item("[3]", "I. Sharafaldin, A. H. Lashkari, and A. A. Ghorbani, 'Toward Generating a New Intrusion Detection Dataset and Intrusion Traffic Characterization,' in Proc. ICISSP, 2018. (CIC-IDS2017 Dataset).")
    pdf.bullet_item("[4]", "E. Rescorla, 'The Transport Layer Security (TLS) Protocol Version 1.3,' RFC 8446, Internet Engineering Task Force (IETF), Aug. 2018.")
    pdf.bullet_item("[5]", "P. Hoffman and P. McManus, 'DNS Queries over HTTPS (DoH),' RFC 8484, Internet Engineering Task Force (IETF), Oct. 2018.")

    total_p = pdf.page_no()
    pdf.output(output_path)
    print(f"[+] Successfully generated Final Year Project Report PDF ({total_p} pages) at: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\sivas\Desktop\innosprit hacktoon vvitu"
    out_file = os.path.join(out_dir, "Network_Intrusion_Detection_Encrypted_Traffic_XAI_SentinelEdge.pdf")
    build_pdf(out_file)
