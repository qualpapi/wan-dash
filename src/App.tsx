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
      const updatedHistory = [{ 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        ticker: pair, cvc: res.data.scorecard.conviction
      }, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('wan_history', JSON.stringify(updatedHistory));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const copyForAudit = () => {
    if (!report) return;
    const { regime, conviction, completeness, alignment } = report.scorecard;
    const text = `SENTINEL_V9.3_AUDIT:
TICKER: ${target} | REGIME: ${regime}
CVC: ${conviction}/4 | INTEGRITY: ${completeness}% | ALIGNMENT: ${alignment}%
VIX: ${report.metrics.vix} | CURVE: ${report.metrics.curve}bps`;
    navigator.clipboard.writeText(text);
    WebApp.HapticFeedback.notificationOccurred('success');
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
        <h2 style={{ margin: 0, color: '#00ff41' }}>WAN$ SENTINEL V9.3</h2>
        <small style={{ color: '#444' }}>INSTITUTIONAL MOS ACTIVE</small>
      </header>

      {loading ? ( <p style={{ textAlign: 'center', color: '#00ff41' }}>[ CALCULATING MACRO VECTOR... ]</p>
      ) : report && (
        <main>
          <div style={{ padding: '15px', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#0a0a0a', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: report.scorecard.conviction >= 3 ? '#00ff41' : '#ffaa00' }}>{report.scorecard.regime}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>CONVICTION:</span>
              <div>{renderConviction(report.scorecard.conviction)}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
              <span>INTEGRITY: {report.scorecard.completeness}%</span>
              <span>ALIGNMENT: {report.scorecard.alignment}%</span>
            </div>
          </div>

          <div style={{ padding: '15px', background: '#111', borderLeft: `4px solid ${report.scorecard.conviction >= 3 ? '#00ff41' : '#ffaa00'}` }}>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>{report.data.trim()}</p>
          </div>
        </main>
      )}

      <div style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '10px' }}>
        <small style={{ color: '#444' }}>CONVICTION LOGS</small>
        {history.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', padding: '5px 0' }}>
            <span>{h.timestamp}</span><span>{h.ticker}</span><span style={{ color: h.cvc >= 3 ? '#00ff41' : '#ffaa00' }}>CVC: {h.cvc}/4</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <input value={target} onChange={(e) => setTarget(e.target.value.toUpperCase())} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #333', textAlign: 'center', marginBottom: '10px' }} />
        <button onClick={copyForAudit} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #00ff41', fontWeight: 'bold', marginBottom: '10px' }}>COPY SCORECARD</button>
        <button onClick={() => scanMarket(target)} style={{ width: '100%', padding: '15px', backgroundColor: '#00ff41', color: '#000', border: 'none', fontWeight: 'bold' }}>SCAN {target}</button>
      </div>
    </div>
  );
}

export default App;