import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const BRIDGE_URL = "https://expression-vernon-judgment-freight.trycloudflare.com";

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>(() => {
  const saved = localStorage.getItem('wan_history');
  return saved ? JSON.parse(saved) : [];
});

  const scanMarket = async (pair: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      setReport(res.data);
      // Inside scanMarket...
setReport(res.data);
const copyForConsult = () => {
  const text = `SENTINEL_V9.1_REPORT:
REGIME: ${parseData(report.data, "REGIME")}
STANCE: ${report.metrics.stance}
GOLD: $${report.metrics.price}
VIX: ${report.metrics.vix}

PROMPT: Based on this 2026 Sovereign Debt tag, provide a 3-point counter-thesis.`;
  
  navigator.clipboard.writeText(text);
  // Haptic feedback for that "Premium" feel
  WebApp.HapticFeedback.notificationOccurred('success');
  alert("Data staged for GPT consultation.");
};

// Add the new scan to the top of the history list
const updatedHistory = [
  { 
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
    stance: res.data.metrics.stance, 
    regime: parseData(res.data.data, "REGIME") 
  },
  ...history
].slice(0, 5); // Only keep the last 5 scans to save space

setHistory(updatedHistory);
localStorage.setItem('wan_history', JSON.stringify(updatedHistory));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    scanMarket("AUDCHF=X");
  }, []);

  // REGEX PARSER: Extracts content after the tags regardless of formatting
  const parseData = (text: string, tag: string) => {
    const regex = new RegExp(`${tag}:?\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].split('\n')[0].trim() : "Scanning...";
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#00ff41' }}>WAN$ SENTINEL V9.1</h2>
        <small style={{ color: '#666' }}>M1 LOCAL NODE: ONLINE</small>
      </header>

      {loading ? (
        <p style={{ marginTop: '40px', textAlign: 'center' }}>[ ANALYZING REGIME... ]</p>
      ) : report ? (
        <main style={{ marginTop: '20px' }}>
          {/* REGIME BOX */}
          <div style={{ padding: '15px', border: '1px solid #00ff41', borderRadius: '4px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#00ff41' }}>
              {parseData(report.data, "REGIME")}
            </h4>
            <p style={{ margin: 0 }}><b>POLICY STANCE:</b> {report.metrics.stance}</p>
          </div>

          {/* ALPHA BOX */}
          <div style={{ background: '#111', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #00ff41' }}>
            <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.4' }}>
              {parseData(report.data, "ALPHA")}
            </p>
          </div>

          <footer style={{ marginTop: '20px', fontSize: '0.8rem', color: '#444' }}>
            PRC: {report.metrics.price} | VIX: {report.metrics.vix} | REAL_R: 1.0%
          </footer>
        </main>
      ) : null}
    
{/* HISTORY TICKER */}
<div style={{ marginTop: '30px', borderTop: '1px solid #222', paddingTop: '15px' }}>
  <small style={{ color: '#666', letterSpacing: '2px' }}>RECENT SENTINEL LOGS</small>
  {history.map((item, index) => (
    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '8px 0', borderBottom: '1px solid #111' }}>
      <span style={{ color: '#444' }}>{item.timestamp}</span>
      <span style={{ color: '#888' }}>{item.regime}</span>
      <span style={{ color: item.stance.includes('RISK') ? '#ff0055' : '#00ff41' }}>{item.stance}</span>
    </div>
  ))}
</div>
{/* --- START OF THE CONTROL STACK --- */}
      <div style={{ marginTop: 'auto' }}> 
        
        {/* 1. COPY BUTTON (Place this first) */}
        <button 
          onClick={copyForConsult} 
          style={{ 
            width: '100%', 
            padding: '15px', 
            marginTop: '20px', 
            backgroundColor: '#111', 
            color: '#00ff41', 
            border: '1px solid #00ff41',
            fontWeight: 'bold' 
          }}
        >
          COPY FOR GPT CONSULT
        </button>
      <button onClick={() => scanMarket("AUDCHF=X")} 
        style={{ width: '100%', padding: '15px', marginTop: '30px', backgroundColor: '#00ff41', color: '#000', border: 'none', fontWeight: 'bold' }}>
        RE-SCAN LOCAL NODE
      </button>
    </div>
  );
}

export default App;