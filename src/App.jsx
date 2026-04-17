import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import Dashboard from './Dashboard.jsx'

// ── Available lonjas (add more here when ready) ───────────────────────────────
const LONJAS = [
  {
    id: 'sevilla',
    name: 'Lonja de Sevilla',
    region: 'Andalucía',
    flag: '🌾',
    color: '#0284c7',
    active: true,
    sessions: 268,
    since: '2015',
  },
  {
    id: 'cordoba',
    name: 'Lonja de Córdoba',
    region: 'Córdoba',
    flag: '🌻',
    color: '#16a34a',
    active: true,
    sessions: 280,
    since: '2012',
  },
  {
    id: 'albacete',
    name: 'Lonja de Albacete',
    region: 'Castilla-La Mancha',
    flag: '🌻',
    color: '#7c3aed',
    active: false,
    sessions: null,
    since: null,
  },
  {
    id: 'burgos',
    name: 'Lonja de Burgos',
    region: 'Castilla y León',
    flag: '🌾',
    color: '#dc2626',
    active: false,
    sessions: null,
    since: null,
  },
]

const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE || 'lonja2025'

// ── Convert Supabase flat rows to [{date, product_key: value}] array ──────────
function rowsToTimeline(dbData) {
  const byDate = {}
  Object.entries(dbData).forEach(([date, products]) => {
    if (!byDate[date]) byDate[date] = { date }
    Object.assign(byDate[date], products)
  })
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function Login({ onOk }) {
  const [v, setV] = useState('')
  const [err, setErr] = useState(false)
  const [shake, setShake] = useState(false)

  function go() {
    if (v.trim().toLowerCase() === ACCESS_CODE.toLowerCase()) {
      onOk()
    } else {
      setErr(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#f0fdf4,#eff6ff,#fefce8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body,*{font-family:'DM Sans',sans-serif;}
        @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-6px)}50%{transform:translateX(6px)}}
      `}</style>
      <div style={{
        animation: 'up .4s ease',
        background: '#fff', borderRadius: 24, padding: '44px 40px',
        width: '100%', maxWidth: 380,
        boxShadow: '0 25px 60px rgba(0,0,0,0.08)', textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg,#16a34a,#0284c7)',
          borderRadius: 18, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 30,
          margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(2,132,199,0.3)'
        }}>🌾</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          Lonjas de Cereales
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 6 }}>
          Precios históricos · España
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 30, fontFamily: "'DM Mono',monospace" }}>
          Cereales · Oleaginosas · Leguminosas
        </p>
        <div style={{ animation: shake ? 'shake .4s ease' : 'none' }}>
          <input
            value={v}
            onChange={e => { setV(e.target.value); setErr(false) }}
            onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="Código de acceso"
            type="password"
            style={{
              width: '100%', border: `1.5px solid ${err ? '#f87171' : '#e2e8f0'}`,
              borderRadius: 12, padding: '13px 16px', fontSize: 14,
              marginBottom: err ? 6 : 12, outline: 'none', color: '#0f172a',
              background: '#f8fafc', textAlign: 'center', letterSpacing: 3,
              fontFamily: "'DM Mono',monospace"
            }}
          />
          {err && (
            <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 10, fontFamily: "'DM Mono',monospace" }}>
              Código incorrecto
            </p>
          )}
          <button onClick={go} style={{
            width: '100%',
            background: 'linear-gradient(135deg,#16a34a,#0284c7)',
            color: '#fff', border: 'none', borderRadius: 12, padding: 14,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2,132,199,0.35)'
          }}>
            Acceder →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PWA Install button ────────────────────────────────────────────────────────
function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState('other') // 'ios' | 'android' | 'other'

  useEffect(() => {
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
    const android = /Android/.test(ua)
    const standalone = window.navigator.standalone === true
    if (standalone) {
      setInstalled(true)
    } else if (ios) {
      setDeviceType('ios')
    } else if (android) {
      setDeviceType('android')
    }

    const handler = e => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return { prompt, install, installed, deviceType }
}

// ── Lonja Selector Screen ─────────────────────────────────────────────────────
function LonjaSelector({ onSelect }) {
  const { prompt, install, installed, deviceType } = useInstallPrompt()

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body,*{font-family:'DM Sans',sans-serif;}
        @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .lonja-card{transition:all .18s;cursor:pointer;}
        .lonja-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.1)!important;}
        .lonja-card.inactive{opacity:0.45;cursor:not-allowed;}
        .lonja-card.inactive:hover{transform:none;box-shadow:0 1px 4px rgba(0,0,0,0.04)!important;}
      `}</style>

      <div style={{ animation: 'up .4s ease', width: '100%', maxWidth: 720 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72,
            background: 'linear-gradient(135deg,#16a34a,#0284c7)',
            borderRadius: 20, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 34,
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(2,132,199,0.25)'
          }}>🌾</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Lonjas de Cereales
          </h1>
          <p style={{ fontSize: 15, color: '#64748b' }}>
            Selecciona la lonja que quieres consultar
          </p>
        </div>

        {/* Lonja cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16
        }}>
          {LONJAS.map(lonja => (
            <div
              key={lonja.id}
              className={`lonja-card${lonja.active ? '' : ' inactive'}`}
              onClick={() => lonja.active && onSelect(lonja)}
              style={{
                background: '#fff', borderRadius: 16, padding: 24,
                border: `1.5px solid ${lonja.active ? lonja.color + '44' : '#f1f5f9'}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: lonja.active ? lonja.color + '18' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                  border: `1.5px solid ${lonja.active ? lonja.color + '33' : '#e2e8f0'}`
                }}>
                  {lonja.flag}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700,
                    color: lonja.active ? '#0f172a' : '#94a3b8',
                    marginBottom: 2
                  }}>
                    {lonja.name}
                  </div>
                  <div style={{
                    fontSize: 12, color: '#64748b',
                    marginBottom: 10, fontFamily: "'DM Mono',monospace"
                  }}>
                    {lonja.region}
                  </div>
                  {lonja.active ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: lonja.color + '18', color: lonja.color,
                        border: `1px solid ${lonja.color}33`,
                        fontFamily: "'DM Mono',monospace", fontWeight: 600
                      }}>
                        {lonja.sessions} sesiones
                      </span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: '#f0fdf4', color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        fontFamily: "'DM Mono',monospace", fontWeight: 600
                      }}>
                        desde {lonja.since}
                      </span>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: '#f8fafc', color: '#94a3b8',
                      border: '1px solid #e2e8f0',
                      fontFamily: "'DM Mono',monospace"
                    }}>
                      Próximamente
                    </span>
                  )}
                </div>
                {lonja.active && (
                  <div style={{
                    fontSize: 18, color: lonja.color,
                    alignSelf: 'center', opacity: 0.7
                  }}>→</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Acceso directo / instalar ── */}
        <div style={{ marginTop: 28, maxWidth: 420, margin: '28px auto 0' }}>
          {installed ? (
            <div style={{
              textAlign: 'center', background: '#f0fdf4',
              border: '1px solid #bbf7d0', borderRadius: 12,
              padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#16a34a'
            }}>
              ✓ App instalada en pantalla de inicio
            </div>

          ) : deviceType === 'ios' ? (
            /* iOS Safari */
            <div style={{
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderRadius: 16, padding: '18px 20px'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155',
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📲</span> Añadir a pantalla de inicio
              </div>
              {[
                { n:1, icon:'⬆️', text:'Toca el botón Compartir en la barra de Safari' },
                { n:2, icon:'➕', text:'Toca "Añadir a pantalla de inicio"' },
                { n:3, icon:'✓',  text:'Toca "Añadir" — el icono aparece en tu inicio' },
              ].map(s => (
                <div key={s.n} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div style={{
                    width:24, height:24, borderRadius:'50%', flexShrink:0,
                    background:'#eff6ff', color:'#0284c7',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700
                  }}>{s.n}</div>
                  <div style={{ fontSize:13, color:'#475569', lineHeight:1.5, paddingTop:3 }}>
                    <span style={{ marginRight:6 }}>{s.icon}</span>{s.text}
                  </div>
                </div>
              ))}
              <p style={{ fontSize:10, color:'#94a3b8', marginTop:4,
                fontFamily:"'DM Mono',monospace", textAlign:'center' }}>
                Solo disponible en Safari · iOS 14+
              </p>
            </div>

          ) : deviceType === 'android' ? (
            /* Android — botón nativo si prompt disponible, instrucciones siempre visibles */
            <div style={{
              background: '#fff', border: '1.5px solid #e2e8f0',
              borderRadius: 16, padding: '18px 20px'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155',
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📲</span> Añadir a pantalla de inicio
              </div>
              {prompt ? (
                <button onClick={install} style={{
                  width: '100%', background: 'linear-gradient(135deg,#16a34a,#0284c7)',
                  border: 'none', borderRadius: 10, padding: '11px 20px', marginBottom: 12,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  fontSize: 14, fontWeight: 700, color: '#fff',
                  boxShadow: '0 4px 14px rgba(2,132,199,0.3)'
                }}>
                  <span>📲</span> Instalar app
                </button>
              ) : null}
              {[
                { n:1, icon:'⋮',  text:'Toca el menú (tres puntos) de Chrome' },
                { n:2, icon:'➕', text:'Toca "Añadir a pantalla de inicio"' },
                { n:3, icon:'✓',  text:'Confirma — el icono aparece en tu inicio' },
              ].map(s => (
                <div key={s.n} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
                  <div style={{
                    width:24, height:24, borderRadius:'50%', flexShrink:0,
                    background:'#eff6ff', color:'#0284c7',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700
                  }}>{s.n}</div>
                  <div style={{ fontSize:13, color:'#475569', lineHeight:1.5, paddingTop:3 }}>
                    <span style={{ marginRight:6 }}>{s.icon}</span>{s.text}
                  </div>
                </div>
              ))}
            </div>

          ) : null /* escritorio: no mostrar nada */}
        </div>

        <p style={{
          textAlign: 'center', marginTop: 20, fontSize: 11,
          color: '#cbd5e1', fontFamily: "'DM Mono',monospace"
        }}>
          Datos extraídos de los PDFs de cada lonja · 2015–2026
        </p>
      </div>
    </div>
  )
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ lonja }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16
    }}>
      <div style={{
        width: 56, height: 56,
        background: 'linear-gradient(135deg,#16a34a,#0284c7)',
        borderRadius: 16, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 26
      }}>🌾</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#334155' }}>
        Cargando {lonja.name}…
      </div>
      <div style={{
        fontSize: 12, color: '#94a3b8', fontFamily: "'DM Mono',monospace"
      }}>
        Conectando con la base de datos
      </div>
      <div style={{
        width: 200, height: 3, background: '#e2e8f0',
        borderRadius: 2, overflow: 'hidden', marginTop: 8
      }}>
        <div style={{
          height: '100%', background: lonja.color,
          borderRadius: 2, width: '60%',
          animation: 'slide 1.2s ease-in-out infinite alternate'
        }}/>
      </div>
      <style>{`@keyframes slide{from{margin-left:0}to{margin-left:40%}}`}</style>
    </div>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false)
  const [lonja, setLonja] = useState(null)
  const [allData, setAllData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState(null)

  // Load prices from Supabase when a lonja is selected — paginated to get all rows
  useEffect(() => {
    if (!lonja) return
    setLoading(true)
    setAllData(null)
    setDataError(null)

    async function fetchAllRows() {
      const PAGE = 1000  // Supabase default max per request
      let allRows = []
      let from = 0
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('prices')
          .select('session_date, product_key, price')
          .eq('lonja_id', lonja.id)
          .order('session_date', { ascending: true })
          .range(from, from + PAGE - 1)

        if (error) throw error
        allRows = allRows.concat(data || [])
        hasMore = (data && data.length === PAGE)
        from += PAGE
      }
      return allRows
    }

    fetchAllRows()
      .then(rows => {
        // All product keys — to ensure missing ones are null not undefined
        const ALL_KEYS = [
          "tbn_g1","tbn_g2","tbn_g3","tbn_g4","tbn_pienso",
          "tdn_g1","tdn_g2","tdn_g3","tdn_g4",
          "ti_pienso",
          "cebada_nac","cebada_imp",
          "trit_nac","trit_imp",
          "avena_nac","avena_imp",
          "maiz_nac","maiz_imp","sorgo_nac",
          "habas_nac","habas_imp",
          "guisan_nac","guisan_imp",
          "girasol_alto","girasol_conv","colza"
        ]
        // Build empty skeleton with null for every product
        const byDate = {}
        rows.forEach(row => {
          if (!byDate[row.session_date]) {
            const empty = { date: row.session_date }
            ALL_KEYS.forEach(k => { empty[k] = null })
            byDate[row.session_date] = empty
          }
          // Only set if value is a real number
          if (row.price != null) {
            byDate[row.session_date][row.product_key] = row.price
          }
        })
        const timeline = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
        setAllData(timeline)
        setLoading(false)
      })
      .catch(error => {
        console.error('Supabase error:', error)
        setDataError(error.message)
        setLoading(false)
      })
  }, [lonja])

  if (!authed) return <Login onOk={() => setAuthed(true)} />
  if (!lonja) return <LonjaSelector onSelect={setLonja} />
  if (loading) return <LoadingScreen lonja={lonja} />
  if (dataError) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24
    }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#dc2626' }}>Error al cargar datos</div>
      <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{dataError}</div>
      <button onClick={() => setLonja(null)} style={{
        marginTop: 8, padding: '8px 20px', borderRadius: 8,
        background: '#0284c7', color: '#fff', border: 'none',
        cursor: 'pointer', fontSize: 13, fontWeight: 600
      }}>← Volver</button>
    </div>
  )

  return (
    <Dashboard
      allData={allData || []}
      lonjaName={lonja.name}
      lonjaId={lonja.id}
      lonjaColor={lonja.color}
      onBack={() => setLonja(null)}
    />
  )
}
