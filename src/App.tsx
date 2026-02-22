// --- APP.TSX : WAN$ V9.4 SENTINEL SOVEREIGN ---

import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const BRIDGE_URL = "https://expression-vernon-judgment-freight.trycloudflare.com";

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("USDJPY=X");
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('wan_history_v94');
    return saved ? JSON.parse(saved) : [];
  });

  const scanMarket = async (pair: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      setReport(res.data);

      const updatedHistory = [{ 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        ticker: pair, cvc: res.data.scorecard.conviction, kssi: res.data.scorecard.kenya_stress
      }, ...history].slice(0, 5);

      setHistory(updatedHistory);
      localStorage.setItem('wan_history_v94', JSON.stringify(updatedHistory));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const copyForAudit = () => {
    if (!report) return;
    const { regime, conviction, completeness, alignment, kenya_stress } = report.scorecard;
    const text = `SENTINEL_V9.4_SOVEREIGN_AUDIT:
TICKER: ${target} | REGIME: ${regime}
CVC: ${conviction}/4 | K-SSI: ${kenya_stress}/4
INTEGRITY: ${completeness}% | ALIGNMENT: ${alignment}%
VIX: ${report.metrics.vix} | CURVE: ${report.metrics.curve}bps

[MANDATE]
Red-Team this divergence. Cross-reference G7 structure against the EM (Kenya) Stress Index.`;
    navigator.clipboard.writeText(text);
    WebApp.HapticFeedback.notificationOccurred('success');
    alert("V9.4 Sovereign Audit Copied.");
  };

  const regimeColor = (regime: string) => {
    if (regime === "SYSTEMIC_STRESS") return "#ff0033";
    if (regime === "POSITIONING_FRICTION") return "#ffaa00";
    if (regime === "GROWTH_EXPANSION") return "#00ff41";
    return "#888";
  };

  const renderConviction = (cvc: number) => {
    const color = cvc >= 3 ? '#00ff41' : (cvc === 0 ? '#333' : '#ffaa00');
    return [0, 1, 2, 3].map(i => (
      <span key={i} style={{ display: 'inline-block', width: '20px', height: '8px', backgroundColor: i < cvc ? color : '#222', marginRight: '4px', borderRadius: '1px' }}></span>
    ));
  };

  useEffect(() => {
    WebApp.ready(); WebApp.expand();
    scanMarket(target);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#00ff41', letterSpacing: '1px' }}>WAN$ SENTINEL V9.4</h2>
        <small style={{ color: '#444' }}>SOVEREIGN MOS ACTIVE</small>
      </header>

      {loading ? ( <p style={{ textAlign: 'center', color: '#00ff41' }}>[ COMPILING SOVEREIGN MATRIX... ]</p>
      ) : report && (
        <main>
          <div style={{ padding: '15px', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#0a0a0a', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: regimeColor(report.scorecard.regime) }}>{report.scorecard.regime}</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>GLOBAL CVC:</span>
              <div>{renderConviction(report.scorecard.conviction)}</div>
            </div>

            {/* V9.4 EM SOVEREIGN LAYER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #333' }}>
              <span style={{ color: '#888' }}>KENYA EM STRESS (K-SSI):</span>
              <span style={{ color: report.scorecard.kenya_stress >= 3 ? '#ff0033' : (report.scorecard.kenya_stress > 0 ? '#ffaa00' : '#00ff41'), fontWeight: 'bold' }}>
                {report.scorecard.kenya_stress}/4
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginTop: '15px' }}>
              <span>INTEGRITY: {report.scorecard.completeness}%</span>
              <span>ALIGNMENT: {report.scorecard.alignment}%</span>
            </div>
          </div>

          <div style={{ padding: '15px', background: '#111', borderLeft: `4px solid ${regimeColor(report.scorecard.regime)}` }}>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{report.analysis.replace('ALPHA:', '').trim()}</p>
          </div>
        </main>
      )}

      {/* RESTORED V9.3 LOGS */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '10px' }}>
        <small style={{ color: '#444' }}>SOVEREIGN LOGS</small>
        {history.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', padding: '5px 0' }}>
            <span>{h.timestamp}</span><span>{h.ticker}</span>
            <span style={{ color: h.cvc >= 3 ? '#00ff41' : '#ffaa00' }}>CVC: {h.cvc} | K-SSI: {h.kssi}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <input value={target} onChange={(e) => setTarget(e.target.value.toUpperCase())} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #333', textAlign: 'center', marginBottom: '10px' }} />
        <button onClick={copyForAudit} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #00ff41', fontWeight: 'bold', marginBottom: '10px' }}>COPY FOR RED-TEAM</button>
        <button onClick={() => scanMarket(target)} style={{ width: '100%', padding: '15px', backgroundColor: '#00ff41', color: '#000', border: 'none', fontWeight: 'bold' }}>SCAN {target}</button>
      </div>
    </div>
  );
}

export default App;