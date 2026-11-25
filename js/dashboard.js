/* Dashboard "Kontrolpanel" on learn.html (DESIGN.md, approved 23 Nov 2026),
 * with the lesson list as topic tiles in levels ("Dashboard: emner i niveauer", 24 Nov 2026). */
(function () {
  const AD = window.AD;
  const P = AD.progress;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const LOCK = svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
  const FLAG = svg('<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>');
  const BACK = svg('<path d="M15 6l-6 6 6 6"/>');
  const DOT = { done: 'done', next: 'now', open: '', locked: 'pro', soon: 'soon' };

  let pendingLesson = null;
  let filter = 'all';
  let openTopic = null; // index in AD.topics, or null for the tile grid
  let animated = false; // bars and counter animate on first render only

  // XP a lesson gives the first time (same rule as engine.js: 10 per step unless set).
  const lessonXP = (l) => (l.steps || []).reduce((sum, s) => sum + (s.xp === undefined ? 10 : s.xp), 0);
  const shortName = (l) => (AD.trackOf(l) === 'basics' ? `Basics B${l.n}` : `Lesson ${l.n}`);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const label = (track, n) => (track === 'basics' ? `B${n}` : String(n));
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

  function pickNext() {
    const code = AD.lessonsIn('code');
    const basics = AD.lessonsIn('basics');
    return code.find((l) => !P.isDone(l.id)) || basics.find((l) => !P.isDone(l.id)) || null;
  }

  // One item per planned lesson number: the built lesson if there is one, otherwise "Coming soon".
  function itemsFor(track, next) {
    const built = {};
    AD.lessonsIn(track).forEach((l) => { if (!built[l.n]) built[l.n] = l; });
    const finals = (AD.finals && AD.finals[track]) || [];
    return (AD.plan[track] || []).map((title, k) => {
      const n = k + 1;
      const l = built[n];
      const final = finals.includes(n);
      if (!l) return { lesson: null, n, track, title, state: 'soon', kind: 'soon', final };
      let state = 'open';
      if (P.isDone(l.id)) state = 'done';
      else if (!P.isUnlocked(l)) state = 'locked';
      else if (l === next) state = 'next';
      return { lesson: l, n, track, title: l.title, state, kind: l.pro ? 'pro' : 'free', final };
    });
  }

  function render() {
    const next = pickNext();
    const items = { basics: itemsFor('basics', next), code: itemsFor('code', next) };
    const all = items.basics.concat(items.code);
    const done = all.filter((i) => i.state === 'done').length;
    const xp = P.get().xp;
    const streak = P.currentStreak();
    const levelOf = (l) => l && AD.levels.find((v) => v.track === AD.trackOf(l) && l.n >= v.from && l.n <= v.to);
    const curLevel = levelOf(next);
    const inLevel = (v) => items[v.track].filter((i) => i.n >= v.from && i.n <= v.to);

    // Top bar
    $('streak').textContent = streak;
    $('xp').textContent = xp;

    // 1. Total lessons completed: one bar per level
    $('doneCount').textContent = done;
    $('totalCount').textContent = all.length;
    $('totalSub').textContent = `${all.length} lessons in ${AD.topics.length} topics`;
    $('bars').innerHTML = AD.levels
      .map((v) => {
        const its = inLevel(v);
        const d = its.filter((i) => i.state === 'done').length;
        const w = pct(d, its.length);
        return `<div class="kbar${v === curLevel ? ' cur' : ''}"><strong>${esc(v.bar)}</strong><span>${d}/${its.length}</span>
          <div class="kmeter" role="img" aria-label="${esc(v.bar)}: ${d} of ${its.length} lessons"><b data-w="${w}" style="width:${!reduceMotion && !animated ? 0 : w}%"></b></div></div>`;
      })
      .join('');
    if (!reduceMotion && !animated) {
      requestAnimationFrame(() => requestAnimationFrame(() =>
        document.querySelectorAll('.kbar .kmeter b').forEach((b) => (b.style.width = b.dataset.w + '%'))
      ));
    }

    // 2. Next lesson
    const btn = $('continueBtn');
    if (next) {
      const locked = !P.isUnlocked(next);
      $('nextTitle').textContent = next.title;
      $('nextMeta').textContent = `${shortName(next)} · 5 min`;
      btn.innerHTML = `Continue ${esc(AD.trackOf(next) === 'basics' ? `basics B${next.n}` : `lesson ${next.n}`)} ${locked ? `<span class="klock">${LOCK}</span>` : ''}<span aria-hidden="true">→</span>`;
      btn.href = locked ? '#' : `lesson.html?id=${next.id}`;
      btn.onclick = locked ? (e) => { e.preventDefault(); openPaywall(next); } : null;
    } else {
      const first = AD.lessonsIn('code')[0];
      $('nextTitle').textContent = 'You have done every lesson.';
      $('nextMeta').textContent = 'New lessons are on the way.';
      btn.textContent = 'Replay a lesson';
      btn.href = first ? `lesson.html?id=${first.id}` : '#';
      btn.onclick = null;
    }

    // Your points
    const log = P.todayLog();
    const today = log.reduce((s, e) => s + e.xp, 0);
    $('pointsList').innerHTML =
      log
        .slice()
        .reverse()
        .map((e) => {
          const l = AD.lessonById(e.id);
          const name = l ? `${shortName(l)} · ${l.title}` : 'Lesson';
          return `<li><span>${esc(name)}</span><b>+${e.xp}</b></li>`;
        })
        .join('') + `<li class="mine"><span>Points today</span><b id="pointsToday">${today}</b></li>`;
    const nextXP = next ? lessonXP(next) : 0;
    $('pointsHint').textContent = log.length
      ? `${xp} XP in total.${next ? ` The next lesson gives +${nextXP}.` : ''}`
      : next ? `No points yet today. One lesson gives +${nextXP}.` : `No points yet today. ${xp} XP in total.`;
    if (!reduceMotion && !animated && today) countUp($('pointsToday'), today);

    // Your streak
    const days = P.recentDays(14);
    const grid = $('streakGrid');
    grid.setAttribute('aria-label', `Practiced on ${days.filter((d) => d.practiced).length} of the last 14 days`);
    grid.innerHTML = days.map((d) => `<i class="${d.practiced ? 'on' : ''}${d.today ? ' today' : ''}" title="${d.day}"></i>`).join('');
    $('streakToday').textContent = plural(streak, 'day');
    $('streakHint').textContent = P.practicedToday()
      ? `Do one lesson tomorrow to make it ${streak + 1}.`
      : streak ? 'Do one lesson today to keep your streak.' : 'Do one lesson today to start a streak.';

    // 3. Projects: Basics B1-B10 and Claude Code 1-25
    const count = (list, from, to) => {
      const its = list.filter((i) => i.n >= from && i.n <= to);
      return { done: its.filter((i) => i.state === 'done').length, total: its.length };
    };
    const projects = [
      { name: "Plan mum's 60th birthday", ...count(items.basics, 1, 10) },
      { name: 'Ship the to-do app', ...count(items.code, 1, 25) },
    ];
    $('projects').innerHTML = projects
      .map(
        (p) => `<div class="kproj-row"><strong>${esc(p.name)}</strong><span>${p.done}/${p.total}</span>
          <div class="kmeter" role="img" aria-label="${p.done} of ${p.total} lessons"><b style="width:${pct(p.done, p.total)}%"></b></div></div>`
      )
      .join('');

    // Sign up is hidden once Pro is unlocked (no Pro box: DESIGN.md punkt 8, 25 Nov 2026)
    $('navProBtn').hidden = P.get().unlockAll;

    // 4. Lessons: filters, then the tile grid or one open topic
    const counts = {
      all: all.length,
      soon: all.filter((i) => i.kind === 'soon').length,
    };
    const labels = { all: 'All', soon: 'Coming' };
    $('tabs').innerHTML = Object.keys(labels)
      .map((k) => `<button type="button" class="ktab" data-f="${k}" aria-pressed="${k === filter}">${labels[k]} ${counts[k]}</button>`)
      .join('');
    document.querySelectorAll('.ktab').forEach((b) =>
      b.addEventListener('click', () => { filter = b.dataset.f; render(); })
    );

    const topics = AD.topics.map((t) => {
      const v = AD.levels.find((x) => x.key === t.level);
      return { ...t, lv: v, items: items[v.track].filter((i) => i.n >= t.from && i.n <= t.to) };
    });
    const area = $('lessonArea');
    area.innerHTML = openTopic === null ? gridHtml(topics, next, curLevel, inLevel) : topicHtml(topics, openTopic);

    area.querySelectorAll('.ktile[data-t]').forEach((b) =>
      b.addEventListener('click', () => showTopic(Number(b.dataset.t)))
    );
    const back = $('topicBack');
    if (back) back.addEventListener('click', () => { openTopic = null; render(); scrollToLessons(); });
    const nextT = $('topicNext');
    if (nextT) nextT.addEventListener('click', () => showTopic(openTopic + 1));
    area.querySelectorAll('.krow[data-id]').forEach((r) =>
      r.addEventListener('click', () => {
        const l = AD.lessonById(r.dataset.id);
        if (P.isUnlocked(l)) location.href = `lesson.html?id=${l.id}`;
        else openPaywall(l);
      })
    );
    animated = true;
  }

  function showTopic(i) {
    openTopic = i;
    render();
    scrollToLessons();
  }

  function scrollToLessons() {
    $('lessons').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  // Tile grid: per level one level cell and its three topic tiles.
  function gridHtml(topics, next, curLevel, inLevel) {
    let h = '<div class="ktiles">';
    AD.levels.forEach((v) => {
      const its = inLevel(v);
      const d = its.filter((i) => i.state === 'done').length;
      const range = v.track === 'basics' ? `B${v.from}–B${v.to}` : `Lessons ${v.from}–${v.to}`;
      h += `<div class="ktile klvcell${v === curLevel ? ' here' : ''}">
        <span class="kk">${esc(v.kicker)}</span><h3>${esc(v.name)}</h3><span class="ksub2">${esc(v.sub)}</span>
        <span class="kcnt"><span>${range}</span><span>${d}/${its.length}</span></span>
        <span class="kmeter"><b style="width:${pct(d, its.length)}%"></b></span></div>`;
      topics.forEach((t, idx) => {
        if (t.lv !== v) return;
        h += tileHtml(t, idx, next, topics.filter((x) => x.lv === v).pop() === t);
      });
    });
    return h + '</div>';
  }

  function tileHtml(t, idx, next, last) {
    const its = t.items;
    const d = its.filter((i) => i.state === 'done').length;
    const anyLocked = its.some((i) => i.state === 'locked');
    const isCur = !!next && its.some((i) => i.lesson === next);
    const match = filter === 'all' || its.some((i) => i.kind === filter);
    const tag = its.every((i) => i.kind === 'soon') ? '<span class="ktag">SOON</span>' : '';
    const flagText = t.lv.track === 'basics' ? 'Ends with the bridge to Claude Code' : 'Ends with the final project';
    const range = `${label(t.lv.track, t.from)}–${label(t.lv.track, t.to)}`;
    return `<button type="button" class="ktile${isCur ? ' cur' : ''}${match ? '' : ' dim'}" data-t="${idx}">
      ${isCur ? '<span class="kstamp">UP NEXT</span>' : ''}
      <span class="ktile-top"><span class="krng">${range}${anyLocked ? `<span class="klk">${LOCK}<span class="sr-only"> includes locked lessons</span></span>` : ''}${last ? `<span class="kfl" title="${flagText}"><span class="sr-only">${flagText}</span>${FLAG}</span>` : ''}</span>${isCur ? '' : tag}</span>
      <h3>${esc(t.title)}</h3><span class="ksub2">${esc(t.sub)}</span>
      <span class="kdots" role="img" aria-label="${d} of ${its.length} done">${its.map((i) => `<i class="${DOT[i.state]}${i.final ? ' final' : ''}"></i>`).join('')}</span>
    </button>`;
  }

  // One open topic: back button, header, its lessons and a button to the next topic.
  function topicHtml(topics, idx) {
    const t = topics[idx];
    const its = t.items;
    const d = its.filter((i) => i.state === 'done').length;
    const shown = its.filter((i) => filter === 'all' || i.kind === filter);
    const nt = topics[idx + 1];
    const range = `${label(t.lv.track, t.from)}–${label(t.lv.track, t.to)}`;
    const where = t.lv.track === 'basics' ? 'Claude Basics' : `Claude Code · ${t.lv.name}`;
    return `<div class="ktopic">
      <button type="button" class="kback" id="topicBack">${BACK}All topics</button>
      <div class="ktopic-h"><div class="krng2">${esc(where)} · Lessons ${range}</div>
        <h3>${esc(t.title)}</h3><p>${esc(t.sub)} · ${d} of ${its.length} done</p>
        <div class="kmeter" role="img" aria-label="${d} of ${its.length} done"><b style="width:${pct(d, its.length)}%"></b></div></div>
      <div class="klist">${shown.length ? shown.map(rowHtml).join('') : '<div class="kempty">Nothing here for this filter.</div>'}</div>
      ${nt ? `<button type="button" class="knext-topic" id="topicNext"><span><span class="kntl">Next topic</span><b>${esc(nt.title)}</b></span><span aria-hidden="true">→</span></button>` : ''}
    </div>`;
  }

  function rowHtml(i) {
    const meta = {
      done: `Done · +${i.lesson ? lessonXP(i.lesson) : 0} XP`,
      next: 'Up next · 5 min',
      open: '5 min',
      locked: '5 min',
      soon: 'Coming soon',
    }[i.state];
    const tag =
      i.final ? '<span class="ktag f">PROJECT</span>'
        : i.state === 'done' ? ''
        : i.kind === 'soon' ? '<span class="ktag">SOON</span>'
        : '';
    const num = i.final ? FLAG : i.state === 'locked' ? LOCK : esc(label(i.track, i.n));
    const inner = `<span class="knum">${num}</span>
      <span><span class="t">${esc(i.title)}</span><span class="m">${meta}</span></span>${tag}${i.state === 'locked' ? '<span class="sr-only">, locked</span>' : ''}`;
    const cls = `krow ${i.state}${i.final ? ' final' : ''}`;
    if (!i.lesson) return `<div class="${cls}">${inner}</div>`;
    return `<button type="button" class="${cls}" data-id="${i.lesson.id}">${inner}</button>`;
  }

  function countUp(el, end) {
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 700);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // The old paywall modal is replaced by the full-screen wall (js/wall.js, DESIGN.md punkt 7).
  function openPaywall(lesson) {
    pendingLesson = lesson || null;
    AD.wall.open(pendingLesson);
  }

  $('navProBtn').addEventListener('click', () => openPaywall(null));
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Reset all progress, XP and streak in this browser?')) {
      P.reset();
      render();
    }
  });

  render();

  const pw = new URLSearchParams(location.search).get('paywall');
  if (pw) {
    const l = AD.lessonById(pw);
    if (l && !P.isUnlocked(l)) openPaywall(l);
  }
})();
