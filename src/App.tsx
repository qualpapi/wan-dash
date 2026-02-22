// --- APP.TSX : WAN$ V9.4 ---

import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const BRIDGE_URL = "YOUR_CLOUDFLARE_URL";

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("USDJPY=X");

  const scanMarket = async (pair: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      setReport(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const regimeColor = (regime: string) => {
    if (regime === "SYSTEMIC_STRESS") return "#ff0033";
    if (regime === "POSITIONING_FRICTION") return "#ffaa00";
    if (regime === "GROWTH_EXPANSION") return "#00ff41";
    return "#666";
  };

  const convictionColor = (cvc: number) => {
    if (cvc >= 3) return "#00ff41";
    if (cvc === 2) return "#ffaa00";
    return "#666";
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    scanMarket(target);
  }, []);

  return (
    <div style={{ padding: 20, background: "#000", color: "#fff", fontFamily: "monospace", minHeight: "100vh" }}>
      
      <h2 style={{ color: "#00ff41" }}>WAN$ V9.4 — SENTINEL SOVEREIGN</h2>

      {loading ? <p>SCANNING MACRO MATRIX...</p> : report && (
        <>
          <div style={{ border: "1px solid #333", padding: 15, marginBottom: 15 }}>
            <h3 style={{ color: regimeColor(report.scorecard.regime) }}>
              {report.scorecard.regime}
            </h3>

            <p style={{ color: convictionColor(report.scorecard.conviction) }}>
              CONVICTION: {report.scorecard.conviction}/4
            </p>

            <p>INTEGRITY: {report.scorecard.completeness}%</p>
            <p>ALIGNMENT: {report.scorecard.alignment}%</p>

            <p style={{ color: report.scorecard.kenya_stress >= 3 ? "#ff0033" : "#888" }}>
              KENYA SOVEREIGN STRESS: {report.scorecard.kenya_stress}/4
            </p>
          </div>

          <div style={{ borderLeft: `4px solid ${regimeColor(report.scorecard.regime)}`, padding: 15 }}>
            <p>{report.analysis}</p>
          </div>
        </>
      )}

      <input
        value={target}
        onChange={(e) => setTarget(e.target.value.toUpperCase())}
        style={{ width: "100%", marginTop: 20, padding: 10, background: "#111", color: "#00ff41", border: "1px solid #333" }}
      />

      <button
        onClick={() => scanMarket(target)}
        style={{ width: "100%", padding: 15, marginTop: 10, background: "#00ff41", color: "#000", fontWeight: "bold" }}
      >
        SCAN
      </button>
    </div>
  );
}

export default App;