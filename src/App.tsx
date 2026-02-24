// --- APP.TSX : WAN$ V9.4 SENTINEL SOVEREIGN ---
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

// IMPORTANT: Update this every time you restart your Cloudflare Tunnel!
const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL;

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState("USDJPY=X");
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('wan_v94_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const scanMarket = async (pair: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      setReport(res.data);

      const log = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticker: pair,
        cvc: res.data.scorecard.cvc,
        kssi: res.data.scorecard.k_ssi,
      };

      const newHistory = [log, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('wan_v94_logs', JSON.stringify(newHistory));
    } catch (e: any) {
      setError(e.message || "Sentinel Node Unreachable. Check Tunnel URL.");
    } finally {
      setLoading(false);
    }
  };

  const copyForAudit = () => {
    if (!report) return;
    const text = `SENTINEL_V9.4_AUDIT: ${target} | CVC: ${report.scorecard.cvc}/4 | K-SSI: ${report.scorecard.k_ssi}/4.`;
    navigator.clipboard.writeText(text);
    alert("Audit Copied.");
  };

  useEffect(() => { WebApp.ready(); WebApp.expand(); scanMarket(target); }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#00ff41', borderBottom: '1px solid #333', paddingBottom: '10px' }}>WAN$ SENTINEL V9.4</h2>
      
      {error && (
        <div style={{ padding: '15px', background: '#300', border: '1px solid #f00', color: '#f00', marginBottom: '20px', fontSize: '0.8rem' }}>
          [ SYSTEM ERROR: {error} ]
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#00ff41' }}>[ CALCULATING SOVEREIGN VECTORS... ]</p>
      ) : report && (
        <main>
          <div style={{ padding: '15px', border: '1px solid #333', backgroundColor: '#0a0a0a', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#00ff41' }}>{report.scorecard.regime}</h4>
            {(() => {
  const kSsi = typeof report.scorecard.k_ssi === 'number' ? report.scorecard.k_ssi : 0;
  const calculatedConviction = Math.max(0, Math.min(4, 4 - kSsi));

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>CONVICTION:</span>
      <span>
        {Array(4).fill(0).map((_, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: '15px',
              height: '8px',
              background: i < calculatedConviction ? '#00ff41' : '#222',
              marginLeft: '4px',
            }}
          ></span>
        ))}
      </span>
    </div>
  );
})()}
            <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    color: report.scorecard.k_ssi >= 3 ? '#f00' : '#888',
  }}
>
  <span>KENYA STRESS (K-SSI):</span>
  <span>{report.scorecard.k_ssi}/4</span>
</div>
          </div>
          <div style={{ padding: '15px', background: '#111', borderLeft: '4px solid #00ff41', fontSize: '0.9rem' }}>
            {report.analysis}
          </div>
        </main>
      )}

      <div style={{ marginTop: '20px', borderTop: '1px solid #222' }}>
        <small style={{ color: '#444' }}>SOVEREIGN LOGS</small>
        {history.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', padding: '5px 0', color: '#666' }}>
            <span>{h.time}</span><span>{h.ticker}</span><span>CVC:{h.cvc} | K-SSI:{h.kssi}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <input value={target} onChange={(e) => setTarget(e.target.value.toUpperCase())} style={{ width: '100%', padding: '12px', background: '#111', color: '#00ff41', border: '1px solid #333', textAlign: 'center' }} />
        <button onClick={() => scanMarket(target)} style={{ width: '100%', padding: '15px', marginTop: '10px', background: '#00ff41', color: '#000', fontWeight: 'bold' }}>SCAN MATRIX</button>
        <button onClick={copyForAudit} style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#111', color: '#00ff41', border: '1px solid #00ff41' }}>COPY AUDIT</button>
      </div>
    </div>
  );
}
export default App;
