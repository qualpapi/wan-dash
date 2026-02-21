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

  const scanMarket = async (pair: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      setReport(res.data);

      const updatedHistory = [
        { 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          ticker: pair,
          regime: res.data.scorecard.regime,
          cvc: res.data.scorecard.conviction
        },
        ...history
      ].slice(0, 5);

      setHistory(updatedHistory);
      localStorage.setItem('wan_history', JSON.stringify(updatedHistory));
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const copyForConsult = () => {
    if (!report) return;
    const { regime, conviction, completeness, alignment } = report.scorecard;
    const text = `SENTINEL_V9.3_SCORECARD:
TICKER: ${target}
REGIME: ${regime}
CONVICTION: ${conviction}/4
COMPLETENESS: ${completeness}% | ALIGNMENT: ${alignment}%
VIX: ${report.metrics.vix} | CURVE: ${report.metrics.curve}bps

[CONSTRAINTS]
1. Do not forecast.
2. Validate the conviction score based on the data provided.
PROMPT: Provide a Red-Team audit of this specific pair's macro alignment.`;
    
    navigator.clipboard.writeText(text);
    WebApp.HapticFeedback.notificationOccurred('success');
    alert("V9.3 Scorecard copied for GPT.");
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    scanMarket(target);
  }, []);

  // Visual Conviction Blocks (0-4)
  const renderConviction = (cvc: number) => {
    const blocks = [];
    for (let i = 0; i < 4; i++) {
      blocks.push(
        <span key={i} style={{ 
          display: 'inline-block', width: '20px', height: '8px', 
          backgroundColor: i < cvc ? (cvc >= 3 ? '#ff0055' : '#00ff41') : '#333', 
          marginRight: '4px', borderRadius: '1px' 
        }}></span>
      );
    }
    return blocks;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#00ff41', letterSpacing: '1px' }}>WAN$ SENTINEL V9.3</h2>
        <small style={{ color: '#666' }}>MOS: SCORECARD ACTIVE</small>
      </header>

      <div style={{ flex: 1 }}>
        {loading ? (
          <p style={{ marginTop: '40px', textAlign: 'center', color: '#00ff41' }}>[ RUNNING CONVICTION MATH... ]</p>
        ) : report ? (
          <main style={{ marginTop: '20px' }}>
            {/* THE V9.3 SCORECARD */}
            <div style={{ padding: '15px', border: '1px solid #333', borderRadius: '4px', marginBottom: '15px', backgroundColor: '#0a0a0a' }}>
              <h4 style={{ margin: '0 0 10px 0', color: report.scorecard.regime.includes('UNCERTAINTY') ? '#ffaa00' : '#00ff41' }}>
                {report.scorecard.regime}
              </h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>CONVICTION:</span>
                <div>{renderConviction(report.scorecard.conviction)}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                <span>DATA INTEGRITY: {report.scorecard.completeness}%</span>
                <span>ALIGNMENT: {report.scorecard.alignment}%</span>
              </div>
            </div>

            <div style={{ background: '#111', padding: '15px', borderRadius: '4px', borderLeft: report.scorecard.conviction >= 3 ? '4px solid #ff0055' : '4px solid #00ff41' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                {report.data.replace('ALPHA:', '').trim()}
              </p>
            </div>

            <footer style={{ marginTop: '15px', fontSize: '0.75rem', color: '#444', display: 'flex', justifyContent: 'space-between' }}>
              <span>VIX: {report.metrics.vix}</span>
              <span>CURVE: {report.metrics.curve}bps</span>
            </footer>
          </main>
        ) : null}

        {/* LOGS SECTION */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #222', paddingTop: '15px' }}>
          <small style={{ color: '#666', letterSpacing: '2px' }}>CONVICTION LOGS</small>
          {history.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', padding: '8px 0', borderBottom: '1px solid #111' }}>
              <span style={{ color: '#444' }}>{item.timestamp}</span>
              <span style={{ color: '#888' }}>{item.ticker}</span>
              <span style={{ color: item.cvc >= 3 ? '#ff0055' : '#00ff41' }}>CVC: {item.cvc}/4</span>
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
          COPY SCORECARD FOR AUDIT
        </button>
        <button onClick={() => scanMarket(target)} style={{ width: '100%', padding: '15px', marginTop: '10px', backgroundColor: '#00ff41', color: '#000', border: 'none', fontWeight: 'bold' }}>
          SCAN {target}
        </button>
      </div>
    </div>
  );
}

export default App;