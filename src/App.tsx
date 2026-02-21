import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const BRIDGE_URL = "https://expression-vernon-judgment-freight.trycloudflare.com";

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("USDJPY=X");
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('wan_history');
    return saved ? JSON.parse(saved) : [];
  });

  const parseData = (text: string, tag: string) => {
    if (!text) return "N/A";
    const regex = new RegExp(`${tag}:?\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].split('\n')[0].trim() : "N/A";
  };

  const scanMarket = async (pair: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      setReport(res.data);

      const updatedHistory = [
        { 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          ticker: pair,
          regime: res.data.engine.deterministic_regime,
          confidence: res.data.engine.confidence
        },
        ...history
      ].slice(0, 5);

      setHistory(updatedHistory);
      localStorage.setItem('wan_history', JSON.stringify(updatedHistory));
    } catch (e) { 
      console.error("Bridge Error:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  const copyForConsult = () => {
    if (!report) return;
    const text = `SENTINEL_V9.2_REPORT:
TICKER: ${target}
REGIME: ${report.engine.deterministic_regime}
CONFIDENCE: ${report.engine.confidence}/100
PAIR_VOL_SENSITIVITY: ${report.engine.multiplier}x
STANCE: ${report.metrics.stance}
PRC: ${report.metrics.price} | VIX: ${report.metrics.vix}

[SYSTEM_CONSTRAINTS]
1. Do not forecast.
2. Counter-thesis must challenge structural assumptions only.
3. Use only provided macro variables.
4. If Confidence < 75, assume data is noisy.

PROMPT: Provide a 3-point institutional-grade counter-thesis for this classification.`;
    
    navigator.clipboard.writeText(text);
    WebApp.HapticFeedback.notificationOccurred('success');
    alert("V9.2 Red-Team constraints staged for GPT.");
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    scanMarket(target);
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#00ff41', letterSpacing: '1px' }}>WAN$ SENTINEL V9.2</h2>
        <small style={{ color: '#666' }}>MOS: INSTITUTIONAL GRADE</small>
      </header>

      <div style={{ flex: 1 }}>
        {loading ? (
          <p style={{ marginTop: '40px', textAlign: 'center', color: '#00ff41' }}>[ EXECUTING DETERMINISTIC SCAN... ]</p>
        ) : report ? (
          <main style={{ marginTop: '20px' }}>
            {/* V9.2 REGIME & CONFIDENCE UI */}
            <div style={{ padding: '15px', border: report.engine.confidence >= 75 ? '1px solid #00ff41' : '1px solid #ffaa00', borderRadius: '4px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: report.engine.confidence >= 75 ? '#00ff41' : '#ffaa00' }}>
                  {report.engine.deterministic_regime}
                </h4>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#111', padding: '4px 8px', borderRadius: '4px' }}>
                  CFD: {report.engine.confidence}%
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                <b>VOL MULTIPLIER:</b> {report.engine.multiplier}x | <b>STANCE:</b> {report.metrics.stance}
              </p>
            </div>

            <div style={{ background: '#111', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #00ff41' }}>
              <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>{parseData(report.data, "ALPHA")}</p>
            </div>

            <footer style={{ marginTop: '20px', fontSize: '0.8rem', color: '#444' }}>
              PX: {report.metrics.price} | VIX: {report.metrics.vix} | REAL_R: 1.0%
            </footer>
          </main>
        ) : null}

        {/* LOGS SECTION */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #222', paddingTop: '15px' }}>
          <small style={{ color: '#666', letterSpacing: '2px' }}>V9.2 DETERMINISTIC LOGS</small>
          {history.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', padding: '8px 0', borderBottom: '1px solid #111' }}>
              <span style={{ color: '#444' }}>{item.timestamp}</span>
              <span style={{ color: '#888' }}>{item.ticker}</span>
              <span style={{ color: item.confidence >= 75 ? '#00ff41' : '#ffaa00' }}>{item.regime} ({item.confidence}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
        <input 
          value={target}
          onChange={(e) => setTarget(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '15px', marginBottom: '10px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #333', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace' }}
          placeholder="ENTER TICKER"
        />
        <button onClick={copyForConsult} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #00ff41', fontWeight: 'bold' }}>
          COPY RED-TEAM PAYLOAD
        </button>
        <button onClick={() => scanMarket(target)} style={{ width: '100%', padding: '15px', marginTop: '10px', backgroundColor: '#00ff41', color: '#000', border: 'none', fontWeight: 'bold' }}>
          SCAN {target}
        </button>
      </div>
    </div>
  );
}

export default App;