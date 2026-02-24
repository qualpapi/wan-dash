// --- APP.TSX : WAN$ V9.4 SENTINEL SOVEREIGN ---
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

// IMPORTANT: Update this every time you restart your Cloudflare Tunnel!
const RAW_BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || "";
const BRIDGE_URL = RAW_BRIDGE_URL.endsWith('/') ? RAW_BRIDGE_URL.slice(0, -1) : RAW_BRIDGE_URL;

function App() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState("USDJPY=X");
  const [tradeRegime, setTradeRegime] = useState('EM_SOVEREIGN'); // Bimodal State
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('wan_v12_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const scanMarket = async (pair: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!BRIDGE_URL) {
        throw new Error("BRIDGE_URL is not defined in environment.");
      }
      const res = await axios.post(`${BRIDGE_URL}/analyze`, { pair, regime: tradeRegime });
      setReport(res.data);

      const log = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticker: pair,
        regime: tradeRegime,
        cvc: res.data.scorecard.cvc,
        kssi: res.data.scorecard.k_ssi,
        vel: res.data.scorecard.velocity || 0,
        vega: res.data.scorecard.vega || 0,
        elast: res.data.scorecard.elasticity || 0,  
      };

      const newHistory = [log, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('wan_v12_logs', JSON.stringify(newHistory));
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
      {/* Bimodal Toggle */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button 
          onClick={() => setTradeRegime('EM_SOVEREIGN')}
          style={{
            flex: 1, padding: '8px', cursor: 'pointer',
            backgroundColor: tradeRegime === 'EM_SOVEREIGN' ? '#00ff41' : '#111',
            color: tradeRegime === 'EM_SOVEREIGN' ? '#000' : '#888',
            border: '1px solid #333', fontWeight: 'bold', fontSize: '0.7rem'
          }}
        >
          EM_SOVEREIGN
        </button>
        <button 
          onClick={() => setTradeRegime('G7_TACTICAL')}
          style={{
            flex: 1, padding: '8px', cursor: 'pointer',
            backgroundColor: tradeRegime === 'G7_TACTICAL' ? '#00ff41' : '#111',
            color: tradeRegime === 'G7_TACTICAL' ? '#000' : '#888',
            border: '1px solid #333', fontWeight: 'bold', fontSize: '0.7rem'
          }}
        >
          G7_TACTICAL
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ color: '#00ff41', margin: 0 }}>WAN$ SENTINEL V12.0</h2>
          {report && tradeRegime === 'EM_SOVEREIGN' && (
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: report.scorecard.posture === 'OFFENSIVE' ? '#00ff41' : (report.scorecard.posture === 'DEFENSIVE' ? '#ff0000' : '#ffff00') }}>
              POSTURE: [{report.scorecard.posture}]
            </div>
          )}
          {report && tradeRegime === 'G7_TACTICAL' && (
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#00ff41' }}>
              MODE: [G7_TACTICAL_SNIPER]
            </div>
          )}
        </div>
        {report && tradeRegime === 'EM_SOVEREIGN' && (
          <div style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '0.7rem', 
            fontWeight: 'bold',
            backgroundColor: report.scorecard.macro_sync === 'GREEN' ? '#003300' : (report.scorecard.macro_sync === 'RED' ? '#330000' : '#333300'),
            color: report.scorecard.macro_sync === 'GREEN' ? '#00ff41' : (report.scorecard.macro_sync === 'RED' ? '#ff0000' : '#ffff00'),
            border: `1px solid ${report.scorecard.macro_sync === 'GREEN' ? '#00ff41' : (report.scorecard.macro_sync === 'RED' ? '#ff0000' : '#ffff00')}`
          }}>
            MACRO-SYNC: {report.scorecard.macro_sync}
          </div>
        )}
      </div>
      
      {error && (
        <div style={{ padding: '15px', background: '#300', border: '1px solid #f00', color: '#f00', marginBottom: '20px', fontSize: '0.8rem' }}>
          [ SYSTEM ERROR: {error} ]
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#00ff41' }}>[ CALCULATING SOVEREIGN VECTORS... ]</p>
      ) : report && (
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.7rem', color: '#888' }}>
            <span>VIX: {report.metrics.vix}</span>
            {tradeRegime === 'EM_SOVEREIGN' ? (
              <>
                <span>DXY: {report.metrics.dxy}</span>
                <span>SPREAD: {report.metrics.curve}</span>
              </>
            ) : (
              <>
                <span>VEGA: {report.metrics.vega}</span>
                <span>ELAST: {report.metrics.elasticity}</span>
                <span>SKEW: {report.metrics.skew}</span>
              </>
            )}
          </div>
          <div style={{ padding: '15px', border: '1px solid #333', backgroundColor: '#0a0a0a', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#00ff41' }}>{report.scorecard.regime}</h4>
            {(() => {
              const rawCvc = typeof report.scorecard.cvc === 'number' ? report.scorecard.cvc : 0;
              const kSsi = typeof report.scorecard.k_ssi === 'number' ? report.scorecard.k_ssi : 0;
              const netConviction = Math.max(0, rawCvc - kSsi);

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
                          background: i < netConviction ? '#00ff41' : '#222',
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
              <div style={{ textAlign: 'right' }}>
                <span>{report.scorecard.k_ssi}/4</span>
                {report.scorecard.velocity !== 0 && (
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '0.7rem', 
                    color: report.scorecard.velocity > 0 ? '#f00' : '#00ff41' 
                  }}>
                    {report.scorecard.velocity > 0 ? '▲' : '▼'} {Math.abs(report.scorecard.velocity)}
                  </span>
                )}
                {report.scorecard.shifted_r !== undefined && (
                  <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '2px' }}>
                    $\beta$ = {report.scorecard.beta} | Lag-$r$ = {report.scorecard.shifted_r.r_10d}
                  </div>
                )}
              </div>
            </div>

            {report.scorecard.capacity !== "NORMAL" && (
              <div style={{ 
                marginTop: '10px', 
                padding: '8px', 
                backgroundColor: '#330000', 
                border: '1px solid #ff0000', 
                color: '#ff0000', 
                fontSize: '0.7rem',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                [ ALERT: {report.scorecard.capacity} ]
              </div>
            )}
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
            <span>{h.time}</span><span>{h.ticker}</span>
            <span>
              {h.regime === 'EM_SOVEREIGN' ? (
                <>CVC:{h.cvc} | K-SSI:{h.kssi}</>
              ) : (
                <>CVC:{h.cvc} | V:{h.vega} | S:{h.skew}</>
              )}
              {h.vel !== 0 && (
                <span style={{ color: h.vel > 0 ? '#f00' : '#00ff41', marginLeft: '4px' }}>
                  ({h.vel > 0 ? '+' : ''}{h.vel})
                </span>
              )}
            </span>
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
