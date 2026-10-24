"use strict";
/* Material Mission: saved state, views, events and boot. */
/* ====================== STATE & STORAGE ====================== */
const sysReduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
function defaultsFor(m){ const s = {}; if (m.play.kind==="sort") return s;
  m.play.controls.forEach(c => s[c.key] = c.options[0].v); return Object.assign(s, m.play.start||{}); }
function freshMission(m, done, att){
  return {v:m.v, step:0, att:att||0, pmatch:null, plan:null, planWrong:0, chartSel:null, chartOk:false, pred:{c:null, r:null}, set:defaultsFor(m), trials:[], sort:{}, sel:null,
    ex:{ok:{},wrong:{},hint:{},last:{},spoken:{}}, tr:{ok:{},wrong:{},hint:{},last:{}},
    done: done || {explored:false, practised:false, demonstrated:false, assisted:false, stamp:false, attempts:0}};
}
function freshStore(){ return {game:GAME_ID, schema:SCHEMA, grade:3, prefs:{narrate:false, sound:true, reduce:sysReduce, big:false}, missions:{}, teacher:{}, lastMission:null, seed:Math.floor(Math.random()*1e9)}; }
let store = freshStore();
const ui = {view:"home", mid:null, busy:false, anim:false, confirm:null, focusHead:true, flash:null, storageOK:true, notice:null, exportText:null};

function save(){
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); ui.storageOK = true; }
  catch(e){ ui.storageOK = false; }
}
function validMission(m, st){
  if (!st || typeof st!=="object") return null;
  if (st.v !== m.v) return "version";
  if (typeof st.step!=="number" || st.step<0 || st.step>=STEPS.length) return null;
  if (!Array.isArray(st.trials)) return null;
  if (m.play.kind!=="sort") {
    const okVal = (s) => s && m.play.controls.every(c => c.options.some(o=>o.v===s[c.key]));
    if (!okVal(st.set)) st.set = defaultsFor(m);
    st.trials = st.trials.filter(t => t && okVal(t.s) && lookup(m,t.s)).slice(-20);
  } else {
    if (typeof st.sort!=="object" || !st.sort) st.sort = {};
    Object.keys(st.sort).forEach(k => { if (!ITEMS[k] || !m.play.cards.some(c=>c.id===st.sort[k])) delete st.sort[k]; });
  }
  ["ex","tr"].forEach(k=>{ if(!st[k]||typeof st[k]!=="object") st[k]={ok:{},wrong:{},hint:{},last:{},spoken:{}}; ["ok","wrong","hint","last"].forEach(x=>{ if(!st[k][x]||typeof st[k][x]!=="object") st[k][x]={}; }); });
  if (!st.pred || typeof st.pred!=="object") st.pred = {c:null,r:null};
  if (!Number.isInteger(st.att)) st.att = 0;
  if (!["yes","partly","no"].includes(st.pmatch)) st.pmatch = null;
  if (!modelCtls(m).some(c=>c.key===st.plan)) st.plan = null;
  st.planWrong = +st.planWrong || 0; st.chartOk = st.chartOk===true; st.chartSel = Number.isInteger(st.chartSel) ? st.chartSel : null;
  ["cer","cerChk"].forEach(x=>{ if (st.ex[x] && typeof st.ex[x]!=="object") delete st.ex[x]; });
  const d = st.done && typeof st.done==="object" ? st.done : {};
  st.done = {explored:!!d.explored, practised:!!d.practised, demonstrated:!!d.demonstrated, assisted:!!d.assisted, stamp:!!d.stamp, attempts:+d.attempts||0};
  // completion flags can never be ahead of the recorded steps
  if (st.step >= 4 && !needCheck(m, st).met) st.step = 2;
  return "ok";
}
function load(){
  let raw = null;
  try { raw = localStorage.getItem(STORE_KEY); ui.storageOK = true; } catch(e){ ui.storageOK = false; }
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (!d || d.game!==GAME_ID || d.schema!==SCHEMA) { ui.notice = "Saved progress was from a different version, so a fresh start was made."; return; }
    const s = freshStore();
    if ([1,2,3,4,5,6].includes(d.grade)) s.grade = d.grade;
    if (Number.isInteger(d.seed)) s.seed = d.seed;
    if (d.prefs && typeof d.prefs==="object") ["narrate","sound","reduce","big","contrast"].forEach(k=>{ if (typeof d.prefs[k]==="boolean") s.prefs[k]=d.prefs[k]; });
    if ([16,18,20,24,32].includes(d.prefs && d.prefs.size)) s.prefs.size = d.prefs.size;
    if (d.teacher && typeof d.teacher==="object") Object.keys(d.teacher).forEach(id=>{ if (byId[id] && typeof d.teacher[id]==="object") s.teacher[id]=d.teacher[id]; });
    let changed = false;
    Object.keys(d.missions||{}).forEach(id => {
      const m = byId[id]; if (!m) return;
      const st = d.missions[id], res = validMission(m, st);
      if (res==="ok") s.missions[id] = st;
      else if (res==="version") { s.missions[id] = freshMission(m, st.done); changed = true; }
    });
    if (byId[d.lastMission]) s.lastMission = d.lastMission;
    store = s;
    if (changed) ui.notice = "Some missions were updated, so they start fresh. Your stamps are kept.";
  } catch(e){ ui.notice = "Saved progress could not be read, so a fresh start was made."; }
}
const M = () => byId[ui.mid];
function S(id){ id = id || ui.mid; const m = byId[id]; if (!store.missions[id]) store.missions[id] = freshMission(m); return store.missions[id]; }

/* ====================== AUDIO & NARRATION ====================== */
let actx = null;
function beep(type){
  if (!store.prefs.sound) return;
  try { actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const seq = {test:[520,660], ok:[660,880], no:[300], stamp:[523,659,784,1046]}[type] || [440];
    seq.forEach((f,i)=>{ const o = actx.createOscillator(), g = actx.createGain(); o.type="triangle"; o.frequency.value=f;
      g.gain.setValueAtTime(.0001, actx.currentTime+i*.11); g.gain.exponentialRampToValueAtTime(.12, actx.currentTime+i*.11+.02); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime+i*.11+.18);
      o.connect(g).connect(actx.destination); o.start(actx.currentTime+i*.11); o.stop(actx.currentTime+i*.11+.2); });
  } catch(e){}
}
function speak(text){
  try { if (!("speechSynthesis" in window)) { announce("Read aloud is not available in this browser. A grown-up can read the screen with you."); return; }
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = .92; u.lang = "en"; speechSynthesis.speak(u);
  } catch(e){}
}
function readScreen(){ const els = document.querySelectorAll("#main [data-read]"); speak(Array.from(els).map(e=>e.textContent.trim()).join(". ")); }
function announce(t){ const l = document.getElementById("live"); l.textContent = ""; setTimeout(()=>l.textContent = t, 30); }

/* ====================== VIEWS ====================== */
function chipRow(d){
  return `<div class="chips">${[["explored","Explored"],["practised","Practised"],["demonstrated","Demonstrated"]].map(([k,l])=>`<span class="chip ${d[k]?"on":""}">${ICON[k]}${l}${d[k]?"":" <span class='sr'>not yet</span>"}</span>`).join("")}</div>`;
}
function gradeStats(g){ const ms = MISSIONS.filter(m=>m.g===g); return {total:ms.length, stamps:ms.filter(m=>store.missions[m.id]&&store.missions[m.id].done.stamp).length}; }
function viewHome(){
  const last = byId[store.lastMission], lst = last && store.missions[last.id];
  const cont = last ? `<button class="btn" data-act="open" data-id="${last.id}" id="b-continue">${lst&&lst.done.stamp&&lst.step===6?"Play again":"Continue"}: ${last.n} ${esc(last.title)}</button>` : "";
  return `<div class="home">
   <div class="home-main">
     <span class="eyebrow">Science Lagoon game</span>
     <h1 tabindex="-1" id="head" data-read>Material <em>Mission</em></h1>
     <p class="lede" data-read>Design, test and improve things for the island school. Pick your grade to see its 10 missions.</p>
     <div class="grades" role="group" aria-label="Choose your grade">${[1,2,3,4,5,6].map(g=>{ const st = gradeStats(g);
       return `<button class="gtile ${store.grade===g?"cur":""}" data-act="pickgrade" data-g="${g}" id="gt-${g}" aria-label="Grade ${g}, ${st.stamps} of ${st.total} stamps">
         <span class="gl">Grade</span><span class="gn">${g}</span><span class="gs">${st.stamps}/${st.total} stamps</span><span class="bar"><span style="width:${Math.round(st.stamps/st.total*100)}%"></span></span></button>`; }).join("")}</div>
     <div class="row">${cont}<button class="btn ghost sm" data-act="read" id="b-read">Read aloud</button></div>
   </div>
   <div class="home-art">${heroArt()}</div>
  </div>`;
}
function missionToken(m, nextId, justId){
  const st = store.missions[m.id], d = st ? st.done : {};
  const state = d.stamp ? "done" : st && (st.step>0 || d.explored) ? "going" : "new";
  const said = d.stamp ? "stamp earned" : state==="going" ? "in progress" : "not started";
  return `<button class="mtok ${state}${m.id===nextId?" next":""}${m.id===justId?" just":""}" data-act="open" data-id="${m.id}" id="b-open-${m.id}" title="${esc(m.goal)}" aria-label="Mission ${m.n}: ${esc(m.title)}, ${said}">
    <span class="mnum">${m.n}</span><span class="mtitle">${esc(m.title)}${m.id===nextId?`<span class="nexttag">Next up</span>`:""}</span>${d.stamp?`<span class="mst" aria-hidden="true">★</span>`:state==="going"?`<span class="mst" aria-hidden="true">${ICON.practised}</span>`:""}</button>`;
}
/* Street map: missions in order down a vertical road, odd numbers on the left, even on the right. */
function lotPos(k){ return {row: Math.floor((k-1)/2), side: k%2 ? "left" : "right"}; }
function playerSVG(){
  return `<svg viewBox="0 0 60 60" aria-hidden="true" focusable="false"><circle cx="30" cy="30" r="28" class="f-surface"/><circle cx="30" cy="30" r="28" fill="none" stroke="var(--sea)" stroke-width="4"/>
   <rect x="13" y="30" width="10" height="16" rx="4" class="f-coral st" stroke-width="1.5"/><path d="M16 52 Q16 34 30 34 Q44 34 44 52Z" class="f-lagoon st" stroke-width="1.5"/>
   <circle cx="30" cy="24" r="11" style="fill:#b97a4e" class="st" stroke-width="1.5"/><path d="M19 22 Q20 11 30 11 Q41 11 41 22 Q36 16 30 17 Q24 16 19 22Z" class="f-ink"/>
   <circle cx="26" cy="25" r="1.6" class="f-ink"/><circle cx="34" cy="25" r="1.6" class="f-ink"/><path d="M26 29 Q30 32 34 29" class="ln" stroke-width="1.5"/></svg>`;
}
function viewGrade(){
  const g = store.grade, ms = MISSIONS.filter(m=>m.g===g), st0 = gradeStats(g);
  const nextM = ms.find(m=>!(store.missions[m.id] && store.missions[m.id].done.stamp)), nextId = nextM && nextM.id, justId = ui.returnTo;
  const rows = Math.ceil(ms.length/2);
  const to = nextM ? lotPos(nextM.k) : {row: rows, side:"mid"};
  const justM = justId && byId[justId] && byId[justId].g===g ? byId[justId] : null;
  ui.playerPos = ui.playerPos || {};
  const from = justM ? lotPos(justM.k) : (ui.playerPos[g] || to);
  ui.playerPos[g] = to;
  const lot = m => { const p = lotPos(m.k);
    return `<section class="room lot lot-${p.side} room-${m.room}" style="grid-area:${p.row+1} / ${p.side==="left"?1:3} / auto / auto" aria-label="${ROOMS[m.room].name}, mission ${m.n}">
      ${roomFurniture(m.room)}<h2 class="rname">${ROOMS[m.room].name}</h2>
      <div class="mtoks">${missionToken(m, nextId, justId)}</div></section>`; };
  return `<div class="stack">
  <div class="mhead"><div class="title"><span class="eyebrow">Material Mission · the island school</span><h1 tabindex="-1" id="head" data-read>Grade ${g} missions</h1>
    <p class="small muted" style="margin-top:2px" data-read>${st0.stamps} of ${st0.total} stamps.${nextM?` Walk down the road to ${esc(nextM.n)} ${esc(nextM.title)} in the ${esc(ROOMS[nextM.room].name.toLowerCase())}.`:" You reached the end of the road!"}</p></div>
    <div class="seg" role="group" aria-label="Switch grade">${[1,2,3,4,5,6].map(n=>`<button class="opt gsw" aria-pressed="${n===g}" data-act="pickgrade" data-g="${n}" id="gs-${n}"><span class="sr">Grade </span>${n}</button>`).join("")}</div></div>
  <div class="street" style="--rows:${rows}" role="group" aria-label="School road, seen from above. Missions go in order down the road.">
    <div class="road" style="grid-area:1 / 2 / ${rows+1} / 3" aria-hidden="true">
      <span class="gate">School gate</span><span class="finish">Finish ⚑</span>
      <span class="trail" id="trail" data-to="${to.row}" style="height:${(to.row+.5)/rows*100}%"></span>
      <span class="player" id="player" data-rows="${rows}" data-from-row="${from.row}" data-from-side="${from.side}" data-to-row="${to.row}" data-to-side="${to.side}">${playerSVG()}</span>
    </div>
    ${ms.map(lot).join("")}
  </div>
  <p class="small muted"><span class="mtok-key new"></span> not started · <span class="mtok-key going"></span> in progress · <span class="mtok-key done"></span> stamp earned · the player shows where you are.</p></div>`;
}
function playerXY(rows, row, side){ return {top: `${Math.min(100,(row+.5)/rows*100)}%`, left: side==="left" ? "30%" : side==="right" ? "70%" : "50%"}; }
function placePlayer(){
  const el = document.getElementById("player"); if (!el) return;
  const rows = +el.dataset.rows, f = playerXY(rows, +el.dataset.fromRow, el.dataset.fromSide), t = playerXY(rows, +el.dataset.toRow, el.dataset.toSide);
  el.style.transition = "none"; el.style.top = f.top; el.style.left = f.left;
  if (f.top===t.top && f.left===t.left) return;
  void el.offsetWidth;
  if (store.prefs.reduce) { el.style.top = t.top; el.style.left = t.left; return; }
  el.classList.add("walking"); el.style.transition = "";
  requestAnimationFrame(()=>{ el.style.top = t.top; el.style.left = t.left; });
  setTimeout(()=>el.classList.remove("walking"), 1300);
}
function walkTo(id, done){
  const el = document.getElementById("player"), m = byId[id];
  if (!el || !m || store.prefs.reduce) return done();
  const t = playerXY(+el.dataset.rows, lotPos(m.k).row, lotPos(m.k).side);
  if (el.style.top===t.top && el.style.left===t.left) return done();
  el.classList.add("walking"); el.style.top = t.top; el.style.left = t.left;
  const tr = document.getElementById("trail"); if (tr) tr.style.height = t.top;
  setTimeout(done, 750);
}

function viewSettings(){
  const p = store.prefs;
  const sw = (k,l,d) => `<div class="toggle"><div><b>${l}</b><div class="small muted">${d}</div></div><button class="sw-btn" role="switch" aria-checked="${!!p[k]}" data-act="pref" data-k="${k}" id="p-${k}"><span class="sr">${l}</span></button></div>`;
  return `<div class="stack">
  <h1 tabindex="-1" id="head" data-read>Learner settings</h1>
  <div class="settings-grid">
   <section class="card"><h2 style="font-size:1.2rem;margin-bottom:10px">Grade</h2>
     <p class="small muted" style="margin-bottom:10px">Choose the grade to show its 10 missions.</p>
     <div class="gradepick" role="group" aria-label="Grade">${[1,2,3,4,5,6].map(g=>`<button class="opt" aria-pressed="${store.grade===g}" data-act="grade" data-g="${g}" id="g-${g}"><span class="sr">Grade </span>${g}</button>`).join("")}</div>
   </section>
   <section class="card"><h2 style="font-size:1.2rem;margin-bottom:6px">Screen and sound</h2>
     ${sw("narrate","Read each screen aloud","Uses the browser's voice. No microphone is used.")}
     ${sw("sound","Sound effects","Short tones after tests and stamps.")}
     ${sw("reduce","Reduce motion","Turns off moving water, rain and sliding.")}
     ${sw("contrast","High contrast","Light text on a dark background, as on OceanHub.")}
     <div class="toggle"><div><b>Text size</b><div class="small muted">The same sizes as OceanHub.</div></div><div class="seg" role="group" aria-label="Text size">${[16,18,20,24,32].map(z=>`<button class="opt" aria-pressed="${(store.prefs.size||16)===z}" data-act="tsize" data-v="${z}" id="ts-${z}">${Math.round(z/16*100)}%</button>`).join("")}</div></div>
   </section>
   <section class="card"><h2 style="font-size:1.2rem;margin-bottom:6px">Progress</h2>
     <p class="small muted">Progress is saved in this browser on this device only. It does not sync between devices. No names, voices, photos or locations are stored.</p>
     <div class="row" style="margin-top:12px"><button class="btn sm ghost" data-act="export" id="b-export">Copy progress record</button>
     <button class="btn sm warn" data-act="resetAllAsk" id="b-resetall">Clear all progress</button></div>
     ${ui.exportText!==null?`<label class="small" for="exp" style="display:block;margin-top:10px">${ui.exportCopied?"Copied. ":"Select and copy this text:"}</label><textarea class="export" id="exp" readonly>${esc(ui.exportText)}</textarea>`:""}
     ${ui.confirm==="all"?`<div class="confirm" style="margin-top:12px"><p><b>Clear every mission, stamp and setting?</b> This cannot be undone.</p><div class="row" style="margin-top:10px"><button class="btn sm warn" data-act="resetAllDo" id="b-ra-yes">Yes, clear it</button><button class="btn sm ghost" data-act="cancel" id="b-ra-no">Keep my progress</button></div></div>`:""}
   </section>
   <section class="card"><h2 style="font-size:1.2rem;margin-bottom:6px">For grown-ups</h2>
     <p class="small muted">The Teacher page lists every mission's goal, proposed curriculum link and review checklist.</p>
     <div class="row" style="margin-top:12px"><button class="btn sm ghost" data-act="teacher" id="b-teach2">Open Teacher page</button></div>
   </section>
  </div></div>`;
}

const REVIEW_ITEMS = [["sci","Science accurate"],["ctx","Maldivian context suitable"],["safe","Safety guidance OK"],["demand","Grade demand OK"],["art","Images match the step"]];
function viewTeacher(){
  const accept = ["Changing colour alone never changes a performance result (G2 Spill squad, G4 Fair roof test).",
    "An unfair comparison cannot complete a cause claim: the Test step stays locked until one variable changes (G3 Fold a bridge, G4, G5, G6).",
    "Every model result is labelled as an example with its conditions.",
    "A successful design must meet every listed requirement (G4 One design two jobs, G5 Lunchbox, G6).",
    "Demonstrated is recorded only for a transfer question solved with no hints and no wrong tries; assisted completion is kept separately."];
  return `<div class="stack">
  <h1 tabindex="-1" id="head">Teacher review</h1>
  <div class="fb note"><span class="ic">!</span><div><b>Curriculum status: Proposed.</b> Grade placements are proposed teaching choices. They must be checked against the current adopted NIE syllabus by a Maldivian science educator. No outcome code or full coverage is claimed. Sources to check: <a href="https://nie.edu.mv/download/english/" target="_blank" rel="noopener">NIE syllabus catalogue</a>, <a href="https://old.moe.gov.mv/assets/upload/Science_Key_Stage_2_Syllabus.pdf" target="_blank" rel="noopener">Key Stage 2 science syllabus (historical)</a>.</div></div>
  <section class="card"><h2 style="font-size:1.2rem;margin-bottom:8px">Built-in acceptance checks</h2><ul class="small" style="margin:0;padding-left:1.1em">${accept.map(a=>`<li>${a}</li>`).join("")}</ul></section>
  ${[1,2,3,4,5,6].map(g=>`<section aria-labelledby="tg${g}"><h2 id="tg${g}" style="font-size:1.25rem;margin-bottom:8px">Grade ${g}</h2>
  <div class="tablewrap"><table><thead><tr><th>Mission</th><th>Goal and evidence of success</th><th>Proposed source</th><th>Learner record</th><th>Review checklist</th></tr></thead><tbody>
  ${MISSIONS.filter(m=>m.g===g).map(m=>{ const st = store.missions[m.id], d = st?st.done:{}; const t = store.teacher[m.id]||{};
    return `<tr><td><b>${m.n} ${esc(m.title)}</b><br><span class="small muted">${m.id} · v${m.v} · ${esc(ROOMS[m.room].name)}</span></td>
     <td>${esc(m.goal)}<br><span class="small muted">${esc(m.idea)}</span></td>
     <td class="small">${esc(m.src)}<br><b>Status: Proposed</b></td>
     <td class="small">${d.explored?"Explored":"—"}${d.practised?", Practised":""}${d.demonstrated?", Demonstrated (independent)":d.assisted?", Transfer with support":""}</td>
     <td>${REVIEW_ITEMS.map(([k,l])=>`<label class="check"><input type="checkbox" data-act="tcheck" data-id="${m.id}" data-k="${k}" id="tc-${m.id}-${k}" ${t[k]?"checked":""}> ${l}</label>`).join("")}</td></tr>`; }).join("")}
  </tbody></table></div></section>`).join("")}
  <section class="card small"><h2 style="font-size:1.2rem;margin-bottom:6px">Classroom use</h2><p class="muted">Use a mission as a demonstration, a paired discussion or independent practice. Ask: what changed, what did the evidence show, and what is still uncertain? Finishing a mission does not mean a child should copy a real experiment. Any off-screen activity needs its own adult supervision and safety plan: no flames, hot objects, sharp tools or mains electricity.</p></section>
  </div>`;
}

/* ---------- mission views ---------- */
function trackHTML(st){
  return `<ol class="track" aria-label="Mission steps">${STEPS.map(([k,l],i)=>`<li class="${i<st.step?"done":i===st.step?"cur":""}" ${i===st.step?'aria-current="step"':""}><span class="dot">${i<st.step?"✓":i+1}</span><span class="tl">${l}</span></li>`).join("")}</ol>`;
}
function settingsSummary(m, s){
  if (m.play.kind==="sort") return Object.keys(s).map(k=>`${ITEMS[k].short} → ${cardOf(m,s[k]).label}`).join(", ") || "Nothing placed";
  return m.play.controls.map(c=>`${c.label}: ${optLabel(m,c.key,s[c.key])}`).join(" · ");
}
function resText(m, r){ if (!r) return "No result"; if (m.play.kind==="sort") return `${r.ok} of ${r.total} correct`; return m.play.res ? m.play.res(r) : ""; }
function obsText(m, r){ if (!r) return ""; return r.obs || (m.play.obsf ? m.play.obsf(r) : ""); }
function reqList(m, r, s, inline){
  const reqs = m.play.reqs; if (!reqs || !reqs.length) return "";
  return `<ul class="reqs${inline?" inline":""}">${reqs.map(q=>{ const y = r ? q.f(r,s) : null; return `<li class="${y===true?"y":y===false?"n":""}"><span class="mk" aria-hidden="true">${y===true?"✓":y===false?"✗":"?"}</span><span>${esc(q.t)} <span class="sr">${y===true?"met":y===false?"not met":"not tested"}</span>${y!==null?`<b class="small" style="color:${y?"var(--ok)":"var(--bad)"}"> ${y?"Met":"Not met"}</b>`:""}</span></li>`; }).join("")}</ul>`;
}
function renderOpts(m, extra){ return Object.assign({}, m.play.rendOpts||{}, extra||{}); }
function sceneFor(m, s, r, extra){ const ss = m.play.setFor ? Object.assign({}, s, m.play.setFor(s)) : s; return scene(m.play.render, ss, r, renderOpts(m, extra)); }

function stepBrief(m, st){
  const reqs = (m.play.reqs && m.play.reqs.length) ? m.play.reqs.map(q=>q.t) : m.job;
  return `<div class="grid2">
   <div class="scenebox">${scene(m.scene.k, m.scene.s, null, m.scene.o||{})}</div>
   <div class="stack">
     <div class="say">${crab(62)}<p class="big-text bubble" data-read>${esc(m.brief)}</p></div>
     <div class="card" style="padding:14px"><h3 style="font-size:1rem;margin-bottom:6px" data-read>The design must:</h3><ul class="reqs">${(m.job||reqs).map(t=>`<li><span class="mk" aria-hidden="true">•</span><span data-read>${esc(t)}</span></li>`).join("")}</ul></div>
     ${m.cards?`<div class="infocards">${m.cards.map(c=>`<div class="info"><h3>${esc(c.h)}</h3><ul>${c.l.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>`:""}
     <p class="small muted"><b>Learning goal:</b> ${esc(m.goal)}</p>
   </div></div>`;
}
function stepPredict(m, st){
  const p = m.predict, g = m.g;
  const opts = p.opts.map(o=>{ const pic = o.s ? sceneFor(m, o.s, o.rk ? m.play.table[o.rk] : null, o.o||{}) : "";
    return `<button class="choice" aria-pressed="${st.pred.c===o.id}" data-act="pred" data-v="${o.id}" id="pr-${o.id}">${pic}<span class="lab">${esc(o.t)}</span></button>`; }).join("");
  const reasons = (p.reasons||[]);
  return `<div class="stack">
   <p class="big-text" data-read>${esc(p.q)}</p>
   <div class="choices" role="group" aria-label="Prediction choices">${opts}</div>
   <section class="card" style="padding:14px"><h3 style="font-size:1rem;margin-bottom:8px">${g<=1?"Why? (optional)":"Choose a reason (optional)"}</h3>
     <div class="seg">${reasons.map((r,i)=>`<button class="opt" aria-pressed="${st.pred.r===r}" data-act="reason" data-v="${esc(r)}" id="rs-${i}">${esc(r)}</button>`).join("")}
     <button class="opt" aria-pressed="${st.pred.r==="aloud"}" data-act="reason" data-v="aloud" id="rs-aloud">I'll say my reason out loud</button></div>
     <p class="small muted" style="margin-top:8px">Saying it out loud is for you and a grown-up. Nothing is recorded.</p>
   </section>
   <p class="small muted">There is no wrong prediction. Your test will show what happens.</p>
  </div>`;
}
function predText(m, st){ const o = m.predict.opts.find(o=>o.id===st.pred.c); if (!o) return "No prediction"; return o.t + (st.pred.r && st.pred.r!=="aloud" ? `, because ${st.pred.r.toLowerCase()}` : st.pred.r==="aloud" ? " (reason said out loud)" : ""); }

function planInfo(m, st){
  const nd = m.play.need||{}, need = m.g>=4 && (nd.fair || nd.one);
  return {need, ok: !need || (nd.fair ? st.plan===nd.fair : !!st.plan)};
}
function planBlock(m, st){
  const nd = m.play.need||{}, pi = planInfo(m, st); if (!pi.need) return "";
  const cs = modelCtls(m);
  let fb = "";
  if (st.plan && !pi.ok) fb = `<div class="fb bad"><span class="ic">!</span><div>${st.planWrong>=2 ? `This mission asks about the ${esc(ctl(m,nd.fair).label.toLowerCase())}. Plan to change only that.` : "Read the brief again. What does this mission ask you to find out?"}</div></div>`;
  if (pi.ok) { const others = cs.filter(c=>c.key!==st.plan).map(c=>c.label.toLowerCase());
    fb = `<div class="fb ok"><span class="ic">✓</span><div>Plan: change the <b>${esc(ctl(m,st.plan).label.toLowerCase())}</b>.${others.length?` Keep the ${esc(others.join(" and "))} the same between the tests you compare.`:""}</div></div>`; }
  if (pi.ok) return `<div class="fb ok"><span class="ic">✓</span><div><b>Plan:</b> change only the <b>${esc(ctl(m,st.plan).label.toLowerCase())}</b>. <button class="linkbtn" data-act="replan" id="b-replan">Change plan</button></div></div>`;
  return `<section class="card tight"><h3 style="font-size:1.05rem;margin-bottom:4px" data-read>Plan your test</h3>
    <p class="small muted" style="margin-bottom:8px">Which one thing will you change? Everything else stays the same.</p>
    <div class="seg" role="group" aria-label="Thing to change">${cs.map(c=>`<button class="opt" aria-pressed="${st.plan===c.key}" data-act="plan" data-v="${c.key}" id="pl-${c.key}">${esc(c.label)}</button>`).join("")}</div>${fb}</section>`;
}
function stepTest(m, st){
  if (m.play.kind==="sort") return stepSort(m, st);
  const plan = planInfo(m, st);
  const T = st.trials, last = T[T.length-1];
  const showing = last && m.play.keys.every(k=>last.s[k]===st.set[k]) && m.play.controls.filter(c=>c.model===false).every(c=>last.s[c.key]===st.set[c.key]);
  const r = showing && !ui.busy ? lookup(m, last.s) : null;
  const nc = needCheck(m, st);
  // fairness warning from the last two trials
  let warn = "";
  if (T.length >= 2) {
    const a = T[T.length-2], b = T[T.length-1], ch = changedKeys(m, a.s, b.s), nm = changedNonModel(m, a.s, b.s);
    const nd = m.play.need || {};
    if ((nd.fair || nd.one) && ch.length > 1) {
      const target = nd.fair || ch[0], others = ch.filter(k=>k!==target);
      warn = `<div class="fb bad" role="alert"><span class="ic">!</span><div><b>${ch.length===2?"Two":"Several"} things changed (${ch.map(k=>ctl(m,k).label.toLowerCase()).join(" and ")}), so we cannot tell which caused the difference.</b>
        <div class="row" style="margin-top:8px"><button class="btn sm" data-act="fixrepeat" id="b-fix">Keep the same ${others.map(k=>ctl(m,k).label.toLowerCase()).join(" and ")} and repeat</button></div></div></div>`;
    } else if (nm.length && !ch.length) {
      warn = `<div class="fb note"><span class="ic">i</span><div>You changed only the ${nm.map(k=>ctl(m,k).label.toLowerCase()).join(" and ")}. The result did not change: colour is not part of this model.</div></div>`;
    }
  }
  const shown = T.length>3 ? T.slice(-3) : T;
  const row = t=>{ const rr = lookup(m, t.s), inPair = nc.pair && nc.pair.includes(t);
    return `<tr class="${inPair?"pair":""}"><td>${t.n}</td>${m.play.controls.map(c=>`<td>${esc(optLabel(m,c.key,t.s[c.key]))}</td>`).join("")}<td><b>${esc(resText(m, rr))}</b>${inPair?' <span class="sr">part of fair pair</span>':""}</td></tr>`; };
  const thead = `<thead><tr><th>#</th>${m.play.controls.map(c=>`<th>${esc(c.label)}</th>`).join("")}<th>Result</th></tr></thead>`;
  return `<div class="grid2">
    <div class="stack">
      <div class="scenebox">${sceneFor(m, st.set, r, {anim: ui.anim && !store.prefs.reduce})}</div>
      ${r ? `<div class="fb ok" aria-live="polite"><span class="ic">✓</span><div><b>${esc(resText(m,r))}</b> <span class="badge">Example model result</span><br>${esc(obsText(m,r))}${m.play.reqs?`<div style="margin-top:6px">${reqList(m, r, st.set, true)}</div>`:""}</div></div>`
          : ui.busy ? `<div class="fb note"><span class="ic">…</span><div>Testing…</div></div>`
          : `${m.play.reqs?`<div class="card tight"><b class="small">Requirements</b>${reqList(m, null, st.set, true)}</div>`:""}`}
    </div>
    <div class="stack">
      ${planBlock(m, st)}
      ${!plan.ok ? `<p class="small muted">Make your plan first. Then the test bench unlocks.</p>` : `${m.play.controls.map(c=>`<fieldset class="ctl"><legend>${esc(c.label)}${c.model===false?'<span class="tag">not part of the model</span>':""}</legend><div class="seg">${c.options.map(o=>`<button class="opt" aria-pressed="${st.set[c.key]===o.v}" data-act="ctl" data-k="${c.key}" data-v="${esc(o.v)}" id="c-${c.key}-${o.v.replace(/\W/g,"")}">${esc(o.label)}</button>`).join("")}</div></fieldset>`).join("")}
      <p class="cond"><b>Kept the same:</b> ${m.play.fixed.map(esc).join(" · ")}</p>
      <button class="btn" data-act="test" id="b-test" ${ui.busy?"disabled":""}>${esc(m.play.testLabel||"Test")}</button>`}
      ${warn}
      ${m.cards ? `<div class="infocards">${m.cards.map(c=>`<div class="info"><h3>${esc(c.h)}</h3><ul>${c.l.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>` : ""}
      <section aria-labelledby="th" class="stack" style="gap:6px">
        <div class="row" style="gap:8px"><h3 id="th" style="font-size:1rem">Test record</h3><span class="badge">Example results</span></div>
        ${T.length ? `<div class="tablewrap"><table>${thead}<tbody>${shown.map(row).join("")}</tbody></table></div>
          ${T.length>3?`<details class="small"><summary>Show all ${T.length} tests</summary><div class="tablewrap" style="margin-top:6px"><table>${thead}<tbody>${T.map(row).join("")}</tbody></table></div></details>`:""}`
          : `<p class="small muted">No tests yet. Each test is saved here and does not change if you move the settings afterwards.</p>`}
        ${nc.met ? `<div class="fb ok"><span class="ic">✓</span><div>${nc.pair?"You have a fair comparison (highlighted). ":""}You have the evidence you need. Press Next.</div></div>` : `<p class="small"><b>To continue:</b> ${esc(nc.msgs.join(" "))}</p>`}
      </section>
    </div>
  </div>`;
}
function stepSort(m, st){
  const T = st.trials, last = T[T.length-1], nc = needCheck(m, st);
  const res = last ? sortResult(m, last.s) : null;
  const fresh = last && JSON.stringify(last.s)===JSON.stringify(st.sort);
  return `<div class="sortbox">
    <p class="big-text" data-read>${st.sel ? `Now tap the card for the ${ITEMS[st.sel].short.toLowerCase()}.` : "Tap a thing, then tap its card."}</p>
    <div class="items" style="grid-template-columns:repeat(${m.play.items.length},minmax(0,1fr))" role="group" aria-label="Things to sort">${m.play.items.map(id=>`<button class="item ${st.sort[id]?"placed":""}" aria-pressed="${st.sel===id}" data-act="sortItem" data-v="${id}" id="si-${id}"><svg viewBox="0 0 100 100" aria-hidden="true">${itemIcon(id)}</svg>${esc(ITEMS[id].short)}<span class="small muted">${ITEMS[id].colour}, ${ITEMS[id].feel}</span>${st.sort[id]?`<span class="sr"> placed on ${esc(cardOf(m,st.sort[id]).label)}</span>`:""}</button>`).join("")}</div>
    <div class="bins" style="grid-template-columns:repeat(${m.play.cards.length},minmax(0,1fr))" role="group" aria-label="Cards">${m.play.cards.map(c=>`<button class="bin" data-act="sortCard" data-v="${c.id}" id="sc-${c.id}" ${st.sel?"":'aria-disabled="true"'}>${matSwatch(c)}<span>${esc(c.label)}</span><span class="in">${Object.keys(st.sort).filter(k=>st.sort[k]===c.id).map(k=>`<svg viewBox="0 0 100 100" role="img" aria-label="${esc(ITEMS[k].name)}">${itemIcon(k)}</svg>`).join("")}</span></button>`).join("")}</div>
    <div class="row"><button class="btn" data-act="test" id="b-test" ${Object.keys(st.sort).length<m.play.items.length||ui.busy?"disabled":""}>Check my sorting</button><button class="btn ghost sm" data-act="sortClear" id="b-sclear">Start sorting again</button></div>
    ${res && fresh ? `<div class="fb ${res.ok===res.total?"ok":"bad"}" aria-live="polite"><span class="ic">${res.ok===res.total?"✓":"!"}</span><div><b>${res.ok} of ${res.total} on the right card.</b> ${res.wrong.length?res.wrong.map(id=>`Look again at the ${ITEMS[id].short.toLowerCase()}: ${m.play.retry||"what is it made from?"}`).join(" "):"Each thing is on the right card."}</div></div>`:""}
    ${nc.met ? "" : ""}
  </div>`;
}

function trialCard(m, t, label){
  const r = lookup(m, t.s);
  return `<div class="evcard">${label?`<span class="eyebrow">${esc(label)}</span>`:""}
    ${m.play.kind==="sort" ? "" : sceneFor(m, t.s, r, {})}
    <div class="res">${esc(resText(m, r))}</div>
    <p class="small">${esc(obsText(m, r))} <span class="muted">${esc(settingsSummary(m, t.s))}</span></p>
    ${m.play.reqs ? reqList(m, r, t.s, true) : ""}
  </div>`;
}
function stepEvidence(m, st){
  const ev = evidenceTrials(m, st);
  let diff = "";
  if (m.play.kind!=="sort" && ev.length===2) {
    const ch = changedKeys(m, ev[0].s, ev[1].s), same = m.play.keys.filter(k=>!ch.includes(k));
    diff = `<div class="diff"><div class="changed"><b>What changed</b><ul class="small" style="margin:6px 0 0;padding-left:1.1em">${ch.map(k=>`<li>${esc(ctl(m,k).label)}: ${esc(optLabel(m,k,ev[0].s[k]))} → ${esc(optLabel(m,k,ev[1].s[k]))}</li>`).join("") || "<li>Nothing in the model</li>"}</ul></div>
      <div><b>What stayed the same</b><ul class="small" style="margin:6px 0 0;padding-left:1.1em">${same.map(k=>`<li>${esc(ctl(m,k).label)}: ${esc(optLabel(m,k,ev[0].s[k]))}</li>`).join("")}${m.play.fixed.map(f=>`<li>${esc(f)}</li>`).join("")}</ul></div></div>`;
  }
  let sortBlock = "";
  if (m.play.kind==="sort") { const s = ev[0].s;
    sortBlock = `<div class="evgrid">${m.play.cards.map(c=>`<div class="evcard"><div class="row">${matSwatch(c)}<b>${esc(c.label)}</b></div><div class="row">${Object.keys(s).filter(k=>s[k]===c.id).map(k=>`<svg viewBox="0 0 100 100" width="60" height="60" aria-hidden="true">${itemIcon(k)}</svg><span class="small">${esc(ITEMS[k].name)} (${ITEMS[k].colour})</span>`).join("")}</div></div>`).join("")}</div>
     <div class="fb note"><span class="ic">i</span><div>${esc(m.play.note||"")}</div></div>`; }
  return `<div class="evlayout">
   <div class="stack">
    ${sortBlock || `<div class="evgrid">${ev.map((t,i)=>trialCard(m, t, ev.length===2 ? (i===0?"Test "+t.n+" (before)":"Test "+t.n+" (after)") : "Test "+t.n)).join("")}</div>`}
    <p class="small muted"><span class="badge">Example model results</span> These come from the game's model, not real measurements.</p>
    ${diff}
   </div>
   <div class="stack">
    <section class="card tight"><p class="small" data-read><b>You predicted:</b> ${esc(predText(m, st))}</p><h3 style="font-size:1.05rem;margin:6px 0 8px" data-read>Did the result match your prediction?</h3>
      <div class="seg" role="group" aria-label="Did the result match your prediction?">${[["yes","Yes"],["partly","Partly"],["no","No"]].map(([v,l])=>`<button class="opt" aria-pressed="${st.pmatch===v}" data-act="pmatch" data-v="${v}" id="pm-${v}">${l}</button>`).join("")}</div>
      ${st.pmatch ? `<div class="fb ${st.pmatch==="yes"?"ok":"note"}" style="margin-top:8px"><span class="ic">${st.pmatch==="yes"?"✓":"★"}</span><div>${st.pmatch==="yes"?"Your prediction matched the evidence. Next, explain why it happened.":"That is fine. Changing your idea because of evidence is exactly what scientists do."}</div></div>` : ""}
    </section>
    ${chartBlock(m, st, ev)}
   </div>
  </div>`;
}
function chartTask(m){ return m.g>=5 && m.play.chart ? m.play.chart : null; }
function chartBottom(m, ev){
  if (ev.length===2) { const ch = changedKeys(m, ev[0].s, ev[1].s); if (ch.length===1) return ch[0]; }
  const nd = m.play.need||{}; return nd.testAll || null;
}
function chartOpts(m, st){
  const c = chartTask(m), ev = evidenceTrials(m, st), bk = chartBottom(m, ev), bl = bk ? ctl(m,bk).label : "Test number";
  return [[c.y,1,"Yes. The side axis shows what you measured, with its unit."],[c.bad,0,"Check the unit. What did you measure it in?"],[bl,0,"That is what you changed. It goes along the bottom."]];
}
function ownChart(m, ev, c, bk){
  const vals = ev.map(t=>c.f(lookup(m,t.s))), max = Math.max(...vals)*1.15 || 1, n = ev.length;
  const ox = 70, oy = 180, top = 30, w = 310, bw = Math.min(60, w/n*0.6);
  let g = `<rect width="400" height="232" class="f-surface"/><line x1="${ox}" y1="${top}" x2="${ox}" y2="${oy}" class="ln"/><line x1="${ox}" y1="${oy}" x2="${ox+w}" y2="${oy}" class="ln"/>`;
  ev.forEach((t,i)=>{ const v = vals[i], h = v/max*(oy-top), cx = ox + w/n*(i+.5);
    const lab = bk ? optLabel(m,bk,t.s[bk]) : `Test ${t.n}`;
    g += `<rect x="${cx-bw/2}" y="${oy-h}" width="${bw}" height="${h}" class="f-sea"/><text x="${cx}" y="${oy-h-5}" text-anchor="middle" class="t-s">${v}</text><text x="${cx}" y="${oy+15}" text-anchor="middle" class="t-s">${esc(lab.length>16?lab.slice(0,15)+"…":lab)}</text>`; });
  g += `<text x="${ox+w/2}" y="${oy+38}" text-anchor="middle" class="t">${esc(bk?ctl(m,bk).label:"Test")}</text><text transform="translate(18 ${(oy+top)/2}) rotate(-90)" text-anchor="middle" class="t">${esc(c.y)}</text>`;
  return `<svg class="scene" style="max-width:520px;margin:0 auto" viewBox="0 0 400 232" role="img" aria-label="Bar chart of your results: ${esc(ev.map((t,i)=>(bk?optLabel(m,bk,t.s[bk]):"Test "+t.n)+" "+vals[i]).join(", "))}">${g}</svg>`;
}
function chartBlock(m, st, ev){
  const c = chartTask(m); if (!c) return "";
  const opts = chartOpts(m, st), ord = order(opts.length, shufKey(m, st, "chart", 0)), bk = chartBottom(m, ev), sel = st.chartSel;
  return `<section class="card tight"><h3 style="font-size:1.05rem;margin-bottom:4px" data-read>Make a chart of your results</h3>
    <p class="small muted" style="margin-bottom:8px">Which label goes up the side of the chart?</p>
    <div class="answers">${ord.map(oi=>{ const o = opts[oi], isSel = sel===oi, cls = isSel ? (o[1]?"right":"wrong") : "";
      return `<button class="answer ${cls}" data-act="chartpick" data-o="${oi}" id="ch-${oi}" aria-pressed="${isSel}" ${st.chartOk?"disabled":""}><span class="mk" aria-hidden="true">${cls==="right"?"✓":cls==="wrong"?"✗":""}</span><span>${esc(o[0])}</span></button>`; }).join("")}</div>
    ${sel!==null && sel!==undefined && opts[sel] ? `<div class="fb ${opts[sel][1]?"ok":"bad"}" style="margin-top:8px"><span class="ic">${opts[sel][1]?"✓":"!"}</span><div>${esc(opts[sel][2])}</div></div>` : ""}
    ${st.chartOk ? `<div class="scenebox" style="margin-top:10px">${ownChart(m, ev, c, bk)}</div><span class="badge">Your example model results</span>` : ""}
  </section>`;
}

function evidenceStrip(m, st){
  const ev = evidenceTrials(m, st);
  return `<div class="predcard small"><b>Your evidence:</b> ${ev.map(t=>`Test ${t.n}: ${esc(m.play.kind==="sort"?settingsSummary(m,t.s):m.play.controls.filter(c=>c.model!==false).map(c=>optLabel(m,c.key,t.s[c.key])).join(", "))} → <b>${esc(resText(m, lookup(m,t.s)))}</b>`).join(" · ")}<br><b>You predicted:</b> ${esc(predText(m, st))}${st.pmatch?` · <b>Matched?</b> ${st.pmatch==="yes"?"Yes":st.pmatch==="partly"?"Partly":"No"}`:""}</div>`;
}
function hintBox(Qn, hl){ return hl>0 ? `<div class="hint">${crab()}<div><div class="lvl">Kakuni's hint ${hl} of 3</div>${Qn.hints.slice(0,hl).map((h,i)=>`<p${i===hl-1?' data-read':""} style="margin-top:4px">${esc(h)}</p>`).join("")}</div></div>` : ""; }
function cerBlock(m, st, qs, qi, Qn){
  const q = st.ex, sel = (q.cer && q.cer[qi]) || {}, checked = q.cerChk && q.cerChk[qi], right = !!q.ok[qi], hl = q.hint[qi]||0;
  let html = `<div class="stack">${qs.length>1?`<p class="eyebrow">Question ${qi+1} of ${qs.length}</p>`:""}<h3 style="font-size:1.25rem" data-read>Build your explanation</h3><p class="small muted">Choose one part for each box. Then check it.</p><div class="cergrid">`;
  Qn.slots.forEach(sl => {
    const ord = order(sl.opts.length, shufKey(m, st, "ex", qi, sl.key));
    html += `<fieldset class="ctl cer"><legend>${sl.label} <span class="small muted">· ${esc(sl.help)}</span></legend><div class="answers">${ord.map(oi => { const o = sl.opts[oi], isSel = sel[sl.key]===oi;
      const cls = (checked||right) && isSel ? (o[1]?"right":"wrong") : "";
      return `<button class="answer ${cls}" data-act="cerpick" data-q="${qi}" data-k="${sl.key}" data-o="${oi}" id="cer-${qi}-${sl.key}-${oi}" aria-pressed="${isSel}" ${right?"disabled":""}><span class="mk" aria-hidden="true">${cls==="right"?"✓":cls==="wrong"?"✗":isSel?"●":""}</span><span>${esc(o[0])}</span></button>`; }).join("")}</div>`;
    if (checked && !right && sel[sl.key]!==undefined && !sl.opts[sel[sl.key]][1]) html += `<div class="fb bad"><span class="ic">!</span><div>${esc(sl.opts[sel[sl.key]][2])}</div></div>`;
    html += `</fieldset>`; });
  html += `</div>`;
  if (right) { const pick = k => Qn.slots.find(x=>x.key===k).opts[sel[k]][0];
    html += `<div class="fb ok" role="status"><span class="ic">✓</span><div><b>Your explanation:</b> ${esc(pick("claim"))}. ${esc(pick("evidence"))} ${esc(pick("reason"))}.</div></div>`; }
  else {
    const all = Qn.slots.every(x=>sel[x.key]!==undefined);
    html += `<div class="row"><button class="btn" data-act="cercheck" data-q="${qi}" id="b-cercheck" ${all?"":"disabled"}>Check my explanation</button>${hl<3?`<button class="btn ghost sm" data-act="hint" data-stage="ex" data-q="${qi}" id="h-ex-${qi}">${hl?"Another hint":"Get a hint"}</button>`:""}</div>${hintBox(Qn, hl)}`;
  }
  return html + `</div>`;
}
function qBlock(m, st, stage, qs){
  const q = st[stage]; const qi = Math.min(Math.max(0, q.cur||0), qs.length-1), Qn = qs[qi];
  if (Qn.cer) return cerBlock(m, st, qs, qi, Qn);
  const ord = order(Qn.opts.length, shufKey(m, st, stage, qi));
  const lastI = q.last[qi], answered = lastI!==undefined && lastI!==null, right = !!q.ok[qi];
  const chosen = answered ? Qn.opts[lastI] : null;
  const hl = q.hint[qi]||0;
  const allDone = qi===qs.length-1;
  let html = `<div class="stack">`;
  if (qs.length>1) html += `<p class="eyebrow">Question ${qi+1} of ${qs.length}</p>`;
  html += `<h3 style="font-size:1.25rem" data-read>${esc(Qn.q)}</h3>`;
  html += `<div class="answers" role="group" aria-label="Answer choices">${ord.map((oi,pos)=>{ const o = Qn.opts[oi]; const sel = answered && lastI===oi; const cls = sel ? (o[1]?"right":"wrong") : (right && o[1] ? "right" : "");
    return `<button class="answer ${cls}" data-act="ans" data-stage="${stage}" data-q="${qi}" data-o="${oi}" id="a-${stage}-${qi}-${oi}" ${right?"disabled":""} aria-pressed="${sel}"><span class="mk" aria-hidden="true">${cls==="right"?"✓":cls==="wrong"?"✗":String.fromCharCode(65+pos)}</span><span>${esc(o[0])}</span></button>`; }).join("")}</div>`;
  if (answered && chosen) html += `<div class="fb ${chosen[1]?"ok":"bad"}" role="status"><span class="ic">${chosen[1]?"✓":"!"}</span><div>${esc(chosen[2])}${!chosen[1]?" Try again.":""}</div></div>`;
  if (q.spoken && q.spoken[qi]) html += `<div class="fb ok"><span class="ic">✓</span><div>A grown-up heard the explanation. Well done.</div></div>`;
  if (!right) {
    html += hintBox(Qn, hl);
    html += `<div class="row">${hl<3?`<button class="btn ghost sm" data-act="hint" data-stage="${stage}" data-q="${qi}" id="h-${stage}-${qi}">${hl?"Another hint":"Get a hint"}</button>`:""}
      ${m.g<=2 && stage==="ex" ? `<button class="btn ghost sm" data-act="spoken" data-q="${qi}" id="sp-${qi}">A grown-up heard me explain it</button>` : ""}</div>`;
    if (m.g<=2 && stage==="ex") html += `<p class="small muted">Explaining out loud counts too. Nothing is recorded; a grown-up taps the button.</p>`;
  } else if (!allDone) html += `<button class="btn sm" data-act="nextq" data-stage="${stage}" data-q="${qi}" id="b-nextq-${stage}-${qi}">Next question</button>`;
  html += `</div>`;
  return html;
}
function stepExplain(m, st){
  return `<div class="grid2"><div class="stack">${qBlock(m, st, "ex", EXQ(m, st))}</div><div class="stack">${evidenceStrip(m, st)}<div class="scenebox hide-sm">${m.play.kind==="sort"?scene("items",{},null,{item:"cup"}):sceneFor(m, (evidenceTrials(m,st).slice(-1)[0]||{s:st.set}).s, lookup(m,(evidenceTrials(m,st).slice(-1)[0]||{s:st.set}).s), {})}</div></div></div>`;
}
function stepTransfer(m, st){
  const t = m.transfer;
  let vis = "";
  if (t.scene) vis = `<div class="scenebox">${scene(t.scene.k, t.scene.s||{}, null, Object.assign({}, t.scene.o||{}, t.scene.pair?{pair:t.scene.pair}:{}))}</div>`;
  if (t.cards) vis += `<div class="infocards">${t.cards.map(c=>`<div class="info"><h3>${esc(c.h)}</h3><ul>${c.l.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  if (t.table) vis += `<div class="tablewrap"><table><thead><tr>${t.table.head.map(h=>`<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.table.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><span class="badge">Example data</span>`;
  return `<div class="grid2"><div class="stack"><div class="fb note"><span class="ic">★</span><div data-read>${esc(t.intro)}</div></div>${vis}</div>
   <div class="stack">${qBlock(m, st, "tr", t.qs)}<p class="small muted">Try this one on your own first. Using a hint is fine; the record will show it was supported.</p></div></div>`;
}
function stepSummary(m, st){
  const d = st.done, ex = st.ex, tr = st.tr;
  const hintsEx = Object.values(ex.hint).reduce((a,b)=>a+b,0), hintsTr = Object.values(tr.hint).reduce((a,b)=>a+b,0);
  const indep = qsIndependent(m, st);
  const next = MISSIONS[MISSIONS.indexOf(m)+1];
  return `<div class="stack">
   <div class="summary-top">${store.prefs.reduce ? "" : `<div class="confetti" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--x:${(i*53)%100}%;--d:${(i%6)*.12}s;--c:var(${["--coral","--sun","--sea","--palm","--lagoon","--c-blue"][i%6]})"></i>`).join("")}</div>`}${stampArt(m.n, true, "stamp-pop")}<div class="stack" style="gap:6px;flex:1;min-width:220px"><span class="eyebrow">Discovery stamp</span><p class="big-text" data-read><b>${esc(m.idea)}</b></p></div></div>
   <div class="indic">
     <div class="${d.explored?"on":""}"><b>${ICON.explored} Explored</b><span class="small muted">You tested the model.</span></div>
     <div class="${d.practised?"on":""}"><b>${ICON.practised} Practised</b><span class="small muted">You explained the evidence.</span></div>
     <div class="${d.demonstrated?"on":""}"><b>${ICON.demonstrated} Demonstrated</b><span class="small muted">${d.demonstrated?"You solved a new problem on your own.":"Solve the new problem with no hints to show this."}</span></div>
   </div>
   <div class="row">
     ${next ? `<button class="btn" data-act="open" data-id="${next.id}" id="b-nextm">Next: ${next.n} ${esc(next.title)} <span class="small" style="opacity:.85">· ${esc(ROOMS[next.room].name)}</span></button>` : ""}
     <button class="btn ghost" data-act="replayAsk" id="b-replay">Play this mission again</button>
     <button class="btn ghost" data-act="missions" id="b-sumhome">Back to the house</button>
     <a class="linkbtn" href="${LESSON_URL}" target="_blank" rel="noopener">Related Science Lagoon lessons</a>
   </div>
   <section class="card"><h3 style="margin-bottom:8px">Your evidence</h3>${evidenceStrip(m, st)}</section>
   <section class="card small"><h3 style="margin-bottom:6px">Support used this time</h3>
     <p>Hints while explaining: ${hintsEx}. Hints on the new problem: ${hintsTr}. ${indep?"You solved the new problem on your own.":"You solved the new problem with some help. Try it again another day without hints."}</p>
     ${ex.spoken && Object.keys(ex.spoken).length ? "<p>An explanation was given out loud to a grown-up.</p>" : ""}
     ${st.pmatch && st.pmatch!=="yes" && d.practised ? "<p><b>★ You changed your idea using evidence.</b> That is real science.</p>" : ""}
     <p class="muted" style="margin-top:6px">These are learning signs in this game, not school grades.</p></section>
   ${ui.confirm==="replay"?`<div class="confirm"><p><b>Start this mission again?</b> Your stamp and best record stay. This attempt's answers are cleared.</p><div class="row" style="margin-top:10px"><button class="btn sm warn" data-act="replay" id="b-rp-yes">Start again</button><button class="btn sm ghost" data-act="cancel" id="b-rp-no">Cancel</button></div></div>`:""}
  </div>`;
}
function qsIndependent(m, st){ const tr = st.tr; return m.transfer.qs.every((_,i)=>tr.ok[i] && !(tr.wrong[i]>0) && !(tr.hint[i]>0)); }

function canAdvance(m, st){
  switch (STEPS[st.step][0]) {
    case "brief": return [true];
    case "predict": return [!!st.pred.c, "Choose a prediction to continue."];
    case "test": { const n = needCheck(m, st); return [n.met, n.msgs.join(" ")]; }
    case "evidence": { const needChart = chartTask(m) && !st.chartOk;
      return [!!st.pmatch && !needChart, !st.pmatch ? "Say whether the result matched your prediction." : "Finish your chart to continue."]; }
    case "explain": return [EXQ(m, st).every((_,i)=>st.ex.ok[i]), "Answer using your evidence to continue."];
    case "transfer": return [m.transfer.qs.every((_,i)=>st.tr.ok[i]), "Solve the new problem to finish."];
    default: return [false];
  }
}
function viewMission(){
  const m = M(), st = S(), k = STEPS[st.step][0];
  const body = {brief:stepBrief, predict:stepPredict, test:stepTest, evidence:stepEvidence, explain:stepExplain, transfer:stepTransfer, summary:stepSummary}[k](m, st);
  const [ok, why] = canAdvance(m, st);
  const heads = {brief:m.title, predict:"Make a prediction", test:"Test on the bench", evidence:"Look at the evidence", explain:"Explain what you found", transfer:"A new problem", summary:"Mission complete"};
  return `<div class="stack mission">
   <div class="mhead"><div class="title"><span class="eyebrow">Grade ${m.g} · Mission ${m.n}${k!=="brief"?" · "+esc(m.title):""} <span class="roompill">${roomFurniture(m.room)}${esc(ROOMS[m.room].name)}</span></span>
     <h1 tabindex="-1" id="head" data-read>${esc(heads[k])}</h1></div>
     <div class="row"><button class="btn ghost sm" data-act="read" id="b-read" aria-label="Read aloud">🔊<span class="hide-sm"> Read aloud</span></button><button class="btn ghost sm" data-act="missions" id="b-exit">Exit</button></div></div>
   ${trackHTML(st)}
   ${ui.flash?`<div class="fb ${ui.flash.type}"><span class="ic">!</span><div>${esc(ui.flash.text)}</div></div>`:""}
   ${body}
   ${k!=="summary"?`<div class="navbar sticky">${st.step>0?`<button class="btn ghost" data-act="back" id="b-back">Back</button>`:""}<span class="why" aria-live="polite">${ok?"":esc(why||"")}</span><button class="btn" data-act="next" id="b-next" ${ok?"":"disabled"}>${k==="transfer"?"Finish":"Next"}</button></div>`:""}
  </div>`;
}

/* ====================== RENDER & EVENTS ====================== */
function render(){
  document.documentElement.classList.toggle("reduce", !!store.prefs.reduce);
  const tz = store.prefs.size || (store.prefs.big ? 18 : 16);
  document.documentElement.style.fontSize = tz!==16 ? `calc(var(--step) * ${tz/16})` : "";
  document.documentElement.classList.toggle("high-contrast", !!store.prefs.contrast);
  const prevId = document.activeElement && document.activeElement.id;
  const main = document.getElementById("main");
  document.documentElement.classList.toggle("onescreen", ui.view==="home");
  main.innerHTML = ui.view==="settings" ? viewSettings() : ui.view==="teacher" ? viewTeacher() : ui.view==="grade" ? viewGrade() : ui.view==="mission" && ui.mid ? viewMission() : viewHome();
  document.querySelectorAll(".topbtn").forEach(b=>b.removeAttribute("aria-current"));
  const cur = {home:"t-home",settings:"t-settings",teacher:"t-teacher"}[ui.view]; if (cur) document.getElementById(cur).setAttribute("aria-current","page");
  document.getElementById("warn").innerHTML = (!ui.storageOK ? `<div class="warnbar"><div class="wrap">This browser is not saving progress. You can still play; progress will be lost when the page closes.</div></div>` : "") +
    (ui.notice ? `<div class="warnbar"><div class="wrap row">${esc(ui.notice)} <button class="linkbtn" data-act="dismiss" id="b-dismiss">OK</button></div></div>` : "");
  if (ui.view==="grade") placePlayer();
  let placed = false;
  if (ui.focusHead && ui.view==="grade" && ui.returnTo) { const t = document.getElementById("b-open-"+ui.returnTo); ui.returnTo = null;
    if (t) { ui.focusHead = false; placed = true; t.focus({preventScroll:true}); t.scrollIntoView({block:"center"}); } }
  if (placed) {}
  else if (ui.focusHead) { ui.focusHead = false; window.scrollTo(0,0); const h = document.getElementById("head"); if (h) h.focus({preventScroll:true});
    if (store.prefs.narrate) setTimeout(readScreen, 250); }
  else if (prevId) { const el = document.getElementById(prevId); if (el && !el.disabled) el.focus({preventScroll:true}); else { const h = document.getElementById("head"); if (h) h.focus({preventScroll:true}); } }
  if (ui.view==="settings" && ui.exportText!==null) { const t = document.getElementById("exp"); if (t && !ui.exportCopied) t.select(); }
}
function go(view, mid){ ui.view = view; if (mid) ui.mid = mid; ui.confirm = null; ui.flash = null; ui.focusHead = true; ui.exportText = null; render(); }

function act(a, d, el){
  const m = M(), st = ui.mid ? S() : null;
  switch (a) {
    case "home": try{speechSynthesis.cancel()}catch(e){} save(); return go("home");
    case "settings": return go("settings");
    case "missions": try{speechSynthesis.cancel()}catch(e){} save(); ui.returnTo = ui.view==="mission" ? ui.mid : null; return go("grade");
    case "pickgrade": store.grade = +d.g; save(); return go("grade");
    case "teacher": return go("teacher");
    case "dismiss": ui.notice = null; return render();
    case "open": { store.lastMission = d.id; const s2 = S(d.id); store.grade = byId[d.id].g; save(); return go("mission", d.id); }
    case "read": return readScreen();
    case "grade": store.grade = +d.g; save(); return render();
    case "tsize": store.prefs.size = [16,18,20,24,32].includes(+d.v) ? +d.v : 16; save(); return render();
    case "pref": store.prefs[d.k] = !store.prefs[d.k]; save(); if (d.k==="narrate" && !store.prefs.narrate) { try{speechSynthesis.cancel()}catch(e){} } return render();
    case "export": { const rec = {game:GAME_ID, schema:SCHEMA, exported:new Date().toISOString(), contentVersions:Object.fromEntries(MISSIONS.map(m=>[m.id,m.v])), grade:store.grade,
        missions:Object.fromEntries(Object.entries(store.missions).map(([id,s])=>[id,{version:s.v, step:STEPS[s.step][0], prediction:s.pred, trials:s.trials, hintsExplain:s.ex.hint, transfer:{correct:s.tr.ok, wrong:s.tr.wrong, hints:s.tr.hint}, indicators:s.done}]))};
      ui.exportText = JSON.stringify(rec, null, 2); ui.exportCopied = false;
      try { navigator.clipboard.writeText(ui.exportText).then(()=>{ ui.exportCopied = true; announce("Progress record copied."); render(); }).catch(()=>render()); } catch(e){ render(); }
      return render(); }
    case "resetAllAsk": ui.confirm = "all"; return render();
    case "resetAllDo": { const g = store.grade; store = freshStore(); store.grade = g; save(); ui.confirm = null; announce("All progress cleared."); return render(); }
    case "cancel": ui.confirm = null; return render();
    case "tcheck": { const t = store.teacher[d.id] = store.teacher[d.id]||{}; t[d.k] = !!el.checked; save(); return; }
    case "back": if (st.step>0) { st.step--; ui.flash = null; save(); ui.focusHead = true; render(); } return;
    case "next": { const [ok] = canAdvance(m, st); if (!ok) return; st.step = Math.min(STEPS.length-1, st.step+1);
      if (STEPS[st.step][0]==="summary") { if (!st.done.stamp) beep("stamp"); st.done.stamp = true; st.done.attempts++; }
      ui.flash = null; save(); ui.focusHead = true; return render(); }
    case "pred": st.pred.c = d.v; save(); return render();
    case "reason": st.pred.r = st.pred.r===d.v ? null : d.v; save(); return render();
    case "ctl": st.set[d.k] = d.v; ui.flash = null; save(); return render();
    case "fixrepeat": { const T = st.trials, a1 = T[T.length-2], b1 = T[T.length-1]; const ch = changedKeys(m, a1.s, b1.s); const target = (m.play.need.fair) || ch[0];
      const ns = Object.assign({}, b1.s); ch.forEach(k=>{ if (k!==target) ns[k] = a1.s[k]; }); st.set = ns; save(); announce("Settings changed back. Press Test to repeat."); render(); const tb = document.getElementById("b-test"); if (tb) tb.focus(); return; }
    case "test": return runTest(m, st);
    case "sortItem": st.sel = st.sel===d.v ? null : d.v; save(); return render();
    case "sortCard": if (!st.sel) { announce("Tap a thing first."); return; } st.sort[st.sel] = d.v; st.done.explored = true; announce(`${ITEMS[st.sel].short} placed on ${cardOf(m,d.v).label}.`); st.sel = null; save(); return render();
    case "sortClear": st.sort = {}; st.sel = null; save(); return render();
    case "ans": { const stage = d.stage, qi = +d.q, oi = +d.o, qs = stage==="ex" ? EXQ(m, st) : m.transfer.qs, q = st[stage];
      if (q.ok[qi] || STEPS[st.step][0] !== (stage==="ex" ? "explain" : "transfer") || !qs[qi] || !qs[qi].opts[oi]) return; q.last[qi] = oi; const o = qs[qi].opts[oi];
      if (o[1]) { q.ok[qi] = true; beep("ok"); } else { q.wrong[qi] = (q.wrong[qi]||0)+1; beep("no"); }
      if (stage==="ex" && EXQ(m, st).every((_,i)=>q.ok[i])) st.done.practised = true;
      if (stage==="tr" && m.transfer.qs.every((_,i)=>q.ok[i])) { if (qsIndependent(m, st)) st.done.demonstrated = true; else st.done.assisted = true; }
      save(); render(); const fb = document.querySelector(".fb[role=status]"); if (fb) announce(fb.textContent.trim()); return; }
    case "hint": { const q = st[d.stage], qi = +d.q; q.hint[qi] = Math.min(3, (q.hint[qi]||0)+1); save(); render(); const hb = document.querySelector(".hint [data-read]"); if (hb) announce("Hint: "+hb.textContent); return; }
    case "spoken": { if (STEPS[st.step][0] !== "explain" || m.g > 2) return;  st.ex.spoken = st.ex.spoken||{}; st.ex.spoken[+d.q] = true; st.ex.ok[+d.q] = true; if (EXQ(m, st).every((_,i)=>st.ex.ok[i])) st.done.practised = true; save(); return render(); }
    case "nextq": { st[d.stage].cur = +d.q + 1; save(); render(); const h3 = document.querySelector("#main h3[data-read]"); const first = document.querySelector(".answer:not([disabled])"); if (first) first.focus(); if (h3) announce(h3.textContent); return; }
    case "cerpick": { if (STEPS[st.step][0]!=="explain") return; const q = st.ex, qi = +d.q; if (q.ok[qi]) return;
      q.cer = q.cer||{}; q.cer[qi] = Object.assign({}, q.cer[qi], {[d.k]: +d.o}); q.cerChk = q.cerChk||{}; q.cerChk[qi] = false; save(); return render(); }
    case "cercheck": { if (STEPS[st.step][0]!=="explain") return; const qs = EXQ(m, st), qi = +d.q, Qn = qs[qi], q = st.ex; if (!Qn || !Qn.cer || q.ok[qi]) return;
      const sel = (q.cer && q.cer[qi]) || {}; if (!Qn.slots.every(x=>sel[x.key]!==undefined)) return;
      const ok = Qn.slots.every(x=>Qn.slots && x.opts[sel[x.key]] && x.opts[sel[x.key]][1]);
      q.cerChk = q.cerChk||{}; q.cerChk[qi] = true;
      if (ok) { q.ok[qi] = true; beep("ok"); announce("Your explanation fits together."); } else { q.wrong[qi] = (q.wrong[qi]||0)+1; beep("no"); announce("Some parts do not fit yet. Look at the marked parts."); }
      if (qs.every((_,i)=>q.ok[i])) st.done.practised = true; save(); return render(); }
    case "pmatch": if (STEPS[st.step][0]!=="evidence") return; st.pmatch = d.v; save(); return render();
    case "chartpick": { if (STEPS[st.step][0]!=="evidence" || !chartTask(m)) return; st.chartSel = +d.o; st.chartOk = chartOpts(m, st)[+d.o][1]===1; if (st.chartOk) beep("ok"); save(); return render(); }
    case "replan": if (STEPS[st.step][0]!=="test") return; st.plan = null; save(); return render();
    case "plan": { if (STEPS[st.step][0]!=="test") return; st.plan = d.v; const nd = m.play.need||{}; if (nd.fair && d.v!==nd.fair) st.planWrong = (st.planWrong||0)+1; save(); return render(); }
    case "replayAsk": ui.confirm = "replay"; return render();
    case "replay": { store.missions[m.id] = freshMission(m, st.done, (st.att||0)+1); ui.confirm = null; save(); ui.focusHead = true; return render(); }
  }
}
function runTest(m, st){
  if (ui.busy || (m.play.kind!=="sort" && !planInfo(m, st).ok)) return;
  const snap = m.play.kind==="sort" ? Object.assign({}, st.sort) : Object.assign({}, st.set);
  const r = lookup(m, snap);
  if (!r) { ui.flash = {type:"bad", text:"This combination is not in the model yet, so no result is shown."}; return render(); }
  ui.busy = true; ui.anim = true; render();
  setTimeout(()=>{
    const last = st.trials[st.trials.length-1];
    st.trials.push({n:(last?last.n:0)+1, s:snap});
    if (st.trials.length > 20) st.trials.shift();
    st.done.explored = true; ui.busy = false; ui.anim = false; beep("test"); save(); render();
    announce(`Test ${(last?last.n:0)+1}: ${resText(m, r)}. ${obsText(m, r)}`);
    const tb = document.getElementById("b-test"); if (tb) tb.focus({preventScroll:true});
  }, store.prefs.reduce ? 80 : 900);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  if (b.disabled || b.getAttribute("aria-disabled")==="true" && b.dataset.act!=="sortCard") return;
  if (b.tagName==="INPUT") return act(b.dataset.act, b.dataset, b);
  e.preventDefault();
  if (b.dataset.act==="open" && ui.view==="grade" && b.classList.contains("mtok")) { if (ui.walking) return; ui.walking = true; return walkTo(b.dataset.id, ()=>{ ui.walking = false; act("open", b.dataset, b); }); }
  act(b.dataset.act, b.dataset, b);
});
document.addEventListener("change", e => { const b = e.target; if (b.matches('input[data-act="tcheck"]')) act("tcheck", b.dataset, b); });

/* ====================== BOOT ====================== */
function boot(data){
  load();
  if (data && data.ui && (data.ui.view==="mission" ? byId[data.ui.mid] : true)) { ui.view = data.ui.view||"home"; ui.mid = data.ui.mid||null; }
  if (data && data.store && data.store.game===GAME_ID && !ui.storageOK) store = data.store;
  render();
}
try { if (window.claude && window.claude.hot && typeof window.claude.hot.snapshot==="function") window.claude.hot.snapshot(()=>({store, ui:{view:ui.view, mid:ui.mid}})); } catch(e){}
(window.claude && window.claude.hot && window.claude.hot.ready) ? window.claude.hot.ready(boot) : boot((window.claude && window.claude.hot && window.claude.hot.data) || {});
