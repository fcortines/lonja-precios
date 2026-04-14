import { useState } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, ReferenceLine, ReferenceArea,
  Customized
} from "recharts";

const SESSION_DATES = [
  "2015-02-17","2015-03-03","2015-03-24","2015-04-14","2015-05-05","2015-05-26",
  "2015-06-02","2015-06-09","2015-06-16","2015-06-23","2015-06-30","2015-07-07",
  "2015-07-14","2015-07-21","2015-07-28","2015-08-04","2015-08-18","2015-09-01",
  "2015-09-15","2015-09-29","2015-10-13","2015-10-27","2015-11-10","2015-11-24",
  "2015-12-09","2015-12-22","2016-01-12","2016-01-26","2016-02-09","2016-02-23",
  "2016-03-08","2016-03-29","2016-04-19","2016-05-03","2016-05-17","2016-05-31",
  "2016-06-07","2016-06-14","2016-06-28","2016-07-05","2016-07-19","2016-08-02",
  "2016-08-23","2016-09-06","2016-09-20","2016-10-05","2016-10-18","2016-10-25",
  "2016-11-08","2016-11-22","2016-11-29","2016-12-13","2017-01-10","2017-01-17",
  "2017-01-31","2017-02-14","2017-03-07","2017-03-21","2017-04-04","2017-04-25",
  "2017-05-23","2017-05-31","2017-06-06","2017-06-13","2017-06-20","2017-07-04",
  "2017-07-18","2017-07-25","2017-08-01","2017-08-22","2017-09-05","2017-09-19",
  "2017-10-03","2017-10-17","2017-10-31","2017-11-14","2017-11-28","2017-12-19",
  "2018-01-09","2018-01-23","2018-02-06","2018-02-20","2018-03-06","2018-03-20",
  "2018-04-03","2018-04-25","2018-05-08","2018-05-22","2018-06-05","2018-06-12",
  "2018-06-19","2018-06-26","2018-07-03","2018-07-10","2018-07-17","2018-07-24",
  "2018-08-07","2018-09-04","2018-09-18","2018-10-02","2018-10-16","2018-10-30",
  "2018-11-13","2018-11-27","2018-12-11","2019-01-15","2019-01-29","2019-02-12",
  "2019-02-26","2019-03-12","2019-03-26","2019-04-09","2019-04-23","2019-05-14",
  "2019-05-21","2019-06-04","2019-06-11","2019-06-18","2019-06-25","2019-07-09",
  "2019-07-16","2019-07-23","2019-08-13","2019-08-27","2019-09-10","2019-09-24",
  "2019-10-08","2019-10-22","2019-11-05","2019-11-19","2019-12-03","2019-12-17",
  "2020-01-07","2020-02-04","2020-02-18","2020-03-24","2020-04-07","2020-04-21",
  "2020-05-05","2020-05-19","2020-05-26","2020-06-02","2020-06-09","2020-06-16",
  "2020-06-23","2020-06-30","2020-07-07","2020-07-14","2020-07-21","2020-07-28",
  "2020-08-11","2020-08-25","2020-09-08","2020-09-22","2020-10-06","2020-10-20",
  "2020-11-03","2020-11-17","2020-12-01","2020-12-15","2021-01-12","2021-01-26",
  "2021-02-09","2021-02-23","2021-03-09","2021-03-23","2021-04-06","2021-04-20",
  "2021-05-04","2021-05-18","2021-05-25","2021-06-01","2021-06-08","2021-06-15",
  "2021-06-22","2021-06-29","2021-07-06","2021-07-13","2021-07-20","2021-07-27",
  "2021-08-10","2021-08-17","2021-08-24","2021-08-31","2021-09-07","2021-09-14",
  "2021-09-21","2021-10-05","2021-10-19","2021-11-02","2021-11-16","2021-11-30",
  "2021-12-14","2022-01-11","2022-01-25","2022-02-08","2022-02-22","2022-03-22",
  "2022-04-08","2022-04-28","2022-05-17","2022-05-31","2022-06-07","2022-06-14",
  "2022-06-21","2022-06-28","2022-07-05","2022-07-12","2022-07-19","2022-07-26",
  "2022-08-02","2022-08-09","2022-08-23","2022-08-30","2022-09-06","2022-09-13",
  "2022-09-20","2022-09-27","2022-10-04","2022-10-11","2022-10-19","2022-10-25",
  "2022-11-08","2022-11-29","2022-12-13","2023-01-10","2023-01-23","2023-02-07",
  "2023-02-21","2023-03-07","2023-03-21","2023-04-11","2023-05-03","2023-05-16",
  "2023-05-23","2023-05-30","2023-06-06","2023-06-13","2023-06-20","2023-06-27",
  "2023-07-04","2023-07-11","2023-07-18","2023-07-25","2023-08-01","2023-08-08",
  "2023-08-29","2023-09-05","2023-09-12","2023-09-19","2023-10-03","2023-10-18",
  "2023-10-31","2023-11-14","2023-11-28","2023-12-12","2024-01-16","2024-01-30",
  "2024-02-20","2024-03-05","2024-03-19","2024-04-02","2024-04-23","2024-05-07",
  "2024-05-21","2024-05-28","2024-06-04","2024-06-11","2024-06-18","2024-06-25",
  "2024-07-02","2024-07-09","2024-07-16","2024-07-23","2024-07-30","2024-08-06",
  "2024-08-20","2024-09-03","2024-09-17","2024-09-24","2024-10-01","2024-10-08",
  "2024-10-15","2024-10-29","2024-11-12","2024-11-26","2024-12-10","2024-12-17",
  "2025-01-07","2025-01-14","2025-01-28","2025-02-11","2025-02-25","2025-03-11",
  "2025-03-25","2025-04-08","2025-04-29","2025-05-13","2025-05-27","2025-06-03",
  "2025-06-10","2025-06-17","2025-06-24","2025-07-01","2025-07-08","2025-07-15",
  "2025-07-22","2025-07-29","2025-08-12","2025-08-26","2025-09-09","2025-09-16",
  "2025-09-23","2025-09-30","2025-10-07","2025-10-21","2025-11-04","2025-11-18",
  "2025-12-02","2025-12-16","2026-01-13","2026-01-27","2026-02-17","2026-03-03",
  "2026-03-10","2026-03-17","2026-03-24"
];

// ── Correct Lonja de Sevilla product taxonomy ─────────────────────────────────
// Trigo Blando Nacional: G1, G2, G3, G4, Pienso (5 cats)
// Trigo Duro Nacional:   G1, G2, G3, G4 (4 cats)
// Trigo Importación:     Pienso only (1 cat)
// Cebada Nacional/Imp, Triticale Nac/Imp, Avena Nac/Imp
// Maíz Nac/Imp, Habas Nac/Imp, Guisantes Nac/Imp
// Oleaginosas: Girasol Alto Oleico, Girasol Convencional, Colza
const PROD_GROUPS = [
  {
    group: "Trigo Blando Nacional",
    products: [
      {key:"tbn_g1",  label:"T.Blando G1 Nac.", color:"#0369a1", base:212, vol:0.12},
      {key:"tbn_g2",  label:"T.Blando G2 Nac.", color:"#0284c7", base:205, vol:0.12},
      {key:"tbn_g3",  label:"T.Blando G3 Nac.", color:"#0ea5e9", base:197, vol:0.13},
      {key:"tbn_g4",  label:"T.Blando G4 Nac.", color:"#38bdf8", base:189, vol:0.13},
      {key:"tbn_pienso",label:"T.Blando Pienso Nac.",color:"#7dd3fc",base:181,vol:0.14},
    ]
  },
  {
    group: "Trigo Duro Nacional",
    products: [
      {key:"tdn_g1",  label:"T.Duro G1 Nac.",   color:"#1e3a8a", base:238, vol:0.12},
      {key:"tdn_g2",  label:"T.Duro G2 Nac.",   color:"#1d4ed8", base:228, vol:0.12},
      {key:"tdn_g3",  label:"T.Duro G3 Nac.",   color:"#3b82f6", base:218, vol:0.13},
      {key:"tdn_g4",  label:"T.Duro G4 Nac.",   color:"#93c5fd", base:208, vol:0.14},
    ]
  },
  {
    group: "Trigo Importación",
    products: [
      {key:"ti_pienso",label:"T.Pienso Imp.",    color:"#6d28d9", base:188, vol:0.14},
    ]
  },
  {
    group: "Cebada",
    products: [
      {key:"cebada_nac",label:"Cebada Nacional", color:"#16a34a", base:176, vol:0.15},
      {key:"cebada_imp",label:"Cebada Imp.",     color:"#4ade80", base:179, vol:0.15},
    ]
  },
  {
    group: "Triticale",
    products: [
      {key:"trit_nac", label:"Triticale Nac.",   color:"#15803d", base:169, vol:0.16},
      {key:"trit_imp", label:"Triticale Imp.",   color:"#86efac", base:171, vol:0.16},
    ]
  },
  {
    group: "Avena",
    products: [
      {key:"avena_nac",label:"Avena Nacional",   color:"#92400e", base:161, vol:0.17},
      {key:"avena_imp",label:"Avena Imp.",       color:"#fbbf24", base:163, vol:0.17},
    ]
  },
  {
    group: "Maíz",
    products: [
      {key:"maiz_nac", label:"Maíz Nacional",   color:"#b91c1c", base:190, vol:0.18},
      {key:"maiz_imp", label:"Maíz Imp.",       color:"#f87171", base:192, vol:0.18},
    ]
  },
  {
    group: "Leguminosas",
    products: [
      {key:"habas_nac",  label:"Habas Nac.",       color:"#0f766e", base:213, vol:0.19},
      {key:"habas_imp",  label:"Habas Imp.",        color:"#2dd4bf", base:215, vol:0.19},
      {key:"guisan_nac", label:"Guisantes Nac.",   color:"#0891b2", base:197, vol:0.20},
      {key:"guisan_imp", label:"Guisantes Imp.",   color:"#67e8f9", base:200, vol:0.20},
    ]
  },
  {
    group: "Oleaginosas",
    products: [
      {key:"girasol_alto",label:"Girasol Alto Oleico",color:"#b45309",base:428,vol:0.21},
      {key:"girasol_conv",label:"Girasol Conv.",      color:"#f59e0b",base:390,vol:0.22},
      {key:"colza",       label:"Colza",             color:"#65a30d", base:445, vol:0.20},
    ]
  },
];
const ALL_PRODS = PROD_GROUPS.reduce(function(a,g){return a.concat(g.products);}, []);

const EVENTS = [
  {date:"2020-03-24",emoji:"🦠",label:"COVID-19",        desc:"Confinamiento España. Caída demanda y colapso logístico afectaron precios durante meses."},
  {date:"2021-10-05",emoji:"⚡",label:"Crisis energética",desc:"Disparada del gas en Europa. Encarecimiento drástico de fertilizantes y costes de producción."},
  {date:"2022-03-22",emoji:"🪖",label:"Guerra Ucrania",   desc:"Invasión Rusia-Ucrania. Ambos ~30% del trigo mundial. Precios máximos históricos mar–jun 2022."},
  {date:"2022-07-22",emoji:"🤝",label:"Acuerdo cereales", desc:"Acuerdo ONU Mar Negro. Inicio corrección desde máximos históricos."},
  {date:"2023-07-17",emoji:"💥",label:"Fin acuerdo",      desc:"Rusia rompe el acuerdo del Mar Negro. Repunte puntual en trigo y maíz."},
  {date:"2023-10-03",emoji:"🌧️",label:"Sequía Andalucía",desc:"Campaña 23/24 con sequía histórica. Producción muy por debajo de la media."},
];

const CAMPS = [
  {id:"15-16",label:"15/16",start:"2015-10-01",end:"2016-09-30"},
  {id:"16-17",label:"16/17",start:"2016-10-01",end:"2017-09-30"},
  {id:"17-18",label:"17/18",start:"2017-10-01",end:"2018-09-30"},
  {id:"18-19",label:"18/19",start:"2018-10-01",end:"2019-09-30"},
  {id:"19-20",label:"19/20",start:"2019-10-01",end:"2020-09-30"},
  {id:"20-21",label:"20/21",start:"2020-10-01",end:"2021-09-30"},
  {id:"21-22",label:"21/22",start:"2021-10-01",end:"2022-09-30"},
  {id:"22-23",label:"22/23",start:"2022-10-01",end:"2023-09-30"},
  {id:"23-24",label:"23/24",start:"2023-10-01",end:"2024-09-30"},
  {id:"24-25",label:"24/25",start:"2024-10-01",end:"2025-09-30"},
  {id:"25-26",label:"25/26",start:"2025-10-01",end:"2026-09-30"},
];

function getSig(k) {
  var M = {
    tbn_g3:    {s:"ESPERAR",color:"#92400e",bg:"#fef3c7",icon:"⏸",desc:"Precio bajo respecto a media histórica. Posible repunte estacional en otoño."},
    cebada_nac:{s:"VENDER", color:"#14532d",bg:"#dcfce7",icon:"📈",desc:"Máximos de 6 meses, +8% sobre media de campaña. Momento favorable para cerrar contratos."},
    maiz_imp:  {s:"COMPRAR",color:"#7f1d1d",bg:"#fee2e2",icon:"📉",desc:"Mínimo estacional. Sube históricamente +12% de sep a dic."},
    girasol_conv:{s:"ESPERAR",color:"#92400e",bg:"#fef3c7",icon:"⏸",desc:"Alta volatilidad sin señal clara. Precio en línea con media."},
    colza:     {s:"VENDER", color:"#14532d",bg:"#dcfce7",icon:"📈",desc:"Tendencia alcista +15% desde inicio de campaña."},
  };
  return M[k]||{s:"S/D",color:"#64748b",bg:"#f1f5f9",icon:"—",desc:"Sin señal disponible para este producto."};
}

// ── Multi-lonja sources ───────────────────────────────────────────────────────
var SOURCES = [
  {id:"sevilla",    label:"Lonja Sevilla",     flag:"🟡", color:"#0284c7"},
  {id:"extremadura",label:"Lonja Extremadura", flag:"🟠", color:"#16a34a"},
  {id:"albacete",   label:"Lonja Albacete",    flag:"🔵", color:"#7c3aed"},
  {id:"burgos",     label:"Lonja Burgos",      flag:"🔴", color:"#dc2626"},
];

// Products tracked across all lonjas
var TRACKED = [
  {key:"tbn_g1",      label:"Trigo Blando G1 Nac."},
  {key:"tbn_g2",      label:"Trigo Blando G2 Nac."},
  {key:"tbn_g3",      label:"Trigo Blando G3 Nac."},
  {key:"tbn_g4",      label:"Trigo Blando G4 Nac."},
  {key:"tbn_pienso",  label:"T.Blando Pienso Nac."},
  {key:"tdn_g1",      label:"Trigo Duro G1 Nac."},
  {key:"tdn_g2",      label:"Trigo Duro G2 Nac."},
  {key:"tdn_g3",      label:"Trigo Duro G3 Nac."},
  {key:"tdn_g4",      label:"Trigo Duro G4 Nac."},
  {key:"ti_pienso",   label:"Trigo Pienso Imp."},
  {key:"cebada_nac",  label:"Cebada Nacional"},
  {key:"cebada_imp",  label:"Cebada Importación"},
  {key:"trit_nac",    label:"Triticale Nacional"},
  {key:"avena_nac",   label:"Avena Nacional"},
  {key:"maiz_nac",    label:"Maíz Nacional"},
  {key:"maiz_imp",    label:"Maíz Importación"},
  {key:"girasol_alto",label:"Girasol Alto Oleico"},
  {key:"girasol_conv",label:"Girasol Conv."},
  {key:"colza",       label:"Colza"},
];

function snm(n){var x=Math.sin(n+99)*10000;return x-Math.floor(x);}

function genMarketData(){
  var sourceParams = {
    sevilla:    {premium:0,   noise:1.00},
    extremadura:{premium:-3,  noise:1.05},
    albacete:   {premium:-6,  noise:1.08},
    burgos:     {premium:-9,  noise:1.06},
  };
  var result = {};
  Object.keys(sourceParams).forEach(function(sid){
    var sp = sourceParams[sid];
    result[sid] = SESSION_DATES.map(function(date,i){
      var y=parseInt(date.slice(0,4)),m=parseInt(date.slice(5,7));
      var row = {date:date};
      ALL_PRODS.forEach(function(p,pi){
        var base = p.base + sp.premium;
        var b = base + (i/SESSION_DATES.length)*base*0.09;
        if(y===2022&&m>=3&&m<=8) b*=1.50;
        else if(y===2022&&m>=9) b*=1.30;
        else if(y===2023&&m<=6) b*=1.16;
        if(y===2020&&m>=3&&m<=6) b*=0.91;
        b += Math.cos((m-2)*Math.PI/6)*base*0.06;
        b += (snm(i*7+pi*13+sid.length*17)-0.5)*base*0.08*sp.noise;
        row[p.key] = Math.round(b*10)/10;
      });
      return row;
    });
  });
  return result;
}
var MARKET_DATA = genMarketData();

// ── Divergence detection ──────────────────────────────────────────────────────
// For a given product and window (N last sessions), compute:
//   - % change per source over the window
//   - flag as DIVERGENCE if one source moves >THRESH% more than the median of others
var DIV_THRESH = 4.5; // % divergence threshold
var DIV_WINDOW = 6;   // sessions to look back

function computeDivergences(filterKeys){
  var tracked = filterKeys&&filterKeys.length>0
    ? TRACKED.filter(function(t){return filterKeys.includes(t.key);})
    : TRACKED;
  var alerts = [];
  tracked.forEach(function(tr){
    var pk = tr.key;
    var moves = {};
    SOURCES.forEach(function(src){
      var series = MARKET_DATA[src.id];
      if(!series) return;
      var vals = series.map(function(r){return r[pk];}).filter(function(x){return x!=null;});
      if(vals.length < DIV_WINDOW+1) return;
      var recent = vals.slice(-DIV_WINDOW);
      var first = recent[0], last = recent[recent.length-1];
      if(!first) return;
      moves[src.id] = ((last - first) / first) * 100;
    });
    var ids = Object.keys(moves);
    if(ids.length < 2) return;
    var sortedVals = ids.map(function(id){return moves[id];}).sort(function(a,b){return a-b;});
    var median = sortedVals[Math.floor(sortedVals.length/2)];
    ids.forEach(function(sid){
      var diff = moves[sid] - median;
      if(Math.abs(diff) >= DIV_THRESH){
        var src = SOURCES.find(function(s){return s.id===sid;});
        var intensity = Math.abs(diff) >= DIV_THRESH*2 ? "FUERTE" : "MODERADA";
        var series = MARKET_DATA[sid];
        var recentVals = series.map(function(r){return r[pk];}).filter(function(x){return x!=null;});
        var lastPrice = recentVals[recentVals.length-1];
        alerts.push({
          sourceId:sid, sourceLabel:src.label, sourceFlag:src.flag, sourceColor:src.color,
          productKey:pk, productLabel:tr.label,
          move:moves[sid], medianMove:median, diff:diff,
          intensity:intensity,
          lastPrice:lastPrice?lastPrice.toFixed(1):"—",
          change:(moves[sid]).toFixed(1),
        });
      }
    });
  });
  alerts.sort(function(a,b){return Math.abs(b.diff)-Math.abs(a.diff);});
  return alerts;
}
var ALL_DIVERGENCES = computeDivergences(null);

// ── Data will be injected via props from App.jsx (real Supabase data) ─────────
// genData() is kept only as fallback for development with no data loaded yet
function sn(n){var x=Math.sin(n)*10000;return x-Math.floor(x);}
function genMockData(){
  return SESSION_DATES.map(function(date,i){
    var y=parseInt(date.slice(0,4)),m=parseInt(date.slice(5,7));
    var row={date:date};
    ALL_PRODS.forEach(function(p,pi){
      var b=p.base+(i/SESSION_DATES.length)*p.base*0.09;
      if(y===2022&&m>=3&&m<=8)b*=1.50;
      else if(y===2022&&m>=9)b*=1.30;
      else if(y===2023&&m<=6)b*=1.16;
      if(y===2020&&m>=3&&m<=6)b*=0.91;
      b+=Math.cos((m-2)*Math.PI/6)*p.base*0.06;
      b+=(sn(i*7+pi*17+pi*41)-0.5)*p.base*(p.vol||0.09);
      row[p.key]=Math.round(b*10)/10;
    });
    return row;
  });
}
// MOCK_DATA used only in demo mode (no Supabase data loaded)
const MOCK_DATA = genMockData();

// ── Build timeline: real rows + null-separator rows for gaps ──────────────────
// The null-separator row causes connectNulls=false lines to break visually.
// NO bridge/dotted line — just a clean break inside the shaded zone.
function buildTimeline(rows) {
  var result = [];
  for (var i = 0; i < rows.length; i++) {
    result.push(rows[i]);
    if (i < rows.length - 1) {
      var d1 = new Date(rows[i].date), d2 = new Date(rows[i+1].date);
      var diff = (d2 - d1) / (1000*60*60*24);
      if (diff > 21) {
        // Insert a single null-value separator row so lines break here
        var sep = {date: rows[i].date + "_sep", _sep: true};
        ALL_PRODS.forEach(function(p){ sep[p.key] = null; });
        result.push(sep);
      }
    }
  }
  return result;
}

function detectGaps(rows) {
  var gaps = [];
  for (var i = 0; i < rows.length-1; i++) {
    var d1 = new Date(rows[i].date), d2 = new Date(rows[i+1].date);
    if ((d2-d1)/(1000*60*60*24) > 21) gaps.push({x1: rows[i].date, x2: rows[i+1].date});
  }
  return gaps;
}

function campRows(c, allData){return (allData||MOCK_DATA).filter(function(r){return r.date>=c.start&&r.date<=c.end;});}
function avgOf(rows,k){var v=rows.map(function(r){return r[k];}).filter(function(x){return x!=null;});return v.length?+(v.reduce(function(a,b){return a+b;},0)/v.length).toFixed(1):null;}
function lastVal(rows,k){var f=rows.slice().reverse().find(function(r){return r[k]!=null;});return f?f[k]:null;}
function trendDir(rows,k){
  // Compare last two sessions with a real value — simple and clear
  var v=rows.map(function(r){return r[k];}).filter(function(x){return x!=null;});
  if(v.length<2)return 0;
  var last=v[v.length-1];
  var prev=v[v.length-2];
  return last-prev;
}

// ── Custom X tick — only renders if this index should be shown ────────────────
// interval is passed via tickCount hack: we filter by index in the tick itself
function makeXTick(interval){
  return function XTick(props){
    var x=props.x,y=props.y,payload=props.payload,index=props.index;
    if(!payload||!payload.value||payload.value.includes("_sep"))return null;
    if(index%interval!==0)return null;
    return(
      <g transform={"translate("+x+","+y+")"}>
        <text x={0} y={0} dy={10} textAnchor="end" fill="#94a3b8" fontSize={9}
          fontFamily="monospace" transform="rotate(-40)">{payload.value.slice(0,7)}</text>
      </g>
    );
  };
}

// Calculate tick interval so at most maxLabels labels are shown
function calcInterval(nRows, maxLabels){
  if(!nRows||nRows<=0) return 1;
  maxLabels = maxLabels||24;
  if(nRows<=maxLabels) return 1;
  return Math.ceil(nRows/maxLabels);
}

// ── Event label at top of chart (SVG text) ────────────────────────────────────
function EventLabel(props){
  var viewBox=props.viewBox,emoji=props.emoji;
  if(!viewBox)return null;
  return(
    <text x={viewBox.x} y={viewBox.y+14} textAnchor="middle" fontSize={14} style={{userSelect:"none",pointerEvents:"none"}}>
      {emoji}
    </text>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function ChartTT(props){
  var active=props.active,payload=props.payload,label=props.label;
  if(!active||!payload||!payload.length)return null;
  var ev=EVENTS.find(function(e){return e.date===label;});
  var real=payload.filter(function(p){return p.value!=null;});
  if(!real.length&&!ev)return null;
  return(
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 14px",
      boxShadow:"0 8px 30px rgba(0,0,0,0.1)",maxWidth:250}}>
      {ev&&(
        <div style={{fontSize:11,background:"#f5f3ff",borderRadius:6,padding:"5px 8px",marginBottom:8,
          color:"#4c1d95",fontWeight:600,lineHeight:1.5}}>
          {ev.emoji} {ev.label}
          <div style={{fontWeight:400,color:"#6d28d9",fontSize:10,marginTop:2}}>{ev.desc}</div>
        </div>
      )}
      <div style={{color:"#64748b",fontSize:10,fontFamily:"monospace",marginBottom:5,fontWeight:600}}>{label}</div>
      {real.slice(0,8).map(function(p){return(
        <div key={p.dataKey} style={{display:"flex",justifyContent:"space-between",gap:14,
          fontSize:11,fontFamily:"monospace",marginBottom:2}}>
          <span style={{color:p.color,fontWeight:600}}>{p.name}</span>
          <span style={{color:"#0f172a",fontWeight:700}}>{p.value} €/t</span>
        </div>
      );})}
      {real.length>8&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>+{real.length-8} más</div>}
    </div>
  );
}

// ── Main chart ────────────────────────────────────────────────────────────────
function PriceChart(props){
  var rows=props.rows,selP=props.selP,chartType=props.chartType,
      height=props.height||380,showCampAvg=props.showCampAvg,
      showHistAvg=props.showHistAvg,histRows=props.histRows,
      from=props.from,to=props.to,tickInterval=props.tickInterval;

  var timeline = buildTimeline(rows);
  var gaps = detectGaps(rows);
  var interval = tickInterval!=null ? tickInterval : calcInterval(rows.length, 32);
  var XTick = makeXTick(interval);
  var visEvs = EVENTS.filter(function(e){return (!from||e.date>=from)&&(!to||e.date<=to);});

  var campAvgs={}, histAvgs={};
  if(showCampAvg) selP.forEach(function(k){campAvgs[k]=avgOf(rows,k);});
  if(showHistAvg&&histRows) selP.forEach(function(k){histAvgs[k]=avgOf(histRows,k);});

  // Sort products by their avg value so labels are spread from top to bottom
  // and we can nudge each one to avoid overlap
  var allAvgVals=[];
  selP.forEach(function(k){
    if(campAvgs[k]) allAvgVals.push({k:k,v:parseFloat(campAvgs[k]),type:"camp"});
    if(histAvgs[k]) allAvgVals.push({k:k,v:parseFloat(histAvgs[k]),type:"hist"});
  });
  allAvgVals.sort(function(a,b){return b.v-a.v;});
  // Assign y-nudge so labels that are close together spread out
  var LABEL_MIN_GAP=14; // px minimum between labels
  var assigned=[];
  allAvgVals.forEach(function(item){
    // Convert value to approximate pixel position is not possible here,
    // so instead we store order index and use dy offset in label
    item.orderIdx=assigned.length;
    assigned.push(item);
  });
  function getLabelDy(k, type){
    var found=allAvgVals.find(function(x){return x.k===k&&x.type===type;});
    return found ? found.orderIdx*(-LABEL_MIN_GAP) : 0;
  }

  // Min width: at least 60px per session so dates are readable on mobile
  var minW = Math.max(600, rows.length * 10);

  if(chartType==="bar"){
    return(
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{minWidth:minW}}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={rows} margin={{right:80,left:0,top:10,bottom:40}}>
              <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="date" tick={<XTick/>} axisLine={false} tickLine={false} interval={0} height={50}/>
              <YAxis tick={{fill:"#94a3b8",fontSize:10,fontFamily:"monospace"}} axisLine={false} tickLine={false} unit="€" domain={["auto","auto"]}/>
              <Tooltip content={<ChartTT/>}/>
              <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
              {selP.map(function(k){var p=ALL_PRODS.find(function(x){return x.key===k;});return p?<Bar key={k} dataKey={k} name={p.label} fill={p.color} opacity={0.8} radius={[2,2,0,0]}/>:null;})}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return(
    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{minWidth:minW}}>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={timeline} margin={{right:70,left:0,top:30,bottom:40}}
            style={{overflow:"visible"}}>
        <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9"/>
        <XAxis dataKey="date" tick={<XTick/>} axisLine={false} tickLine={false}
          interval={0} height={50}
          tickFormatter={function(v){return (v&&v.includes("_sep"))?"":v;}}/>
        <YAxis tick={{fill:"#94a3b8",fontSize:10,fontFamily:"monospace"}} axisLine={false}
          tickLine={false} unit="€" domain={["auto","auto"]}/>
        <Tooltip content={<ChartTT/>}/>
        <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>

        {/* Shaded gap zones */}
        {gaps.map(function(g,i){
          return <ReferenceArea key={"ga"+i} x1={g.x1} x2={g.x2}
            fill="#e2e8f0" fillOpacity={0.6} stroke="none"/>;
        })}

        {/* Event vertical lines + emoji at top */}
        {visEvs.map(function(ev){
          return(
            <ReferenceLine key={ev.date} x={ev.date}
              stroke="#7c3aed" strokeDasharray="3 3" strokeWidth={1.2} strokeOpacity={0.4}
              label={<EventLabel emoji={ev.emoji}/>}/>
          );
        })}

        {/* Historical avg — fine dotted, NO label (overlay handles it) */}
        {showHistAvg&&selP.map(function(k){
          var p=ALL_PRODS.find(function(x){return x.key===k;});
          if(!histAvgs[k])return null;
          return <ReferenceLine key={"hav"+k} y={histAvgs[k]} stroke={p.color}
            strokeDasharray="2 3" strokeWidth={1.5} strokeOpacity={0.45}/>;
        })}

        {/* Campaign avg — long dash, NO label (overlay handles it) */}
        {showCampAvg&&selP.map(function(k){
          var p=ALL_PRODS.find(function(x){return x.key===k;});
          if(!campAvgs[k])return null;
          return <ReferenceLine key={"cav"+k} y={campAvgs[k]} stroke={p.color}
            strokeDasharray="10 4" strokeWidth={2} strokeOpacity={0.8}/>;
        })}

        {/* Avg labels overlay — uses yAxis scale to compute pixel positions */}
        <Customized component={function(cProps){
          var yAxis=cProps.yAxis;
          if(!yAxis||!yAxis.scale) return null;
          var scale=yAxis.scale;
          var xRight=cProps.offset?cProps.offset.left+cProps.offset.width:0;
          // Build list of {pixelY, value, color, dash}
          var items=[];
          selP.forEach(function(k){
            var p=ALL_PRODS.find(function(x){return x.key===k;});if(!p)return;
            if(showHistAvg&&histAvgs[k]) items.push({py:scale(histAvgs[k]),value:histAvgs[k],color:p.color,dash:true});
            if(showCampAvg&&campAvgs[k]) items.push({py:scale(campAvgs[k]),value:campAvgs[k],color:p.color,dash:false});
          });
          if(!items.length) return null;
          // Sort by pixel Y, resolve overlaps
          items.sort(function(a,b){return a.py-b.py;});
          var LH=12,GAP=2;
          items.forEach(function(item){item.fy=item.py;});
          for(var i=1;i<items.length;i++){
            var minY=items[i-1].fy+LH+GAP;
            if(items[i].fy<minY) items[i].fy=minY;
          }
          for(var j=items.length-2;j>=0;j--){
            var maxY=items[j+1].fy-LH-GAP;
            if(items[j].fy>maxY) items[j].fy=maxY;
          }
          var lx=xRight+6;
          return(
            <g style={{overflow:"visible"}}>
              {items.map(function(item,ii){
                return(
                  <g key={ii}>
                    {Math.abs(item.fy-item.py)>3&&(
                      <line x1={lx-2} y1={item.py} x2={lx+2} y2={item.fy}
                        stroke={item.color} strokeWidth={0.5} strokeOpacity={0.5}/>
                    )}
                    <rect x={lx-2} y={item.fy-6} width={52} height={12}
                      fill="white" fillOpacity={0.92} rx={2}/>
                    <text x={lx} y={item.fy+2} fill={item.color} fontSize={8}
                      fontFamily="monospace" fontWeight={item.dash?"400":"700"}
                      style={{userSelect:"none"}}>
                      {item.dash?"···":"—"} {item.value}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        }}/>

        {/* Solid lines — connectNulls=true so line stays continuous */}
        {selP.map(function(k){
          var p=ALL_PRODS.find(function(x){return x.key===k;});
          return p?<Line key={k} type="monotone" dataKey={k} name={p.label}
            stroke={p.color} strokeWidth={2} dot={false}
            activeDot={{r:4,strokeWidth:0}} connectNulls={true} legendType="line"/>:null;
        })}

      </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── UI helpers ────────────────────────────────────────────────────────────────
// Fixed table layout: group headers on top, subcategory chips below each column.
// Uses <table> with fixed layout so columns are always equal-width and aligned.
function ProdSelector(props){
  var selP=props.selP,setSelP=props.setSelP;
  function tog(k){setSelP(function(p){return p.includes(k)?p.filter(function(x){return x!==k;}):[...p,k];});}
  var GNAMES={
    "Trigo Blando Nacional":"TRIGO BLANDO",
    "Trigo Duro Nacional":  "TRIGO DURO",
    "Trigo Importación":    "T. IMP.",
    "Cebada":               "CEBADA",
    "Triticale":            "TRITICALE",
    "Avena":                "AVENA",
    "Maíz":                 "MAÍZ",
    "Leguminosas":          "LEGUMINOS.",
    "Oleaginosas":          "OLEAGIN.",
  };
  function shortLabel(p){
    var k=p.key;
    // Trigo Blando Nac: solo el grado (G1, G2, G3, G4, Pienso)
    if(k==="tbn_g1")return "G1";
    if(k==="tbn_g2")return "G2";
    if(k==="tbn_g3")return "G3";
    if(k==="tbn_g4")return "G4";
    if(k==="tbn_pienso")return "Pienso";
    // Trigo Duro Nac: solo el grado
    if(k==="tdn_g1")return "G1";
    if(k==="tdn_g2")return "G2";
    if(k==="tdn_g3")return "G3";
    if(k==="tdn_g4")return "G4";
    // Trigo Imp: solo Pienso
    if(k==="ti_pienso")return "Pienso";
    // Cebada, Avena, Maíz: Nacional / Imp.
    if(k==="cebada_nac")return "Nacional";
    if(k==="cebada_imp")return "Imp.";
    if(k==="avena_nac") return "Nacional";
    if(k==="avena_imp") return "Imp.";
    if(k==="maiz_nac")  return "Nacional";
    if(k==="maiz_imp")  return "Imp.";
    // Triticale: igual que antes
    if(k==="trit_nac")  return "Nacional";
    if(k==="trit_imp")  return "Imp.";
    // Leguminosas: nombre completo
    if(k==="habas_nac")  return "Habas Nac.";
    if(k==="habas_imp")  return "Habas Imp.";
    if(k==="guisan_nac") return "Guisantes Nac.";
    if(k==="guisan_imp") return "Guisantes Imp.";
    // Oleaginosas
    if(k==="girasol_conv") return "G. Convencional";
    if(k==="girasol_alto") return "G. Alto Oleico";
    if(k==="colza")        return "Colza";
    return p.label;
  }
  var maxRows=PROD_GROUPS.reduce(function(m,g){return Math.max(m,g.products.length);},0);
  var ncols=PROD_GROUPS.length;
  return(
    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
      <table style={{
        tableLayout:"fixed",borderCollapse:"collapse",
        width:"100%",minWidth:540,
      }}>
        <colgroup>
          {PROD_GROUPS.map(function(_,i){
            return <col key={i} style={{width:(100/ncols).toFixed(2)+"%"}}/>;
          })}
        </colgroup>
        <thead>
          <tr>
            {PROD_GROUPS.map(function(g,gi){
              return(
                <th key={g.group} style={{
                  padding:"0 6px 7px 6px",
                  textAlign:"left",
                  fontSize:9,fontWeight:800,letterSpacing:1,
                  textTransform:"uppercase",
                  color:"#334155",
                  fontFamily:"'DM Mono',monospace",
                  borderBottom:"2px solid #e2e8f0",
                  borderRight:gi<ncols-1?"1px solid #f1f5f9":"none",
                  whiteSpace:"nowrap",
                  overflow:"hidden",
                }}>{GNAMES[g.group]||g.group}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({length:maxRows},function(_,ri){
            return(
              <tr key={ri}>
                {PROD_GROUPS.map(function(g,gi){
                  var p=g.products[ri];
                  var on=p&&selP.includes(p.key);
                  return(
                    <td key={g.group} style={{
                      padding:"3px 6px",
                      verticalAlign:"top",
                      borderRight:gi<ncols-1?"1px solid #f1f5f9":"none",
                    }}>
                      {p&&(
                        <button onClick={function(){tog(p.key);}} style={{
                          display:"block",width:"100%",
                          padding:"3px 7px",borderRadius:5,textAlign:"left",
                          border:"1.5px solid "+(on?p.color:"#e2e8f0"),
                          background:on?p.color+"18":"#fff",
                          color:on?p.color:"#94a3b8",
                          fontSize:11,fontWeight:on?700:500,
                          cursor:"pointer",transition:"all .13s",
                          whiteSpace:"nowrap",overflow:"hidden",
                          textOverflow:"ellipsis",lineHeight:1.4,
                        }}>{shortLabel(p)}</button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChartToggle(props){
  var v=props.value,oc=props.onChange;
  return(
    <div style={{display:"flex",background:"#f1f5f9",borderRadius:8,padding:3,gap:2,flexShrink:0}}>
      {[{v:"line",l:"〰 Línea"},{v:"bar",l:"▌ Barras"}].map(function(opt){
        return(
          <button key={opt.v} onClick={function(){oc(opt.v);}} style={{
            background:v===opt.v?"#fff":"transparent",color:v===opt.v?"#0284c7":"#94a3b8",
            border:"none",borderRadius:6,padding:"5px 12px",fontSize:12,
            fontWeight:v===opt.v?700:400,cursor:"pointer",transition:"all .15s"}}>{opt.l}</button>
        );
      })}
    </div>
  );
}

// ── Alertas tab (self-contained with own product selector state) ──────────────
function AlertasTab(props){
  var box=props.box,chartType=props.chartType,setChartType=props.setChartType;
  var _s=useState(["tbn_g3","cebada_nac","maiz_imp","girasol_conv","colza"]);
  var selP=_s[0];var setSelP=_s[1];

  var divergences = computeDivergences(selP);
  var N_SES = 8; // sessions for the reference table

  return(
    <div style={{animation:"fi .3s ease"}}>

      {/* ── Selector de cultivos PRIMERO ── */}
      <div style={Object.assign({},box,{marginBottom:14})}>
        <div style={{fontSize:12,color:"#64748b",fontWeight:600,marginBottom:10}}>
          Cultivos a analizar
        </div>
        <ProdSelector selP={selP} setSelP={setSelP}/>
      </div>

      {/* ── Tabla comparativa: franja por cultivo, lonjas debajo ── */}
      <div style={Object.assign({},box,{marginBottom:14})}>
        <div style={{fontSize:13,fontWeight:700,color:"#334155",marginBottom:4,
          display:"flex",alignItems:"center",gap:8}}>
          📊 Comparativa de lonjas — últimas {N_SES} sesiones
        </div>
        <div style={{fontSize:11,color:"#94a3b8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>
          Precio €/t · <span style={{color:"#16a34a"}}>verde</span> = subida sesión anterior · <span style={{color:"#dc2626"}}>rojo</span> = bajada
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace",minWidth:500}}>
            <thead>
              <tr style={{borderBottom:"2px solid #f1f5f9"}}>
                <th style={{padding:"6px 10px",textAlign:"left",color:"#94a3b8",fontWeight:600,whiteSpace:"nowrap",width:160}}>Cultivo · Lonja</th>
                {SESSION_DATES.slice(-N_SES).map(function(d){return(
                  <th key={d} style={{padding:"6px 6px",textAlign:"right",color:"#94a3b8",fontWeight:400,whiteSpace:"nowrap",fontSize:10}}>{d.slice(5)}</th>
                );})}
                <th style={{padding:"6px 10px",textAlign:"right",color:"#64748b",fontWeight:700,whiteSpace:"nowrap"}}>Var.</th>
              </tr>
            </thead>
            <tbody>
              {selP.map(function(pk,pi){
                var tr2 = TRACKED.find(function(t){return t.key===pk;});
                return SOURCES.map(function(src,si){
                  var series = MARKET_DATA[src.id];
                  var last8 = SESSION_DATES.slice(-N_SES).map(function(d){
                    var row = series.find(function(r){return r.date===d;});
                    return row ? row[pk] : null;
                  });
                  var first=last8.find(function(x){return x!=null;});
                  var last=last8.slice().reverse().find(function(x){return x!=null;});
                  var chg=first&&last?((last-first)/first*100).toFixed(1):null;
                  var isFirstLonja = si===0;
                  var isLastLonja = si===SOURCES.length-1;
                  return(
                    <tr key={pk+src.id} style={{
                      borderBottom:isLastLonja?"3px solid #e2e8f0":"1px solid #fafafa",
                      background:pi%2===0?(si%2===0?"#fff":"#fcfcfd"):(si%2===0?"#f8fafc":"#f5f8fb")}}>
                      <td style={{padding:"5px 10px",whiteSpace:"nowrap"}}>
                        {isFirstLonja&&(
                          <div style={{fontSize:10,fontWeight:700,color:"#334155",
                            fontFamily:"'DM Mono',monospace",marginBottom:1}}>
                            {tr2?tr2.label:pk}
                          </div>
                        )}
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:11}}>{src.flag}</span>
                          <span style={{color:src.color,fontWeight:600,fontSize:11}}>{src.label.replace("Lonja ","")}</span>
                        </div>
                      </td>
                      {last8.map(function(v,vi){
                        var prev=vi>0?last8[vi-1]:null;
                        var up=prev!=null&&v!=null&&v>prev;
                        var dn=prev!=null&&v!=null&&v<prev;
                        return(
                          <td key={vi} style={{padding:"5px 6px",textAlign:"right",
                            color:v!=null?(up?"#16a34a":dn?"#dc2626":"#334155"):"#e2e8f0",
                            fontWeight:up||dn?600:400}}>
                            {v!=null?v.toFixed(0):"—"}
                          </td>
                        );
                      })}
                      <td style={{padding:"5px 10px",textAlign:"right",fontWeight:700,
                        color:chg!=null?(parseFloat(chg)>0?"#16a34a":parseFloat(chg)<0?"#dc2626":"#64748b"):"#94a3b8"}}>
                        {chg!=null?((parseFloat(chg)>0?"+":"")+chg+"%"):"—"}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Explicación ── */}
      <div style={Object.assign({},box,{background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",
        border:"1px solid #bfdbfe",marginBottom:14})}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
          <span style={{fontSize:26,flexShrink:0}}>🔔</span>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:4}}>Divergencias entre lonjas</div>
            <div style={{fontSize:13,color:"#475569",lineHeight:1.7}}>
              Se detecta cuando una lonja sube o baja más del <b>{DIV_THRESH}%</b> respecto
              a la mediana del resto en las últimas <b>{DIV_WINDOW} sesiones</b>.
              Una divergencia puede anticipar un movimiento generalizado, reflejar
              un exceso de oferta regional, o responder a demanda puntual.
            </div>
            <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
              {SOURCES.map(function(s){return(
                <span key={s.id} style={{fontSize:11,padding:"3px 10px",borderRadius:20,
                  background:s.color+"18",color:s.color,border:"1px solid "+s.color+"33",
                  fontFamily:"'DM Mono',monospace",fontWeight:600}}>
                  {s.flag} {s.label}
                </span>
              );})}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alertas ── */}
      {divergences.length===0?(
        <div style={Object.assign({},box,{textAlign:"center",padding:"40px 16px"})}>
          <div style={{fontSize:28,marginBottom:10}}>✅</div>
          <div style={{fontSize:14,fontWeight:600,color:"#475569",marginBottom:4}}>
            Sin divergencias en los cultivos seleccionados
          </div>
          <div style={{fontSize:12,color:"#94a3b8"}}>
            Todas las lonjas se mueven en línea. Umbral: ±{DIV_THRESH}% en {DIV_WINDOW} sesiones.
          </div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {divergences.map(function(al,i){
            var isUp=al.diff>0;
            var isStrong=al.intensity==="FUERTE";
            var borderColor=isStrong?(isUp?"#16a34a":"#dc2626"):(isUp?"#4ade80":"#f87171");
            var bgColor=isStrong?(isUp?"#f0fdf4":"#fff1f2"):(isUp?"#f7fef9":"#fff8f8");
            return(
              <div key={i} style={{background:bgColor,borderRadius:14,
                border:"1.5px solid "+borderColor,padding:"16px 20px",
                boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
                  {/* Source + product */}
                  <div style={{minWidth:160}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:18}}>{al.sourceFlag}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{al.sourceLabel}</div>
                        <div style={{fontSize:11,color:"#64748b",fontFamily:"'DM Mono',monospace"}}>{al.productLabel}</div>
                      </div>
                    </div>
                    <div style={{fontSize:28,fontWeight:700,color:"#0f172a",lineHeight:1}}>
                      {al.lastPrice}<span style={{fontSize:12,color:"#94a3b8",fontWeight:400}}> €/t</span>
                    </div>
                  </div>
                  {/* Movement */}
                  <div style={{flex:1,minWidth:160}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{fontSize:20}}>{isUp?"📈":"📉"}</span>
                      <span style={{fontSize:20,fontWeight:800,color:isUp?"#16a34a":"#dc2626"}}>
                        {isUp?"+":""}{al.change}%
                      </span>
                      <span style={{fontSize:11,color:"#64748b",fontFamily:"'DM Mono',monospace"}}>
                        en {DIV_WINDOW} sesiones
                      </span>
                    </div>
                    <div style={{fontSize:11,color:"#64748b",fontFamily:"'DM Mono',monospace",lineHeight:1.7}}>
                      Resto lonjas: <b style={{color:"#334155"}}>{al.medianMove.toFixed(1)}%</b>
                      <br/>
                      Divergencia: <b style={{color:isUp?"#16a34a":"#dc2626"}}>{isUp?"+":""}{al.diff.toFixed(1)}% vs mediana</b>
                    </div>
                  </div>
                  {/* Intensity */}
                  <div style={{minWidth:180}}>
                    <span style={{display:"inline-block",fontSize:10,fontWeight:700,
                      padding:"3px 10px",borderRadius:20,marginBottom:8,
                      fontFamily:"'DM Mono',monospace",
                      background:isStrong?(isUp?"#dcfce7":"#fee2e2"):(isUp?"#f0fdf4":"#fff1f2"),
                      color:isStrong?(isUp?"#14532d":"#7f1d1d"):(isUp?"#15803d":"#b91c1c"),
                      border:"1px solid "+(isStrong?(isUp?"#86efac":"#fca5a5"):(isUp?"#bbf7d0":"#fecaca"))}}>
                      {isStrong?"⚡":"〰"} {al.intensity}
                    </span>
                    <div style={{fontSize:11,color:"#475569",lineHeight:1.65}}>
                      {isUp
                        ?(isStrong?"Subida inusualmente fuerte. Puede anticipar movimiento alcista generalizado o reflejar demanda puntual."
                                  :"Presión alcista moderada. Vigilar si otras lonjas siguen.")
                        :(isStrong?"Caída intensa no reflejada en el resto. Posible exceso de oferta local o ajuste de calidad."
                                  :"Presión bajista moderada. Puede ser estacionalidad local.")}
                    </div>
                  </div>
                </div>
                {/* Other lonjas strip */}
                <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid "+borderColor+"55"}}>
                  <div style={{fontSize:10,color:"#94a3b8",fontFamily:"'DM Mono',monospace",marginBottom:6}}>
                    Variación resto de lonjas (mismas {DIV_WINDOW} sesiones):
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {SOURCES.filter(function(s){return s.id!==al.sourceId;}).map(function(s){
                      var series=MARKET_DATA[s.id];if(!series)return null;
                      var vals=series.map(function(r){return r[al.productKey];}).filter(function(x){return x!=null;});
                      if(vals.length<DIV_WINDOW+1)return null;
                      var recent=vals.slice(-DIV_WINDOW);
                      var mv=((recent[recent.length-1]-recent[0])/recent[0]*100).toFixed(1);
                      var mvN=parseFloat(mv);
                      return(
                        <div key={s.id} style={{display:"flex",alignItems:"center",gap:5,
                          padding:"4px 10px",borderRadius:20,background:"#fff",
                          border:"1px solid #e2e8f0",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
                          <span>{s.flag}</span>
                          <span style={{color:"#64748b"}}>{s.label}</span>
                          <span style={{fontWeight:700,color:mvN>0?"#16a34a":mvN<0?"#dc2626":"#64748b"}}>
                            {mvN>0?"+":""}{mv}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{background:"#fef9c3",borderRadius:10,padding:"12px 16px",fontSize:12,
        color:"#92400e",border:"1px solid #fde68a",fontFamily:"'DM Mono',monospace",
        lineHeight:1.6,marginTop:14}}>
        ⚠️ Divergencias orientativas. Una desviación regional puede tener causas legítimas. No son asesoramiento financiero.
      </div>
    </div>
  );
}


// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard(props){
  var allDataProp = props.allData || [];
  var lonjaName = props.lonjaName || "Lonja de Sevilla";
  var lonjaColor = props.lonjaColor || "#0284c7";
  var onBack = props.onBack || function(){};

  var DEF=["tbn_g3","cebada_nac"];
  var _t=useState("historico");var tab=_t[0];var setTab=_t[1];
  var _hs=useState(DEF);var hSelP=_hs[0];var setHSelP=_hs[1];
  var _cs=useState(DEF);var cSelP=_cs[0];var setCSelP=_cs[1];
  var _ms=useState(DEF);var mSelP=_ms[0];var setMSelP=_ms[1];
  var _ss=useState(["tbn_g3","cebada_nac","maiz_imp","girasol_conv","colza"]);
  var sSelP=_ss[0];var setSSelP=_ss[1];
  var _ct=useState("line");var chartType=_ct[0];var setChartType=_ct[1];
  var _ca=useState("24-25");var camp=_ca[0];var setCamp=_ca[1];
  var _cc=useState(["22-23","23-24","24-25"]);var campCmp=_cc[0];var setCampCmp=_cc[1];
  // Default range: earliest → latest date in actual data
  var today=new Date().toISOString().slice(0,10);
  var earliestDate=allDataProp.length?allDataProp[0].date:"2015-01-01";
  var latestDate=allDataProp.length?allDataProp[allDataProp.length-1].date:today;
  var _fr=useState(null);var from=_fr[0];var setFrom=_fr[1];
  var _to=useState(null);var to=_to[0];var setTo=_to[1];
  // Once data arrives set the range to cover all of it
  var effectiveFrom = from || earliestDate;
  var effectiveTo   = to   || latestDate;
  var _rp=useState("tbn_g3");var recP=_rp[0];var setRecP=_rp[1];

  function togC(k){setCampCmp(function(p){return p.includes(k)?p.filter(function(x){return x!==k;}):[...p,k];});}

  var filtered=allDataProp.filter(function(r){return r.date>=effectiveFrom&&r.date<=effectiveTo;});
  var cc=CAMPS.find(function(c){return c.id===camp;});
  var crows=cc?campRows(cc,allDataProp):[];
  var sig=getSig(recP);
  var CC=["#0284c7","#16a34a","#dc2626","#d97706","#7c3aed","#db2777","#0891b2","#65a30d","#ea580c","#9333ea","#0f766e"];
  var YRS=["2015","2016","2017","2018","2019","2020","2021","2022","2023","2024","2025","2026"];
  var TABS=[
    {id:"historico",l:"📈 Histórico"},{id:"campana",l:"🗓 Campaña"},
    {id:"comparativa",l:"⚖️ Comparativa"},{id:"senales",l:"🤖 Señales"},
    {id:"alertas",l:"🔔 Alertas",badge:ALL_DIVERGENCES.length}
  ];
  var box={background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:14,
    border:"1px solid #f1f5f9",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"};

  function statCard(rows,k){
    var p=ALL_PRODS.find(function(x){return x.key===k;});if(!p)return null;
    var vals=rows.map(function(r){return r[k];}).filter(function(x){return x!=null;});
    var last=vals.length?vals[vals.length-1]:null;
    var prev=vals.length>1?vals[vals.length-2]:null;
    var a=avgOf(rows,k);
    var diff=last!=null&&prev!=null?+(last-prev).toFixed(1):null;
    var diffPct=prev&&diff!=null?+(diff/prev*100).toFixed(1):null;
    return(
      <div key={k} style={{background:"#fff",borderRadius:14,padding:"16px",
        border:"1px solid #f1f5f9",borderTop:"4px solid "+p.color,
        boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>{p.label}</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:2}}>
          <div style={{fontSize:30,fontWeight:700,color:"#0f172a",lineHeight:1}}>
            {last!=null?last:"—"}<span style={{fontSize:12,color:"#94a3b8",fontWeight:400}}> €</span>
          </div>
          {diff!=null&&(
            <div style={{fontSize:12,fontWeight:700,marginBottom:3,
              color:diff>0?"#16a34a":diff<0?"#dc2626":"#94a3b8"}}>
              {diff>0?"+":""}{diff} ({diffPct>0?"+":""}{diffPct}%)
            </div>
          )}
        </div>
        <div style={{fontSize:10,color:"#94a3b8",fontFamily:"'DM Mono',monospace",marginTop:4,display:"flex",gap:8}}>
          <span>avg {a}</span>
          {prev!=null&&<span style={{color:"#cbd5e1"}}>·</span>}
          {prev!=null&&<span>anterior {prev} €</span>}
        </div>
      </div>
    );
  }

  function campCard(k){
    var p=ALL_PRODS.find(function(x){return x.key===k;});if(!p)return null;
    var last=lastVal(crows,k),a=avgOf(crows,k);
    var vals=crows.map(function(r){return r[k];}).filter(function(x){return x!=null;});
    var mn=vals.length?Math.min.apply(null,vals):0,mx=vals.length?Math.max.apply(null,vals):0;
    var lv=last!=null?last:mn,pct=mn===mx?50:Math.round((lv-mn)/(mx-mn)*100);
    return(
      <div key={k} style={{background:"#fff",borderRadius:14,padding:"16px",
        border:"1px solid #f1f5f9",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:11,color:"#64748b",marginBottom:8,fontFamily:"'DM Mono',monospace"}}>{p.label}</div>
        <div style={{fontSize:30,fontWeight:700,color:"#0f172a",lineHeight:1,marginBottom:4}}>
          {last}<span style={{fontSize:12,color:"#94a3b8",fontWeight:400}}> €</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94a3b8",marginBottom:8,fontFamily:"'DM Mono',monospace"}}>
          <span>↓{mn}</span><span>avg {a}</span><span>↑{mx}</span>
        </div>
        <div style={{height:5,background:"#f1f5f9",borderRadius:3}}>
          <div style={{height:"100%",background:p.color,borderRadius:3,width:pct+"%",transition:"width .6s"}}/>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:"#f8fafc",color:"#0f172a"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}body,*{font-family:'DM Sans',sans-serif;}
        ::-webkit-scrollbar{width:4px;height:4px;background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:2px}
        input[type=date]{border:1.5px solid #e2e8f0;background:#fff;color:#334155;
          padding:6px 10px;border-radius:8px;font-size:12px;
          font-family:'DM Mono',monospace;outline:none;}
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #f1f5f9",padding:"0 20px",
        position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 0",flex:1}}>
            {/* Back button */}
            <button onClick={onBack} style={{
              background:"none",border:"1px solid #e2e8f0",borderRadius:8,
              padding:"6px 10px",cursor:"pointer",color:"#64748b",fontSize:12,
              display:"flex",alignItems:"center",gap:4,flexShrink:0,
              transition:"all .15s"
            }}>← Lonjas</button>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,"+lonjaColor+","+lonjaColor+"cc)",
              borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌾</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#0f172a",lineHeight:1.1}}>{lonjaName}</div>
              <div style={{fontSize:10,color:"#94a3b8",fontFamily:"'DM Mono',monospace"}}>
                {allDataProp.length} SES · {ALL_PRODS.length} PROD · 2015–2026
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
            {TABS.map(function(t){return(
              <button key={t.id} onClick={function(){setTab(t.id);}} style={{
                background:tab===t.id?"#eff6ff":"transparent",color:tab===t.id?"#0284c7":"#94a3b8",
                border:"none",borderRadius:8,padding:"9px 14px",fontSize:13,
                fontWeight:tab===t.id?700:500,cursor:"pointer",transition:"all .15s",
                position:"relative"}}>
                {t.l}
                {t.badge>0&&<span style={{position:"absolute",top:4,right:4,
                  background:"#dc2626",color:"#fff",fontSize:9,fontWeight:700,
                  borderRadius:10,padding:"1px 5px",lineHeight:1.4}}>{t.badge}</span>}
              </button>
            );})}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"20px 16px"}}>

        {/* ══ HISTÓRICO ══ */}
        {tab==="historico"&&(
          <div style={{animation:"fi .3s ease"}}>
            <div style={box}>
              <div style={{marginBottom:12}}>
                <ProdSelector selP={hSelP} setSelP={setHSelP}/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:"#64748b",fontWeight:600}}>Rango:</span>
                <input type="date" value={effectiveFrom} onChange={function(e){setFrom(e.target.value);}}/>
                <span style={{color:"#cbd5e1"}}>—</span>
                <input type="date" value={effectiveTo} onChange={function(e){setTo(e.target.value);}}/>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {YRS.map(function(y){return(
                    <button key={y} onClick={function(){setFrom(y+"-01-01");setTo(y+"-12-31");}}
                      style={{background:"#f8fafc",border:"1px solid #e2e8f0",color:"#64748b",
                        borderRadius:6,padding:"4px 9px",fontSize:11,cursor:"pointer",
                        fontFamily:"'DM Mono',monospace"}}>{y}</button>
                  );})}
                  <button onClick={function(){setFrom(earliestDate);setTo(latestDate);}}
                    style={{background:"#eff6ff",border:"1px solid #bfdbfe",color:"#0284c7",
                      borderRadius:6,padding:"4px 9px",fontSize:11,cursor:"pointer",
                      fontFamily:"'DM Mono',monospace",fontWeight:700}}>Todo</button>
                </div>
                <span style={{fontSize:11,color:"#94a3b8",fontFamily:"'DM Mono',monospace"}}>{filtered.length} ses.</span>
                <div style={{marginLeft:"auto"}}><ChartToggle value={chartType} onChange={setChartType}/></div>
              </div>
            </div>
            {/* ── Tarjetas encima del gráfico ── */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:10,marginBottom:14}}>
              {hSelP.map(function(k){return statCard(filtered,k);})}
            </div>

            <div style={Object.assign({},box,{padding:"4px 10px 10px"})}>
              <PriceChart rows={filtered} selP={hSelP} chartType={chartType} height={400}
                showCampAvg={true} from={effectiveFrom} to={effectiveTo}/>
              <div style={{paddingLeft:10,paddingTop:4,fontSize:10,color:"#94a3b8",
                fontFamily:"'DM Mono',monospace",display:"flex",gap:14,flexWrap:"wrap"}}>
                <span>— — media período</span>
                <span style={{color:"#7c3aed"}}>┊ evento de mercado</span>
                <span style={{background:"#e2e8f0",padding:"0 5px",borderRadius:3,color:"#64748b"}}>█ sin cotización</span>
              </div>
            </div>

            {/* ── Últimas sesiones table — valores alineados a la izquierda ── */}
            {filtered.length>0&&hSelP.length>0&&(
              <div style={Object.assign({},box,{padding:"14px 16px"})}>
                <div style={{fontSize:13,fontWeight:700,color:"#334155",marginBottom:12}}>
                  Últimas sesiones
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,fontFamily:"'DM Mono',monospace",minWidth:400}}>
                    <thead>
                      <tr style={{borderBottom:"2px solid #f1f5f9"}}>
                        <th style={{padding:"6px 12px",textAlign:"left",color:"#94a3b8",fontWeight:600,whiteSpace:"nowrap"}}>Fecha</th>
                        {hSelP.map(function(k){
                          var p=ALL_PRODS.find(function(x){return x.key===k;});
                          return p?<th key={k} style={{padding:"6px 12px",textAlign:"left",color:p.color,fontWeight:600,whiteSpace:"nowrap"}}>{p.label}</th>:null;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(-12).reverse().map(function(row,ri){
                        var prevRow=filtered.slice(-12).reverse()[ri+1];
                        return(
                          <tr key={row.date} style={{borderBottom:"1px solid #f8fafc",
                            background:ri%2===0?"#fff":"#fafbfc"}}>
                            <td style={{padding:"6px 12px",color:"#64748b",whiteSpace:"nowrap"}}>{row.date}</td>
                            {hSelP.map(function(k){
                              var v=row[k];
                              var vp=prevRow?prevRow[k]:null;
                              var up=vp!=null&&v!=null&&v>vp;
                              var dn=vp!=null&&v!=null&&v<vp;
                              return(
                                <td key={k} style={{padding:"6px 12px",textAlign:"left",
                                  color:v!=null?(up?"#16a34a":dn?"#dc2626":"#334155"):"#e2e8f0",
                                  fontWeight:up||dn?600:400}}>
                                  {v!=null?v+" €":"—"}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CAMPAÑA ══ */}
        {tab==="campana"&&(
          <div style={{animation:"fi .3s ease"}}>
            <div style={box}>
              <div style={{marginBottom:12}}>
                <ProdSelector selP={cSelP} setSelP={setCSelP}/>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'DM Mono',monospace"}}>Campaña (oct–oct):</span>
                {CAMPS.map(function(c){return(
                  <button key={c.id} onClick={function(){setCamp(c.id);}} style={{
                    background:camp===c.id?"#0284c7":"#f8fafc",color:camp===c.id?"#fff":"#64748b",
                    border:"1px solid "+(camp===c.id?"#0284c7":"#e2e8f0"),borderRadius:8,
                    padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer",
                    transition:"all .15s",fontFamily:"'DM Mono',monospace"}}>{c.label}</button>
                );})}
                <div style={{marginLeft:"auto"}}><ChartToggle value={chartType} onChange={setChartType}/></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:12,marginBottom:14}}>
              {cSelP.map(function(k){return campCard(k);})}
            </div>
            <div style={Object.assign({},box,{padding:"4px 10px 10px"})}>
              <div style={{fontSize:13,fontWeight:700,color:"#334155",paddingLeft:10,paddingTop:12,
                marginBottom:4,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
                <span>Evolución campaña {cc?cc.label:""} · {crows.length} sesiones</span>
                <span style={{fontSize:11,color:"#94a3b8",fontFamily:"'DM Mono',monospace",fontWeight:400}}>
                  — — media campaña &nbsp;&nbsp; · · · media histórica 2015–2026
                </span>
              </div>
              <PriceChart rows={crows} selP={cSelP} chartType={chartType} height={320}
                showCampAvg={true} showHistAvg={true} histRows={allDataProp}
                from={cc?cc.start:""} to={cc?cc.end:""} tickInterval={3}/>
            </div>
          </div>
        )}

        {/* ══ COMPARATIVA ══ */}
        {tab==="comparativa"&&(
          <div style={{animation:"fi .3s ease"}}>
            <div style={box}>
              <div style={{marginBottom:12}}>
                <ProdSelector selP={mSelP} setSelP={setMSelP}/>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#64748b",fontWeight:600,fontFamily:"'DM Mono',monospace"}}>Campañas:</span>
                {CAMPS.map(function(c){return(
                  <button key={c.id} onClick={function(){togC(c.id);}} style={{
                    background:campCmp.includes(c.id)?"#dbeafe":"#f8fafc",
                    color:campCmp.includes(c.id)?"#1d4ed8":"#64748b",
                    border:"1.5px solid "+(campCmp.includes(c.id)?"#93c5fd":"#e2e8f0"),
                    borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,
                    cursor:"pointer",transition:"all .15s",fontFamily:"'DM Mono',monospace"}}>{c.label}</button>
                );})}
                <div style={{marginLeft:"auto"}}><ChartToggle value={chartType} onChange={setChartType}/></div>
              </div>
            </div>
            {mSelP.map(function(pk){
              var p=ALL_PRODS.find(function(x){return x.key===pk;});if(!p)return null;
              var maxLen=0,sm={};
              campCmp.forEach(function(cid){var c=CAMPS.find(function(x){return x.id===cid;});if(!c)return;var r=campRows(c);sm[cid]=r;if(r.length>maxLen)maxLen=r.length;});

              // ── Uniform grid: 12 months × 4 slots = 48 slots per campaign ──
              // Map each real session to a slot by its month position in campaign
              // Campaign starts October (month 10)
              var CAMP_MONTHS=["10","11","12","01","02","03","04","05","06","07","08","09"];
              var SLOTS_PER_MONTH=4;
              var TOTAL_SLOTS=CAMP_MONTHS.length*SLOTS_PER_MONTH;
              var MONTH_NAMES={"10":"oct","11":"nov","12":"dic","01":"ene","02":"feb","03":"mar","04":"abr","05":"may","06":"jun","07":"jul","08":"ago","09":"sep"};

              // Build uniform slot array
              var slots=[];
              for(var si=0;si<TOTAL_SLOTS;si++){
                var mIdx=Math.floor(si/SLOTS_PER_MONTH);
                var slotInMonth=si%SLOTS_PER_MONTH;
                var monName=CAMP_MONTHS[mIdx]?MONTH_NAMES[CAMP_MONTHS[mIdx]]:"";
                slots.push({
                  slot:si,
                  monthIdx:mIdx,
                  slotInMonth:slotInMonth,
                  label:monName,
                  isMonthStart:slotInMonth===0,
                });
              }

              // Assign campaign rows to slots by month
              // For each campaign, group sessions by calendar month, then fill slots 0-3
              campCmp.forEach(function(cid){
                var rows2=sm[cid]||[];
                // Group rows by month string
                var byMonth={};
                rows2.forEach(function(r){
                  var mon=r.date.slice(5,7);
                  if(!byMonth[mon])byMonth[mon]=[];
                  byMonth[mon].push(r);
                });
                // Assign to slots
                CAMP_MONTHS.forEach(function(mon,mi){
                  var mRows=byMonth[mon]||[];
                  for(var s=0;s<SLOTS_PER_MONTH;s++){
                    var slotIdx=mi*SLOTS_PER_MONTH+s;
                    if(slotIdx<TOTAL_SLOTS){
                      var rowVal=mRows[s]?mRows[s][pk]:null;
                      if(rowVal!=null) slots[slotIdx][cid]=rowVal;
                    }
                  }
                });
              });

              function CmpXTick(tickProps){
                var x=tickProps.x,y=tickProps.y,index=tickProps.index;
                var slot=slots[index];
                if(!slot)return null;
                if(slot.isMonthStart){
                  return(
                    <g transform={"translate("+x+","+(y+2)+")"}>
                      <line x1={0} y1={0} x2={0} y2={6} stroke="#94a3b8" strokeWidth={1.5}/>
                      <text x={0} y={16} textAnchor="middle" fill="#334155"
                        fontSize={9} fontFamily="monospace" fontWeight="700">
                        {slot.label}
                      </text>
                    </g>
                  );
                }
                // Mid-slot: tiny tick
                return(
                  <g transform={"translate("+x+","+(y+2)+")"}>
                    <line x1={0} y1={0} x2={0} y2={3} stroke="#e2e8f0" strokeWidth={1}/>
                  </g>
                );
              }

              return(
                <div key={pk} style={Object.assign({},box,{padding:"14px 10px 12px",marginBottom:14})}>
                  <div style={{display:"flex",alignItems:"center",gap:8,paddingLeft:10,marginBottom:10}}>
                    <span style={{width:10,height:10,borderRadius:2,background:p.color,display:"inline-block"}}/>
                    <span style={{fontSize:14,fontWeight:700,color:"#334155"}}>{p.label}</span>
                    <span style={{fontSize:11,color:"#94a3b8",fontFamily:"'DM Mono',monospace"}}>€/t · campaña oct–oct · 4 slots/mes</span>
                  </div>
                  {chartType==="bar"?(
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={slots} margin={{right:14,left:0,bottom:32}}>
                        <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false}/>
                        <XAxis dataKey="slot" tick={<CmpXTick/>} axisLine={false} tickLine={false} interval={0} height={36}/>
                        <YAxis tick={{fill:"#94a3b8",fontSize:9,fontFamily:"monospace"}} axisLine={false} tickLine={false} unit="€" domain={["auto","auto"]}/>
                        <Tooltip content={<ChartTT/>} labelFormatter={function(_,payload){return payload&&payload[0]?slots[payload[0].payload.slot].label||"":""}}/>
                        <Legend wrapperStyle={{fontSize:11,paddingTop:6}}/>
                        {campCmp.map(function(cid,ci){return <Bar key={cid} dataKey={cid} name={"Camp. "+cid} fill={CC[ci%CC.length]} opacity={0.8} radius={[2,2,0,0]}/>;} )}
                      </BarChart>
                    </ResponsiveContainer>
                  ):(
                    <ResponsiveContainer width="100%" height={200}>
                      <ComposedChart data={slots} margin={{right:14,left:0,bottom:32}}>
                        <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9"/>
                        <XAxis dataKey="slot" tick={<CmpXTick/>} axisLine={false} tickLine={false} interval={0} height={36}/>
                        <YAxis tick={{fill:"#94a3b8",fontSize:9,fontFamily:"monospace"}} axisLine={false} tickLine={false} unit="€" domain={["auto","auto"]}/>
                        <Tooltip content={<ChartTT/>}/>
                        <Legend wrapperStyle={{fontSize:11,paddingTop:6}}/>
                        {campCmp.map(function(cid,ci){return <Line key={cid} type="monotone" dataKey={cid} name={"Camp. "+cid} stroke={CC[ci%CC.length]} strokeWidth={2} dot={false} activeDot={{r:4,strokeWidth:0}} connectNulls={true}/>;} )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ SEÑALES ══ */}
        {tab==="senales"&&(
          <div style={{animation:"fi .3s ease"}}>
            <div style={box}><ProdSelector selP={sSelP} setSelP={setSSelP}/></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:10,marginBottom:20}}>
              {sSelP.map(function(k){
                var p=ALL_PRODS.find(function(x){return x.key===k;});if(!p)return null;
                var si=getSig(k),active=recP===k;
                return(
                  <div key={k} onClick={function(){setRecP(k);}} style={{
                    background:"#fff",border:"2px solid "+(active?p.color:"#f1f5f9"),
                    borderRadius:14,padding:"14px",cursor:"pointer",transition:"all .15s",
                    boxShadow:active?"0 6px 20px rgba(0,0,0,0.1)":"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:6,fontFamily:"'DM Mono',monospace"}}>{p.label}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:24}}>{si.icon}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,
                        background:si.bg,color:si.color,fontFamily:"'DM Mono',monospace"}}>{si.s}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {sig&&(
              <div style={Object.assign({},box,{marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"})}>
                <div style={{display:"flex",gap:18,alignItems:"flex-start",flexWrap:"wrap"}}>
                  <div style={{width:56,height:56,background:sig.bg,borderRadius:14,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{sig.icon}</div>
                  <div style={{flex:1,minWidth:180}}>
                    <div style={{fontSize:11,color:"#94a3b8",marginBottom:4,fontFamily:"'DM Mono',monospace"}}>
                      Señal · {(function(){var p=ALL_PRODS.find(function(p){return p.key===recP;});return p?p.label:"";})()}
                    </div>
                    <div style={{fontSize:26,fontWeight:700,color:sig.color,marginBottom:8}}>{sig.s}</div>
                    <p style={{fontSize:14,color:"#334155",lineHeight:1.75}}>{sig.desc}</p>
                  </div>
                </div>
              </div>
            )}
            <div style={Object.assign({},box,{marginBottom:14})}>
              <div style={{fontSize:14,fontWeight:700,color:"#334155",marginBottom:14,
                display:"flex",alignItems:"center",gap:8}}>
                <span>🔬</span> Cómo se determinan las señales
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[
                  {icon:"📊",t:"Posición en campaña",     d:"Precio vs máximo/mínimo de la campaña (oct–oct). Tercio superior → VENDER; tercio inferior → COMPRAR."},
                  {icon:"📈",t:"Tendencia reciente",       d:"Pendiente media de las últimas 6 sesiones. Positiva acelerada → VENDER; negativa sostenida → COMPRAR."},
                  {icon:"🗓️",t:"Estacionalidad histórica", d:"Patrón estacional 2015–2024. Detecta si el momento actual está en fase alcista o bajista histórica."},
                  {icon:"⌀", t:"Desviación sobre media",   d:">+10% sobre media histórica → VENDER. <-8% → COMPRAR."},
                  {icon:"🔁",t:"Confirmación multiseñal",  d:"Necesarios ≥2 criterios coincidentes. Si hay contradicción → ESPERAR."},
                  {icon:"⚠️",t:"Limitaciones",             d:"Solo análisis estadístico histórico. No incluye clima, cosechas ni geopolítica. No es asesoramiento financiero."},
                ].map(function(it,i){
                  return(
                    <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px",background:"#f8fafc",borderRadius:10}}>
                      <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{it.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:3}}>{it.t}</div>
                        <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{it.d}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{background:"#fef9c3",borderRadius:10,padding:"12px 16px",fontSize:12,
              color:"#92400e",border:"1px solid #fde68a",fontFamily:"'DM Mono',monospace",lineHeight:1.6}}>
              ⚠️ Señales orientativas basadas en análisis estadístico histórico. No constituyen asesoramiento financiero.
            </div>
          </div>
        )}
        {/* ══ ALERTAS ══ */}
        {tab==="alertas"&&(
          <AlertasTab box={box} chartType={chartType} setChartType={setChartType}/>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
