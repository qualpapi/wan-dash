import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

// YOUR UNIQUE CLOUDFLARE TUNNEL URL
const BRIDGE_URL = "https://expression-vernon-judgment-freight.trycloudflare.com";

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const scanMarket = async (pair: string) => {
    setLoading(true);
    try {
      // Calling your local M1 via the Cloudflare Bridge
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair });
      setReport(res.data);
    } catch (e) {
      console.error("Bridge Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand(); // Full-screen mode for the Mini App
    scanMarket("AUDCHF=X"); 
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#00ff41' }}>WAN$ SENTINEL V9.1</h2>
        <small style={{ color: '#666' }}>M1 LOCAL NODE: ONLINE</small>
      </header>

      {loading ? (
        <p style={{ marginTop: '40px', textAlign: 'center' }}>[ ANALYZING SOVEREIGN DEBT REGIME... ]</p>
      ) : report ? (
        <main style={{ marginTop: '20px' }}>
          <div style={{ padding: '15px', border: '1px solid #00ff41', borderRadius: '4px', marginBottom: '15px' }}>
            {/* Displaying REGIME and STANCE from your bridge's deterministic facts */}
            <h4 style={{ margin: '0 0 10px 0', color: '#00ff41' }}>{report.data.split('\n')[1]}</h4> 
            <p style={{ margin: 0 }}><b>STANCE:</b> {report.metrics.stance}</p>
          </div>

          <div style={{ background: '#111', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #00ff41' }}>
            <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.4' }}>
               {report.data.split('\n')[3]} {/* This is the LLM-tagged ALPHA hint */}
            </p>
          </div>

          <footer style={{ marginTop: '20px', fontSize: '0.8rem', color: '#444', textAlign: 'right' }}>
            PRC: {report.metrics.price} | VIX: {report.metrics.vix} | REAL_R: 1.0%
          </footer>
        </main>
      ) : null}

      <button 
        onClick={() => scanMarket("AUDCHF=X")}
        style={{ width: '100%', padding: '15px', marginTop: '30px', backgroundColor: '#00ff41', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
      >
        RE-SCAN LOCAL NODE
      </button>
    </div>
  );
}

export default App;