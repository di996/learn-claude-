/* Dashboard "Kontrolpanel" on learn.html (DESIGN.md, approved 23 Nov 2026). */
(function () {
  const AD = window.AD;
  const P = AD.progress;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const TRACKS = [
    { key: 'basics', name: 'Claude Basics', list: 'listBasics' },
    { key: 'code', name: 'Claude Code', list: 'listCode' },
  ];

  let pendingLesson = null;
  let filter = 'all';
  let animated = false; // the stripe and counter animate on first render only

  // XP a lesson gives the first time (same rule as engine.js: 10 per step unless set).
  const lessonXP = (l) => (l.steps || []).reduce((sum, s) => sum + (s.xp === undefined ? 10 : s.xp), 0);
  const shortName = (l) => (AD.trackOf(l) === 'basics' ? `Basics B${l.n}` : `Lesson ${l.n}`);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  function pickNext() {
    const code = AD.lessonsIn('code');
    const basics = AD.lessonsIn('basics');
    return code.find((l) => !P.isDone(l.id)) || basics.find((l) => !P.isDone(l.id)) || null;
  }

  // Every lesson in a track, built ones first, then the planned ones ("Coming soon").
  function itemsFor(track, next) {
    const real = AD.lessonsIn(track).map((l) => {
      let state = 'open';
      if (P.isDone(l.id)) state = 'done';
      else if (!P.isUnlocked(l)) state = 'locked';
      else if (l === next) state = 'next';
      return { lesson: l, n: l.n, title: l.title, state, kind: l.pro ? 'pro' : 'free', track };
    });
    const soon = (AD.upcoming || [])
      .filter((u) => u.track === track)
      .map((u) => ({ lesson: null, n: u.n, title: u.title, state: 'soon', kind: 'soon', track }));
    return real.concat(soon).sort((a, b) => a.n - b.n);
  }

  function render() {
    const next = pickNext();
    const items = { basics: itemsFor('basics', next), code: itemsFor('code', next) };
    const all = items.basics.concat(items.code);
    const done = all.filter((i) => i.state === 'done').length;
    const xp = P.get().xp;
    const streak = P.currentStreak();

    // Top bar
    $('streak').textContent = streak;
    $('xp').textContent = xp;

    // 3. Total lessons completed
    $('doneCount').textContent = done;
    $('totalCount').textContent = all.length;
    const stripe = $('stripe');
    stripe.setAttribute('aria-label', `${done} of ${all.length} lessons completed`);
    stripe.innerHTML = all
      .map((i) => `<i class="${{ done: 'done', next: 'now', open: '', locked: 'pro', soon: 'soon' }[i.state]}"></i>`)
      .join('');
    if (!reduceMotion && !animated && stripe.animate) {
      [...stripe.children].forEach((el, n) =>
        el.animate([{ transform: 'scaleY(.2)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], {
          duration: 300, delay: n * 35, easing: 'cubic-bezier(.2,0,0,1)', fill: 'backwards',
        })
      );
    }

    // 4a. Next lesson
    const btn = $('continueBtn');
    if (next) {
      const locked = !P.isUnlocked(next);
      $('nextTitle').textContent = next.title;
      $('nextMeta').textContent = `${shortName(next)} · ${next.pro ? 'Pro' : 'Free'} · 5 min`;
      btn.innerHTML = `Continue ${esc(AD.trackOf(next) === 'basics' ? `basics B${next.n}` : `lesson ${next.n}`)} <span aria-hidden="true">→</span>`;
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

    // 4b. Your points
    const log = P.todayLog();
    const today = log.reduce((s, e) => s + e.xp, 0);
    $('pointsList').innerHTML =
      log
        .slice()
        .reverse()
        .map((e) => {
          const l = AD.lessonById(e.id);
          const label = l ? `${shortName(l)} · ${l.title}` : 'Lesson';
          return `<li><span>${esc(label)}</span><b>+${e.xp}</b></li>`;
        })
        .join('') + `<li class="mine"><span>Points today</span><b id="pointsToday">${today}</b></li>`;
    const nextXP = next ? lessonXP(next) : 0;
    $('pointsHint').textContent = log.length
      ? `${xp} XP in total.${next ? ` The next lesson gives +${nextXP}.` : ''}`
      : next ? `No points yet today. One lesson gives +${nextXP}.` : `No points yet today. ${xp} XP in total.`;
    if (!reduceMotion && !animated && today) countUp($('pointsToday'), today);

    // 4c. Your streak
    const days = P.recentDays(14);
    const grid = $('streakGrid');
    grid.setAttribute('aria-label', `Practiced on ${days.filter((d) => d.practiced).length} of the last 14 days`);
    grid.innerHTML = days.map((d) => `<i class="${d.practiced ? 'on' : ''}${d.today ? ' today' : ''}" title="${d.day}"></i>`).join('');
    $('streakToday').textContent = plural(streak, 'day');
    $('streakHint').textContent = P.practicedToday()
      ? `Do one lesson tomorrow to make it ${streak + 1}.`
      : streak ? 'Do one lesson today to keep your streak.' : 'Do one lesson today to start a streak.';

    // 5. Projects (only the two real ones)
    const basicsDone = items.basics.filter((i) => i.state === 'done').length;
    const todo = items.code.filter((i) => i.n >= 1 && i.n <= 7);
    const todoDone = todo.filter((i) => i.state === 'done').length;
    const projects = [
      { name: "Plan mum's 60th birthday", done: basicsDone, total: items.basics.length },
      { name: 'Ship the to-do app', done: todoDone, total: todo.length },
    ];
    $('projects').innerHTML = projects
      .map(
        (p) => `<div class="kproj-row"><strong>${esc(p.name)}</strong><span>${p.done}/${p.total}</span>
          <div class="kmeter" role="img" aria-label="${p.done} of ${p.total} lessons"><b style="width:${p.total ? Math.round((100 * p.done) / p.total) : 0}%"></b></div></div>`
      )
      .join('');

    // 5. Pro box
    const lockedCount = all.filter((i) => i.state === 'locked').length;
    const hasPro = P.get().unlockAll;
    $('proBox').hidden = hasPro;
    $('kpTwo').classList.toggle('no-pro', hasPro);
    $('navProBtn').hidden = hasPro;
    $('proLabel').textContent = `Pro · ${plural(lockedCount, 'lesson')} locked`;

    // 6. Lesson list
    const counts = {
      all: all.length,
      free: all.filter((i) => i.kind === 'free').length,
      pro: all.filter((i) => i.kind === 'pro').length,
      soon: all.filter((i) => i.kind === 'soon').length,
    };
    const labels = { all: 'All', free: 'Free', pro: 'Pro', soon: 'Coming' };
    $('tabs').innerHTML = Object.keys(labels)
      .map((k) => `<button type="button" class="ktab" data-f="${k}" aria-pressed="${k === filter}">${labels[k]} ${counts[k]}</button>`)
      .join('');
    document.querySelectorAll('.ktab').forEach((b) =>
      b.addEventListener('click', () => { filter = b.dataset.f; render(); })
    );

    TRACKS.forEach((t) => {
      const list = items[t.key];
      const tDone = list.filter((i) => i.state === 'done').length;
      const allFree = list.every((i) => i.kind !== 'pro');
      const shown = list.filter((i) => filter === 'all' || i.kind === filter);
      $(t.list).innerHTML =
        `<div class="kgroup"><span>${t.name}</span><span>${tDone}/${list.length}${allFree ? ' · free' : ''}</span></div>` +
        (shown.length ? shown.map(rowHtml).join('') : '<div class="kempty">Nothing here for this filter.</div>');
    });

    document.querySelectorAll('.krow[data-id]').forEach((r) =>
      r.addEventListener('click', () => {
        const l = AD.lessonById(r.dataset.id);
        if (P.isUnlocked(l)) location.href = `lesson.html?id=${l.id}`;
        else openPaywall(l);
      })
    );
    animated = true;
  }

  function rowHtml(i) {
    const label = i.track === 'basics' ? `B${i.n}` : String(i.n);
    const meta = {
      done: `Done · +${i.lesson ? lessonXP(i.lesson) : 0} XP`,
      next: 'Up next · 5 min',
      open: '5 min',
      locked: 'Pro · 5 min',
      soon: 'Coming soon',
    }[i.state];
    const tag =
      i.state === 'done' ? ''
        : i.kind === 'pro' ? '<span class="ktag p">PRO</span>'
        : i.kind === 'soon' ? '<span class="ktag">SOON</span>'
        : '<span class="ktag">FREE</span>';
    const inner = `<span class="knum">${i.state === 'locked' ? LOCK : esc(label)}</span>
      <span><span class="t">${esc(i.title)}</span><span class="m">${meta}</span></span>${tag}`;
    if (!i.lesson) return `<div class="krow soon">${inner}</div>`;
    const aria = i.state === 'locked' ? ` aria-label="${esc(i.title)} (Pro, locked)"` : '';
    return `<button type="button" class="krow ${i.state}" data-id="${i.lesson.id}"${aria}>${inner}</button>`;
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

  function openPaywall(lesson) {
    pendingLesson = lesson || null;
    $('paywall').hidden = false;
    $('unlockBtn').focus();
  }

  $('pwClose').addEventListener('click', () => ($('paywall').hidden = true));
  $('proBtn').addEventListener('click', () => openPaywall(null));
  $('navProBtn').addEventListener('click', () => openPaywall(null));
  $('unlockBtn').addEventListener('click', () => {
    P.setUnlockAll(true);
    $('paywall').hidden = true;
    if (pendingLesson) location.href = `lesson.html?id=${pendingLesson.id}`;
    else render();
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Reset all progress, XP and streak in this browser?')) {
      P.reset();
      render();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $('paywall').hidden = true;
  });

  render();

  const pw = new URLSearchParams(location.search).get('paywall');
  if (pw) {
    const l = AD.lessonById(pw);
    if (l && !P.isUnlocked(l)) openPaywall(l);
  }
})();
