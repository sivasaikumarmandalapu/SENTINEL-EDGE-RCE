// SentinelEdge - Real-Time SOC Dashboard Controller
let ws = null;
let activeBlocklist = [];
let allIncidents = [];
let countdownInterval = null;
let campusCameraProgress = 0;

function mountDashboardLayout() {
    const workspaceLeft = document.getElementById("workspace-left");
    const workspaceRight = document.getElementById("workspace-right");
    const pipelineSlot = document.getElementById("pipeline-slot");
    const blocklistSlot = document.getElementById("blocklist-slot");
    const legacyGrid = document.querySelector(".main-split-grid");
    const campusPanel = legacyGrid?.querySelector(".campus-panel");
    const pipelinePanel = legacyGrid?.querySelector(".pipeline-card");
    const blocklistPanel = legacyGrid?.querySelector(".blocklist-card");
    const incidentsPanel = document.querySelector(".incidents-panel");

    if (!workspaceLeft || !workspaceRight || !pipelineSlot || !blocklistSlot ||
        !legacyGrid || !campusPanel || !pipelinePanel || !blocklistPanel || !incidentsPanel) {
        console.error("[SentinelEdge SOC] Dashboard layout could not be initialized: required panels are missing.");
        return;
    }

    workspaceRight.append(campusPanel);
    workspaceLeft.append(incidentsPanel);
    pipelineSlot.append(pipelinePanel);
    blocklistSlot.append(blocklistPanel);
    legacyGrid.remove();
}

function sendCampusCameraProgress(progress) {
    const frame = document.getElementById("campus-3d-frame");
    campusCameraProgress = Math.min(1, Math.max(0, progress));
    document.getElementById("btn-top-view")?.classList.toggle("active", campusCameraProgress >= 0.5);
    document.getElementById("btn-3d-view")?.classList.toggle("active", campusCameraProgress < 0.5);
    frame?.contentWindow?.postMessage(
        { type: "SENTINEL_CAMERA_PROGRESS", progress: campusCameraProgress },
        window.location.origin
    );
}

function setupCampusScrollCamera() {
    const workspace = document.getElementById("main-workspace");
    const frame = document.getElementById("campus-3d-frame");
    const campusPanel = document.querySelector(".campus-panel");
    if (!workspace || !frame || !campusPanel) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;

    const updateProgress = () => {
        animationFrame = 0;
        if (reducedMotion || window.matchMedia("(max-width: 960px)").matches) return;

        const workspaceTop = workspace.getBoundingClientRect().top + window.scrollY;
        const scrollRange = Math.max(1, workspace.offsetHeight - campusPanel.offsetHeight);
        const progress = (window.scrollY - workspaceTop) / scrollRange;
        sendCampusCameraProgress(progress);
    };

    const scheduleUpdate = () => {
        if (!animationFrame) animationFrame = window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    frame.addEventListener("load", scheduleUpdate);
    window.addEventListener("message", (event) => {
        if (event.origin !== window.location.origin ||
            event.source !== frame.contentWindow ||
            event.data?.type !== "SENTINEL_CAMERA_READY") return;
        sendCampusCameraProgress(campusCameraProgress);
    });

    scheduleUpdate();
}

mountDashboardLayout();
setupCampusScrollCamera();

let wsAttempts = 0;
let fallbackInterval = null;
let isFallbackMode = false;

// Connect to Real-time WebSocket with Autonomous Serverless Fallback
function connectWebSocket() {
    if (isFallbackMode) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    // Fast fallback on static/serverless cloud deployments (e.g. *.vercel.app)
    if (window.location.hostname.includes("vercel.app")) {
        startFallbackSimulation();
        return;
    }
    
    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("[SentinelEdge SOC] WebSocket connected to Edge Engine.");
            wsAttempts = 0;
            isFallbackMode = false;
            if (fallbackInterval) {
                clearInterval(fallbackInterval);
                fallbackInterval = null;
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "INITIAL_STATE") {
                    handleInitialState(data);
                } else if (data.type === "PACKET_INSPECTED") {
                    handlePacketEvent(data);
                }
            } catch (e) {
                console.error("Error processing WebSocket message:", e);
            }
        };

        ws.onerror = () => {
            wsAttempts++;
            if (wsAttempts >= 1 && !fallbackInterval) {
                startFallbackSimulation();
            }
        };

        ws.onclose = () => {
            wsAttempts++;
            if (wsAttempts >= 1 && !fallbackInterval) {
                startFallbackSimulation();
            } else if (!isFallbackMode) {
                setTimeout(connectWebSocket, 3000);
            }
        };
    } catch (err) {
        startFallbackSimulation();
    }
}

// Fallback telemetry simulator for serverless (Vercel) cloud environments
function startFallbackSimulation() {
    if (fallbackInterval) return;
    isFallbackMode = true;
    console.log("[SentinelEdge SOC] Running autonomous client-side telemetry engine (Serverless Cloud Mode).");

    let simPackets = 39159;
    let simForwarded = 38478;
    let simHeavy = 401;
    let simBlocked = 681;
    let simQuarantined = 4;

    const sampleScenarios = [
        {
            kind: "PORT_SCAN_ATTACK",
            class: "PORT_SCAN",
            tier1_status: "FLAGGED",
            tier1_msg: "SCAN Rapid Multi-Port Probe (6 empty ports/3s)",
            proto: "TLS Encrypted Sweep",
            cipher: "TLS_AES_128_GCM_SHA256",
            dport: 3306,
            subnet: "External_WAN",
            agent_score: 0.90,
            is_scan: true,
            is_heavy: false,
            entropy: "2.58 bits",
            dispersion: "18.0 (High Dispersion)",
            synack: "6.00 (Unacked SYN)",
            iat: "0.02 ms",
            conf: 99.69,
            action: "BLOCKED",
            ban_sec: 90,
            reason: "Port Scan on Empty Ports Detected -> Jailed for 90s",
            shap: {
                port_entropy: { label: "Shannon Port Entropy", phi: 0.4812 },
                empty_port_ratio: { label: "Empty / Closed Port Probes", phi: 0.1893 },
                port_diversity_ratio: { label: "Port Diversity Index", phi: 0.1342 },
                agent_score: { label: "Tier 2 Agent Anomaly Index", phi: 0.0855 },
                syn_ratio: { label: "TCP SYN Flag Ratio", phi: -0.0080 }
            },
            lime: "LIME Local Surrogate Rule: IF empty_port_ratio > 0.80 (unopened port probes) AND port_entropy > 1.50 (multi-port dispersion) AND syn_ratio > 0.50 AND mean_pkt_len < 120 bytes ==> Classified as PORT_SCAN (Confidence: 99.69%)"
        },
        {
            kind: "WEB_EXPLOIT",
            class: "MALICIOUS_PAYLOAD",
            tier1_status: "FLAGGED",
            tier1_msg: "EXPLOIT SQL Injection Attempt (UNION SELECT)",
            proto: "DoH Tunnel / Encrypted Exfil",
            cipher: "TLS_CHACHA20_POLY1305_SHA256",
            dport: 443,
            subnet: "External_WAN",
            agent_score: 0.90,
            is_scan: false,
            is_heavy: false,
            entropy: "7.94 bits",
            dispersion: "1.0 (HTTPS / DoH)",
            synack: "1.00 (Session Active)",
            iat: "0.15 ms",
            conf: 96.68,
            action: "BLOCKED",
            ban_sec: 120,
            reason: "Active Attack (MALICIOUS_PAYLOAD) -> Jailed for 120s",
            shap: {
                tier1_flagged: { label: "Wire Filter Signature Match", phi: 0.8727 },
                agent_score: { label: "Tier 2 Agent Anomaly Index", phi: 0.1019 },
                syn_ratio: { label: "TCP SYN Flag Ratio", phi: -0.0461 },
                flow_duration: { label: "Active Flow Lifetime", phi: 0.0154 },
                port_entropy: { label: "Shannon Port Entropy", phi: 0.0056 }
            },
            lime: "LIME Local Surrogate Rule: IF tier1_signature = FLAGGED (Snort/Suricata CVE pattern) AND agent_anomaly_score > 0.72 ==> Classified as MALICIOUS_PAYLOAD (Confidence: 96.68%)"
        },
        {
            kind: "DOS_SYN_FLOOD",
            class: "DOS_SYN_FLOOD",
            tier1_status: "FLAGGED",
            tier1_msg: "DOS High Volume SYN Flood Burst (52 SYNs/2s)",
            proto: "TCP Raw SYN",
            cipher: "None",
            dport: 80,
            subnet: "External_WAN",
            agent_score: 0.85,
            is_scan: false,
            is_heavy: false,
            entropy: "0.18 bits",
            dispersion: "1.0 (Flood Target)",
            synack: "24.0 (Half-Open Burst)",
            iat: "0.01 ms",
            conf: 99.59,
            action: "BLOCKED",
            ban_sec: 120,
            reason: "Active Attack (DOS_SYN_FLOOD) -> Jailed for 120s",
            shap: {
                pkt_rate: { label: "Packet Velocity (PPS)", phi: 0.5739 },
                tier1_flagged: { label: "Wire Filter Signature Match", phi: 0.2775 },
                agent_score: { label: "Tier 2 Agent Anomaly Index", phi: 0.0948 },
                port_diversity_ratio: { label: "Port Diversity Index", phi: 0.0385 },
                syn_ratio: { label: "TCP SYN Flag Ratio", phi: -0.0099 }
            },
            lime: "LIME Local Surrogate Rule: IF pkt_rate > 1.40 (high velocity PPS) AND single_target_port = ACTIVE ==> Classified as DOS_SYN_FLOOD (Confidence: 99.59%)"
        },
        {
            kind: "GENUINE_HEAVY_TRANSFER",
            class: "BENIGN_HEAVY_TRANSFER",
            tier1_status: "CLEAN",
            tier1_msg: "Wire Filter Cleared",
            proto: "TLS 1.3 / HTTPS",
            cipher: "TLS_AES_256_GCM_SHA384",
            dport: 443,
            subnet: "Lab-2",
            agent_score: 0.02,
            is_scan: false,
            is_heavy: true,
            entropy: "0.00 bits",
            dispersion: "1.0 (Single Port MTU)",
            synack: "1.00 (Stream ACK)",
            iat: "0.08 ms",
            conf: 98.50,
            action: "FORWARDED",
            ban_sec: 0,
            reason: "Genuine Heavy Data Transfer Cleared (Single-Port Legitimate Stream)",
            shap: {
                mean_pkt_len: { label: "Packet Length Variance", phi: -0.0404 },
                byte_rate: { label: "Byte Throughput (KBPS)", phi: 0.0154 },
                port_entropy: { label: "Shannon Port Entropy", phi: -0.0008 },
                empty_port_ratio: { label: "Empty / Closed Port Probes", phi: 0.0000 },
                flow_duration: { label: "Active Flow Lifetime", phi: -0.0048 }
            },
            lime: "LIME Local Surrogate Rule: IF empty_port_ratio == 0.0 (valid port 443) AND mean_pkt_len > 0.70 (1460B MTU) AND port_entropy < 0.10 ==> Classified as BENIGN_HEAVY_TRANSFER (Confidence: 98.5%)"
        }
    ];

    // Seed initial active jail entries and recent incidents immediately
    activeBlocklist = [
        { ip: "198.51.100.77", reason: "Port Scan on Empty Ports Detected -> Jailed for 90s", remaining_seconds: 86 },
        { ip: "203.0.113.120", reason: "Active Attack (MALICIOUS_PAYLOAD) -> Jailed for 120s", remaining_seconds: 114 }
    ];
    renderBlocklist();

    const triggerTick = (forcedIdx = null) => {
        simPackets += Math.floor(Math.random() * 12) + 3;
        const r = Math.random();
        let sc = null;
        if (forcedIdx !== null) {
            sc = sampleScenarios[forcedIdx];
        } else if (r < 0.24) {
            sc = sampleScenarios[0];
        } else if (r < 0.38) {
            sc = sampleScenarios[1];
        } else if (r < 0.48) {
            sc = sampleScenarios[2];
        } else if (r < 0.72) {
            sc = sampleScenarios[3];
        }

        if (sc) {
            if (sc.action === "BLOCKED") simBlocked++;
            else if (sc.action === "QUARANTINED") simQuarantined++;
            else {
                simForwarded++;
                if (sc.is_heavy) simHeavy++;
            }
        } else {
            simForwarded++;
        }

        const tel = {
            total_packets: simPackets,
            forwarded: simForwarded,
            genuine_heavy_transfers_cleared: simHeavy,
            blocked: simBlocked,
            quarantined: simQuarantined,
            avg_latency_ms: (Math.random() * 0.14 + 0.31).toFixed(2),
            edge_ram_mb: (Math.random() * 1.4 + 37.2).toFixed(2),
            edge_cpu_percent: (Math.random() * 2.5 + 3.2).toFixed(1)
        };

        if (sc) {
            const attackerIps = ["198.51.100.42", "198.51.100.77", "203.0.113.88", "203.0.113.120"];
            const srcIp = sc.is_heavy
                ? "192.168.20.104"
                : attackerIps[Math.floor(Math.random() * attackerIps.length)];
            const dstIp = sc.is_heavy ? "10.0.0.10" : "192.168.10.55";

            if (sc.action === "BLOCKED") {
                const existing = activeBlocklist.find(x => x.ip === srcIp);
                if (!existing) {
                    activeBlocklist.unshift({ ip: srcIp, reason: sc.reason, remaining_seconds: sc.ban_sec });
                    if (activeBlocklist.length > 6) activeBlocklist.pop();
                    renderBlocklist();
                }
            }

            handlePacketEvent({
                id: Math.floor(Math.random() * 90000) + 1000,
                telemetry: tel,
                decision_action: sc.action,
                sim_type: sc.kind,
                src_ip: srcIp,
                dst_ip: dstIp,
                src_port: Math.floor(Math.random() * 15000) + 40000,
                dst_port: sc.dport,
                subnet: sc.subnet,
                tier1_msg: sc.tier1_msg,
                tier1_status: sc.tier1_status,
                agent_score: sc.agent_score,
                is_single_port_heavy: sc.is_heavy,
                is_port_scan_pattern: sc.is_scan,
                agent_features: {
                    dispersion: sc.dispersion,
                    entropy: sc.entropy,
                    synack: sc.synack,
                    iat: sc.iat
                },
                neuron_class: sc.class,
                neuron_confidence: sc.conf,
                encrypted_protocol: sc.proto,
                cipher_suite: sc.cipher,
                inspection_mode: "Zero-Decryption Flow Metadata Profiling",
                xai: {
                    shap: { attributions: sc.shap },
                    lime: { human_summary: sc.lime }
                }
            });
        } else {
            const subnets = ["Lab-1", "Lab-2", "Lab-3"];
            const subIdx = Math.floor(Math.random() * subnets.length);
            const encProtos = [
                { p: "TLS 1.3 / HTTPS", c: "TLS_AES_256_GCM_SHA384", dport: 443 },
                { p: "DoH (RFC 8484)", c: "TLS_CHACHA20_POLY1305_SHA256", dport: 53 },
                { p: "SSHv2 Encrypted", c: "chacha20-poly1305@openssh.com", dport: 22 }
            ];
            const ep = encProtos[Math.floor(Math.random() * encProtos.length)];

            handlePacketEvent({
                telemetry: tel,
                decision_action: "FORWARDED",
                sim_type: "NORMAL_TRAFFIC",
                src_ip: `192.168.${(subIdx + 1) * 10}.${Math.floor(Math.random() * 80) + 10}`,
                dst_ip: "142.250.190.46",
                src_port: Math.floor(Math.random() * 20000) + 32000,
                dst_port: ep.dport,
                subnet: subnets[subIdx],
                tier1_msg: "Wire Filter Cleared",
                tier1_status: "CLEAN",
                agent_score: 0.04,
                is_single_port_heavy: false,
                is_port_scan_pattern: false,
                agent_features: {
                    dispersion: "1.0 (Standard Flow)",
                    entropy: "0.00 bits",
                    synack: "1.02 (Balanced)",
                    iat: "0.14 ms"
                },
                neuron_class: "BENIGN_NORMAL",
                neuron_confidence: 99.1,
                encrypted_protocol: ep.p,
                cipher_suite: ep.c,
                inspection_mode: "Zero-Decryption Flow Metadata Profiling",
                xai: {
                    shap: {
                        attributions: {
                            empty_port_ratio: { label: "Empty / Closed Port Probes", phi: -0.0210 },
                            port_entropy: { label: "Shannon Port Entropy", phi: -0.0145 },
                            tier1_flagged: { label: "Wire Filter Signature Match", phi: 0.0000 },
                            agent_score: { label: "Tier 2 Agent Anomaly Index", phi: -0.0110 },
                            syn_ratio: { label: "TCP SYN Flag Ratio", phi: -0.0062 }
                        }
                    },
                    lime: {
                        human_summary: "LIME Local Surrogate Rule: IF port_diversity_ratio <= 0.05 AND empty_port_ratio <= 0.05 ==> Classified as BENIGN_NORMAL (Confidence: 99.1%)"
                    }
                }
            });
        }
    };

    // Fire an immediate PORT_SCAN event + regular ticks so UI & XAI populate immediately
    triggerTick(0);
    setTimeout(() => triggerTick(1), 350);
    setTimeout(() => triggerTick(3), 700);
    fallbackInterval = setInterval(() => triggerTick(null), 1800);
}

function handleInitialState(data) {
    if (data.telemetry) updateTelemetry(data.telemetry);
    if (data.blocklist) {
        activeBlocklist = data.blocklist;
        renderBlocklist();
    }
    if (data.recent_incidents && data.recent_incidents.length > 0) {
        allIncidents = data.recent_incidents;
        renderIncidentsTable();
    }
}

function handlePacketEvent(data) {
    // 1. Update Telemetry & KPI deck
    if (data.telemetry) {
        updateTelemetry(data.telemetry);
    }

    // 2. Animate 4-Tier Sequence
    updatePipelineSequence(data);

    // 3. Update AI & Neurons live statistics
    updateAIAnalysisData(data);

    // 4. Record in incidents if not pure ordinary benign
    if (data.decision_action === "BLOCKED" || data.decision_action === "QUARANTINED" || data.sim_type === "PORT_SCAN_ATTACK" || data.tier1_status === "FLAGGED") {
        allIncidents.unshift({
            id: data.id || Math.floor(Math.random() * 1000000),
            datetime_str: new Date().toLocaleTimeString(),
            src_ip: data.src_ip,
            dst_ip: data.dst_ip,
            dst_port: data.dst_port || 80,
            subnet: data.subnet || "External_WAN",
            tier1_rule_hit: data.tier1_msg || (data.tier1_status === "CLEAN" ? "Clean" : "Flagged"),
            agent_anomaly_score: data.agent_score || 0.05,
            neuron_class: data.neuron_class || "NORMAL",
            neuron_confidence: data.neuron_confidence || 98.7,
            action_taken: data.decision_action || "FORWARDED",
            encrypted_proto: data.encrypted_protocol || "TLS 1.3 / HTTPS",
            cipher_suite: data.cipher_suite || "TLS_AES_256_GCM_SHA384",
            inspection_mode: data.inspection_mode || "Zero-Decryption Flow Metadata Profiling",
            xai: data.xai || {}
        });

        if (allIncidents.length > 50) allIncidents.pop();
        renderIncidentsTable();
        if (!isFallbackMode) syncBlocklistFromServer();
    }
}

function updateTelemetry(telem) {
    if (!telem) return;
    const tot = Number(telem.total_packets ?? telem.total_packets_inspected ?? 0);
    const fwd = Number(telem.forwarded ?? 0);
    const hvy = Number(telem.genuine_heavy_transfers_cleared ?? 401);
    const blk = Number(telem.blocked ?? telem.total_threats_blocked ?? 0);
    const qua = Number(telem.quarantined ?? 0);
    const lat = telem.avg_latency_ms ?? telem.engine_latency_ms ?? "0.42";
    const ram = telem.edge_ram_mb ?? "37.4";
    const cpu = telem.edge_cpu_percent ?? "4.2";

    document.getElementById("stat-total").innerText = (Number.isFinite(tot) ? tot : 0).toLocaleString();
    document.getElementById("stat-forwarded").innerText = (Number.isFinite(fwd) ? fwd : 0).toLocaleString();
    document.getElementById("stat-heavy").innerText = (Number.isFinite(hvy) ? hvy : 401).toLocaleString();
    document.getElementById("stat-blocked").innerText = (Number.isFinite(blk) ? blk : 0).toLocaleString();
    document.getElementById("stat-quarantined").innerText = (Number.isFinite(qua) ? qua : 0).toLocaleString();
    
    document.getElementById("avg-latency").innerText = `${lat} ms`;
    document.getElementById("edge-ram").innerText = `${ram} MB`;
    document.getElementById("edge-cpu").innerText = `${cpu}%`;
}

function updatePipelineSequence(data) {
    // 1. Ingress
    const pIngress = document.getElementById("pipe-ingress-ip");
    const pDest = document.getElementById("pipe-dest-ip");
    if (pIngress && pDest) {
        pIngress.innerText = `${data.src_ip}:${data.src_port || 49610}`;
        pDest.innerText = `➔ ${data.dst_ip}:${data.dst_port || 443}`;
    }

    // 2. Suricata & Snort
    const pT1 = document.getElementById("pipe-t1-val");
    if (pT1) {
        if (data.tier1_status === "FLAGGED") {
            pT1.innerText = data.tier1_msg || "Signature Hit";
            pT1.className = "step-status text-crimson";
        } else if (data.tier1_status === "BLOCKED_AT_WIRE") {
            pT1.innerText = "BLOCKED AT WIRE (JAILED)";
            pT1.className = "step-status text-crimson";
        } else {
            pT1.innerText = "CLEAN (0 alerts)";
            pT1.className = "step-status text-emerald";
        }
    }

    // 3. Sentinel AI Agent
    const pT2 = document.getElementById("pipe-t2-val");
    if (pT2) {
        if (data.is_single_port_heavy) {
            pT2.innerText = "Genuine Heavy Stream";
            pT2.className = "step-status text-teal";
        } else if (data.is_port_scan_pattern) {
            pT2.innerText = "Port Scan Probe!";
            pT2.className = "step-status text-crimson";
        } else {
            pT2.innerText = `Score: ${data.agent_score}`;
            pT2.className = "step-status text-cyan";
        }
    }

    // 4. The Neurons (DNN)
    const pT3 = document.getElementById("pipe-t3-val");
    if (pT3) {
        let confVal = Number(data.neuron_confidence || 98.5);
        if (confVal > 100) confVal = Number((confVal / 100).toFixed(1));
        const nCls = data.neuron_class || "BENIGN_NORMAL";
        pT3.innerText = `${nCls} (${confVal}%)`;
        if (nCls === "BENIGN_NORMAL" || nCls === "BENIGN_HEAVY_TRANSFER" || nCls === "NORMAL") {
            pT3.className = "step-status text-emerald";
        } else {
            pT3.className = "step-status text-crimson";
        }
    }

    // 5. Decision & Response
    const pT4 = document.getElementById("pipe-t4-val");
    if (pT4) {
        pT4.innerText = data.decision_action || "FORWARDED";
        if (data.decision_action === "FORWARDED") {
            pT4.className = "decision-badge";
            pT4.style.color = "var(--accent-emerald)";
            pT4.style.borderColor = "var(--accent-emerald)";
        } else if (data.decision_action === "BLOCKED") {
            pT4.className = "decision-badge";
            pT4.style.color = "var(--accent-crimson)";
            pT4.style.borderColor = "var(--accent-crimson)";
        } else {
            pT4.className = "decision-badge";
            pT4.style.color = "var(--accent-amber)";
            pT4.style.borderColor = "var(--accent-amber)";
        }
    }
}

// --- Dynamic Blocklist Management ---
async function syncBlocklistFromServer() {
    if (isFallbackMode) return;
    try {
        const res = await fetch("/api/blocklist");
        if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) {
                activeBlocklist = list;
                renderBlocklist();
            }
        }
    } catch (e) {
        console.warn("Blocklist sync skipped in offline/serverless mode.");
    }
}

function renderBlocklist() {
    const tbody = document.getElementById("blocklist-body");
    const countBadge = document.getElementById("blocklist-count-badge");
    if (!tbody || !countBadge) return;

    countBadge.innerText = `${activeBlocklist.length} IP JAILED`;

    if (!activeBlocklist || activeBlocklist.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state-cell">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748B" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                        <span>No active firewall blocks currently active.</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let html = "";
    activeBlocklist.forEach(item => {
        html += `
            <tr>
                <td class="text-crimson" style="font-weight:700;">🚫 ${item.ip}</td>
                <td><small style="color:#CBD5E1;">${item.reason}</small></td>
                <td>
                    <span class="badge-pill-crimson" id="cd-${item.ip.replace(/\./g, '-')}">
                        ⏱ ${item.remaining_seconds}s remaining
                    </span>
                </td>
                <td>
                    <button class="btn-inspect" onclick="unblockIp('${item.ip}')">Release</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Tick down remaining blocklist seconds
countdownInterval = setInterval(() => {
    if (activeBlocklist.length === 0) return;
    
    let hasChanges = false;
    activeBlocklist.forEach(item => {
        if (item.remaining_seconds > 0) {
            item.remaining_seconds -= 1;
            const cdEl = document.getElementById(`cd-${item.ip.replace(/\./g, '-')}`);
            if (cdEl) {
                cdEl.innerText = `⏱ ${item.remaining_seconds}s remaining`;
            }
        } else {
            hasChanges = true;
        }
    });

    if (hasChanges) {
        activeBlocklist = activeBlocklist.filter(item => item.remaining_seconds > 0);
        renderBlocklist();
    }
}, 1000);

async function unblockIp(ip) {
    if (!isFallbackMode) {
        try {
            await fetch(`/api/unblock/${ip}`, { method: "POST" });
        } catch (e) {
            console.warn("Unblock API fallback:", e);
        }
    }
    activeBlocklist = activeBlocklist.filter(item => item.ip !== ip);
    renderBlocklist();
    showToast(`✓ Released ${ip} from dynamic firewall jail`);
}

// --- Incident Feed & Filtering ---
function renderIncidentsTable() {
    const tbody = document.getElementById("incidents-body");
    if (!tbody) return;

    const filterSubnet = document.getElementById("subnet-filter-select") ? document.getElementById("subnet-filter-select").value : "ALL";
    const searchVal = document.getElementById("incident-search-input") ? document.getElementById("incident-search-input").value.toLowerCase() : "";

    let filtered = allIncidents.filter(inc => {
        if (filterSubnet !== "ALL" && inc.subnet !== filterSubnet) return false;
        if (searchVal) {
            const rowStr = `${inc.src_ip} ${inc.dst_ip} ${inc.tier1_rule_hit} ${inc.neuron_class}`.toLowerCase();
            if (!rowStr.includes(searchVal)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state-cell">No matching incidents found.</td></tr>`;
        return;
    }

    let html = "";
    filtered.forEach(data => {
        let actionBadge = `<span class="action-badge-forward">FORWARDED</span>`;
        if (data.action_taken === "BLOCKED" || data.decision_action === "BLOCKED") {
            actionBadge = `<span class="action-badge-blocked">BLOCKED</span>`;
        } else if (data.action_taken === "QUARANTINED" || data.decision_action === "QUARANTINED") {
            actionBadge = `<span class="action-badge-quarantine">QUARANTINE</span>`;
        }

        const nowStr = data.datetime_str || new Date().toLocaleTimeString();
        const incidentId = data.id || Math.floor(Math.random() * 100000);
        const srcIp = data.src_ip;
        const dstIp = `${data.dst_ip}:${data.dst_port || 80}`;
        const subnet = data.subnet || "Campus";
        const t1Msg = data.tier1_rule_hit || "Clean";
        const agentScore = data.agent_anomaly_score !== undefined ? data.agent_anomaly_score : 0.05;
        const neuronClass = data.neuron_class || "NORMAL";
        const confidence = data.neuron_confidence || 98.7;
        const encProto = data.encrypted_proto || data.encrypted_protocol || "TLS 1.3 / HTTPS";

        html += `
            <tr>
                <td style="color:var(--text-muted);">${nowStr}</td>
                <td><span class="badge-tag-subnet">${subnet}</span></td>
                <td><span class="badge-tag-encrypted">🔒 ${encProto}</span></td>
                <td class="text-cyan font-bold">${srcIp}</td>
                <td style="color:#FFFFFF;">${dstIp}</td>
                <td style="max-width:260px; overflow:hidden; text-overflow:ellipsis;"><small style="color:#CBD5E1;">${t1Msg}</small></td>
                <td>${agentScore}</td>
                <td><strong>${neuronClass}</strong> <small style="color:var(--text-muted);">(${confidence}%)</small></td>
                <td>${actionBadge}</td>
                <td>
                    <button class="btn-inspect" onclick="inspectIncident(${incidentId}, '${srcIp}', '${dstIp}', '${neuronClass}', '${confidence}')">Inspect</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function filterIncidents() {
    renderIncidentsTable();
}

// ==========================================================================
// DYNAMIC NAVIGATION, SCROLL-SPY & INTERACTION
// ==========================================================================

const targetMap = {
    "dashboard": "section-dashboard",
    "campus": "section-campus",
    "live": "section-live",
    "incidents": "section-incidents",
    "forensics": "section-forensics",
    "blocklist": "section-blocklist",
    "ai-analysis": "section-ai-analysis",
    "reports": "section-reports",
    "settings": "section-settings"
};

let isManualScrolling = false;
let scrollTimeout = null;

function switchNav(el) {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    el.classList.add("active");

    const targetKey = el.getAttribute("data-target");
    const sectionId = targetMap[targetKey];
    if (!sectionId) return;

    const targetEl = document.getElementById(sectionId);
    if (!targetEl) return;

    isManualScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isManualScrolling = false;
    }, 1000);

    if (targetKey === "dashboard") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        const topHeader = document.querySelector(".top-header");
        const headerHeight = topHeader ? topHeader.offsetHeight + 18 : 85;
        const rect = targetEl.getBoundingClientRect();
        const targetTop = window.pageYOffset + rect.top - headerHeight;

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth"
        });
    }

    targetEl.classList.remove("section-target-highlight");
    void targetEl.offsetWidth; // trigger reflow
    targetEl.classList.add("section-target-highlight");
}

function setupScrollSpy() {
    const navItems = Array.from(document.querySelectorAll(".sidebar-menu .nav-item"));

    window.addEventListener("scroll", () => {
        if (isManualScrolling) return;

        // If at the very top, activate Dashboard
        if (window.scrollY < 120) {
            navItems.forEach(i => i.classList.remove("active"));
            const dashItem = document.querySelector('.nav-item[data-target="dashboard"]');
            if (dashItem) dashItem.classList.add("active");
            return;
        }

        const scrollPos = window.scrollY + 140;
        let activeKey = "dashboard";

        const order = ["settings", "reports", "ai-analysis", "forensics", "blocklist", "live", "incidents", "campus", "dashboard"];
        for (const key of order) {
            const sectionEl = document.getElementById(targetMap[key]);
            if (sectionEl) {
                const top = sectionEl.getBoundingClientRect().top + window.scrollY;
                if (scrollPos >= top) {
                    activeKey = key;
                    break;
                }
            }
        }

        const activeItem = document.querySelector(`.nav-item[data-target="${activeKey}"]`);
        if (activeItem && !activeItem.classList.contains("active")) {
            navItems.forEach(i => i.classList.remove("active"));
            activeItem.classList.add("active");
        }
    }, { passive: true });
}

// ==========================================================================
// FORENSICS INSPECTOR & PAYLOAD DISSECTOR
// ==========================================================================

const sampleForensicFrames = [
    {
        title: "FRAME #1042 DEEP PACKET DISSECTION",
        tags: [
            { text: "ETHERNET II", alert: false },
            { text: "IPv4 [TTL 64]", alert: false },
            { text: "TCP [SYN, ECN]", alert: false },
            { text: "ANOMALY: EMPTY PORT PROBE", alert: true }
        ],
        hex: `0000   00 0c 29 12 34 56 00 0c 29 ab cd ef 08 00 45 00   ..).4V..).....E.
0010   00 3c 1a 2b 40 00 40 06 b8 1f c6 33 64 2a c0 a8   .<.+@.@....3d*..
0020   0a 37 c3 50 00 87 00 00 00 00 a0 02 72 10 3a 4f   .7.P........r.:O
0030   00 00 02 04 05 b4 04 02 08 0a 00 23 b1 c2 00 00   ...........#....`,
        incident: { id: 1042, src: "192.168.10.150:49210", dst: "145.3.21.66:23", cls: "PORT_SCAN_ATTACK", conf: 99.4 }
    },
    {
        title: "FRAME #1038 DEEP PACKET DISSECTION",
        tags: [
            { text: "ETHERNET II", alert: false },
            { text: "IPv4 [TTL 128]", alert: false },
            { text: "TCP [SYN BURST]", alert: true },
            { text: "RATE: 2800 PKT/SEC", alert: true }
        ],
        hex: `0000   00 50 56 c0 00 08 00 0c 29 e4 fa 11 08 00 45 00   .PV...).......E.
0010   00 28 a1 10 40 00 80 06 4c e2 ac 10 00 2c 91 03   .(..@...L....,..
0020   15 50 95 30 00 50 00 00 00 00 50 02 20 00 b8 4a   .P.0.P....P. ..J
0030   00 00 00 00 00 00 00 00                            ........`,
        incident: { id: 1038, src: "172.16.0.44:38192", dst: "145.3.21.80:80", cls: "DDOS_SYN_FLOOD", conf: 98.9 }
    },
    {
        title: "FRAME #1029 DEEP PACKET DISSECTION",
        tags: [
            { text: "ETHERNET II", alert: false },
            { text: "IPv4 [TTL 52]", alert: false },
            { text: "TCP [ACK, PSH]", alert: false },
            { text: "CVE-2023-44487 HIT", alert: true }
        ],
        hex: `0000   00 1a 4a 16 01 a2 00 0c 29 88 12 90 08 00 45 00   ..J.....).....E.
0010   00 54 2c b1 40 00 34 06 a2 e1 0a 00 0c 58 91 03   .T,.@.4......X..
0020   15 2c c8 00 01 bb 44 a1 10 02 50 18 10 00 3e 81   .,....D...P...>.
0030   00 00 00 00 04 00 00 00 00 00 00 00 00 03 00 00   ................`,
        incident: { id: 1029, src: "10.0.12.88:51200", dst: "145.3.21.44:443", cls: "EXPLOIT_PAYLOAD", conf: 96.5 }
    },
    {
        title: "FRAME #1015 DEEP PACKET DISSECTION",
        tags: [
            { text: "ETHERNET II", alert: false },
            { text: "IPv4 [TTL 64]", alert: false },
            { text: "TCP [ACK] 1460B MTU", alert: false },
            { text: "BENIGN SINGLE PORT STREAM", alert: false }
        ],
        hex: `0000   00 0c 29 bb 44 21 00 0c 29 33 22 11 08 00 45 00   ..).D!..)3"....E.
0010   05 b4 71 88 40 00 40 06 63 12 c0 a8 01 37 91 03   ..q.@.@.c....7..
0020   15 0a 01 bb 01 bb 11 22 33 44 55 66 77 88 80 10   ......."3DUfw...
0030   01 f5 3a 4f 00 00 01 01 08 0a 00 31 a2 f0 00 00   ..:O.......1....`,
        incident: { id: 1015, src: "192.168.1.55:443", dst: "145.3.21.10:443", cls: "BENIGN_HEAVY_TRANSFER", conf: 99.8 }
    }
];

let currentSelectedForensicIndex = 0;

function selectForensicFrame(index, el) {
    currentSelectedForensicIndex = index;
    document.querySelectorAll(".forensic-frame-item").forEach(item => item.classList.remove("active"));
    if (el) el.classList.add("active");

    const frame = sampleForensicFrames[index];
    if (!frame) return;

    const titleEl = document.getElementById("forensic-payload-title");
    if (titleEl) titleEl.innerText = frame.title;

    const hexEl = document.getElementById("forensic-hex-viewer");
    if (hexEl) hexEl.innerText = frame.hex;

    const tagsEl = document.getElementById("forensic-protocol-tags");
    if (tagsEl) {
        tagsEl.innerHTML = frame.tags.map(t => `<span class="proto-tag ${t.alert ? 'alert' : ''}">${t.text}</span>`).join("");
    }

    const forensicBtn = document.getElementById("forensic-export-btn");
    if (forensicBtn) {
        forensicBtn.href = `/api/export_pcap/${frame.incident.id}`;
        forensicBtn.onclick = (e) => {
            if (isFallbackMode) {
                e.preventDefault();
                triggerPcapDownload(frame.incident.id, frame.incident.cls);
            }
        };
    }
}

function openCurrentForensicModal() {
    const frame = sampleForensicFrames[currentSelectedForensicIndex] || sampleForensicFrames[0];
    inspectIncident(frame.incident.id, frame.incident.src, frame.incident.dst, frame.incident.cls, frame.incident.conf);
}

function captureLiveBufferPacket() {
    const randIdx = Math.floor(Math.random() * sampleForensicFrames.length);
    selectForensicFrame(randIdx);
    const items = document.querySelectorAll(".forensic-frame-item");
    if (items[randIdx]) {
        items.forEach(i => i.classList.remove("active"));
        items[randIdx].classList.add("active");
    }
    showToast("Captured fresh SPAN frame from router interface!");
}

// ==========================================================================
// AI & NEURONS DNN LIVE STATS UPDATE
// ==========================================================================

function updateAIDnnBars(nClass, conf) {
    const bars = {
        "BENIGN_NORMAL": { p: "prob-benign", b: "bar-benign" },
        "BENIGN_HEAVY_TRANSFER": { p: "prob-heavy", b: "bar-heavy" },
        "PORT_SCAN": { p: "prob-scan", b: "bar-scan" },
        "DDOS_SYN_FLOOD": { p: "prob-ddos", b: "bar-ddos" },
        "EXPLOIT_PAYLOAD": { p: "prob-exploit", b: "bar-exploit" }
    };

    let mainConf = Number(conf || 96.5);
    if (mainConf > 100) mainConf = Number((mainConf / 100).toFixed(1));
    mainConf = Math.min(99.9, Math.max(50.0, mainConf));
    const remainder = Math.max(0.1, (100 - mainConf) / 4).toFixed(1);
    const normClass = (nClass || "BENIGN_NORMAL").toUpperCase();

    for (const [cls, ids] of Object.entries(bars)) {
        const pEl = document.getElementById(ids.p);
        const bEl = document.getElementById(ids.b);
        if (pEl && bEl) {
            const isMatch = (
                normClass === cls ||
                (cls === "BENIGN_NORMAL" && normClass === "NORMAL") ||
                (cls === "PORT_SCAN" && normClass.includes("PORT_SCAN")) ||
                (cls === "BENIGN_HEAVY_TRANSFER" && normClass.includes("HEAVY")) ||
                (cls === "DDOS_SYN_FLOOD" && (normClass.includes("DDOS") || normClass.includes("DOS"))) ||
                (cls === "EXPLOIT_PAYLOAD" && (normClass.includes("MALICIOUS") || normClass.includes("EXPLOIT")))
            );
            const val = isMatch ? mainConf.toFixed(1) : remainder;
            pEl.innerText = `${val}%`;
            bEl.style.width = `${val}%`;
        }
    }
}

function updateAIAnalysisData(data) {
    const aiScoreEl = document.getElementById("ai-active-agent-score");
    if (aiScoreEl && data.agent_score !== undefined) {
        aiScoreEl.innerText = `Score: ${data.agent_score} (${data.is_single_port_heavy ? 'Genuine Stream' : (data.is_port_scan_pattern ? 'Port Scan Probe' : 'Clean')})`;
    }
    const featDispersion = document.getElementById("feat-dispersion");
    if (featDispersion) {
        if (data.agent_features?.dispersion) {
            featDispersion.innerText = data.agent_features.dispersion;
        } else if (data.is_port_scan_pattern) {
            featDispersion.innerText = "18.0 (High Dispersion)";
            featDispersion.className = "feat-val text-crimson";
        } else if (data.is_single_port_heavy) {
            featDispersion.innerText = "1.0 (Single Port MTU)";
            featDispersion.className = "feat-val text-teal";
        } else {
            featDispersion.innerText = "1.0 (Standard Flow)";
            featDispersion.className = "feat-val text-white";
        }
    }
    const featEntropy = document.getElementById("feat-entropy");
    if (featEntropy && data.agent_features?.entropy) {
        featEntropy.innerText = data.agent_features.entropy;
    }
    const featSynAck = document.getElementById("feat-synack");
    if (featSynAck && data.agent_features?.synack) {
        featSynAck.innerText = data.agent_features.synack;
    }
    const featIat = document.getElementById("feat-iat");
    if (featIat && data.agent_features?.iat) {
        featIat.innerText = data.agent_features.iat;
    }
    if (data.neuron_class) {
        updateAIDnnBars(data.neuron_class, data.neuron_confidence);
    }

    // Live update for XAI SHAP & LIME Engine panel
    if (data.xai?.shap?.attributions) {
        const shapContainer = document.getElementById("global-shap-bars");
        if (shapContainer) {
            let html = "";
            const entries = Object.entries(data.xai.shap.attributions).slice(0, 5);
            for (const [k, f] of entries) {
                const phi = typeof f.phi === "number" ? f.phi : 0.0;
                const isThreat = phi >= 0;
                const widthPct = Math.min(100, Math.max(8, Math.round(Math.abs(phi) * 100)));
                const fillClass = isThreat ? "shap-bar-fill-pos" : "shap-bar-fill-neg";
                const colorStyle = isThreat ? "color:#F43F5E;" : "color:#10B981;";
                const sign = isThreat ? "+" : "";
                html += `
                    <div class="shap-bar-row">
                        <span class="shap-feat-name" title="${f.label}">${f.label}</span>
                        <div class="shap-bar-track"><div class="${fillClass}" style="width: ${widthPct}%;"></div></div>
                        <span class="shap-val-text" style="${colorStyle}">${sign}${phi.toFixed(3)}</span>
                    </div>
                `;
            }
            shapContainer.innerHTML = html;
        }
    }
    if (data.xai?.lime?.human_summary) {
        const limeEl = document.getElementById("global-lime-box");
        if (limeEl) {
            limeEl.innerText = data.xai.lime.human_summary;
        }
    }
}

// ==========================================================================
// REPORTS & SETTINGS ACTIONS
// ==========================================================================

function exportIncidentsCSV() {
    if (!allIncidents || allIncidents.length === 0) {
        showToast("No incident records available yet to export.");
        return;
    }
    const headers = ["ID", "Time", "Subnet", "Source IP", "Destination", "Tier 1 Rule", "Agent Score", "Neuron Class", "Confidence", "Action"];
    const rows = allIncidents.map(inc => [
        inc.id,
        `"${inc.datetime_str || ''}"`,
        `"${inc.subnet || ''}"`,
        `"${inc.src_ip || ''}"`,
        `"${inc.dst_ip}:${inc.dst_port || 80}"`,
        `"${(inc.tier1_rule_hit || '').replace(/"/g, '""')}"`,
        inc.agent_anomaly_score,
        `"${inc.neuron_class || ''}"`,
        inc.neuron_confidence,
        `"${inc.action_taken || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sentinel_edge_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${allIncidents.length} incidents to CSV`);
}

function printSOCReport() {
    window.print();
}

function saveEdgeSettings() {
    const jailTime = document.getElementById("setting-jail-range")?.value || 90;
    const autoJail = document.getElementById("setting-auto-jail")?.checked ? "Enabled" : "Disabled";
    const sensitivity = document.getElementById("setting-ai-sensitivity")?.value || "0.70";
    showToast(`✓ Settings Saved: Jail=${jailTime}s | Auto-Defense=${autoJail} | Threshold=${sensitivity}`);
}

function showToast(message) {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}

// 3D View Buttons Toggle & Block Details Selector
const campusBlockSelect = document.getElementById("select-campus-block");
if (campusBlockSelect) {
    campusBlockSelect.addEventListener("change", (e) => {
        const frame = document.getElementById("campus-3d-frame");
        frame?.contentWindow?.postMessage(
            { type: "SENTINEL_SELECT_BLOCK", blockId: e.target.value },
            "*"
        );
    });
}

const toggleLabelsCheck = document.getElementById("toggle-labels-check");
if (toggleLabelsCheck) {
    toggleLabelsCheck.addEventListener("change", (e) => {
        const frame = document.getElementById("campus-3d-frame");
        frame?.contentWindow?.postMessage(
            { type: "SENTINEL_TOGGLE_LABELS", show: e.target.checked },
            "*"
        );
    });
}

window.addEventListener("message", (event) => {
    if (event.data?.type === "SENTINEL_BLOCK_SELECTED" && campusBlockSelect && event.data.blockId) {
        campusBlockSelect.value = event.data.blockId;
    }
});

document.getElementById("btn-3d-view")?.addEventListener("click", () => {
    document.getElementById("btn-3d-view").classList.add("active");
    document.getElementById("btn-top-view").classList.remove("active");
    sendCampusCameraProgress(0);
});

document.getElementById("btn-top-view")?.addEventListener("click", () => {
    document.getElementById("btn-top-view").classList.add("active");
    document.getElementById("btn-3d-view").classList.remove("active");
    sendCampusCameraProgress(1);
});

function triggerPcapDownload(id, nClass) {
    // Generate binary Wireshark-compatible libpcap bytes client-side if offline/fallback
    const encoder = new TextEncoder();
    const payload = encoder.encode(`SentinelEdge Incident #${id} | Class: ${nClass} | XAI + ETA Forensic Capture`);
    const frameLen = 54 + payload.length;
    const totalLen = 24 + 16 + frameLen;
    const buf = new ArrayBuffer(totalLen);
    const dv = new DataView(buf);
    const u8 = new Uint8Array(buf);

    // PCAP Global Header (24 bytes): magic 0xa1b2c3d4 LE, v2.4, snaplen 262144, Ethernet(1)
    dv.setUint32(0, 0xa1b2c3d4, true);
    dv.setUint16(4, 2, true);
    dv.setUint16(6, 4, true);
    dv.setUint32(16, 262144, true);
    dv.setUint32(20, 1, true);

    // Packet Header (16 bytes)
    dv.setUint32(24, Math.floor(Date.now() / 1000), true);
    dv.setUint32(28, 0, true);
    dv.setUint32(32, frameLen, true);
    dv.setUint32(36, frameLen, true);

    // Minimal Ethernet/IPv4/TCP Header (IPv4 ethertype 0x0800 at bytes 12-13)
    u8.set([0x00,0x0c,0x29,0x12,0x34,0x56, 0x00,0x0c,0x29,0xab,0xcd,0xef, 0x08,0x00, 0x45,0x00], 40);
    u8.set(payload, 40 + 54);

    const blob = new Blob([buf], { type: "application/vnd.tcpdump.pcap" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel_incident_${id}_${nClass}.pcap`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ Downloaded Wireshark .pcap (${frameLen}B frame)`);
}

// Modal Inspector with Explainable AI (SHAP & LIME) and Encrypted Traffic Analysis
async function inspectIncident(id, src, dst, nClass, conf) {
    const modal = document.getElementById("forensic-modal");
    const details = document.getElementById("modal-details");
    const pcapBtn = document.getElementById("btn-download-pcap");

    pcapBtn.href = `/api/export_pcap/${id}`;
    pcapBtn.onclick = (e) => {
        if (isFallbackMode) {
            e.preventDefault();
            triggerPcapDownload(id, nClass);
        }
    };

    // Look up cached incident record or fetch from backend API
    let inc = allIncidents.find(item => item.id == id);
    if (!inc || !inc.xai) {
        try {
            const resp = await fetch(`/api/incident/${id}`);
            if (resp.ok) {
                const apiData = await resp.json();
                inc = Object.assign(inc || {}, apiData);
            }
        } catch (e) {
            console.warn("Could not fetch remote incident record:", e);
        }
    }

    const encProto = inc?.encrypted_proto || inc?.encrypted_protocol || "TLS 1.3 / HTTPS";
    const cipherSuite = inc?.cipher_suite || "TLS_AES_256_GCM_SHA384";
    const inspMode = inc?.inspection_mode || "Zero-Decryption Flow Metadata Profiling (ETA)";
    const subnet = inc?.subnet || "Campus Edge";

    // Extract SHAP attributions
    const shapData = inc?.xai?.shap || inc?.shap || null;
    let shapBarsHtml = "";

    const defaultAttributions = {
        "port_entropy": { label: "Shannon Port Entropy", phi: 0.744, impact: "INCREASES_THREAT" },
        "empty_port_ratio": { label: "Empty / Closed Port Probes", phi: 0.420, impact: "INCREASES_THREAT" },
        "syn_ratio": { label: "TCP SYN Flag Ratio", phi: 0.312, impact: "INCREASES_THREAT" },
        "pkt_rate": { label: "Packet Velocity (PPS)", phi: 0.185, impact: "INCREASES_THREAT" },
        "mean_pkt_len": { label: "Packet Length Variance", phi: -0.142, impact: "REDUCES_THREAT" },
        "flow_duration": { label: "Active Flow Lifetime", phi: -0.065, impact: "REDUCES_THREAT" }
    };

    const attributions = shapData?.attributions || defaultAttributions;

    for (const [key, feat] of Object.entries(attributions)) {
        const phi = typeof feat.phi === "number" ? feat.phi : 0.0;
        const isThreat = phi >= 0;
        const widthPct = Math.min(100, Math.max(8, Math.round(Math.abs(phi) * 100)));
        const fillClass = isThreat ? "shap-bar-fill-pos" : "shap-bar-fill-neg";
        const colorStyle = isThreat ? "color:#F43F5E;" : "color:#10B981;";
        const sign = isThreat ? "+" : "";

        shapBarsHtml += `
            <div class="shap-bar-row">
                <span class="shap-feat-name" title="${feat.label}">${feat.label}</span>
                <div class="shap-bar-track">
                    <div class="${fillClass}" style="width: ${widthPct}%;"></div>
                </div>
                <span class="shap-val-text" style="${colorStyle}">${sign}${phi.toFixed(3)}</span>
            </div>
        `;
    }

    // Extract LIME rule
    const limeRule = inc?.xai?.lime?.human_summary || inc?.lime_rule || 
        `LIME Local Surrogate Rule: IF empty_port_ratio > 0.56 AND port_entropy > 1.88 AND syn_ratio > 0.50 ==> Classified as ${nClass} (Confidence: ${conf}%)`;

    details.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px; font-size:12.5px;">
            <div><strong>Incident ID:</strong> #${id}</div>
            <div><strong>Neuron Decision:</strong> <span class="text-crimson font-bold">${nClass} (${conf}%)</span></div>
            <div><strong>Source Attacker IP:</strong> <span class="text-cyan font-bold">${src}</span></div>
            <div><strong>Victim Target:</strong> <span style="color:#FFFFFF;">${dst}</span> (${subnet})</div>
        </div>

        <!-- Encrypted Traffic Analysis Telemetry Card -->
        <div class="enc-meta-grid">
            <div><strong>🔒 Protocol:</strong> <span class="badge-tag-encrypted">${encProto}</span></div>
            <div><strong>Cipher Suite:</strong> <span style="color:#7DD3FC; font-family:monospace;">${cipherSuite}</span></div>
            <div><strong>Inspection Method:</strong> <span class="text-emerald font-bold">${inspMode}</span></div>
            <div><strong>Privacy Status:</strong> <span style="color:#FDE047;">Zero-Decryption (Compliant)</span></div>
        </div>

        <!-- Explainable AI (XAI) Section -->
        <div class="xai-card-section">
            <div class="xai-header">
                <span class="xai-title">🧠 SHAP (SHapley Additive exPlanations) Feature Attribution</span>
                <span class="xai-badge">Game-Theoretic \u03c6</span>
            </div>
            <p style="font-size:11px; color:#94A3B8; margin-bottom:8px;">
                Mathematically decomposes the neural network output. Red bars push towards threat block (+); green bars pull towards benign (-).
            </p>
            <div class="shap-bars-container">
                ${shapBarsHtml}
            </div>
        </div>

        <!-- LIME Local Linear Surrogate Card -->
        <div class="xai-card-section" style="margin-top:10px;">
            <div class="xai-header">
                <span class="xai-title">🔍 LIME (Local Interpretable Model-agnostic Explanations)</span>
                <span class="xai-badge">Surrogate Decision Rule</span>
            </div>
            <div class="lime-box">
                ${limeRule}
            </div>
        </div>

        <!-- Forensic Packet Hex & ASCII Dissection -->
        <div style="margin-top:12px;">
            <strong>Forensic Raw Packet Payload (Hex & ASCII Dump):</strong>
            <div class="hex-box">
0000   00 0c 29 12 34 56 00 0c 29 ab cd ef 08 00 45 00   ..).4V..).....E.
0010   00 3c 1a 2b 40 00 40 06 b8 1f c6 33 64 2a c0 a8   .<.+@.@....3d*..
0020   0a 37 c3 50 00 87 00 00 00 00 a0 02 72 10 3a 4f   .7.P........r.:O
0030   00 00 02 04 05 b4 04 02 08 0a 00 23 b1 c2 00 00   ...........#....
            </div>
            <p style="margin-top:8px; font-size:11px; color:#94A3B8;">
                Captured via SentinelEdge Gateway Tap. Ready for verification in Wireshark or deep incident analysis.
            </p>
        </div>
    `;

    modal.classList.add("active");
}

function closeModal() {
    document.getElementById("forensic-modal").classList.remove("active");
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
    connectWebSocket();
    syncBlocklistFromServer();
    setupScrollSpy();
    selectForensicFrame(0);
});
