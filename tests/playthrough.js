/* Plays every mission start to finish with correct answers and checks the gates.
   Run: node tests/playthrough.js   (needs Playwright with Chromium). Exits 1 on any failure. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text()); });
  const path = require('path');
  await p.goto('file://' + path.join(__dirname, '..', 'index.html')); await p.waitForTimeout(300);
  const out = await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms)); store.prefs.reduce = true; store.prefs.sound = false;
    const L = []; let bad = 0, cerCount = 0, planCount = 0, chartCount = 0; const pos = [0,0,0,0];
    for (const m of MISSIONS) {
      act('open', {id:m.id}); const st = S(m.id);
      act('next', {}); act('pred', {v:m.predict.opts[0].id}); act('next', {});
      if (m.play.kind==='sort') { for (const id of m.play.items) { act('sortItem',{v:id}); act('sortCard',{v:m.play.answer[id]}); } act('test',{}); await sleep(110); }
      else {
        if (planInfo(m, st).need) { planCount++; const wrongKey = modelCtls(m).find(c=>c.key!==(m.play.need.fair||'')); act('test',{}); await sleep(100);
          if (st.trials.length) L.push('PLAN GATE LEAK '+m.id); act('plan',{v:m.play.need.fair||modelCtls(m)[0].key}); }
        let combos=[{}]; for (const k of m.play.keys){ const n=[]; combos.forEach(c=>ctl(m,k).options.forEach(o=>n.push({...c,[k]:o.v}))); combos=n; }
        if (m.id==='materials-g5-03') combos.reverse();
        for (const c of combos){ for (const k in c) act('ctl',{k,v:c[k]}); act('test',{}); await sleep(90); }
      }
      act('next',{}); // evidence
      if (canAdvance(m,st)[0]) L.push('EVIDENCE NOT GATED '+m.id);
      act('pmatch',{v:'partly'});
      if (chartTask(m)) { chartCount++; const o = chartOpts(m,st); act('chartpick',{o:o.findIndex(x=>x[1]===0)}); act('chartpick',{o:o.findIndex(x=>x[1]===1)}); }
      act('next',{}); // explain
      const qs = EXQ(m, st);
      qs.forEach((q,qi)=>{ if (q.cer) { cerCount++; q.slots.forEach(sl=>act('cerpick',{q:qi,k:sl.key,o:sl.opts.findIndex(o=>o[1])})); act('cercheck',{q:qi}); }
        else { const ord = order(q.opts.length, shufKey(m,st,'ex',qi)); pos[ord.indexOf(q.opts.findIndex(o=>o[1]))]++; act('ans',{stage:'ex',q:qi,o:q.opts.findIndex(o=>o[1])}); }
        if (qi<qs.length-1) act('nextq',{stage:'ex',q:qi}); });
      act('next',{});
      m.transfer.qs.forEach((q,qi)=>{ const ord = order(q.opts.length, shufKey(m,st,'tr',qi)); pos[ord.indexOf(q.opts.findIndex(o=>o[1]))]++;
        act('ans',{stage:'tr',q:qi,o:q.opts.findIndex(o=>o[1])}); if (qi<m.transfer.qs.length-1) act('nextq',{stage:'tr',q:qi}); });
      act('next',{});
      const ok = STEPS[st.step][0]==='summary' && st.done.demonstrated && st.done.practised;
      if (!ok) { bad++; L.push(`FAIL ${m.id} step=${STEPS[st.step][0]} need=${needCheck(m,st).msgs.join(' ')} why=${canAdvance(m,st)[1]}`); }
    }
    // length tell after rebalancing (original questions only)
    let n=0, longest=0; MISSIONS.forEach(m=>[...m.explain,...m.transfer.qs.filter(q=>!q.idea)].forEach(q=>{ n++; const i=q.opts.findIndex(o=>o[1]); const Ls=q.opts.map(o=>o[0].length); if (Ls[i] > Math.max(...Ls.filter((_,j)=>j!==i))+8) longest++; }));
    L.push(`failures=${bad} cer=${cerCount} plans=${planCount} charts=${chartCount} correctPositionABCD=${pos.join('/')} correctClearlyLongest=${longest}/${n}`);
    return L.join('\n');
  });
  console.log(out);
  console.log('ERRORS:', errs.length ? errs.slice(0,8).join('\n') : 'none'); await b.close();
  if (errs.length || /FAIL|LEAK|NOT GATED/.test(out)) process.exit(1);
})();
