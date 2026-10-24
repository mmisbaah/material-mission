"use strict";
/* Material Mission: SVG test-bench scenes, drawn from state. */
/* ====================== RENDERERS ====================== */
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const bench = (y=200) => `<rect x="0" y="${y}" width="400" height="${240-y}" class="f-bench"/><line x1="0" y1="${y}" x2="400" y2="${y}" stroke="var(--benchline)" stroke-width="2"/>`;
const ms = (tag, a, mat, fillCls) => `<${tag} ${a} class="${fillCls||"f-m-"+mat} st"/><${tag} ${a} fill="url(#tx-${mat})" class="nopt"/>`;
const drop = (x,y,s=1,cls="") => `<path class="f-water ${cls}" d="M${x} ${y} q${4*s} ${7*s} 0 ${10*s} q${-4*s} ${-3*s} 0 ${-10*s}z"/>`;

function turtle(cx, y, w, wet){
  const h = w*0.42;
  let g = `<ellipse cx="${cx}" cy="${y-h*0.55}" rx="${w/2}" ry="${h*0.6}" class="f-palm st"/>
    <path d="M${cx-w*0.3} ${y-h*0.6} L${cx} ${y-h*0.95} L${cx+w*0.3} ${y-h*0.6} L${cx} ${y-h*0.3}Z" class="tex" />
    <circle cx="${cx+w/2+8}" cy="${y-h*0.5}" r="9" class="f-palm st"/><circle cx="${cx+w/2+11}" cy="${y-h*0.55}" r="1.8" class="f-ink"/>
    <rect x="${cx-w*0.35}" y="${y-8}" width="12" height="8" rx="3" class="f-palm st"/><rect x="${cx+w*0.22}" y="${y-8}" width="12" height="8" rx="3" class="f-palm st"/>`;
  if (wet) for (let i=0;i<4;i++) g += drop(cx-w*0.3+i*w*0.2, y-h*1.05+(i%2)*6, 1.1);
  return g;
}
function crab(size=58){
  return `<svg viewBox="0 0 60 60" width="${size}" height="${size}" aria-hidden="true">
   <path d="M10 30 q-8 -10 -2 -18 q4 6 10 4" class="f-coral st"/><path d="M50 30 q8 -10 2 -18 q-4 6 -10 4" class="f-coral st"/>
   <ellipse cx="30" cy="36" rx="18" ry="12" class="f-coral st"/>
   <line x1="24" y1="26" x2="22" y2="16" class="ln"/><line x1="36" y1="26" x2="38" y2="16" class="ln"/>
   <circle cx="22" cy="15" r="4" class="f-surface st"/><circle cx="38" cy="15" r="4" class="f-surface st"/>
   <circle cx="22" cy="15" r="1.6" class="f-ink"/><circle cx="38" cy="15" r="1.6" class="f-ink"/>
   <path d="M24 40 q6 4 12 0" class="ln"/>
   <path d="M14 44 l-6 6 M18 46 l-4 7 M46 44 l6 6 M42 46 l4 7" class="ln"/></svg>`;
}

function itemIcon(id){
  const it = ITEMS[id], c = it.fill, t = it.tx ? `url(#tx-${it.tx})` : null;
  const P = {spoon:[["ellipse",'cx="50" cy="30" rx="17" ry="22"'],["rect",'x="45" y="48" width="10" height="46" rx="5"']],
    bag:[["rect",'x="20" y="36" width="60" height="56" rx="6"']], cup:[["path",'d="M26 18 L74 18 L67 92 L33 92 Z"']],
    ball:[["circle",'cx="50" cy="55" r="28"']], sheet:[["rect",'x="14" y="36" width="72" height="40" rx="2"']],
    ruler:[["rect",'x="8" y="42" width="84" height="18" rx="2"']], stone:[["path",'d="M18 70 Q16 40 44 34 Q76 30 82 58 Q86 84 54 84 Q22 86 18 70Z"']],
    coconut:[["circle",'cx="50" cy="54" r="32"']], shell:[["path",'d="M50 88 L16 46 Q50 8 84 46 Z"']],
    leaf:[["path",'d="M50 90 Q12 60 28 20 Q60 6 80 30 Q88 66 50 90Z"']], bottle:[["path",'d="M40 10 h20 v16 q14 8 14 22 v42 h-48 v-42 q0 -14 14 -22z"']],
    jar:[["rect",'x="24" y="30" width="52" height="60" rx="10"']], can:[["rect",'x="28" y="20" width="44" height="70" rx="6"']],
    box:[["rect",'x="20" y="22" width="60" height="68" rx="2"']], pile:[["path",'d="M10 88 Q50 18 90 88Z"']],
    glass:[["path",'d="M30 46 L70 46 L66 90 L34 90Z"']], balloon:[["ellipse",'cx="50" cy="40" rx="26" ry="30"']],
    cube:[["rect",'x="28" y="36" width="44" height="44" rx="6"']], bar:[["rect",'x="14" y="34" width="72" height="40" rx="3"']],
    egg:[["ellipse",'cx="50" cy="52" rx="24" ry="32"']], loaf:[["path",'d="M14 82 v-24 q0 -28 36 -28 q36 0 36 28 v24z"']]}[it.shape];
  let g = "";
  if (it.shape==="bag") g += `<path d="M34 40 Q50 4 66 40" class="k-c-${it.colour}" stroke-width="6" fill="none"/>`;
  if (it.shape==="glass") g += `<path d="M28 14 L72 14 L66 90 L34 90Z" class="f-surface st"/>`;
  if (it.shape==="balloon") g += `<path d="M50 70 q-6 12 0 24" class="ln"/>`;
  if (it.shape==="jar") g += `<rect x="28" y="20" width="44" height="12" rx="3" class="f-m-metal st"/>`;
  P.forEach(([tag,a]) => g += `<${tag} ${a} class="${c} st"/>${t?`<${tag} ${a} fill="${t}"/>`:""}`);
  if (it.shape==="ruler") g += `<path d="M20 42 v8 M32 42 v5 M44 42 v8 M56 42 v5 M68 42 v8 M80 42 v5" class="stn"/>`;
  if (it.shape==="shell") g += `<path d="M50 86 L34 30 M50 86 L50 22 M50 86 L66 30" class="tex"/>`;
  if (it.shape==="leaf") g += `<path d="M50 88 Q48 50 70 26" class="tex"/>`;
  if (it.shape==="coconut" && id!=="husk") g += `<circle cx="42" cy="40" r="3" class="f-ink"/>`;
  if (it.shape==="can") g += `<ellipse cx="50" cy="22" rx="22" ry="5" class="f-m-metal st"/>`;
  if (it.shape==="bar") g += `<path d="M38 34 v40 M62 34 v40 M14 54 h72" class="tex"/>`;
  if (it.shape==="box") g += `<path d="M20 34 h60" class="tex"/>`;
  if (it.shape==="cube") g += `<path d="M36 44 l6 22" class="hi"/>`;
  if (it.tx==="plastic" && ["cup","spoon","ball","bottle","jar"].includes(it.shape)) g += `<path d="M38 30 Q34 44 38 58" class="hi"/>`;
  return `<g>${g}</g>`;
}
function cardOf(m, id){ return m.play.cards.find(c=>c.id===id) || {id, label:id, fill:"f-surface", tx:null}; }
function matSwatch(card){
  return `<svg class="sw" viewBox="0 0 64 40" aria-hidden="true"><rect x="1" y="1" width="62" height="38" rx="7" class="${card.fill} st"/>${card.tx?`<rect x="1" y="1" width="62" height="38" rx="7" fill="url(#tx-${card.tx})"/>`:""}${card.tx==="plastic"?'<path d="M14 32 L24 8" class="hi"/>':""}</svg>`;
}

const R = {};
R.items = (s,r,o) => { const it = ITEMS[o.item];
  return {g:`${bench(205)}<g transform="translate(130,40) scale(1.45)">${itemIcon(o.item)}</g>`,
    alt:`${it.name}: colour ${it.colour}, feels ${it.feel}.`}; };

R.squash = (s,r,o) => {
  const ob = s.object, ac = s.action || "press", st = r ? r.change : (ob==="cushion"&&o.result ? "squash" : "none");
  let shape;
  if (ob==="paper") shape = st==="bend" ? `<path d="M110 196 Q200 120 290 196" class="pl-out"/><path d="M110 196 Q200 120 290 196" class="pl-in"/>` : ms("rect",'x="110" y="192" width="180" height="7"',"paper");
  else if (ob==="sponge") shape = st==="squash" ? ms("rect",'x="138" y="172" width="124" height="28" rx="6"',"sponge") : st==="bend" ? ms("path",'d="M140 168 Q200 138 260 168 L260 198 Q200 170 140 198 Z"',"sponge") : ms("rect",'x="150" y="140" width="100" height="60" rx="6"',"sponge");
  else if (ob==="block") shape = ms("rect",'x="155" y="140" width="90" height="60" rx="3"',"wood");
  else if (ob==="clay") shape = st==="squash" ? `<ellipse cx="200" cy="188" rx="74" ry="13" class="f-clay st"/>` : `<ellipse cx="200" cy="172" rx="46" ry="28" class="f-clay st"/>`;
  else if (ob==="band") shape = st==="stretch" ? `<ellipse cx="200" cy="170" rx="96" ry="6" fill="none" stroke="var(--c-brown)" stroke-width="5"/>` : `<ellipse cx="200" cy="170" rx="44" ry="12" fill="none" stroke="var(--c-brown)" stroke-width="5"/>`;
  else if (ob==="string") shape = `<path d="M130 170 Q200 176 270 170" fill="none" stroke="var(--m-card)" stroke-width="4"/><path d="M130 170 Q200 176 270 170" fill="none" class="stn" stroke-width=".7"/>`;
  else if (ob==="stick") shape = ms("rect",'x="130" y="164" width="140" height="12" rx="4"',"wood");
  else shape = st==="squash" ? ms("rect",'x="128" y="170" width="144" height="30" rx="14"',"cloth") : ms("rect",'x="140" y="132" width="120" height="68" rx="24"',"cloth");
  let f = "";
  if (ac==="press") {
    const top = st==="squash" ? 170 : ob==="paper" ? 192 : ob==="cushion" ? 132 : 140;
    f = `<rect x="165" y="${top-16}" width="70" height="14" rx="7" class="f-coral st"/><path d="M200 ${top-56} v26" class="arrow"/>`;
  } else if (ac==="pull") { const e = st==="stretch" ? 96 : 70; f = `<path d="M${200-e-4} 170 h-34" class="arrow"/><path d="M${200+e+4} 170 h34" class="arrow"/>`; }
  else f = `<path d="M100 170 q-14 -36 14 -58" class="arrow"/><path d="M300 170 q14 -36 -14 -58" class="arrow"/>`;
  if (r && r.stays===true) f = `<rect x="165" y="70" width="70" height="14" rx="7" class="f-coral st"/><path d="M200 66 v-22" class="arrow"/>` + `<text x="320" y="120" text-anchor="middle" class="t-s">let go: stays flat</text>`;
  if (r && r.stays===false) { shape = ms("rect",'x="150" y="140" width="100" height="60" rx="6"',"sponge"); f = `<rect x="165" y="70" width="70" height="14" rx="7" class="f-coral st"/><path d="M200 66 v-22" class="arrow"/><text x="320" y="120" text-anchor="middle" class="t-s">let go: springs back</text>`; }
  const names = {paper:"paper sheet",sponge:"sponge",block:"wooden block",cushion:"cushion",clay:"lump of clay",band:"rubber band",string:"piece of string",stick:"wooden stick"};
  return {g:bench(200)+shape+f, alt:`A ${names[ob]} being ${ac==="press"?"pressed":ac==="pull"?"pulled":"bent"} gently. ${r ? r.obs : "Not tested yet."}`};
};

R.container = (s,r,o) => {
  const k = s.container, cx = 200; let g = bench(200);
  if (k==="cup" || k==="bowl") {
    const d = k==="cup" ? `M${cx-42} 96 L${cx+42} 96 L${cx+33} 198 L${cx-33} 198 Z` : `M${cx-70} 124 Q${cx} 236 ${cx+70} 124 Z`;
    const w = k==="cup" ? `M${cx-38} 108 L${cx+38} 108 L${cx+31} 196 L${cx-31} 196 Z` : `M${cx-64} 132 Q${cx} 226 ${cx+64} 132 Z`;
    g += ms("path",`d="${d}"`, k==="cup"?"plastic":"wood");
    if (r) g += `<path d="${w}" class="f-water" opacity=".85"/>`;
    if (k==="cup") g += `<path d="M${cx-26} 106 L${cx-20} 186" class="hi"/>`;
  } else {
    const basket = k==="basket";
    const d = basket ? `M${cx-58} 100 L${cx+58} 100 L${cx+44} 198 L${cx-44} 198 Z` : `M${cx-70} 124 Q${cx} 236 ${cx+70} 124 Z`;
    if (r) g += `<ellipse cx="${cx}" cy="212" rx="80" ry="7" class="f-water" opacity=".7"/>`;
    g += ms("path",`d="${d}"`, basket?"basket":"metal");
    const holes = basket ? [[-30,120],[0,120],[30,120],[-24,150],[6,150],[34,150],[-16,180],[14,180]] : [[-40,140],[-14,140],[14,140],[40,140],[-26,160],[0,160],[26,160],[-12,178],[12,178]];
    holes.forEach(([x,y]) => g += `<circle cx="${cx+x}" cy="${y}" r="${basket?5:4}" class="f-sky st" stroke-width="1"/>`);
    if (!basket) g += `<rect x="${cx+70}" y="118" width="70" height="10" rx="5" class="f-m-metal st"/>`;
    if (r) { g += `<path d="M${cx-38} 186 Q${cx} 194 ${cx+38} 186 L${cx+40} 196 L${cx-40} 196Z" class="f-water" opacity=".8"/>`;
      [[-20,204],[10,214],[30,206],[-4,222]].forEach(([x,y])=> g += drop(cx+x,y,1.2,"fall")); }
  }
  if (!r) g += `<g transform="translate(60,40)"><path d="M0 0 h36 v44 h-36z" class="f-m-plastic st"/><path d="M36 10 q14 0 14 14" class="ln"/>${drop(18,52,1.4)}</g><text x="44" y="30" class="t-s">same water</text>`;
  const nm = {cup:"A plastic cup",basket:"A woven basket with holes",sieve:"A metal sieve with holes",bowl:"A wooden bowl with no holes"}[k];
  return {g, alt:`${nm}. ${r ? r.obs : "Not tested yet."}`};
};

R.absorb = (s,r,o) => {
  const sm = s.sample, mat = {towel:"paper",plastic:"plastic",cloth:"cloth",bag:"plastic",raincoat:"plastic",shirt:"cloth",cotton:"cloth",paper:"paper"}[sm];
  const fill = s.colour ? "f-c-"+s.colour : "f-m-"+mat;
  const pts = 'points="100,160 300,160 330,198 70,198"';
  let g = bench(198) + ms("polygon", pts, mat, fill);
  g += `<g><rect x="186" y="14" width="28" height="54" rx="6" class="f-m-plastic st"/><ellipse cx="200" cy="14" rx="18" ry="10" class="f-coral st"/><path d="M194 68 L200 86 L206 68Z" class="f-m-plastic st"/></g>`;
  if (s.coat==="wax") g += `<polygon ${pts} fill="url(#tx-plastic)"/><text x="300" y="150" class="t-s">wax</text>`;
  if (o.anim) for (let i=0;i<3;i++) g += `<g class="fall" style="animation-delay:${i*.25}s">${drop(200,92,1.3)}</g>`;
  if (r) {
    const xs = [130,170,200,235,270];
    xs.forEach((x,i)=> g += i < r.top ? `<circle cx="${x}" cy="${172+(i%2)*10}" r="8" class="f-water st" stroke-width="1"/><circle cx="${x-3}" cy="${169+(i%2)*10}" r="2.4" class="hif"/>` : `<ellipse cx="${x}" cy="${178+(i%2)*8}" rx="20" ry="7" class="f-wet" opacity=".38"/>`);
  }
  const nm = {towel:"paper towel",plastic:"plastic sheet",cloth:"cotton cloth",bag:"plastic bag",raincoat:"plastic raincoat",shirt:"cotton T-shirt",cotton:"cotton",paper:"paper"}[sm]+(s.coat==="wax"?" with a wax coating":"");
  return {g, alt:`A square of ${s.colour?s.colour+" ":""}${nm} under a dropper. ${r ? r.obs : "Not tested yet."}`};
};

R.shade = (s,r,o) => {
  const beach = o.beach, W = s.roof==="wide" ? 120 : 60, toyW = beach ? 96 : 96, lit = !!(r || o.anim || beach);
  let g = "";
  g += `<rect x="40" y="10" width="320" height="18" rx="8" class="f-m-metal st"/><text x="200" y="23" text-anchor="middle" class="t-s">${beach?"sun":"torch light"}</text>`;
  if (lit) g += `<rect x="40" y="28" width="320" height="172" class="f-light" opacity=".75"/>`;
  g += bench(200);
  if (beach) { g += `<rect x="${200-toyW/2}" y="194" width="${toyW}" height="6" class="f-c-red st"/>`; }
  if (lit) g += `<rect x="${200-W/2}" y="${beach?100:108}" width="${W}" height="${beach?94:92}" class="f-shade" opacity=".55"/>`;
  if (!beach) g += turtle(200, 200, toyW*0.8, false);
  if (beach) g += `<path d="M${200-W/2} 100 Q200 60 ${200+W/2} 100Z" class="f-coral st"/><line x1="200" y1="78" x2="200" y2="196" class="ln"/>`;
  else g += ms("rect",`x="${200-W/2}" y="100" width="${W}" height="8"`,"card") + `<line x1="${200-W/2+4}" y1="108" x2="${200-W/2+4}" y2="200" class="ln"/><line x1="${200+W/2-4}" y1="108" x2="${200+W/2-4}" y2="200" class="ln"/>`;
  if (lit && W < toyW) { [[200-toyW/2+6,170],[200+toyW/2-6,170]].forEach(([x,y]) => g += `<g transform="translate(${x},${y})"><circle r="6" class="f-sun st"/><path d="M-11 0h-4M11 0h4M0 -11v-4" class="ln"/></g>`); }
  if (r) g += `<line x1="${200-W/2}" y1="216" x2="${200+W/2}" y2="216" class="ln" marker-end="url(#arr)" marker-start="url(#arr)"/><text x="200" y="232" text-anchor="middle" class="t">shade ${r.shade} cm</text>`;
  if (!beach) g += `<text x="200" y="94" text-anchor="middle" class="t-m">${s.roof==="wide"?"wide roof 10 cm":"narrow roof 5 cm"}</text>`;
  return {g, alt: beach ? `A beach umbrella over a 120 cm mat, sun straight above.` : `A ${s.roof} roof over a toy turtle 8 cm wide, under torch light. ${r ? r.obs : "Torch off, not tested yet."}`};
};

R.cover = (s,r,o) => {
  const cup = o.mode==="cup", mat = s.material, slope = s.shape!=="flat";
  const fill = s.colour ? "f-c-"+s.colour : "f-m-"+mat;
  let g = bench(200);
  const drops = [70,110,150,190,230,270,310,340];
  drops.forEach((x,i)=> g += `<g class="rain" style="animation-delay:${(i%3)*.2}s">${drop(x, 22+(i%3)*16, 1.2)}</g>`);
  const coverPath = slope ? (r && r.flow==="pool" ? "" : 'points="110,82 290,124 290,132 110,90"') : (r && r.flow==="pool" ? "" : 'points="110,100 290,100 290,108 110,108"');
  if (!slope && r && r.flow==="pool") g += ms("path",'d="M110 100 Q200 122 290 100 L290 108 Q200 130 110 108Z"',mat,fill) + `<ellipse cx="200" cy="108" rx="52" ry="7" class="f-water"/>`;
  else g += ms("polygon",coverPath,mat,fill);
  g += `<line x1="115" y1="${slope?90:108}" x2="115" y2="200" class="ln"/><line x1="285" y1="${slope?130:108}" x2="285" y2="200" class="ln"/>`;
  if (cup) {
    const lv = r ? Math.min(54, r.v*0.6) : 0;
    g += `<path d="M175 140 L225 140 L221 198 L179 198Z" class="f-m-plastic st"/>`;
    if (lv) g += `<path d="M${179+0.07*(54-lv)} ${198-lv} L${221-0.07*(54-lv)} ${198-lv} L221 197 L179 197Z" class="f-water" opacity=".85"/>`;
    [150,165,180].forEach((y,i)=> g += `<line x1="175" y1="${y+4}" x2="183" y2="${y+4}" class="stn"/>`);
    g += `<text x="200" y="134" text-anchor="middle" class="t-s">${r ? r.v+" mL" : "cup"}</text>`;
  } else g += turtle(200, 200, 70, r && !r.dry);
  if (r) {
    if (r.flow==="off"||r.flow==="both") g += `<path d="M130 ${slope?86:104} L288 ${slope?124:104}" class="flow"/><path d="M292 128 Q300 160 304 196" class="flow"/><ellipse cx="312" cy="200" rx="22" ry="4" class="f-water"/>`;
    if (r.flow==="soak"||r.flow==="both"||r.flow==="pool") [[170,0],[200,12],[230,4]].forEach(([x,dy])=> g += drop(x, (slope?118:118)+dy, 1.1, "fall"));
  }
  const nm = {cloth:"cloth",plastic:"plastic",metal:"metal",paper:"paper",leaf:"banana-leaf"}[mat];
  return {g, alt:`A ${slope?"sloping":"flat"} ${s.colour?s.colour+" ":""}${nm} cover in the rain over ${cup?"a measuring cup":"a toy turtle"}. ${r ? (r.obs || (r.v+" mL came through.")) : "Not tested yet."}`};
};

R.bridge = (s,r,o) => {
  const gap = parseInt(s.gap,10)*9, mat = o.mat || "paper", x1 = 200-gap/2, x2 = 200+gap/2;
  let g = bench(200);
  g += ms("rect",`x="${x1-80}" y="140" width="80" height="60"`,"wood") + ms("rect",`x="${x2}" y="140" width="80" height="60"`,"wood");
  const n = r ? r.v : 0, sag = r ? (s.shape==="flat" ? 16 : 6) : 0;
  const L = x1-40, Rr = x2+40, inCls = mat==="card" ? "pc-in" : "pp-in";
  let d;
  if (s.shape==="flat") d = `M${L} 138 L${x1} 138 Q200 ${138+sag*2} ${x2} 138 L${Rr} 138`;
  else { const seg = 12, cnt = Math.round((Rr-L)/seg); d = `M${L} 138`;
    for (let i=1;i<=cnt;i++){ const x = L+i*seg, t = (x-x1)/(x2-x1), dip = (x>x1&&x<x2) ? sag*4*t*(1-t) : 0; d += ` L${x} ${(i%2? 128:138)+dip}`; } }
  g += `<path d="${d}" class="pl-out"/><path d="${d}" class="${inCls}"/>`;
  for (let i=0;i<n;i++) g += `<ellipse cx="200" cy="${126+sag-i*8}" rx="16" ry="5" class="f-coral st"/>`;
  g += `<line x1="${x1}" y1="216" x2="${x2}" y2="216" class="ln" marker-start="url(#arr)" marker-end="url(#arr)"/><text x="200" y="232" text-anchor="middle" class="t">gap ${s.gap} cm</text>`;
  if (r) g += `<text x="200" y="${118+sag-n*8}" text-anchor="middle" class="t-d">${n}</text>`;
  return {g, alt:`A ${s.shape} ${mat} bridge across a ${s.gap} cm gap. ${r ? `It held ${n} counters.` : "No counters yet."}`};
};

R.tower = (s,r,o) => {
  const h = s.height==="tall" ? 65 : 45, cx = 200, w = 50;
  let g = bench(200);
  const tube = (y, rot) => `<g ${rot?`transform="rotate(${rot} ${cx} ${y+h})"`:""}>${ms("rect",`x="${cx-w/2}" y="${y}" width="${w}" height="${h}" rx="4"`,"paper")}${o.stripes?`<rect x="${cx-w/2}" y="${y+h/3}" width="${w}" height="${h/5}" class="f-c-red"/>`:""}<ellipse cx="${cx}" cy="${y}" rx="${w/2}" ry="5" class="f-m-paper st"/></g>`;
  const fail = !!r;
  g += tube(200-h, 0);
  const joinY = 200-h, topY = 200-2*h, rot = fail ? (r.v < 6 ? 7 : 3) : (s.join==="small"?4:0);
  let top = tube(topY, 0);
  let blocks = ""; const n = r ? r.v : 0;
  for (let i=0;i<n;i++) blocks += `<rect x="${cx-18}" y="${topY-8-i*8}" width="36" height="8" class="f-m-wood st" stroke-width="1.4"/>`;
  g += `<g transform="rotate(${rot} ${cx+w/2} ${joinY})">${top}${blocks}</g>`;
  if (s.join==="small") g += `<rect x="${cx+w/2-6}" y="${joinY-5}" width="10" height="10" class="f-m-plastic st" stroke-width="1.4"/>`;
  if (s.join==="wrap" || s.join==="tab") g += `<rect x="${cx-w/2-3}" y="${joinY-7}" width="${w+6}" height="14" class="f-m-plastic st" stroke-width="1.4"/>`;
  if (s.join==="tab") g += `<path d="M${cx-w/2} ${joinY+7} l8 12 l8 -12 M${cx+w/2-16} ${joinY+7} l8 12 l8 -12" class="f-m-paper st" stroke-width="1.4"/>`;
  if (r) g += `<rect x="${cx+60}" y="${topY-40}" width="36" height="8" class="f-m-wood st" transform="rotate(25 ${cx+78} ${topY-36})"/><text x="${cx+72}" y="${topY-50}" class="t-s">next block bends it</text><text x="70" y="60" class="t-d">${n} blocks</text>`;
  const jn = {small:"a small piece of tape",wrap:"tape wrapped all round",tab:"folded tabs and tape"}[s.join];
  return {g, alt:`A ${s.height} paper tower of two tubes joined with ${jn}. ${r ? `It held ${n} blocks.` : "No blocks yet."}`};
};

R.reuse = (s,r,o) => {
  let g = bench(206);
  if (o.bottle) {
    g += `<path d="M180 60 h40 v20 q20 10 20 30 v84 h-80 v-84 q0 -20 20 -30z" class="f-m-plastic st"/><rect x="186" y="48" width="28" height="14" rx="3" class="f-c-blue st"/>
      <path d="M190 194 l8 -10 l6 8 l8 -12" class="ln" stroke="var(--bad)" stroke-width="3"/>` + drop(196,206,1.3) + drop(212,216,1.1) + `<ellipse cx="205" cy="226" rx="30" ry="4" class="f-water"/>`;
    return {g, alt:"A drinking bottle with a split base, leaking water."};
  }
  const days = ["S","M","T","W","T","S","M","T","W","T"];
  days.forEach((d,i)=>{ const x = 30+i*30; g += `<rect x="${x}" y="40" width="26" height="40" rx="5" class="f-surface st" stroke-width="1.4"/><text x="${x+13}" y="54" text-anchor="middle" class="t-s">${d}</text><text x="${x+13}" y="94" text-anchor="middle" class="t-m">${i+1}</text>`;
    if (r) { if (s.plan==="bags") g += `<path d="M${x+6} 62 h14 v12 h-14z M${x+9} 62 q4 -6 8 0" class="f-m-plastic st" stroke-width="1"/>`;
             else g += `<path d="M${x+7} 66 l4 5 l8 -10" class="ln" stroke="var(--ok)"/>`; } });
  g += `<g transform="translate(70,130)"><rect x="0" y="20" width="90" height="50" rx="8" class="f-m-plastic st"/><rect x="-4" y="10" width="98" height="14" rx="5" class="f-m-plastic st"/><rect x="38" y="18" width="14" height="10" class="${s.plan==="repair"&&r?"f-palm":"f-coral"} st"/>${s.plan==="repair"&&!r?'<path d="M40 22 l10 4" class="ln"/>':""}</g>`;
  const waste = r ? r.waste : 0;
  g += `<g transform="translate(260,120)"><path d="M0 10 h80 l-8 76 h-64z" class="f-m-metal st"/><rect x="-6" y="0" width="92" height="12" rx="4" class="f-m-metal st"/><text x="40" y="58" text-anchor="middle" class="t-d">${r?waste:"?"}</text><text x="40" y="76" text-anchor="middle" class="t-s">thrown away</text></g>`;
  const pn = {repair:"repair the lid clip",replace:"replace the container",bags:"use a new bag each day"}[s.plan];
  return {g, alt:`Ten school days, Sunday to Thursday, two weeks. Plan: ${pn}. ${r ? r.obs : "Not tested yet."}`};
};

R.pan = (s,r,o) => {
  let g = bench(205);
  if (o.spoon) {
    g += `<path d="M120 120 h160 v80 h-160z" class="f-m-metal st"/><path d="M124 132 h152 v64 h-152z" class="f-c-yellow" opacity=".75"/>`;
    g += ms("rect",'x="210" y="40" width="12" height="130" rx="6" transform="rotate(20 216 105)"', s.spoon==="wood"?"wood":"metal");
    g += `<path d="M150 112 q6 -12 0 -24 M180 112 q6 -12 0 -24" class="ln-m"/>`;
    return {g, alt:`A ${s.spoon==="wood"?"wooden":"metal"} spoon in a pot of hot soup.`};
  }
  g += `<rect x="110" y="195" width="180" height="10" class="f-m-metal st"/><path d="M125 192 h150" class="heat" stroke-dasharray="10 6"/>`;
  g += ms("path",'d="M118 136 L282 136 L272 190 L128 190 Z"', s.body==="wood"?"wood":"metal");
  g += `<path d="M126 150 L274 150 L270 184 L130 184Z" class="f-water" opacity=".8"/>`;
  g += ms("rect",'x="282" y="140" width="96" height="14" rx="7"', s.handle==="wood"?"wood":"metal");
  if (r) {
    if (r.hot) g += `<path d="M160 128 q8 -14 0 -28 M200 128 q8 -14 0 -28 M240 128 q8 -14 0 -28" class="ln-m"/>`;
    g += `<path d="M150 188 q4 -8 0 -16 M200 188 q4 -8 0 -16 M250 188 q4 -8 0 -16" class="heat"/>`;
    if (s.handle==="steel") g += `<path d="M290 147 H${r.temp>40?370:320}" class="arrow"/>`;
    const th = Math.min(60, r.temp);
    g += `<g transform="translate(360,40)"><rect x="0" y="0" width="14" height="70" rx="7" class="f-surface st"/><rect x="3" y="${66-th}" width="8" height="${th}" rx="4" class="f-coral"/><circle cx="7" cy="76" r="9" class="f-coral st"/></g><text x="352" y="30" text-anchor="end" class="t">${r.temp} °C</text>`;
  }
  g += `<text x="200" y="230" text-anchor="middle" class="t-m">virtual stove: no real flames</text>`;
  return {g, alt:`A pan with a ${s.body} body and a ${s.handle} handle on a virtual stove. ${r ? `${r.food}. Handle ${r.temp} °C (example).` : "Not heated yet."}`};
};

R.track = (s,r,o) => {
  const H = s.start==="high" ? 70 : 40, surf = s.surface;
  let g = `<rect x="0" y="200" width="400" height="40" class="f-bench"/>`;
  g += ms("polygon",`points="10,190 80,190 10,${190-H}"`,"wood");
  g += `<rect x="80" y="186" width="314" height="14" class="f-s-${surf} st"/><rect x="80" y="186" width="314" height="14" fill="url(#tx-${surf})"/>`;
  for (let d=0; d<=200; d+=50) { const x = 80+d*1.5; g += `<line x1="${x}" y1="204" x2="${x}" y2="212" class="ln"/><text x="${x}" y="226" text-anchor="middle" class="t-s">${d}${d===200?" cm":""}</text>`; }
  const x = r ? Math.min(380, 80+r.v*1.5) : 26, y = r ? 186 : 190-H*0.75;
  const ang = r ? 0 : Math.atan2(H,70)*180/Math.PI;
  if (r) g += `<path d="M80 180 H${x-14}" class="ln-m" stroke-dasharray="5 5"/>`;
  const body = o.ball ? `<circle cx="0" cy="-10" r="10" class="f-c-red st"/>` : `<rect x="-18" y="-18" width="36" height="12" rx="4" class="f-c-blue st"/><circle cx="-10" cy="-4" r="5" class="f-ink"/><circle cx="10" cy="-4" r="5" class="f-ink"/>`;
  g += `<g transform="translate(${x},${y}) rotate(${ang})" ${r&&o.anim?'class="slide"':""}>${body}</g>`;
  if (r) g += `<text x="${Math.min(x,340)}" y="160" text-anchor="middle" class="t-d">${r.v} cm</text>`;
  const sn = {tiles:"smooth tiles",mat:"a rough mat",sand:"sand",floor:"a smooth floor",grass:"grass"}[surf];
  return {g, alt:`A ${o.ball?"ball":"toy car"} on ${sn}, ramp ${s.start==="high"?"20":"10"} cm high. ${r ? `It travelled ${r.v} cm.` : "Not released yet."}`};
};

const CHART_DATA = [{m:"Paper towel",v:[18,20,19]},{m:"Newspaper",v:[9,8,10]},{m:"Cotton cloth",v:[25,23,24]}];
R.chart = (s,r,o) => {
  let g = `<rect x="0" y="0" width="400" height="240" class="f-surface"/>`;
  g += `<rect x="296" y="8" width="96" height="20" rx="4" fill="none" stroke="var(--muted)" stroke-dasharray="4 3"/><text x="344" y="22" text-anchor="middle" class="t-m">EXAMPLE DATA</text>`;
  const ox = 64, oy = 190, top = 40, sc = (oy-top)/30;
  const type = r ? s.chart : "none";
  if (type !== "pie") {
    g += `<line x1="${ox}" y1="${top}" x2="${ox}" y2="${oy}" class="ln"/><line x1="${ox}" y1="${oy}" x2="384" y2="${oy}" class="ln"/>`;
    [0,10,20,30].forEach(v => g += `<line x1="${ox-5}" y1="${oy-v*sc}" x2="${ox}" y2="${oy-v*sc}" class="ln"/><text x="${ox-8}" y="${oy-v*sc+4}" text-anchor="end" class="t-s">${v}</text>`);
  }
  if (type==="bar") CHART_DATA.forEach((d,i)=>{ const gx = ox+20+i*104;
    d.v.forEach((v,j)=> g += `<rect x="${gx+j*26}" y="${oy-v*sc}" width="22" height="${v*sc}" class="${["f-sea","f-lagoon","f-palm"][j]} st" stroke-width="1"/>`);
    g += `<text x="${gx+37}" y="${oy+14}" text-anchor="middle" class="t-s">${d.m}</text>`; });
  if (type==="line") [0,1,2].forEach(j=>{ let p = CHART_DATA.map((d,i)=>`${ox+57+i*104},${oy-d.v[j]*sc}`).join(" ");
    g += `<polyline points="${p}" fill="none" stroke-width="2.5" class="${["k-c-blue","k-c-brown","k-c-blue"][j]}" stroke="var(--sea)"/>`;
    CHART_DATA.forEach((d,i)=>{ g += `<circle cx="${ox+57+i*104}" cy="${oy-d.v[j]*sc}" r="4" class="f-sea"/>`; if(j===0) g += `<text x="${ox+57+i*104}" y="${oy+14}" text-anchor="middle" class="t-s">${d.m}</text>`; }); });
  if (type==="pie") { const tot = CHART_DATA.reduce((a,d)=>a+d.v.reduce((x,y)=>x+y,0),0); let a0 = -Math.PI/2;
    CHART_DATA.forEach((d,i)=>{ const sum = d.v.reduce((x,y)=>x+y,0), a1 = a0+sum/tot*Math.PI*2, cx=200, cy=125, rr=80;
      const p = `M${cx} ${cy} L${cx+rr*Math.cos(a0)} ${cy+rr*Math.sin(a0)} A${rr} ${rr} 0 ${a1-a0>Math.PI?1:0} 1 ${cx+rr*Math.cos(a1)} ${cy+rr*Math.sin(a1)}Z`;
      g += `<path d="${p}" class="${["f-sea","f-lagoon","f-palm"][i]} st"/>`; const am=(a0+a1)/2; g += `<text x="${cx+(rr+18)*Math.cos(am)}" y="${cy+(rr+18)*Math.sin(am)}" text-anchor="middle" class="t-s">${d.m}</text>`; a0 = a1; }); }
  if (type==="none") g += `<text x="220" y="120" text-anchor="middle" class="t-m">Choose a chart and press Draw chart</text>`;
  if (type!=="pie") {
    g += `<text x="224" y="${oy+34}" text-anchor="middle" class="t">${esc(r && s.x!=="none" ? s.x : "")}</text>`;
    g += `<text transform="translate(18 ${(oy+top)/2}) rotate(-90)" text-anchor="middle" class="t">${esc(r && s.y!=="none" ? s.y : "")}</text>`;
    if (type==="bar") g += `<text x="80" y="30" class="t-m">bars: trial 1, 2, 3</text>`;
  }
  return {g, alt: r ? `A ${s.chart} chart of example absorbency data. Bottom axis: ${s.x}. Side axis: ${s.y}.` : "Empty chart axes with example absorbency data waiting to be drawn."};
};

R.box = (s,r,o) => {
  const tub = o.tub; let g = bench(205);
  if (tub) {
    const mat = s.material==="card" ? "card" : "plastic", wall = s.material==="thick" ? 7 : 3;
    g += `<g transform="translate(110,150)"><rect x="0" y="22" width="60" height="18" rx="3" class="f-m-metal st"/><text x="30" y="35" text-anchor="middle" class="t-s">${r ? r.mass+" g" : "— g"}</text></g>`;
    g += ms("path",'d="M170 90 L300 90 L292 186 L178 186Z"', mat) + `<path d="M${170+wall} 90 L${300-wall} 90 L${292-wall} ${186-wall} L${178+wall} ${186-wall}Z" class="f-sky" opacity=".55"/>`;
    g += `<path d="M${176+wall} 104 L${294-wall} 104 L${292-wall} ${184-wall} L${178+wall} ${184-wall}Z" class="f-water" opacity=".75"/>`;
    if (s.seams==="open") g += `<path d="M178 186 l8 -16 M292 186 l-8 -16" class="ln" stroke-dasharray="3 3"/>`;
    if (r && r.leak > 0) { g += drop(184,192,1.2,"fall") + drop(286,194,1,"fall") + `<ellipse cx="235" cy="203" rx="${Math.min(70,10+r.leak)}" ry="4" class="f-water"/>`; }
    if (r) g += `<text x="235" y="228" text-anchor="middle" class="t">${r.leak} mL leaked</text>`;
    return {g, alt:`A ${s.material==="card"?"card":s.material+" plastic"} container with ${s.seams} seams, filled with water. ${r ? `Mass ${r.mass} g, leaked ${r.leak} mL.` : "Not tested yet."}`};
  }
  const load = o.load || 5;
  const iter = !!s.material; // grade 6 mission 63 uses features
  const wall = iter ? (s.material==="corr" ? 6 : 3) : (s.design==="thick" ? 10 : 3);
  const mat = iter ? (s.material==="corr" ? "corr" : "card") : "card";
  const fails = r && r.holds < load;
  g += `<g transform="translate(140,196)"><rect x="0" y="0" width="120" height="9" class="f-m-metal st"/></g><text x="342" y="198" text-anchor="middle" class="t">${r ? r.mass+" kg" : ""}</text><text x="342" y="214" text-anchor="middle" class="t-m">${r ? "empty mass" : ""}</text>`;
  // books
  const cols = ["f-c-red","f-c-blue","f-c-green","f-c-yellow","f-c-blue","f-c-red"];
  const nb = Math.min(6, Math.max(2, Math.round(load*1.2)));
  for (let i=0;i<nb;i++) g += `<rect x="${158+i*15}" y="${fails?86:80}" width="13" height="40" class="${cols[i]} st" stroke-width="1.2"/>`;
  const baseY = 190;
  const shape = fails ? `M132 100 L268 100 L268 ${baseY} Q200 ${baseY+16} 132 ${baseY}Z` : `M132 100 L268 100 L268 ${baseY} L132 ${baseY}Z`;
  g += ms("path",`d="${shape}"`, mat, "f-m-card");
  g += `<rect x="132" y="100" width="${wall}" height="${baseY-100}" class="f-m-wood" opacity=".55"/><rect x="${268-wall}" y="100" width="${wall}" height="${baseY-100}" class="f-m-wood" opacity=".55"/>`;
  if (iter && s.base==="double") g += `<line x1="134" y1="${baseY-7}" x2="266" y2="${baseY-7}" class="ln"/>`;
  if (iter && s.handles==="cutout") g += `<rect x="182" y="110" width="36" height="12" rx="6" class="f-sky st"/>`;
  if (fails) g += `<path d="M190 ${baseY+6} l6 -8 l6 8 l6 -8" class="ln" stroke="var(--bad)" stroke-width="3"/>`;
  g += `<text x="200" y="70" text-anchor="middle" class="t-s">${load} kg of ${load<2?"pencils":"books"}</text>`;
  if (r) g += `<text x="64" y="120" text-anchor="middle" class="t-d">${fails?"sags":"holds"}</text><text x="64" y="138" text-anchor="middle" class="t-s">up to ${r.holds} kg</text>`;
  const desc = iter ? `${s.material==="corr"?"corrugated":"plain"} card box, ${s.base} base, ${s.handles==="cutout"?"cut-out handles":"no handles"}` : `${s.design}-walled box`;
  return {g, alt:`A ${desc}, loaded with ${load} kg. ${r ? (fails ? `The base sags; it holds about ${r.holds} kg.` : `It holds the load; up to about ${r.holds} kg.`) + ` Empty mass ${r.mass} kg.` : "Not tested yet."}`};
};

R.lunch = (s,r,o) => {
  let g = bench(196);
  const d = s.design;
  if (d==="foam") g += ms("path",'d="M140 120 h120 v60 h-120z"',"foam") + ms("path",'d="M140 120 l20 -30 h80 l20 30z"',"foam");
  if (d==="plastic") g += ms("rect",'x="130" y="110" width="140" height="74" rx="12"',"plastic") + `<rect x="126" y="100" width="148" height="18" rx="7" class="f-m-plastic st"/><rect x="190" y="112" width="20" height="14" rx="3" class="f-coral st"/>`;
  if (d==="steel") { [0,1,2].forEach(i=> g += ms("rect",`x="150" y="${150-i*34}" width="100" height="32" rx="6"`,"metal")); g += `<path d="M160 82 Q200 40 240 82" class="ln" stroke-width="4"/>`; }
  if (r) {
    g += `<g transform="translate(30,40)"><rect width="88" height="64" rx="10" class="f-surface st"/><text x="44" y="26" text-anchor="middle" class="t-d">${r.boxes}</text><text x="44" y="46" text-anchor="middle" class="t-s">box${r.boxes>1?"es":""} / year</text></g>`;
    g += `<g transform="translate(290,40)"><rect width="88" height="64" rx="10" class="f-surface st"/><text x="44" y="26" text-anchor="middle" class="t-d">${r.mass} g</text><text x="44" y="46" text-anchor="middle" class="t-s">mass</text></g>`;
  }
  const nm = {foam:"A single-use foam box",plastic:"A plastic box with a clip lid",steel:"A three-tier steel tiffin"}[d];
  return {g, alt:`${nm}. ${r ? r.obs : "Not tested yet."}`};
};

/* ---------- scenes added for the extra missions ---------- */
const ms2 = (tag, a, fill, tx) => `<${tag} ${a} class="${fill} st"/>${tx?`<${tag} ${a} fill="url(#tx-${tx})" class="nopt"/>`:""}`;
const lbl = (x, y, t, cls="t-s") => `<text x="${x}" y="${y}" text-anchor="middle" class="${cls}">${esc(t)}</text>`;

R.light = (s,r,o) => {
  const SH = {clear:["f-m-plastic",null,.35],tracing:["f-m-paper","paper",.85],cloth:["f-m-cloth","cloth",1],wood:["f-m-wood","wood",1],card:["f-m-card","card",1],metal:["f-m-metal","metal",1]}[s.sheet] || ["f-m-card","card",1];
  const lit = !!(r || o.anim), thr = r ? {all:.75,some:.32,none:0}[r.through] : .75;
  let g = bench(200);
  g += `<rect x="18" y="98" width="56" height="28" rx="6" class="f-m-metal st"/><ellipse cx="76" cy="112" rx="5" ry="15" class="f-sun st"/>`;
  g += `<rect x="330" y="36" width="16" height="164" class="f-surface st"/>`;
  if (lit) g += `<polygon points="80,100 80,124 190,${o.shadow?40:58} 190,${o.shadow?184:168}" class="f-light" opacity=".8"/>`;
  if (o.shadow) {
    if (lit) g += `<polygon points="190,40 190,184 330,22 330,200" class="f-light" opacity=".6"/>`;
    const shade = r ? {none:.8,some:.3,all:.06}[r.through] : 0;
    if (r) g += `<ellipse cx="338" cy="112" rx="7" ry="40" class="f-ink" opacity="${shade}"/>`;
    g += `<g transform="translate(190,112)"><ellipse cx="0" cy="0" rx="9" ry="26" class="${SH[0]} st" opacity="${SH[2]}"/>${SH[1]?`<ellipse cx="0" cy="0" rx="9" ry="26" fill="url(#tx-${SH[1]})"/>`:""}<circle cx="0" cy="-32" r="7" class="${SH[0]} st" opacity="${SH[2]}"/></g><line x1="190" y1="140" x2="190" y2="200" class="ln"/>`;
    g += lbl(338, 222, "screen");
  } else {
    if (lit && thr) g += `<polygon points="206,58 206,168 330,40 330,196" class="f-light" opacity="${thr}"/>`;
    g += `<rect x="184" y="52" width="16" height="122" class="${SH[0]} st" opacity="${SH[2]}"/>${SH[1]?`<rect x="184" y="52" width="16" height="122" fill="url(#tx-${SH[1]})"/>`:""}`;
    if (s.sheet==="clear") g += `<path d="M188 70 L196 110" class="hi"/>`;
    if (r && r.through==="all") g += `<path d="M300 150 h30 l-6 10 h-18z M314 150 v-26 l12 20z" class="f-c-red st" stroke-width="1"/>`;
    g += lbl(338, 222, "wall");
  }
  const nm = {clear:"clear plastic",tracing:"tracing paper",cloth:"cloth",wood:"wooden board",card:"card",metal:"metal"}[s.sheet];
  return {g, alt:`A torch shining at ${o.shadow?"a turtle puppet made of ":""}${nm}. ${r ? (r.obs||r.short) : "Torch off, not tested yet."}`};
};

function floatObj(k){
  return {block:ms("rect",'x="-28" y="-16" width="56" height="32" rx="3"',"wood"),
    stone:ms2("path",'d="M-26 10 Q-28 -12 -4 -16 Q24 -18 26 4 Q26 16 0 16 Q-24 18 -26 10Z"',"f-stone","sand"),
    cap:`<rect x="-14" y="-8" width="28" height="16" rx="3" class="f-c-blue st"/><path d="M-14 -4 h28" class="tex"/>`,
    coconut:`<circle r="22" class="f-c-brown st"/><circle r="22" fill="url(#tx-basket)"/><circle cx="-6" cy="-10" r="2.5" class="f-ink"/><circle cx="6" cy="-10" r="2.5" class="f-ink"/><circle cx="0" cy="-2" r="2.5" class="f-ink"/>`,
    sheet:ms("rect",'x="-40" y="-2" width="80" height="4"',"metal"),
    boat:ms("path",'d="M-38 -14 L38 -14 L28 12 L-28 12Z"',"metal"),
    ball:ms("circle",'r="11"',"metal"),
    clayball:`<circle r="16" class="f-clay st"/>`,
    claybowl:`<path d="M-34 -10 Q0 34 34 -10 L28 -10 Q0 22 -28 -10Z" class="f-clay st"/>`}[k];
}
R.float = (s,r,o) => {
  const k = s.object; let g = bench(205);
  g += `<rect x="80" y="64" width="240" height="140" rx="6" fill="none" class="st"/><rect x="82" y="108" width="236" height="94" class="f-water" opacity=".42"/><line x1="82" y1="108" x2="318" y2="108" stroke="var(--water)" stroke-width="2"/>`;
  let y, x = 200;
  if (!r) y = 34;
  else if (r.floats) y = (k==="boat"||k==="claybowl") ? 104 : (k==="sheet" ? 107 : 108);
  else y = ({ball:190,stone:186,clayball:186})[k] || 186;
  if (!r) g += `<path d="M200 56 v40" class="ln-m" stroke-dasharray="4 4"/>`;
  g += `<g transform="translate(${x},${y})">${floatObj(k)}</g>`;
  if (r && r.carry) for (let i=0;i<Math.min(r.carry,8);i++) g += `<circle cx="${178+(i%4)*14}" cy="${y-18-Math.floor(i/4)*10}" r="5" class="f-c-red st" stroke-width="1"/>`;
  const nm = {block:"wooden block",stone:"coral stone",cap:"plastic bottle cap",coconut:"coconut",sheet:"flat foil sheet",boat:"foil boat",ball:"tight foil ball",clayball:"clay ball",claybowl:"clay bowl"}[k];
  return {g, alt:`A ${nm} ${r ? (r.floats?"floating in":"at the bottom of") : "above"} a tank of water. ${r ? (r.obs||r.short||"") : "Not tested yet."}`};
};

function magObj(k){
  return {clip:`<path d="M-14 4 h24 a5 5 0 0 0 0 -10 h-22 a4 4 0 0 0 0 8 h18" fill="none" stroke="var(--m-metal)" stroke-width="3"/><path d="M-14 4 h24 a5 5 0 0 0 0 -10 h-22 a4 4 0 0 0 0 8 h18" class="stn" fill="none" stroke-width=".8"/>`,
    peg:ms("rect",'x="-22" y="-6" width="44" height="12" rx="2"',"wood"),
    button:`<circle r="12" class="f-c-green st"/><circle cx="-3" cy="0" r="2" class="f-ink"/><circle cx="3" cy="0" r="2" class="f-ink"/>`,
    cap:`<path d="M-12 0 l2 -6 l4 2 l4 -4 l4 4 l4 -2 l2 6 l-2 6 l-4 -2 l-4 4 l-4 -4 l-4 2z" class="f-m-metal st" stroke-width="1.2"/>`,
    can:ms("rect",'x="-12" y="-20" width="24" height="40" rx="4"',"metal","f-m-metal"),
    wire:`<path d="M-20 0 q5 -10 10 0 t10 0 t10 0 t10 0" fill="none" stroke="var(--c-brown)" stroke-width="3.5"/>`,
    nail:`<rect x="-20" y="-2" width="36" height="4" class="f-m-metal st" stroke-width="1"/><rect x="-22" y="-6" width="4" height="12" class="f-m-metal st" stroke-width="1"/>`,
    lid:`<circle r="16" class="f-m-metal st"/><circle r="11" fill="none" class="tex"/>`,
    ribbon:ms("path",'d="M-24 -4 Q0 -12 24 -4 L24 4 Q0 -4 -24 4Z"',"cloth")}[k];
}
R.magnet = (s,r,o) => {
  let g = bench(205);
  if (o.chain) {
    const sc = s.magnet==="small" ? .7 : 1, w = 120*sc, fill = s.colour==="blue" ? "f-c-blue" : "f-c-red";
    g += `<line x1="200" y1="0" x2="200" y2="24" class="ln"/><rect x="${200-w/2}" y="24" width="${w/2}" height="${26*sc}" class="${fill} st"/><rect x="200" y="24" width="${w/2}" height="${26*sc}" class="f-m-metal st"/>${lbl(200-w/4,24+17*sc,"N","t-s")}${lbl(200+w/4,24+17*sc,"S","t-s")}`;
    const n = r ? r.v : 0, big = s.clips==="large", h = big ? 26 : 18;
    for (let i=0;i<n;i++) g += `<rect x="${200+w/2-12}" y="${24+26*sc+i*h}" width="${big?14:10}" height="${h}" rx="5" fill="none" stroke="var(--m-metal)" stroke-width="3"/><rect x="${200+w/2-12}" y="${24+26*sc+i*h}" width="${big?14:10}" height="${h}" rx="5" fill="none" class="stn" stroke-width=".7"/>`;
    if (r) g += `<text x="90" y="120" class="t-d">${n} clips</text>`;
    return {g, alt:`A ${s.magnet} ${s.colour||""} bar magnet with ${s.clips} paperclips. ${r ? `A chain of ${n} clips hangs.` : "Not tested yet."}`};
  }
  g += `<path d="M168 16 h64 v58 h-20 v-38 h-24 v38 h-20z" class="f-c-red st"/><rect x="168" y="68" width="20" height="10" class="f-m-metal st"/><rect x="212" y="68" width="20" height="10" class="f-m-metal st"/>`;
  const up = r && r.sticks;
  g += `<g transform="translate(200,${up?92:190})">${magObj(s.object)}</g>`;
  if (r && !up) g += `<path d="M200 96 v40" class="ln-m" stroke-dasharray="4 5"/>${lbl(250,130,"no pull","t-m")}`;
  const nm = {clip:"steel paperclip",peg:"wooden peg",button:"plastic button",cap:"steel bottle top",can:"aluminium can",wire:"copper wire",nail:"iron nail",lid:"steel tin lid",ribbon:"cloth ribbon"}[s.object];
  return {g, alt:`A magnet above a ${nm}. ${r ? (r.obs||r.short) : "Not tested yet."}`};
};

R.melt = (s,r,o) => {
  let g = "";
  if (o.coolbox) {
    g += bench(200);
    const foam = s.wall==="foam", w = s.thick==="thick" ? 16 : 7, cls = foam ? "f-m-foam" : "f-c-blue", tx = foam ? "foam" : "plastic";
    g += ms2("rect",'x="120" y="96" width="160" height="100" rx="8"',cls,tx) + `<rect x="${120+w}" y="${96+w}" width="${160-2*w}" height="${100-2*w}" class="f-sky"/>`;
    const left = r ? r.left/100 : 1, n = Math.max(0, Math.round(6*left));
    for (let i=0;i<6;i++) if (i<n) g += `<rect x="${136+w+(i%3)*30}" y="${170-w-Math.floor(i/3)*22}" width="24" height="20" rx="3" class="f-ice st" stroke-width="1"/>`;
    if (r) g += `<rect x="${121+w}" y="${186-w}" width="${158-2*w}" height="${10}" class="f-water" opacity=".6"/>`;
    g += s.lid==="sealed" ? ms2("rect",'x="114" y="84" width="172" height="14" rx="5"',cls,tx) : `<g transform="rotate(-8 120 88)">${ms2("rect",'x="116" y="74" width="172" height="14" rx="5"',cls,tx)}</g>`;
    g += `<g transform="translate(300,170)"><rect width="70" height="22" rx="4" class="f-m-metal st"/>${lbl(35,15,r?r.mass+" kg":"— kg")}</g>`;
    if (r) g += `<text x="200" y="228" text-anchor="middle" class="t">${r.left}% ice left</text>`;
    return {g, alt:`A ${s.thick} ${s.wall} cool box with a ${s.lid} lid. ${r ? `${r.left}% ice left, mass ${r.mass} kg.` : "Not tested yet."}`};
  }
  const sun = s.place==="sun";
  if (sun) g += `<circle cx="60" cy="44" r="24" class="f-sun"/><path d="M60 8 v-6 M60 80 v6 M24 44 h-6 M96 44 h6 M34 18 l-4 -4 M86 70 l4 4 M86 18 l4 -4 M34 70 l-4 4" class="ln" stroke="var(--sun)" stroke-width="3"/>`;
  else g += `<path d="M110 60 Q200 10 290 60Z" class="f-coral st"/><line x1="200" y1="36" x2="200" y2="200" class="ln"/><rect x="110" y="60" width="180" height="140" class="f-shade" opacity=".25"/>`;
  g += bench(200) + `<ellipse cx="200" cy="198" rx="70" ry="8" class="f-surface st"/>`;
  const sub = s.substance || "ice", left = r ? (r.left!==undefined ? r.left/100 : 0) : 1;
  const fill = {ice:"f-ice",butter:"f-c-yellow",chocolate:"f-c-brown"}[sub];
  if (left < 1) g += `<ellipse cx="200" cy="196" rx="${20+46*(1-left)}" ry="${4+3*(1-left)}" class="${sub==="ice"?"f-water":fill}" opacity=".8"/>`;
  if (left > 0) { const h = 44*left, w = 44*(0.6+0.4*left); g += `<rect x="${200-w/2}" y="${194-h}" width="${w}" height="${h}" rx="5" class="${fill} st"/>${sub==="ice"?`<path d="M${200-w/2+6} ${198-h} l6 ${h*0.5}" class="hi"/>`:""}`; }
  if (s.cover==="cloth") g += `<path d="M126 196 Q130 120 200 116 Q270 120 274 196Z" class="f-m-cloth st" opacity=".85"/><path d="M126 196 Q130 120 200 116 Q270 120 274 196Z" fill="url(#tx-cloth)"/>`;
  if (s.cover==="foil") g += `<path d="M130 196 Q130 124 200 122 Q270 124 270 196Z" class="f-m-metal st" opacity=".85"/><path d="M130 196 Q130 124 200 122 Q270 124 270 196Z" fill="url(#tx-metal)"/>`;
  if (s.cover==="foam") g += `<rect x="124" y="110" width="152" height="88" rx="6" class="f-m-foam st" opacity=".92"/><rect x="124" y="110" width="152" height="88" rx="6" fill="url(#tx-foam)"/>`;
  if (r) g += `<text x="330" y="120" text-anchor="middle" class="t-d">${r.mins?r.mins+" min":r.left+"%"}</text><text x="330" y="138" text-anchor="middle" class="t-s">${r.mins?"to melt":"left"}</text>`;
  return {g, alt:`${sub} on a dish in the ${s.place}${s.cover&&s.cover!=="none"?", covered with "+s.cover:""}. ${r ? (r.mins?`Melted in ${r.mins} minutes.`:`${r.left}% left.`) : "Not tested yet."}`};
};

R.circuit = (s,r,o) => {
  const glow = r ? r.glow : 0;
  let g = bench(212);
  g += `<path d="M70 160 V70 H180 M220 70 H330 V170 H300 M240 170 H120 V196 H90" class="ln" stroke-width="3"/>`;
  g += `<rect x="40" y="160" width="60" height="36" rx="4" class="f-c-green st"/><rect x="100" y="172" width="6" height="12" class="f-m-metal st" stroke-width="1"/>${lbl(70,182,s.salt!==undefined?"3 V":"1.5 V")}`;
  if (glow) g += `<circle cx="200" cy="64" r="${glow===2?34:22}" class="f-light" opacity="${glow===2?.95:.6}"/><path d="M200 18 v-8 M164 34 l-6 -6 M236 34 l6 -6" class="ln" stroke="var(--sun)" stroke-width="3" opacity="${glow===2?1:.4}"/>`;
  g += `<circle cx="200" cy="64" r="16" class="${glow?"f-sun":"f-surface"} st"/><path d="M192 72 q8 -16 16 0" class="ln" stroke-width="1.4"/>${lbl(200,104,s.salt!==undefined?"LED":"bulb","t-m")}`;
  if (s.item) {
    const it = {spoon:ms("path",'d="M244 166 h44 q14 -10 22 0 q-8 10 -22 0z"',"metal"),stick:ms("rect",'x="240" y="164" width="64" height="9" rx="3"',"wood"),
      ruler:`<rect x="238" y="163" width="68" height="11" class="f-c-yellow st"/><path d="M246 163 v4 M256 163 v4 M266 163 v4 M276 163 v4 M286 163 v4" class="tex"/><path d="M242 166 L300 166" class="hi"/>`,
      foil:ms("rect",'x="240" y="164" width="64" height="8"',"metal")}[s.item];
    g += it + `<circle cx="240" cy="170" r="4" class="f-coral"/><circle cx="300" cy="170" r="4" class="f-coral"/>`;
  } else if (s.contact) {
    g += ms2("rect",'x="226" y="176" width="88" height="14"', s.base==="foil"?"f-m-metal":"f-m-card", s.base==="foil"?"metal":"card");
    g += `<path d="M240 170 Q270 ${r&&r.on?176:156} 300 170" fill="none" stroke="${s.contact==="foil"?"var(--m-metal)":"var(--m-paper)"}" stroke-width="5"/><path d="M240 170 Q270 ${r&&r.on?176:156} 300 170" fill="none" class="stn" stroke-width=".8"/>`;
    if (r) g += `<path d="M270 128 v20" class="arrow"/>${lbl(270,120,"press","t-m")}`;
  } else if (s.salt!==undefined) {
    g += `<path d="M236 150 h70 l-6 50 h-58z" class="f-m-plastic st" opacity=".7"/><rect x="240" y="164" width="62" height="34" class="f-water" opacity=".6"/>`;
    for (let i=0;i<+s.salt*4;i++) g += `<rect x="${246+(i*7)%52}" y="${170+(i*5)%22}" width="3" height="3" class="f-c-white"/>`;
    g += `<line x1="250" y1="140" x2="250" y2="190" class="ln" stroke-width="3"/><line x1="292" y1="140" x2="292" y2="190" class="ln" stroke-width="3"/>`;
  }
  if (r && r.short) g += `<text x="200" y="236" text-anchor="middle" class="t">${esc(r.short)}</text>`;
  g += `<text x="70" y="232" text-anchor="middle" class="t-m">battery only</text>`;
  const what = s.item ? `a ${s.item} in the gap` : s.contact ? `a ${s.contact} strip on a ${s.base} base` : `${s.salt} spoons of salt in water`;
  return {g, alt:`A battery circuit with ${what}. ${r ? ["The light is off.","The light glows dimly.","The light is on."][glow] : "Not tested yet."}`};
};

R.dissolve = (s,r,o) => {
  let g = bench(205);
  g += `<path d="M140 70 L260 70 L250 200 L150 200Z" class="f-m-plastic st" opacity=".45"/><path d="M144 92 L256 92 L249 198 L151 198Z" class="f-water" opacity=".5"/>`;
  if (s.temp==="warm") g += `<path d="M170 60 q6 -10 0 -20 M200 60 q6 -10 0 -20 M230 60 q6 -10 0 -20" class="ln-m"/>${lbl(310,60,"warm (virtual)","t-m")}`;
  if (s.stir==="yes") g += `<rect x="216" y="30" width="8" height="150" rx="4" transform="rotate(12 220 105)" class="f-m-metal st"/><path d="M168 150 a32 10 0 1 0 64 0" class="arrow" stroke-width="3"/>`;
  const col = s.solute==="sand" ? "f-s-sand" : "f-c-white";
  if (!r) g += `<g transform="translate(110,40)"><ellipse cx="0" cy="0" rx="22" ry="8" class="f-m-metal st"/><path d="M-12 -2 q12 -14 24 0z" class="${col} st" stroke-width="1"/></g>`;
  else if (!r.dissolved) g += `<path d="M156 198 Q200 172 244 198Z" class="${col} st" stroke-width="1"/><path d="M156 198 Q200 172 244 198Z" fill="url(#tx-sand)"/>`;
  else g += `<text x="178" y="186" text-anchor="middle" class="t-s">dissolved</text>`;
  if (r && r.secs) g += `<text x="330" y="130" text-anchor="middle" class="t-d">${r.secs} s</text>`;
  return {g, alt:`${s.solute||"Sugar"} in a glass of ${s.temp||"cool"} water${s.stir==="yes"?", stirred":""}. ${r ? (r.dissolved?"It dissolved.":"It did not dissolve.")+(r.secs?` ${r.secs} seconds.`:"") : "Not added yet."}`};
};

R.thermo = (s,r,o) => {
  let g = bench(205);
  const mug = 'd="M140 96 h90 v96 q0 10 -10 10 h-70 q-10 0 -10 -10z"';
  g += `<path ${mug} class="f-surface st"/><path d="M230 120 q26 0 26 24 t-26 24" fill="none" class="ln" stroke-width="5"/>`;
  if (s.wrap==="cloth") g += ms2("path",'d="M134 110 h102 v84 q0 12 -12 12 h-78 q-12 0 -12 -12z"',"f-m-cloth","cloth");
  if (s.wrap==="foam") g += ms2("path",'d="M128 104 h114 v92 q0 14 -14 14 h-86 q-14 0 -14 -14z"',"f-m-foam","foam");
  g += `<rect x="146" y="100" width="78" height="10" class="f-water" opacity=".7"/>`;
  const t = r ? r.temp : 60, h = Math.max(4, (t-20)*2.2);
  g += `<rect x="178" y="20" width="14" height="110" rx="7" class="f-surface st"/><rect x="181" y="${126-h}" width="8" height="${h}" rx="4" class="f-coral"/>`;
  g += `<text x="170" y="40" text-anchor="end" class="t">${t} °C</text>`;
  if (r && r.series) {
    const X = i => 280+i*26, Y = v => 160-(v-30)*3.6;
    g += `<line x1="276" y1="50" x2="276" y2="164" class="ln-m"/><line x1="276" y1="164" x2="388" y2="164" class="ln-m"/>${lbl(332,180,"minutes 0–20","t-m")}`;
    [30,45,60].forEach(v => g += `<text x="272" y="${Y(v)+4}" text-anchor="end" class="t-m">${v}</text>`);
    g += `<polyline points="${r.series.map((v,i)=>X(i)+","+Y(v)).join(" ")}" fill="none" stroke="var(--sea)" stroke-width="2.5"/>`;
    r.series.forEach((v,i)=> g += `<circle cx="${X(i)}" cy="${Y(v)}" r="4" class="f-sea"/>`);
  } else g += lbl(320,120,r?"after 20 min":"start 60 °C","t-m");
  return {g, alt:`A cup of warm water with ${s.wrap==="none"?"no wrap":"a "+s.wrap+" wrap"}. ${r ? (r.series?`Readings ${r.series.join(", ")} °C.`:`${t} °C after 20 minutes.`) : "Starts at 60 °C."}`};
};

R.bounce = (s,r,o) => {
  let g = bench(205);
  const Y = cm => 205-cm*1.6;
  g += `<line x1="60" y1="${Y(100)}" x2="60" y2="205" class="ln"/>`;
  [0,25,50,75,100].forEach(v => g += `<line x1="54" y1="${Y(v)}" x2="66" y2="${Y(v)}" class="ln"/><text x="48" y="${Y(v)+4}" text-anchor="end" class="t-s">${v}${v===100?" cm":""}</text>`);
  const fill = {rubber:"f-c-red",wood:"f-m-wood",clay:"f-clay"}[s.ball];
  g += `<circle cx="150" cy="${Y(100)}" r="12" class="${fill} st" opacity="${r?.35:1}"/><path d="M150 ${Y(100)+14} V192" class="ln-m" stroke-dasharray="4 4"/>`;
  if (r) { if (r.v) g += `<path d="M150 192 Q190 ${Y(r.v)*2-192} 230 192" class="ln-m" stroke-dasharray="4 4"/><circle cx="190" cy="${Y(r.v)}" r="12" class="${fill} st"/><line x1="60" y1="${Y(r.v)}" x2="176" y2="${Y(r.v)}" class="ln-m"/><text x="300" y="${Y(r.v)}" class="t-d">${r.v} cm</text>`;
    else g += `<ellipse cx="150" cy="200" rx="18" ry="5" class="${fill} st"/><text x="300" y="150" class="t-d">0 cm</text>`; }
  return {g, alt:`A ${s.ball} ball dropped from 100 cm. ${r ? `It bounced ${r.v} cm.` : "Not dropped yet."}`};
};

R.sound = (s,r,o) => {
  let g = bench(205);
  const L = {none:0,cloth:6,foam:12,thin:6,thick:14,egg:8}[s.lining]||0;
  g += `<rect x="90" y="90" width="140" height="110" class="f-m-card st"/>`;
  if (L) g += s.lining==="egg" ? (()=>{let e=`<rect x="${92}" y="92" width="136" height="106" class="f-m-card"/>`; for(let i=0;i<6;i++) e += `<circle cx="${102+i*23}" cy="100" r="7" class="f-m-card st" stroke-width="1"/><circle cx="${102+i*23}" cy="190" r="7" class="f-m-card st" stroke-width="1"/>`; return e;})()
     : ms2("rect",`x="92" y="92" width="136" height="106"`, s.lining==="cloth"?"f-m-cloth":"f-m-foam", s.lining==="cloth"?"cloth":"foam");
  g += `<rect x="${92+L}" y="${92+L}" width="${136-2*L}" height="${106-2*L}" class="f-sky"/>`;
  g += `<rect x="140" y="120" width="40" height="56" rx="6" class="f-ink"/><circle cx="160" cy="140" r="10" class="f-m-metal"/><circle cx="160" cy="164" r="6" class="f-m-metal"/>`;
  const db = r ? r.db : 0, waves = r ? Math.max(0, Math.round((db-40)/10)) : 0;
  for (let i=0;i<waves;i++) g += `<path d="M${240+i*12} 120 q10 25 0 50" class="ln" stroke="var(--coral)" stroke-width="2.5"/>`;
  g += `<g transform="translate(330,150)"><path d="M-40 0 A40 40 0 0 1 40 0Z" class="f-surface st"/>`;
  const ang = Math.PI*(1-(Math.min(90,Math.max(40,db||40))-40)/50);
  g += `<line x1="0" y1="0" x2="${34*Math.cos(ang)}" y2="${-34*Math.sin(ang)}" class="ln" stroke="var(--coral)" stroke-width="3"/>${lbl(0,18,r?db+" dB":"dB meter")}</g>`;
  return {g, alt:`A speaker in a box lined with ${s.lining==="none"?"nothing":s.lining}. ${r ? `The meter reads ${db} dB.` : "Not tested yet."}`};
};

R.filter = (s,r,o) => {
  let g = bench(205);
  g += `<path d="M130 40 L270 40 L218 112 L218 132 L182 132 L182 112Z" class="f-m-plastic st" opacity=".55"/>`;
  g += `<path d="M150 140 h100 v62 h-100z" class="f-m-plastic st" opacity=".45"/>`;
  let lvl = 0, clarity = 2;
  if (s.soil) {
    const f = {sand:["f-s-sand","sand"],garden:["f-s-mat","mat"],clay:["f-clay",null]}[s.soil];
    g += ms2("path",'d="M150 64 L250 64 L218 108 L182 108Z"',f[0],f[1]) + `<path d="M140 52 L260 52 L250 64 L150 64Z" class="f-water" opacity=".6"/>`;
    if (r) lvl = r.v*0.55;
    clarity = 2;
  } else if (s.mix) {
    g += `<path d="M146 56 L254 56 L224 98 L176 98Z" class="${s.mix==="sand"?"f-s-sand":"f-water"}" opacity=".85"/>`;
    g += s.filter==="paper" ? `<path d="M144 50 L200 120 L256 50" fill="none" stroke="var(--m-paper)" stroke-width="4"/>` : `<path d="M144 50 L200 120 L256 50" fill="none" class="ln" stroke-dasharray="3 5"/>`;
    if (r) { lvl = 44; clarity = r.clear; }
  } else {
    let y = 106;
    const layers = [];
    if (s.gravel==="yes") layers.push(["gravel"]); if (s.sand==="yes") layers.push(["sand"]); if (s.cloth==="yes") layers.push(["cloth"]);
    layers.forEach(([k]) => { const h = 14; const w = 34 + (106-y)*1.2;
      g += k==="gravel" ? (()=>{let e=""; for(let i=0;i<5;i++) e += `<circle cx="${200-w/2+6+i*(w-12)/4}" cy="${y-6}" r="6" class="f-stone st" stroke-width="1"/>`; return e;})()
        : ms2("rect",`x="${200-w/2}" y="${y-h}" width="${w}" height="${h}"`, k==="sand"?"f-s-sand":"f-m-cloth", k==="sand"?"sand":"cloth");
      y -= h; });
    g += `<path d="M146 50 L254 50 L246 ${Math.max(60,y-2)} L154 ${Math.max(60,y-2)}Z" class="f-c-brown" opacity=".55"/>`;
    if (r) { lvl = 44; clarity = Math.min(2, r.clarity); }
  }
  if (lvl) g += `<rect x="152" y="${200-lvl}" width="96" height="${lvl}" class="f-water" opacity=".7"/>` + (clarity<2 ? `<rect x="152" y="${200-lvl}" width="96" height="${lvl}" class="f-c-brown" opacity="${clarity===0?.7:.35}"/>` : "");
  if (r && r.salt) g += `<text x="300" y="176" text-anchor="middle" class="t">still salty</text>`;
  if (r && r.v!==undefined) g += `<text x="310" y="176" text-anchor="middle" class="t-d">${r.v} mL</text>`;
  if (r && r.mins!==undefined) g += `<text x="310" y="176" text-anchor="middle" class="t-d">${r.mins} min</text>`;
  const what = s.soil ? `${s.soil} soil` : s.mix ? `${s.mix==="sand"?"sandy":"salty"} water through ${s.filter==="paper"?"filter paper":"a fishing net"}` : `muddy water through layers: ${["cloth","sand","gravel"].filter(k=>s[k]==="yes").join(", ")||"none"}`;
  return {g, alt:`A funnel filter with ${what}. ${r ? (r.obs||r.short||"") : "Not poured yet."}`};
};

R.rust = (s,r,o) => {
  let g = bench(205);
  g += `<path d="M140 60 h120 v140 h-120z" class="f-m-plastic st" opacity=".4"/>`;
  const wet = s.place==="fresh"||s.place==="salt";
  if (wet) g += `<rect x="142" y="110" width="116" height="88" class="f-water" opacity=".5"/>`;
  if (s.place==="salt") for (let i=0;i<10;i++) g += `<rect x="${150+(i*11)%100}" y="${190-(i%3)*4}" width="4" height="4" class="f-c-white"/>`;
  if (o.spray) for (let i=0;i<8;i++) g += drop(110+i*26, 28+(i%2)*10, .9);
  g += `<g transform="rotate(-25 200 140)"><rect x="140" y="134" width="120" height="10" class="f-m-metal st"/><rect x="132" y="126" width="10" height="26" class="f-m-metal st"/>`;
  if (s.coat==="paint") g += `<rect x="140" y="134" width="120" height="10" class="f-c-blue" opacity=".8"/>`;
  if (s.coat==="oil") g += `<path d="M146 136 h108" class="hi"/>`;
  const n = r ? [0,4,8,14][r.rust] : 0;
  for (let i=0;i<n;i++) g += `<circle cx="${146+(i*17)%110}" cy="${136+(i%3)*3}" r="${3+(i%2)}" class="f-rust"/>`;
  g += `</g>`;
  g += lbl(200, 228, s.days ? `after ${s.days} days` : "after 7 days", "t");
  const pl = {dry:"dry air",fresh:"fresh water",salt:"salt water"}[s.place] || "salt spray";
  return {g, alt:`An iron ${s.coat&&s.coat!=="none"?s.coat+"-coated ":""}nail in ${pl}. ${r ? ["No rust.","A little rust.","Some rust.","Lots of rust."][r.rust] : "Not tested yet."}`};
};

R.landing = (s,r,o) => {
  let g = bench(205);
  if (s.pad==="paper") g += ms("rect",'x="140" y="200" width="120" height="4"',"paper");
  if (s.pad==="cotton") for (let i=0;i<7;i++) g += `<circle cx="${148+i*17}" cy="${192+(i%2)*4}" r="12" class="f-m-foam st" stroke-width="1.2"/>`;
  if (s.pad==="bubble") { g += `<rect x="140" y="186" width="120" height="18" class="f-m-plastic st"/>`; for (let i=0;i<8;i++) g += `<circle cx="${148+i*15}" cy="195" r="5" class="hif"/>`; }
  const top = s.pad==="cotton" ? 180 : s.pad==="bubble" ? 186 : 200;
  const y = r ? top-22 : 40;
  g += `<ellipse cx="200" cy="${y}" rx="16" ry="22" class="f-c-white st"/>`;
  if (!r) g += `<path d="M200 66 V${top-6}" class="ln-m" stroke-dasharray="4 4"/>${lbl(240,120,"50 cm","t-s")}`;
  if (r && r.cracked) g += `<path d="M186 ${y-4} l6 6 l6 -8 l6 8 l6 -6" class="ln" stroke-width="2"/><ellipse cx="226" cy="${top-2}" rx="10" ry="3" class="f-c-yellow"/>`;
  if (r) g += `<text x="320" y="120" text-anchor="middle" class="t-d">${r.cracked?"cracked":"safe"}</text>`;
  return {g, alt:`A virtual egg dropped onto ${s.pad==="none"?"the bare floor":s.pad}. ${r ? (r.cracked?"It cracked.":"It did not crack.") : "Not dropped yet."}`};
};

R.hang = (s,r,o) => {
  let g = bench(208);
  g += `<rect x="70" y="196" width="120" height="12" class="f-m-wood st"/><rect x="96" y="20" width="10" height="176" class="f-m-wood st"/><rect x="96" y="20" width="120" height="10" class="f-m-wood st"/>`;
  const len = r ? r.len : 10, px = len*8, n = +s.weights;
  g += `<path d="M206 30 V${30+px}" class="ln" stroke="var(--c-brown)" stroke-width="5"/>`;
  if (r) for (let i=0;i<n;i++) g += `<rect x="192" y="${30+px+i*10}" width="28" height="10" class="f-m-metal st" stroke-width="1.2"/>`;
  else for (let i=0;i<n;i++) g += `<rect x="250" y="${196-(i+1)*10}" width="28" height="10" class="f-m-metal st" stroke-width="1.2"/>`;
  g += `<rect x="300" y="26" width="26" height="170" class="f-c-yellow st"/>`;
  for (let c=0;c<=20;c+=2) g += `<line x1="300" y1="${30+c*8}" x2="${c%4?308:314}" y2="${30+c*8}" class="stn"/>${c%4?"":`<text x="322" y="${34+c*8}" text-anchor="middle" class="t-m">${c}</text>`}`;
  g += `<line x1="214" y1="${30+px}" x2="298" y2="${30+px}" class="ln-m" stroke-dasharray="3 3"/>`;
  if (r) g += `<text x="360" y="${34+px}" class="t">${len} cm</text>`;
  return {g, alt:`A rubber band hanging from a stand with ${n} weight${n>1?"s":""}. ${r ? `It is ${len} cm long.` : "Unstretched, 10 cm."}`};
};

R.dry = (s,r,o) => {
  let g = "";
  if (s.place==="sun") g += `<circle cx="56" cy="40" r="22" class="f-sun"/>`;
  else g += `<rect x="0" y="0" width="400" height="200" class="f-shade" opacity=".22"/><path d="M60 20 h280 l-20 24 h-240z" class="f-palm st"/>`;
  if (s.wind==="breezy") g += `<path d="M30 90 h50 q10 0 10 -8 M30 110 h70 M30 130 h44 q10 0 10 8" class="ln-m" stroke-width="2.5"/>`;
  g += bench(205);
  if (o.dish) {
    const sh = s.dish==="shallow";
    g += sh ? `<ellipse cx="220" cy="196" rx="90" ry="12" class="f-surface st"/>` : `<path d="M180 120 h80 v76 h-80z" class="f-surface st"/>`;
    if (!r) g += sh ? `<ellipse cx="220" cy="194" rx="80" ry="8" class="f-water" opacity=".7"/>` : `<rect x="182" y="140" width="76" height="54" class="f-water" opacity=".7"/>`;
    else for (let i=0;i<9;i++) g += `<rect x="${sh?160+i*13:188+(i*8)%60}" y="${sh?190-(i%2)*3:190-(i%3)*3}" width="5" height="5" class="f-c-white st" stroke-width=".6"/>`;
    if (r) g += `<text x="330" y="110" text-anchor="middle" class="t-d">${r.hours} h</text>${lbl(330,128,"until dry")}`;
    return {g, alt:`A ${s.dish} dish of sea water in the ${s.place}. ${r ? `Dry after ${r.hours} hours, leaving salt crystals.` : "Not dried yet."}`};
  }
  g += `<line x1="120" y1="60" x2="120" y2="205" class="ln" stroke-width="4"/><line x1="320" y1="60" x2="320" y2="205" class="ln" stroke-width="4"/><path d="M120 66 Q220 78 320 66" class="ln"/>`;
  const sway = s.wind==="breezy" ? 10 : 0;
  g += ms("path",`d="M184 72 L256 72 L${256+sway} 150 L${184+sway} 150Z"`,"cloth");
  if (!r) [196,220,244].forEach((x,i)=> g += drop(x+sway, 158+i%2*8, 1));
  if (r) g += `<text x="200" y="186" text-anchor="middle" class="t-d">${r.mins} min</text>`;
  return {g, alt:`A wet cloth on a line in the ${s.place}, ${s.wind==="breezy"?"with a breeze":"no wind"}. ${r ? `Dry after ${r.mins} minutes.` : "Still wet."}`};
};

R.para = (s,r,o) => {
  let g = bench(208);
  g += `<line x1="40" y1="20" x2="40" y2="208" class="ln"/><text x="48" y="28" class="t-s">2 m</text><line x1="34" y1="20" x2="46" y2="20" class="ln"/>`;
  const w = s.size==="large" ? 120 : 64, fill = {plastic:["f-m-plastic","plastic"],paper:["f-m-paper","paper"],cloth:["f-m-cloth","cloth"]}[s.canopy];
  const cy = r ? 100 : 50;
  g += ms2("path",`d="M${200-w/2} ${cy} Q200 ${cy-w*0.55} ${200+w/2} ${cy}Z"`,fill[0],fill[1]);
  g += `<path d="M${200-w/2} ${cy} L196 ${cy+50} M${200+w/2} ${cy} L204 ${cy+50} M200 ${cy-6} V${cy+50}" class="ln-m"/><rect x="190" y="${cy+50}" width="20" height="16" class="f-m-card st"/>`;
  if (r) g += `<g transform="translate(320,90)"><circle r="26" class="f-surface st"/><line x1="0" y1="0" x2="0" y2="-18" class="ln"/><rect x="-5" y="-34" width="10" height="6" class="f-ink"/></g><text x="320" y="146" text-anchor="middle" class="t-d">${r.secs} s</text>`;
  return {g, alt:`A ${s.size} ${s.canopy} parachute carrying a small parcel. ${r ? `It took ${r.secs} seconds to fall 2 m.` : "Not dropped yet."}`};
};

R.fizz = (s,r,o) => {
  let g = bench(205);
  g += `<path d="M170 80 h20 v20 q30 10 30 40 v64 h-80 v-64 q0 -30 30 -40z" class="f-m-plastic st" opacity=".55"/><path d="M142 150 h76 v52 h-76z" class="f-c-yellow" opacity=".45"/>`;
  const n = +s.spoons;
  g += `<path d="M150 202 Q180 ${202-n*6} 210 202Z" class="f-c-white st" stroke-width="1"/>`;
  if (r) { for (let i=0;i<8;i++) g += `<circle cx="${152+(i*9)%56}" cy="${160+(i*7)%36}" r="2.5" class="hif" stroke="var(--muted)" stroke-width=".6"/>`;
    const rad = r.v*2.6; g += `<ellipse cx="180" cy="${80-rad}" rx="${rad}" ry="${rad*1.05}" class="f-c-red st"/><text x="320" y="110" text-anchor="middle" class="t-d">${r.v} cm</text>${lbl(320,128,"across")}`; }
  else g += `<path d="M172 80 q-6 -16 8 -22 q14 6 8 22z" class="f-c-red st"/>`;
  return {g, alt:`A bottle of vinegar with ${n} spoon${n>1?"s":""} of bicarbonate and a balloon on top. ${r ? `The balloon grew to ${r.v} cm across.` : "Not mixed yet."}`};
};

function scene(kind, s, r, o={}){
  if (o.pair) {
    let inner = "";
    o.pair.forEach((p,i)=>{ const sub = R[kind] ? R[kind](p.s||{}, p.r||null, p.o||{}) : null; if(!sub) return;
      inner += `<g transform="translate(${i*200+4},40) scale(.48)"><rect width="400" height="240" fill="url(#skyg)"/>${sub.g}</g><text x="${i*200+100}" y="30" text-anchor="middle" class="t">${esc(p.label)}</text>`; });
    const alt = o.pair.map(p=>p.label).join(" compared with ");
    return `<svg class="scene" viewBox="0 0 400 170" role="img" aria-label="${esc(alt)}"><rect width="400" height="170" class="f-surface"/>${inner}</svg>`;
  }
  const fn = R[kind];
  if (!fn) return `<svg class="scene" viewBox="0 0 400 240" role="img" aria-label="Picture unavailable"><rect width="400" height="240" class="f-sky"/><text x="200" y="125" text-anchor="middle" class="t">Picture unavailable</text></svg>`;
  const {g, alt} = fn(s||{}, r||null, o);
  return `<svg class="scene${o.anim?" anim":""}" viewBox="0 0 400 240" role="img" aria-label="${esc(alt)}"><rect width="400" height="240" fill="url(#skyg)"/>${g}</svg>`;
}

function islandBits(){
  const st = g => { const ms = MISSIONS.filter(m=>m.g===g); return {n:ms.filter(m=>store.missions[m.id]&&store.missions[m.id].done.stamp).length, t:ms.length}; };
  const names = ["shells on the sand","a beach umbrella","a folded bridge to a sandbank","a lantern on the school","a parachute in the sky","a dhoni boat"];
  const art = [
    `<circle cx="160" cy="246" r="5" class="f-c-white st" stroke-width="1"/><circle cx="176" cy="250" r="4" class="f-coral st" stroke-width="1"/><circle cx="330" cy="248" r="5" class="f-c-yellow st" stroke-width="1"/>`,
    `<line x1="430" y1="200" x2="430" y2="240" class="ln"/><path d="M400 204 Q430 176 460 204Z" class="f-coral st"/>`,
    `<ellipse cx="34" cy="266" rx="26" ry="7" class="f-sand st"/><path d="M48 262 l7 -6 l7 6 l7 -6 l7 6 l7 -6 l7 6" class="pl-out"/><path d="M48 262 l7 -6 l7 6 l7 -6 l7 6 l7 -6 l7 6" class="pp-in"/>`,
    `<line x1="126" y1="152" x2="126" y2="164" class="ln"/><circle cx="126" cy="170" r="12" class="f-light"/><circle cx="126" cy="170" r="6" class="f-sun st"/>`,
    `<path d="M300 70 Q330 40 360 70Z" class="f-m-cloth st"/><path d="M300 70 L326 98 M360 70 L334 98" class="ln-m"/><rect x="324" y="96" width="12" height="10" class="f-m-card st"/>`,
    `<path d="M90 292 Q150 312 210 292 L200 304 Q150 316 100 304Z" class="f-m-wood st"/><line x1="150" y1="250" x2="150" y2="300" class="ln"/><path d="M152 254 L184 290 L152 290Z" class="f-c-white st"/>`];
  const pos = [[168,236],[430,190],[34,250],[110,160],[360,60],[190,256]];
  let g = "", total = 0, built = [];
  for (let i=0;i<6;i++){ const s = st(i+1); total += s.n; const on = s.n>0;
    if (on) built.push(names[i]);
    g += `<g opacity="${on?1:.22}">${art[i]}</g>`;
    if (s.n>=s.t) g += `<path transform="translate(${pos[i][0]},${pos[i][1]}) scale(.9)" d="M0 -9 L2.6 -3 L9 -2.6 L4 1.8 L5.6 8 L0 4.6 L-5.6 8 L-4 1.8 L-9 -2.6 L-2.6 -3Z" class="f-sun st" stroke-width="1"/>`; }
  return {g, total, built};
}
function heroArt(){
  const ib = islandBits();
  return `<svg viewBox="0 0 520 330" role="img" aria-label="Your island school. ${ib.total} of ${MISSIONS.length} stamps. ${ib.built.length?"Built so far: "+ib.built.join(", ")+".":"Earn stamps to add things to the island."}">
  <rect width="520" height="330" rx="26" class="f-sky"/>
  <circle cx="440" cy="62" r="30" class="f-sun"/>
  <path d="M0 200 Q60 190 130 200 T260 200 T390 200 T520 200 V304 Q520 330 494 330 H26 Q0 330 0 304Z" class="f-lagoon" opacity=".85"/>
  <path d="M0 230 Q70 220 140 230 T280 230 T420 230 T520 228 V304 Q520 330 494 330 H26 Q0 330 0 304Z" class="f-sea" opacity=".9"/>
  <path d="M70 250 Q260 150 470 250 Z" class="f-sand st"/>
  <path d="M120 236 L120 150 L250 150 L250 222" class="f-surface st"/>
  <polygon points="104,156 186,104 268,156" class="f-m-leaf st"/><polygon points="104,156 186,104 268,156" fill="url(#tx-leaf)"/>
  <rect x="140" y="178" width="34" height="46" class="f-m-wood st"/>
  <text x="215" y="174" text-anchor="middle" class="t-s">SCHOOL</text>
  <path d="M370 236 q-10 -60 6 -118" class="ln" stroke-width="7" stroke="var(--m-wood)"/>
  <path d="M376 120 q-40 -6 -60 18 M376 120 q34 -12 56 6 M376 120 q-16 -30 -46 -34 M376 120 q20 -30 50 -28" class="ln" stroke="var(--palm)" stroke-width="7"/>
  <rect x="268" y="196" width="88" height="8" class="f-m-wood st"/><line x1="276" y1="204" x2="276" y2="232" class="ln"/><line x1="348" y1="204" x2="348" y2="232" class="ln"/>
  <path d="M276 190 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6" class="pl-out"/><path d="M276 190 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6" class="pp-in"/>
  <path d="M326 176 h20 l-3 20 h-14z" class="f-m-plastic st"/>
  <rect x="200" y="196" width="50" height="34" rx="4" class="f-surface st"/><text x="225" y="210" text-anchor="middle" class="t-s">MUST:</text><line x1="208" y1="218" x2="242" y2="218" class="ln-m"/><line x1="208" y1="224" x2="236" y2="224" class="ln-m"/>
  ${ib.g}
  <text x="260" y="320" text-anchor="middle" style="font:700 13px var(--body);fill:var(--sea-ink)">Your island: ${ib.total} of ${MISSIONS.length} stamps</text>
  <g transform="translate(100,226) scale(.7)"><path d="M10 30 q-8 -10 -2 -18 q4 6 10 4" class="f-coral st"/><path d="M50 30 q8 -10 2 -18 q-4 6 -10 4" class="f-coral st"/><ellipse cx="30" cy="36" rx="18" ry="12" class="f-coral st"/><circle cx="22" cy="18" r="4" class="f-surface st"/><circle cx="38" cy="18" r="4" class="f-surface st"/><circle cx="22" cy="18" r="1.6" class="f-ink"/><circle cx="38" cy="18" r="1.6" class="f-ink"/></g>
  </svg>`;
}
function stampArt(n, earned, cls=""){
  return `<svg class="stamp ${cls}" viewBox="0 0 60 60" role="img" aria-label="${earned?"Discovery stamp earned":"Discovery stamp not yet earned"}">
   <circle cx="30" cy="30" r="27" fill="none" stroke="${earned?"var(--coral)":"var(--line)"}" stroke-width="3" stroke-dasharray="${earned?"0":"5 4"}"/>
   <circle cx="30" cy="30" r="20" class="${earned?"f-coral":"f-surface"}" opacity="${earned?".15":"1"}"/>
   <text x="30" y="35" text-anchor="middle" style="font:700 ${String(n).length>3?12:14}px var(--display);fill:${earned?"var(--coral)":"var(--muted)"}">${n}</text></svg>`;
}
const ICON = {
  explored:`<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  practised:`<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 2 A5 5 0 0 1 7 12Z" fill="currentColor"/></svg>`,
  demonstrated:`<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M7 1 L8.8 5 L13 5.4 L9.8 8.2 L10.8 12.6 L7 10.3 L3.2 12.6 L4.2 8.2 L1 5.4 L5.2 5Z" fill="currentColor"/></svg>`
};

/* Top-down furniture for the house plan (decorative). */
function roomFurniture(k){
  const a = {
    classroom:`<rect x="20" y="2" width="60" height="7" rx="2" class="f-ink" opacity=".75"/><rect x="40" y="14" width="22" height="10" rx="2" class="f-m-wood st"/>${[0,1,2].map(c=>[0,1].map(r=>`<rect x="${10+c*30}" y="${36+r*20}" width="20" height="11" rx="2" class="f-m-wood st" stroke-width="1.2"/><circle cx="${20+c*30}" cy="${51+r*20}" r="3" class="f-c-blue"/>`).join("")).join("")}`,
    library:`<rect x="2" y="2" width="96" height="10" class="f-m-wood st"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${6+i*11}" y="4" width="7" height="6" class="${["f-c-red","f-c-blue","f-c-green","f-c-yellow"][i%4]}"/>`).join("")}<rect x="86" y="16" width="10" height="58" class="f-m-wood st"/><circle cx="42" cy="48" r="20" class="f-c-green st" opacity=".7"/><circle cx="24" cy="66" r="6" class="f-coral st"/><circle cx="60" cy="66" r="6" class="f-c-yellow st"/>`,
    art:`<rect x="6" y="20" width="58" height="34" rx="4" class="f-m-wood st"/>${["f-c-red","f-c-blue","f-c-yellow","f-c-green"].map((c,i)=>`<circle cx="${16+i*13}" cy="30" r="4" class="${c}"/>`).join("")}<rect x="16" y="40" width="18" height="10" class="f-c-white st" stroke-width="1"/><path d="M78 10 L94 10 L86 40Z" class="f-m-wood st"/><rect x="74" y="50" width="22" height="22" rx="3" class="f-c-white st"/>`,
    lab:`<rect x="2" y="4" width="70" height="16" rx="2" class="f-surface st"/><rect x="10" y="7" width="12" height="9" rx="2" class="f-sky st" stroke-width="1"/><rect x="2" y="46" width="70" height="16" rx="2" class="f-surface st"/><rect x="48" y="49" width="12" height="9" rx="2" class="f-sky st" stroke-width="1"/><circle cx="36" cy="12" r="3" class="f-lagoon"/><circle cx="20" cy="54" r="3" class="f-coral"/><rect x="82" y="4" width="14" height="70" rx="2" class="f-m-metal st"/>`,
    canteen:`<rect x="2" y="2" width="96" height="14" rx="3" class="f-m-metal st"/><rect x="10" y="30" width="60" height="12" rx="3" class="f-m-wood st"/><rect x="10" y="56" width="60" height="12" rx="3" class="f-m-wood st"/>${[0,1,2,3].map(i=>`<circle cx="${18+i*15}" cy="25" r="3.5" class="f-c-blue"/><circle cx="${18+i*15}" cy="73" r="3.5" class="f-c-blue"/>`).join("")}`,
    dt:`<rect x="2" y="2" width="96" height="20" rx="2" class="f-m-wood st"/><rect x="10" y="7" width="22" height="9" class="f-m-metal st" stroke-width="1"/><circle cx="56" cy="12" r="5" class="f-m-metal st" stroke-width="1"/><rect x="40" y="40" width="34" height="24" rx="2" class="f-m-wood st"/><rect x="80" y="44" width="16" height="16" class="f-m-card st"/>`,
    garden:`${[0,1,2].map(i=>`<rect x="6" y="${8+i*20}" width="54" height="12" rx="3" class="f-c-brown" opacity=".55"/>${[0,1,2,3].map(j=>`<circle cx="${14+j*13}" cy="${14+i*20}" r="3.5" class="f-palm"/>`).join("")}`).join("")}<circle cx="82" cy="58" r="15" class="f-palm st"/>`,
    playground:`${[0,1,2].map(i=>`<rect x="8" y="${8+i*16}" width="16" height="14" fill="none" class="st"/>`).join("")}<rect x="24" y="24" width="16" height="14" fill="none" class="st"/><circle cx="72" cy="40" r="22" fill="none" class="st" stroke-dasharray="4 4"/><circle cx="72" cy="40" r="6" class="f-coral st"/>`
  }[k] || "";
  return `<svg class="furn" viewBox="0 0 100 78" aria-hidden="true" focusable="false">${a}</svg>`;
}
