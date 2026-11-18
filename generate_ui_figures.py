import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['figure.dpi'] = 300

# -------------------------------------------------------------
# Fig 9.1: SOC Dashboard Interface
# -------------------------------------------------------------
def gen_fig_9_1():
    fig, ax = plt.subplots(figsize=(11, 6.2))
    ax.axis('off')
    
    # Outer dark theme background
    bg = plt.Rectangle((0, 0), 11, 6.2, facecolor='#0B0F19')
    ax.add_patch(bg)
    
    # Top navbar
    nav = plt.Rectangle((0, 5.4), 11, 0.8, facecolor='#111827', edgecolor='#1F2937')
    ax.add_patch(nav)
    ax.text(0.4, 5.8, "🛡️ SENTINELEDGE : ENTERPRISE SOC COMMAND", color='#38BDF8', fontweight='bold', fontsize=12, va='center')
    
    # Badges on top navbar
    # Capsule 1
    c1 = plt.Rectangle((6.2, 5.55), 2.2, 0.5, facecolor='#1E293B', edgecolor='#10B981', linewidth=1.5)
    ax.add_patch(c1)
    ax.text(7.3, 5.8, "🧠 XAI: SHAP / LIME Active", color='#34D399', fontweight='bold', fontsize=8, ha='center', va='center')
    
    # Capsule 2
    c2 = plt.Rectangle((8.6, 5.55), 2.1, 0.5, facecolor='#1E293B', edgecolor='#38BDF8', linewidth=1.5)
    ax.add_patch(c2)
    ax.text(9.65, 5.8, "🔒 INSPECT: TLS 1.3 ETA", color='#38BDF8', fontweight='bold', fontsize=8, ha='center', va='center')
    
    # Metric cards row
    cards = [
        ("INSPECTED FLOWS", "142,890", "#38BDF8"),
        ("ANOMALY INTRUSIONS", "128", "#F43F5E"),
        ("TLS 1.3 / DoH RATIO", "89.4%", "#A855F7"),
        ("AVG INFERENCE TIME", "0.42 ms", "#10B981")
    ]
    for i, (title, val, col) in enumerate(cards):
        x = 0.4 + i * 2.6
        cd = plt.Rectangle((x, 4.4), 2.4, 0.8, facecolor='#1F2937', edgecolor='#374151', linewidth=1)
        ax.add_patch(cd)
        ax.text(x + 0.15, 4.95, title, color='#9CA3AF', fontsize=7.5, fontweight='bold')
        ax.text(x + 0.15, 4.62, val, color=col, fontsize=12.5, fontweight='bold')
        
    # Main split: Left 3D View (5.6 wide), Right Incident Feed (4.4 wide)
    left_panel = plt.Rectangle((0.4, 0.4), 5.8, 3.8, facecolor='#111827', edgecolor='#374151')
    ax.add_patch(left_panel)
    ax.text(0.6, 3.9, "🌐 3D CAMPUS PERIMETER DIGITAL TWIN (WebGL)", color='#E5E7EB', fontweight='bold', fontsize=9.5)
    
    # Draw simple campus 3D buildings wireframe
    b1 = plt.Rectangle((1.0, 1.2), 1.4, 2.0, facecolor='#1E3A8A', alpha=0.5, edgecolor='#3B82F6', linewidth=1.5)
    ax.add_patch(b1)
    ax.text(1.7, 2.2, "Academic\nBlock A", color='white', ha='center', fontsize=7.5, fontweight='bold')
    
    b2 = plt.Rectangle((2.7, 1.6), 1.5, 1.6, facecolor='#1E3A8A', alpha=0.5, edgecolor='#3B82F6', linewidth=1.5)
    ax.add_patch(b2)
    ax.text(3.45, 2.4, "Central\nLibrary", color='white', ha='center', fontsize=7.5, fontweight='bold')
    
    b3 = plt.Rectangle((4.5, 1.0), 1.3, 1.8, facecolor='#1E3A8A', alpha=0.5, edgecolor='#3B82F6', linewidth=1.5)
    ax.add_patch(b3)
    ax.text(5.15, 1.9, "Admin &\nData Center", color='white', ha='center', fontsize=7.5, fontweight='bold')
    
    # Attack pulse line in red
    ax.annotate('', xy=(5.15, 1.9), xytext=(0.8, 0.6),
                arrowprops=dict(arrowstyle="->", color="#F43F5E", lw=2.5, linestyle="--"))
    ax.text(2.6, 0.75, "⚠️ TLS 1.3 Encrypted Ingress Attack (Blocked by SentinelEdge)", color='#F43F5E', fontsize=7.5, fontweight='bold')

    # Right panel: Incident table
    right_panel = plt.Rectangle((6.5, 0.4), 4.1, 3.8, facecolor='#111827', edgecolor='#374151')
    ax.add_patch(right_panel)
    ax.text(6.7, 3.9, "🚨 REAL-TIME THREAT DETECTIONS", color='#E5E7EB', fontweight='bold', fontsize=9.5)
    
    incidents = [
        ("TLS 1.3 C2 Heartbeat", "192.168.1.104", "98.4%", "#EF4444"),
        ("DoH Tunnel Exfiltration", "10.0.4.52", "96.7%", "#F97316"),
        ("SSH Multi-Attempt Brute", "172.16.2.88", "99.1%", "#EF4444"),
        ("SYN Flood (Perimeter)", "192.168.1.201", "99.9%", "#EF4444"),
        ("High Entropy Outbound Surge", "10.0.1.15", "92.3%", "#F59E0B")
    ]
    for idx, (inc_type, src_ip, conf, col) in enumerate(incidents):
        iy = 3.3 - idx * 0.6
        row = plt.Rectangle((6.65, iy - 0.15), 3.8, 0.5, facecolor='#1F2937', edgecolor='#374151', linewidth=0.5)
        ax.add_patch(row)
        ax.text(6.8, iy + 0.12, inc_type, color='white', fontweight='bold', fontsize=7.5)
        ax.text(6.8, iy - 0.05, f"Src: {src_ip} | Conf: {conf}", color='#9CA3AF', fontsize=6.8)
        # Inspect button
        btn = plt.Rectangle((9.4, iy - 0.08), 0.9, 0.35, facecolor='#2563EB', edgecolor='none')
        ax.add_patch(btn)
        ax.text(9.85, iy + 0.095, "XAI Inspect", color='white', fontweight='bold', fontsize=6.5, ha='center', va='center')
        
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 6.2)
    fig.tight_layout()
    fig.savefig('report_figures/fig_9_1_soc_dashboard.png', dpi=300, bbox_inches='tight')
    plt.close(fig)
    print("Generated Fig 9.1")

# -------------------------------------------------------------
# Fig 9.2: Three.js Campus Digital Twin Visualizer
# -------------------------------------------------------------
def gen_fig_9_2():
    fig, ax = plt.subplots(figsize=(10, 5.5))
    ax.axis('off')
    
    bg = plt.Rectangle((0, 0), 10, 5.5, facecolor='#030712')
    ax.add_patch(bg)
    
    # Grid lines representing 3D floor plane
    for x in np.linspace(0.5, 9.5, 15):
        ax.plot([x, x], [0.5, 5.0], color='#1F2937', lw=0.6, alpha=0.6)
    for y in np.linspace(0.5, 5.0, 10):
        ax.plot([0.5, 9.5], [y, y], color='#1F2937', lw=0.6, alpha=0.6)
        
    # Buildings
    buildings = [
        (1.2, 1.8, 1.8, 2.4, "CSE Block\n(Cyber Lab)", "#2563EB"),
        (4.2, 2.2, 1.6, 2.6, "Central Server\nData Center", "#DC2626"),
        (6.8, 1.5, 1.8, 2.0, "Campus Wi-Fi\nGateway Hub", "#059669"),
    ]
    for bx, by, bw, bh, btitle, bcol in buildings:
        rect = plt.Rectangle((bx, by), bw, bh, facecolor=bcol, alpha=0.35, edgecolor=bcol, linewidth=2)
        ax.add_patch(rect)
        ax.text(bx + bw/2, by + bh/2, btitle, color='white', fontweight='bold', fontsize=8.5, ha='center', va='center')
        
    # Attack vectors
    ax.annotate('', xy=(4.2, 3.5), xytext=(1.2, 4.8),
                arrowprops=dict(arrowstyle="->", color="#EF4444", lw=3, linestyle="--"))
    ax.text(2.6, 4.4, "🚨 Lateral Movement (SSHv2 / Port 22)", color='#EF4444', fontweight='bold', fontsize=8)
    
    ax.annotate('', xy=(5.8, 3.0), xytext=(8.5, 4.2),
                arrowprops=dict(arrowstyle="->", color="#A855F7", lw=3, linestyle="--"))
    ax.text(7.2, 3.9, "⚠️ DoH C2 Beaconing (Port 443)", color='#A855F7', fontweight='bold', fontsize=8)
    
    ax.text(5.0, 0.8, "Interactive WebGL Perimeter Defense Digital Twin - Live Node Activity Tracking", color='#94A3B8', ha='center', fontsize=9, fontweight='bold')
    
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    fig.tight_layout()
    fig.savefig('report_figures/fig_9_2_campus_digital_twin.png', dpi=300, bbox_inches='tight')
    plt.close(fig)
    print("Generated Fig 9.2")

# -------------------------------------------------------------
# Fig 9.3: Live Incident Stream & Telemetry Table
# -------------------------------------------------------------
def gen_fig_9_3():
    fig, ax = plt.subplots(figsize=(10, 5.2))
    ax.axis('off')
    
    bg = plt.Rectangle((0, 0), 10, 5.2, facecolor='#0F172A')
    ax.add_patch(bg)
    
    # Title
    ax.text(0.5, 4.75, "SentinelEdge Live Forensics Telemetry Ingestion Log", color='#38BDF8', fontweight='bold', fontsize=11)
    
    # Table header
    headers = ["Timestamp", "Source IP", "Dest Port", "Protocol / ETA", "Entropy", "Threat Class", "Action"]
    x_positions = [0.5, 2.0, 3.5, 4.6, 6.2, 7.3, 8.8]
    
    hdr_box = plt.Rectangle((0.4, 4.2), 9.2, 0.4, facecolor='#1E293B', edgecolor='#334155')
    ax.add_patch(hdr_box)
    for h, x in zip(headers, x_positions):
        ax.text(x, 4.4, h, color='#94A3B8', fontweight='bold', fontsize=8)
        
    # Table rows
    rows = [
        ("12:04:18.420", "192.168.1.104", "443", "TLS 1.3 (RFC 8446)", "7.96", "TLS 1.3 C2 Tunnel", "JAIL DROP"),
        ("12:04:19.105", "10.0.4.52", "443", "DoH (RFC 8484)", "7.94", "DoH Tunnel Exfil", "JAIL DROP"),
        ("12:04:20.002", "172.16.2.88", "22", "SSHv2 / KeyEx", "6.85", "SSH Brute Force", "JAIL DROP"),
        ("12:04:20.550", "192.168.1.45", "443", "TLS 1.3 Standard", "5.42", "Benign Web Traffic", "FORWARD"),
        ("12:04:21.012", "10.0.1.15", "80", "HTTP Plaintext", "4.12", "Benign Internal", "FORWARD"),
        ("12:04:22.380", "192.168.1.201", "80", "TCP SYN Blast", "1.10", "SYN Flood DoS", "RATE LIMIT"),
    ]
    
    for idx, r in enumerate(rows):
        y = 3.65 - idx * 0.55
        r_box = plt.Rectangle((0.4, y - 0.1), 9.2, 0.45, facecolor='#1E293B' if idx%2==0 else '#172554', edgecolor='#334155', linewidth=0.5)
        ax.add_patch(r_box)
        for val, x in zip(r, x_positions):
            col = '#34D399' if val in ['FORWARD', 'Benign Web Traffic', 'Benign Internal'] else ('#EF4444' if 'JAIL' in val or 'Tunnel' in val or 'Flood' in val else '#E2E8F0')
            ax.text(x, y + 0.12, val, color=col, fontsize=7.5, fontweight='bold' if val in ['JAIL DROP', 'FORWARD'] else 'normal')
            
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.2)
    fig.tight_layout()
    fig.savefig('report_figures/fig_9_3_live_incident_stream.png', dpi=300, bbox_inches='tight')
    plt.close(fig)
    print("Generated Fig 9.3")

# -------------------------------------------------------------
# Fig 9.8: Dynamic IP Quarantine Jail Interface
# -------------------------------------------------------------
def gen_fig_9_8():
    fig, ax = plt.subplots(figsize=(10, 5.0))
    ax.axis('off')
    
    bg = plt.Rectangle((0, 0), 10, 5.0, facecolor='#0B0F19')
    ax.add_patch(bg)
    
    ax.text(0.5, 4.5, "🔒 TIER 4 DYNAMIC IP JAIL - ACTIVE AUTONOMOUS QUARANTINE RULES", color='#F43F5E', fontweight='bold', fontsize=11)
    
    # Table header
    headers = ["Quarantined IP", "Triggering Threat", "Confidence", "Packets Dropped", "Jail Expiration", "Control Action"]
    x_pos = [0.5, 2.4, 4.4, 5.8, 7.3, 8.8]
    
    hdr_box = plt.Rectangle((0.4, 3.9), 9.2, 0.4, facecolor='#1F2937', edgecolor='#374151')
    ax.add_patch(hdr_box)
    for h, x in zip(headers, x_pos):
        ax.text(x, 4.1, h, color='#9CA3AF', fontweight='bold', fontsize=7.8)
        
    jail_rows = [
        ("192.168.1.104", "TLS 1.3 C2 Tunnel", "98.4%", "14,890 pkts", "3540s left", "RELEASE"),
        ("10.0.4.52", "DoH Tunnel Exfil", "96.7%", "8,420 pkts", "3210s left", "RELEASE"),
        ("172.16.2.88", "SSH Brute Force", "99.1%", "29,400 pkts", "3580s left", "RELEASE"),
        ("192.168.1.201", "SYN Flood DoS", "99.9%", "184,200 pkts", "2400s left", "RELEASE"),
    ]
    
    for idx, r in enumerate(jail_rows):
        y = 3.3 - idx * 0.65
        r_box = plt.Rectangle((0.4, y - 0.15), 9.2, 0.52, facecolor='#111827', edgecolor='#EF4444', linewidth=1)
        ax.add_patch(r_box)
        for v_idx, (val, x) in enumerate(zip(r, x_pos)):
            if v_idx == 5:
                # Release button
                btn = plt.Rectangle((x - 0.1, y - 0.05), 0.9, 0.32, facecolor='#DC2626', edgecolor='none')
                ax.add_patch(btn)
                ax.text(x + 0.35, y + 0.11, val, color='white', fontweight='bold', fontsize=7.0, ha='center', va='center')
            else:
                col = '#EF4444' if v_idx in [0, 1] else ('#FBBF24' if v_idx==3 else '#F3F4F6')
                ax.text(x, y + 0.12, val, color=col, fontsize=7.8, fontweight='bold' if v_idx==0 else 'normal')
                
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.0)
    fig.tight_layout()
    fig.savefig('report_figures/fig_9_8_dynamic_jail.png', dpi=300, bbox_inches='tight')
    plt.close(fig)
    print("Generated Fig 9.8")

# -------------------------------------------------------------
# Fig 9.9: Wireshark PCAP Packet Capture Export Validation
# -------------------------------------------------------------
def gen_fig_9_9():
    fig, ax = plt.subplots(figsize=(10, 5.2))
    ax.axis('off')
    
    bg = plt.Rectangle((0, 0), 10, 5.2, facecolor='#FFFFFF')
    ax.add_patch(bg)
    
    # Outer border
    border = plt.Rectangle((0.05, 0.05), 9.9, 5.1, facecolor='none', edgecolor='#64748B', linewidth=1)
    ax.add_patch(border)
    
    # Wireshark mock header
    ws_hdr = plt.Rectangle((0.05, 4.6), 9.9, 0.55, facecolor='#2563EB', edgecolor='none')
    ax.add_patch(ws_hdr)
    ax.text(0.3, 4.88, "Wireshark - [SentinelEdge_Incident_Dump_192.168.1.104.pcap]", color='white', fontweight='bold', fontsize=9.5)
    
    # Packet list view header
    p_hdr = plt.Rectangle((0.1, 4.1), 9.8, 0.4, facecolor='#E2E8F0', edgecolor='#CBD5E1')
    ax.add_patch(p_hdr)
    p_cols = ["No.", "Time", "Source", "Destination", "Protocol", "Length", "Info"]
    p_x = [0.2, 0.8, 1.8, 3.2, 4.7, 5.7, 6.6]
    for h, x in zip(p_cols, p_x):
        ax.text(x, 4.3, h, color='#334155', fontweight='bold', fontsize=8)
        
    pkts = [
        ("1", "0.000000", "192.168.1.104", "198.51.100.2", "TLSv1.3", "517", "Client Hello, SNI: c2-hidden-relay.net"),
        ("2", "0.014200", "198.51.100.2", "192.168.1.104", "TLSv1.3", "1420", "Server Hello, Change Cipher Spec, Encrypted Extensions"),
        ("3", "0.014890", "198.51.100.2", "192.168.1.104", "TLSv1.3", "890", "Certificate, Certificate Verify, Finished"),
        ("4", "0.018900", "192.168.1.104", "198.51.100.2", "TLSv1.3", "320", "Application Data (Encrypted Beacon / C2 Command)"),
        ("5", "1.018950", "192.168.1.104", "198.51.100.2", "TLSv1.3", "320", "Application Data (Periodic Heartbeat Beacon)"),
        ("6", "2.019020", "192.168.1.104", "198.51.100.2", "TLSv1.3", "320", "Application Data (Periodic Heartbeat Beacon)"),
        ("7", "2.025100", "192.168.1.1", "192.168.1.104", "ICMP", "70", "Destination Unreachable (Host Administratively Filtered)"),
    ]
    
    for idx, p in enumerate(pkts):
        py = 3.6 - idx * 0.4
        bg_col = '#FEF2F2' if idx in [3, 4, 5] else ('#F1F5F9' if idx%2==0 else '#FFFFFF')
        if idx == 6: bg_col = '#DCFCE7'
        p_row = plt.Rectangle((0.1, py - 0.08), 9.8, 0.36, facecolor=bg_col, edgecolor='none')
        ax.add_patch(p_row)
        for val, x in zip(p, p_x):
            ax.text(x, py + 0.1, val, color='#DC2626' if idx in [3,4,5] and x==4.7 else '#0F172A', fontsize=7.2, family='monospace')
            
    # Packet details pane at bottom
    det_box = plt.Rectangle((0.1, 0.15), 9.8, 0.75, facecolor='#F8FAFC', edgecolor='#CBD5E1')
    ax.add_patch(det_box)
    ax.text(0.2, 0.65, "> Frame 4: 320 bytes on wire (2560 bits)", color='#334155', fontsize=7.2, family='monospace')
    ax.text(0.2, 0.45, "> Transport Layer Security -> TLSv1.3 Record Layer: Encrypted Application Data", color='#334155', fontsize=7.2, family='monospace')
    ax.text(0.2, 0.25, "  [SentinelEdge Zero-Decryption Metadata: Entropy=7.96 bits/byte, Fixed Length=320B, Delta-IAT=1.00s]", color='#2563EB', fontweight='bold', fontsize=7.2, family='monospace')

    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.2)
    fig.tight_layout()
    fig.savefig('report_figures/fig_9_9_wireshark_pcap.png', dpi=300, bbox_inches='tight')
    plt.close(fig)
    print("Generated Fig 9.9")

gen_fig_9_1()
gen_fig_9_2()
gen_fig_9_3()
gen_fig_9_8()
gen_fig_9_9()
print("All UI and validation figures generated successfully!")
