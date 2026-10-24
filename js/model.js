"use strict";
/* Material Mission: science model lookups and fairness/requirement validators. */
/* ====================== MODEL & VALIDATORS ====================== */
const byId = Object.fromEntries(MISSIONS.map(m=>[m.id,m]));
const ctl = (m,k) => m.play.controls.find(c=>c.key===k);
const optLabel = (m,k,v) => { const c = ctl(m,k); const o = c && c.options.find(o=>o.v===v); return o ? o.label : String(v); };
function lookup(m, s){
  const p = m.play;
  if (p.kind==="sort") return sortResult(m, s);
  if (p.fn) return p.fn(s);
  const key = p.keys.map(k=>s[k]).join("|");
  return p.table[key] || null;
}
function sortResult(m, placements){
  const items = m.play.items; let ok = 0; const wrong = [];
  items.forEach(id => { if (placements[id]===m.play.answer[id]) ok++; else wrong.push(id); });
  return {ok, total:items.length, wrong};
}
function changedKeys(m, a, b){ return m.play.keys.filter(k => a[k]!==b[k]); }
function changedNonModel(m, a, b){ return m.play.controls.filter(c=>c.model===false && a[c.key]!==b[c.key]).map(c=>c.key); }
function passes(m, s){ const reqs = m.play.reqs; if (!reqs || !reqs.length) return true; const r = lookup(m,s); return !!r && reqs.every(q=>q.f(r,s)); }
function findPair(m, T, pred, passLater){
  for (let j=T.length-1;j>0;j--) for (let i=j-1;i>=0;i--) {
    const ch = changedKeys(m, T[i].s, T[j].s);
    if (pred(ch) && (!passLater || passes(m, T[j].s))) return [T[i], T[j]];
  }
  return null;
}
function needCheck(m, st){
  const p = m.play, T = st.trials, nd = p.need || {}, out = {met:true, msgs:[], pair:null};
  if (p.kind==="sort") { const last = T[T.length-1]; const ok = last && sortResult(m,last.s).ok===p.items.length;
    if (!ok) { out.met=false; out.msgs.push("Put every thing on a card, then press Check my sorting."); } return out; }
  if (nd.testAll) { const c = ctl(m, nd.testAll); const miss = c.options.filter(o=>!T.some(t=>t.s[nd.testAll]===o.v));
    if (miss.length) { out.met=false; out.msgs.push(`Test ${miss.map(o=>o.label).join(" and ")} too.`); } }
  if (nd.min && T.length < nd.min) { out.met=false; out.msgs.push(`Run at least ${nd.min} tests so you can compare.`); }
  if (nd.fair) { const pr = findPair(m, T, ch=>ch.length===1 && ch[0]===nd.fair, nd.passLater);
    if (!pr) { out.met=false; out.msgs.push(`Make a fair comparison: change only the ${ctl(m,nd.fair).label.toLowerCase()} between two tests${nd.passLater?", and reach the target":""}.`); } else out.pair = pr; }
  if (nd.one) { const pr = findPair(m, T, ch=>ch.length===1, true);
    if (!pr) { out.met=false; out.msgs.push("Change one feature from a design you tested, then test again. The new design must meet every requirement."); } else out.pair = pr; }
  if (nd.pass && !T.some(t=>passes(m,t.s))) { out.met=false; out.msgs.push("Find a design that meets every requirement."); }
  return out;
}
function evidenceTrials(m, st){
  const T = st.trials, nc = needCheck(m, st);
  if (nc.pair) return nc.pair;
  const nd = m.play.need || {};
  if (m.play.kind==="sort") return T.slice(-1);
  if (nd.testAll) { const k = nd.testAll; return ctl(m,k).options.map(o=>{ for (let i=T.length-1;i>=0;i--) if (T[i].s[k]===o.v) return T[i]; return null; }).filter(Boolean); }
  if (nd.pass) { const pi = T.map(t=>passes(m,t.s)).lastIndexOf(true); if (pi<0) return T.slice(-2);
    const other = T.slice().reverse().find(t=>!passes(m,t.s)); return other ? [other, T[pi]] : [T[pi]]; }
  return T.slice(-2);
}

/* ---- seeded shuffle: same order on retry, new order on replay ---- */
function rng(key){ let h = 1779033703 ^ key.length; for (let i=0;i<key.length;i++){ h = Math.imul(h ^ key.charCodeAt(i), 3432918353); h = h<<13 | h>>>19; }
  return () => { h = Math.imul(h ^ h>>>16, 2246822507); h = Math.imul(h ^ h>>>13, 3266489909); h ^= h>>>16; return (h>>>0)/4294967296; }; }
function order(n, key){ const r = rng(key), a = [...Array(n).keys()]; for (let i=n-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
function shufKey(m, st, stage, qi, slot){ return `${store.seed}|${m.id}|${stage}|${qi}|${slot||""}|${st.att||0}`; }
function modelCtls(m){ return m.play.controls.filter(c=>c.model!==false); }
function designName(m, t){ return modelCtls(m).map(c=>optLabel(m,c.key,t.s[c.key])).join(", "); }

/* Grade 4–6 explanation builder: claim, evidence and reason from the child's own tests */
function cerFor(m, st){
  if (m.g < 4 || m.play.kind==="sort") return null;
  const nd = m.play.need || {}, T = st.trials, rt = t => resText(m, lookup(m, t.s));
  let claim, evid, reason;
  const nc = needCheck(m, st);
  if ((nd.fair || nd.one) && nc.pair) {
    const [a,b] = nc.pair, K = changedKeys(m, a.s, b.s)[0], kl = ctl(m,K).label.toLowerCase();
    const other = m.play.keys.find(k=>k!==K), ol = other ? ctl(m,other).label.toLowerCase() : "colour";
    claim = [[nd.one ? `Changing the ${kl} made the design meet the brief` : `Changing the ${kl} changed the result`,1,"Yes. That is what your fair test shows."],
             [`The ${ol} caused the difference`,0,`The ${ol} stayed the same in your fair pair, so it cannot explain the difference.`],
             ["Nothing we changed made any difference",0,"Your two results were different, so something made a difference."]];
    evid = [[`Test ${a.n} (${optLabel(m,K,a.s[K])}): ${rt(a)}. Test ${b.n} (${optLabel(m,K,b.s[K])}): ${rt(b)}.`,1,"Yes. You used your own recorded results."],
            ["It looked better after we changed it",0,"How it looks is not evidence. Use your recorded results."],
            ["My prediction said this would happen",0,"A prediction is a guess made before testing. Evidence comes from the test."]];
    reason = [["Only one thing changed, so it caused the difference",1,"Yes. That is why the test is fair."],
              ["The result was the one I was hoping for",0,"Hoping is not a reason. Fairness is."],
              ["We changed several things at the same time",0,"In your fair pair only one thing changed."]];
  } else if (m.play.reqs && m.play.reqs.length) {
    const P = [...T].reverse().find(t=>passes(m,t.s)), F = [...T].reverse().find(t=>!passes(m,t.s));
    if (!P || !F) return null;
    claim = [[`${designName(m,P)} meets the brief`,1,"Yes. Your tests back this claim."],
             [`${designName(m,F)} meets the brief`,0,`Look at test ${F.n}: it missed at least one requirement.`],
             ["None of the designs meets the brief",0,`Look at test ${P.n}: it met every requirement.`]];
    evid = [[`Test ${P.n}: ${rt(P)}`,1,"Yes. That result meets every requirement."],
            [`Test ${F.n}: ${rt(F)}`,0,"That result missed a requirement, so it cannot support the claim."],
            ["It looked the strongest of all of them",0,"How it looks is not evidence. Use your recorded results."]];
    reason = [["It met every requirement under the same test conditions",1,"Yes. A design has to meet the whole brief."],
              ["It did best on one measure, which is enough",0,"The brief counts every requirement, not just one."],
              ["It was the design I predicted would win",0,"Your prediction is not evidence. The test result is."]];
  } else return null;
  return {q:"Build your explanation", cer:true,
    slots:[{key:"claim",label:"Claim",help:"What did you find out?",opts:claim},{key:"evidence",label:"Evidence",help:"Which results show it?",opts:evid},{key:"reason",label:"Reason",help:"Why can you trust it?",opts:reason}],
    hints:["Choose each part to match your own tests.","Claim: what you found. Evidence: your results. Reason: why the test is fair or complete.",
      `Worked example: ${claim[0][0]}. ${evid[0][0]} ${reason[0][0]}.`]};
}
function EXQ(m, st){ const c = cerFor(m, st); return c ? [...m.explain, c] : m.explain; }
