import os
import sys
import json
import time
import tempfile
import numpy as np

sys.path.insert(0, os.path.abspath("."))
from sentinel_core import SentinelEdgeCore
from simulation.traffic_generator import ContinuousTrafficGenerator
from tier3_neurons.neurons import CLASSES
from tier3_neurons.xai_explainer import FEATURE_NAMES, FEATURE_HUMAN_LABELS
from tier4_response.database import IncidentDatabase
from tier4_response.response_engine import AutonomousResponseEngine

def eval_mlp():
    core = SentinelEdgeCore()
    
    def make_dataset(seed, noise_std=0.0):
        np.random.seed(seed)
        X, y = [], []
        n = 200
        for c in range(5):
            for _ in range(n):
                if c == 0:
                    v = [np.random.uniform(0.01,0.1), np.random.uniform(0.01,0.2), np.random.uniform(0.01,0.05), np.random.uniform(0.0,0.05), np.random.uniform(0.0,0.2), np.random.uniform(0.1,0.6), np.random.uniform(0.0,0.2), np.random.uniform(0.02,0.15), 0.0, np.random.uniform(0.1,0.8)]
                elif c == 1:
                    v = [np.random.uniform(0.5,1.0), np.random.uniform(0.6,1.2), np.random.uniform(0.001,0.02), 0.0, 0.0, np.random.uniform(0.7,1.0), np.random.uniform(0.01,0.05), np.random.uniform(0.05,0.2), 0.0, np.random.uniform(0.2,0.9)]
                elif c == 2:
                    v = [np.random.uniform(0.1,0.4), np.random.uniform(0.01,0.05), np.random.uniform(0.4,0.95), np.random.uniform(0.6,1.0), np.random.uniform(1.5,3.5), np.random.uniform(0.02,0.08), np.random.uniform(0.7,1.0), np.random.uniform(0.7,0.98), 1.0, np.random.uniform(0.05,0.3)]
                elif c == 3:
                    v = [np.random.uniform(0.8,1.5), np.random.uniform(0.1,0.3), np.random.uniform(0.01,0.1), np.random.uniform(0.0,0.2), np.random.uniform(0.0,0.5), np.random.uniform(0.02,0.06), np.random.uniform(0.9,1.0), np.random.uniform(0.8,1.0), 1.0, np.random.uniform(0.01,0.2)]
                else:
                    v = [np.random.uniform(0.02,0.15), np.random.uniform(0.05,0.2), np.random.uniform(0.01,0.05), np.random.uniform(0.0,0.1), 0.0, np.random.uniform(0.3,0.8), np.random.uniform(0.1,0.3), np.random.uniform(0.85,0.99), 1.0, np.random.uniform(0.1,0.5)]
                v = np.array(v, dtype=np.float32)
                if noise_std > 0:
                    v = np.clip(v + np.random.normal(0, noise_std, size=10), 0.0, 4.0)
                    v[8] = 1.0 if v[8] >= 0.5 else 0.0
                X.append(v)
                y.append(c)
        return np.array(X, dtype=np.float32), np.array(y, dtype=int)

    # 1. Standard Held-Out Test (seed=999, clean distribution)
    X_clean, y_clean = make_dataset(999, noise_std=0.0)
    cm_clean = np.zeros((5, 5), dtype=int)
    t_inf = []
    for vec, ty in zip(X_clean, y_clean):
        t0 = time.perf_counter()
        p = core.t3_neurons._forward_vector(vec)
        t_inf.append((time.perf_counter() - t0) * 1e6)
        cm_clean[ty, int(np.argmax(p))] += 1

    # 2. Boundary-Stress Noisy Test (seed=2026, sigma=0.18 noise)
    X_noisy, y_noisy = make_dataset(2026, noise_std=0.18)
    cm_noisy = np.zeros((5, 5), dtype=int)
    probs_noisy = []
    for vec, ty in zip(X_noisy, y_noisy):
        p = core.t3_neurons._forward_vector(vec)
        probs_noisy.append(p.tolist())
        cm_noisy[ty, int(np.argmax(p))] += 1

    # 3. Global Mean |SHAP| across 100 balanced samples (20 per class from clean test)
    shap_abs_sums = {fn: [] for fn in FEATURE_NAMES}
    for cls_idx in range(5):
        idxs = np.where(y_clean == cls_idx)[0][:20]
        for idx in idxs:
            res_s = core.t3_neurons.explainer.compute_shap_values(X_clean[idx], core.t3_neurons._forward_vector, target_class_idx=cls_idx)
            for fn, info in res_s["attributions"].items():
                shap_abs_sums[fn].append(abs(info["phi"]))
    global_shap = {fn: round(float(np.mean(vals)), 4) for fn, vals in shap_abs_sums.items()}

    # 4. End-to-End Pipeline Run with isolated temp DB
    tmp_db = os.path.join(tempfile.gettempdir(), "sentinel_bench_temp.db")
    for ext in ("", "-wal", "-shm"):
        if os.path.exists(tmp_db + ext):
            os.remove(tmp_db + ext)
    core.db = IncidentDatabase(tmp_db)
    core.t4_response = AutonomousResponseEngine(core.db)
    gen = ContinuousTrafficGenerator()

    lat_t1, lat_t2, lat_t3_xai, lat_t4_pass, lat_t4_block, lat_early = [], [], [], [], [], []
    entropy_heavy, entropy_scan = [], []
    samples = {}

    # Normal flows
    for _ in range(100):
        res = core.process_packet(gen.generate_normal_packet())
        lat_t1.append(res["tier1"]["latency_us"])
        lat_t2.append(res["agent"]["latency_us"])
        lat_t3_xai.append(res["neurons"]["latency_us"])
        lat_t4_pass.append(res["decision"]["latency_us"])
        time.sleep(0.002)

    # Genuine heavy transfer burst (same flow, single port 443, full 1460B MTU)
    for i in range(40):
        pkt = gen.generate_heavy_transfer_packet()
        res = core.process_packet(pkt)
        entropy_heavy.append(res["agent"]["features"]["port_entropy"])
        lat_t1.append(res["tier1"]["latency_us"])
        lat_t2.append(res["agent"]["latency_us"])
        lat_t3_xai.append(res["neurons"]["latency_us"])
        if i == 39:
            samples["BENIGN_HEAVY_TRANSFER"] = {
                "action": res["decision"]["action"],
                "class": res["neurons"]["neuron_class"],
                "features": res["agent"]["features"],
                "shap": res["neurons"]["xai"]["shap"],
                "lime": res["neurons"]["xai"]["lime"]
            }
        time.sleep(0.003)

    # Port scan probes (use dedicated attacker IP so flow starts clean)
    for idx_p, port in enumerate([21, 23, 25, 69, 110, 135, 139, 445, 1433, 3306]):
        pkt = gen.generate_port_scan_packet()
        pkt["src_ip"] = "198.51.100.77"
        pkt["dst_port"] = port
        res = core.process_packet(pkt)
        if res["decision"].get("is_active_ban"):
            lat_early.append(res["total_latency_ms"] * 1000.0)
        else:
            if res["agent"].get("features"):
                entropy_scan.append(res["agent"]["features"]["port_entropy"])
            if res["neurons"].get("xai"):
                if res["neurons"]["neuron_class"] == "PORT_SCAN":
                    samples["PORT_SCAN"] = {
                        "action": res["decision"]["action"],
                        "class": res["neurons"]["neuron_class"],
                        "confidence": res["neurons"]["neuron_confidence"],
                        "features": res["agent"]["features"],
                        "shap": res["neurons"]["xai"]["shap"],
                        "lime": res["neurons"]["xai"]["lime"]
                    }
                    lat_t4_block.append(res["decision"]["latency_us"])
        time.sleep(0.005)

    # Realistic Exploit Flow: 1st benign TCP handshake + 0.2s wait + Exploit payload on packet 2
    gen_exploit_ip = "203.0.113.120"
    pkt_hs = {
        "src_ip": gen_exploit_ip, "dst_ip": "10.0.0.5", "src_port": 51200,
        "dst_port": 443, "protocol": "TCP", "flags": "SA", "packet_len": 64,
        "payload": "", "subnet": "External_WAN", "sim_type": "NORMAL_TRAFFIC",
        "is_encrypted": True, "encrypted_protocol": "TLS 1.3 / HTTPS",
        "cipher_suite": "TLS_AES_256_GCM_SHA384", "inspection_mode": "Zero-Decryption Flow Metadata Profiling"
    }
    core.process_packet(pkt_hs)
    time.sleep(0.25)
    pkt_exp = gen.generate_exploit_packet()
    pkt_exp["src_ip"] = gen_exploit_ip
    res_exp = core.process_packet(pkt_exp)
    if res_exp["neurons"].get("xai"):
        samples["MALICIOUS_PAYLOAD"] = {
            "action": res_exp["decision"]["action"],
            "class": res_exp["neurons"]["neuron_class"],
            "confidence": res_exp["neurons"]["neuron_confidence"],
            "tier1_msg": res_exp["tier1"]["msg"],
            "features": res_exp["agent"]["features"],
            "shap": res_exp["neurons"]["xai"]["shap"],
            "lime": res_exp["neurons"]["xai"]["lime"]
        }
    # Also test a genuine DoS SYN flood burst (36 rapid SYNs to port 80)
    dos_ip = "198.51.100.201"
    for idx_d in range(36):
        pkt_dos = {
            "src_ip": dos_ip, "dst_ip": "10.0.0.5", "src_port": 40000 + idx_d,
            "dst_port": 80, "protocol": "TCP", "flags": "S", "packet_len": 54,
            "payload": "", "subnet": "External_WAN", "sim_type": "DOS_SYN_FLOOD",
            "is_encrypted": False, "encrypted_protocol": "TCP Raw SYN",
            "cipher_suite": "None", "inspection_mode": "Zero-Decryption Flow Metadata Profiling"
        }
        res_dos = core.process_packet(pkt_dos)
        if res_dos["neurons"].get("xai") and res_dos["neurons"]["neuron_class"] == "DOS_SYN_FLOOD":
            samples["DOS_SYN_FLOOD"] = {
                "action": res_dos["decision"]["action"],
                "class": res_dos["neurons"]["neuron_class"],
                "confidence": res_dos["neurons"]["neuron_confidence"],
                "tier1_msg": res_dos["tier1"]["msg"],
                "features": res_dos["agent"]["features"],
                "shap": res_dos["neurons"]["xai"]["shap"],
                "lime": res_dos["neurons"]["xai"]["lime"]
            }
        time.sleep(0.001)

    telem = core.get_system_telemetry()
    out = {
        "classes": CLASSES,
        "feature_names": FEATURE_NAMES,
        "feature_labels": FEATURE_HUMAN_LABELS,
        "clean_cm": cm_clean.tolist(),
        "clean_accuracy_pct": round(float(np.trace(cm_clean) / np.sum(cm_clean) * 100), 2),
        "noisy_cm": cm_noisy.tolist(),
        "noisy_accuracy_pct": round(float(np.trace(cm_noisy) / np.sum(cm_noisy) * 100), 2),
        "noisy_probs": probs_noisy,
        "noisy_y": y_noisy.tolist(),
        "mlp_only_inference_us": round(float(np.mean(t_inf)), 2),
        "global_mean_abs_shap": global_shap,
        "latencies_us": {
            "tier1_mean": round(float(np.mean(lat_t1)), 2),
            "tier2_mean": round(float(np.mean(lat_t2)), 2),
            "tier3_mlp_xai_mean": round(float(np.mean(lat_t3_xai)), 2),
            "tier4_forward_mean": round(float(np.mean(lat_t4_pass)), 2),
            "tier4_db_block_mean": round(float(np.mean(lat_t4_block)) if lat_t4_block else 0.0, 2),
            "early_wire_drop_mean": round(float(np.mean(lat_early)) if lat_early else 0.0, 2),
        },
        "entropy_heavy_max": round(float(max(entropy_heavy)), 3),
        "entropy_scan_progression": [round(float(x), 3) for x in entropy_scan],
        "telemetry": telem,
        "samples": samples
    }

    with open("eval_metrics.json", "w") as f:
        json.dump(out, f, indent=2)
    print("Saved eval_metrics.json successfully!")
    print("Clean Acc:", out["clean_accuracy_pct"], "% | Noisy Acc (sigma=0.18):", out["noisy_accuracy_pct"], "%")
    print("Latencies (us):", out["latencies_us"])
    print("MLP forward only (us):", out["mlp_only_inference_us"])
    print("Global SHAP:", out["global_mean_abs_shap"])

if __name__ == "__main__":
    eval_mlp()
