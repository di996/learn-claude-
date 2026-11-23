/* Renders the lesson path on learn.html */
(function () {
  const AD = window.AD;
  const P = AD.progress;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let pendingLesson = null;

  function starsHtml(n) {
    return [1, 2, 3].map((i) => `<span class="${i <= n ? '' : 'off'}">⭐</span>`).join('');
  }

  function render() {
    const lessons = AD.lessons;
    const next = lessons.find((l) => !P.isDone(l.id)) || lessons[0];
    const units = [
      { name: 'Unit 1', title: 'Claude Code basics', items: lessons.filter((l) => !l.pro), pro: false },
      { name: 'Unit 2 · Pro', title: 'Work like a power user', items: lessons.filter((l) => l.pro), pro: true },
    ];

    $('units').innerHTML = units
      .map(
        (u) => `
        <div class="unit-head${u.pro ? ' pro' : ''}"><p class="eyebrow">${esc(u.name)}</p><h2>${esc(u.title)}</h2></div>
        <div class="path">
          ${u.items
            .map((l, idx) => {
              const x = idx % 4 === 1 ? 1 : idx % 4 === 3 ? -1 : 0;
              const done = P.isDone(l.id);
              const locked = !P.isUnlocked(l);
              const isNext = l === next && !locked;
              const cls = ['node', done ? 'done' : '', locked ? 'locked' : '', isNext ? 'next' : ''].join(' ');
              return `
                ${isNext ? `<div class="start-bubble" style="--x:${x}">` + (done ? 'Replay' : P.get().xp ? 'Next' : 'Start') + '</div>' : ''}
                <button type="button" class="${cls}" style="--x:${x}" data-id="${l.id}" aria-label="${esc(l.title)}${locked ? ' (locked)' : ''}">
                  <span class="disc">${locked ? '🔒' : done ? '★' : esc(l.icon)}</span>
                  <span class="nlabel">${esc(l.title)}</span>
                  <span class="nstars">${done ? starsHtml(P.stars(l.id)) : ''}</span>
                </button>`;
            })
            .join('')}
        </div>`
      )
      .join('');

    document.querySelectorAll('.node').forEach((n) =>
      n.addEventListener('click', () => {
        const l = AD.lessonById(n.dataset.id);
        if (P.isUnlocked(l)) location.href = `lesson.html?id=${l.id}`;
        else openPaywall(l);
      })
    );

    const doneCount = lessons.filter((l) => P.isDone(l.id)).length;
    $('doneCount').textContent = doneCount;
    $('totalCount').textContent = lessons.length;
    $('ringArc').setAttribute('stroke-dashoffset', String(188.5 * (1 - doneCount / lessons.length)));
    const streak = P.currentStreak();
    $('streak').textContent = streak;
    $('xp').textContent = P.get().xp;
    $('goalToday').textContent = P.practicedToday() ? '✅' : '⬜';
    $('goalStreak').textContent = `${streak} day${streak === 1 ? '' : 's'}`;

    const cont = lessons.find((l) => !P.isDone(l.id));
    const btn = $('continueBtn');
    if (cont) {
      btn.textContent = `${doneCount ? 'Continue' : 'Start'}: ${cont.title}`;
      btn.onclick = (e) => {
        e.preventDefault();
        if (P.isUnlocked(cont)) location.href = `lesson.html?id=${cont.id}`;
        else openPaywall(cont);
      };
    } else {
      btn.textContent = 'All done – replay a lesson';
      btn.onclick = (e) => { e.preventDefault(); location.href = `lesson.html?id=${lessons[0].id}`; };
    }
  }

  function openPaywall(lesson) {
    pendingLesson = lesson || null;
    $('paywall').hidden = false;
    $('unlockBtn').focus();
  }

  $('pwClose').addEventListener('click', () => ($('paywall').hidden = true));
  $('proBtn').addEventListener('click', () => openPaywall(null));
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
