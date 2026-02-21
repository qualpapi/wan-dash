import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const BRIDGE_URL = "https://expression-vernon-judgment-freight.trycloudflare.com";

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("AUDCHF=X"); // Tracks current ticker in input
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('wan_history');
    return saved ? JSON.parse(saved) : [];
  });

  // REGEX PARSER: Extracts clean data from AI tags
  const parseData = (text: string, tag: string) => {
    if (!text) return "Scanning...";
    const regex = new RegExp(`${tag}:?\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].split('\n')[0].trim() : "N/A";
  };

  const scanMarket = async (pair: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      const newData = res.data;
      setReport(newData);

      // PERSISTENCE: Save the current scan to the log
      const updatedHistory = [
        { 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          stance: newData.metrics.stance, 
          regime: parseData(newData.data, "REGIME"),
          ticker: pair 
        },
        ...history
      ].slice(0, 5); // Keep last 5 for performance

      setHistory(updatedHistory);
      localStorage.setItem('wan_history', JSON.stringify(updatedHistory));
    } catch (e) { 
      console.error("Bridge Error:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  // GPT CONSULT BRIDGE: Now correctly scoped outside of scanMarket
  const copyForConsult = () => {
  if (!report) return;
  const text = `SENTINEL_V9.1_REPORT:
TICKER: ${target}
REGIME: ${parseData(report.data, "REGIME")}
STANCE: ${report.metrics.stance}
PRC: ${report.metrics.price} | VIX: ${report.metrics.vix}

[SYSTEM_CONSTRAINTS]
1. Do not forecast.
2. Counter-thesis must challenge structural assumptions only.
3. Use only provided macro variables.
4. If data is insufficient, report "STRUCTURAL UNCERTAINTY".

PROMPT: Provide a 3-point institutional-grade counter-thesis for this classification.`;
  
  navigator.clipboard.writeText(text);
  WebApp.HapticFeedback.notificationOccurred('success');
  alert("Red-Team constraints staged for GPT.");
};

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    scanMarket(target); // Initial scan on mount
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'monospace', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#00ff41' }}>WAN$ SENTINEL V9.1</h2>
        <small style={{ color: '#666' }}>M1 LOCAL NODE: ONLINE</small>
      </header>

      <div style={{ flex: 1 }}>
        {loading ? (
          <p style={{ marginTop: '40px', textAlign: 'center', color: '#00ff41' }}>[ ANALYZING {target}... ]</p>
        ) : report ? (
          <main style={{ marginTop: '20px' }}>
            <div style={{ padding: '15px', border: '1px solid #00ff41', borderRadius: '4px', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#00ff41' }}>{parseData(report.data, "REGIME")}</h4>
              <p style={{ margin: 0 }}><b>POLICY STANCE:</b> {report.metrics.stance}</p>
            </div>
            <div style={{ background: '#111', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #00ff41' }}>
              <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.4' }}>{parseData(report.data, "ALPHA")}</p>
            </div>
            <footer style={{ marginTop: '20px', fontSize: '0.8rem', color: '#444' }}>
              PX: {report.metrics.price} | VIX: {report.metrics.vix} | REAL_R: 1.0%
            </footer>
          </main>
        ) : null}

        {/* LOGS SECTION */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #222', paddingTop: '15px' }}>
          <small style={{ color: '#666', letterSpacing: '2px' }}>RECENT SENTINEL LOGS</small>
          {history.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 0', borderBottom: '1px solid #111' }}>
              <span style={{ color: '#444' }}>{item.timestamp}</span>
              <span style={{ color: '#888' }}>{item.ticker}</span>
              <span style={{ color: item.stance.includes('RISK') ? '#ff0055' : '#00ff41' }}>{item.stance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MULTI-PAIR CONTROL STACK */}
      <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
        <input 
          value={target}
          onChange={(e) => setTarget(e.target.value.toUpperCase())}
          style={{ width: '100%', padding: '15px', marginBottom: '10px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #333', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace' }}
          placeholder="ENTER TICKER (BTC-USD)"
        />
        <button onClick={copyForConsult} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#00ff41', border: '1px solid #00ff41', fontWeight: 'bold' }}>
          COPY FOR GPT CONSULT
        </button>
        <button onClick={() => scanMarket(target)} style={{ width: '100%', padding: '15px', marginTop: '10px', backgroundColor: '#00ff41', color: '#000', border: 'none', fontWeight: 'bold' }}>
          SCAN {target}
        </button>
      </div>
    </div>
  );
}

export default App;