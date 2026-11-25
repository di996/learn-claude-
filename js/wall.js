/* Full-screen Pro wall, shown after the last open lesson and when a locked lesson is opened.
   Design: DESIGN.md, "Muren efter lektion 5" (approved 24 Nov 2026). Payments are not live: "Continue with Pro" is the test unlock. */
(function () {
  const AD = window.AD;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  let el = null;
  let target = null;

  function build() {
    el = document.createElement('div');
    el.className = 'wall';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'wallTitle');
    el.innerHTML = `
      <div class="wall-inner">
        <div>
          <span class="wall-eyebrow" id="wallEyebrow">Lesson 6 is next</span>
          <h2 id="wallTitle">You are just getting good at this.</h2>
          <p class="wall-text">Keep going with Pro: approve edits, allow commands, slash commands, memory, plan mode and subagents. New lessons every month.</p>
          <div class="wall-got">
            <div><b id="wallLessons">0</b><span>lessons</span></div>
            <div><b id="wallXp">0</b><span>XP</span></div>
            <div><b id="wallStreak">0</b><span>day streak</span></div>
          </div>
          <div class="wall-plans">
            <button class="wall-plan" type="button" aria-pressed="false"><b>$19</b><small>per month</small></button>
            <button class="wall-plan on" type="button" aria-pressed="true"><em>Save 56%</em><b>$99</b><small>per year</small></button>
          </div>
          <button class="btn wall-go" type="button" id="wallGo">Continue with Pro <span aria-hidden="true">→</span></button>
          <button class="wall-later" type="button" id="wallLater">Not now</button>
          <p class="wall-small">Payments aren't live yet in this preview.</p>
        </div>
        <div class="wall-peek" aria-hidden="true">
          <div class="wall-peek-term">
            <div class="wall-peek-bar"><b></b><b></b><b></b><span id="wallPeekTitle">Lesson 6</span></div>
            <div class="wall-peek-body">
              <div><span class="u">&gt; add a dark mode toggle</span></div>
              <div><span class="a">●</span> Update(<span class="d">src/app.js</span>)</div>
              <div class="d">  Do you want to make this edit?</div>
              <div>  1. Yes</div>
              <div>  2. No, and tell Claude what to do differently</div>
            </div>
          </div>
          <div class="wall-lock"><span>${LOCK}Pro</span></div>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.querySelectorAll('.wall-plan').forEach((p) => p.addEventListener('click', () => {
      el.querySelectorAll('.wall-plan').forEach((q) => {
        q.classList.toggle('on', q === p);
        q.setAttribute('aria-pressed', String(q === p));
      });
    }));
    el.querySelector('#wallGo').addEventListener('click', () => {
      AD.progress.setUnlockAll(true);
      location.href = target ? `lesson.html?id=${target.id}` : 'learn.html';
    });
    el.querySelector('#wallLater').addEventListener('click', later);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el && !el.hidden) later(); });
  }

  function later() {
    // From a lesson, "Not now" goes to the dashboard. Elsewhere (front page, dashboard) it just closes.
    if (/lesson\.html/.test(location.pathname)) location.href = 'learn.html';
    else close();
  }

  function count(node, end) {
    if (reduce) { node.textContent = end; return; }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 600);
      node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function open(lesson) {
    if (!el) build();
    target = lesson || null;
    const first = lesson || firstLocked();
    el.querySelector('#wallEyebrow').textContent = lesson ? `Lesson ${lesson.n} is next` : 'Unlock every lesson';
    el.querySelector('#wallPeekTitle').textContent = first ? `Lesson ${first.n} · ${first.title}` : 'Pro';
    const p = AD.progress.get();
    const done = Object.keys(p.lessons || {}).filter((id) => AD.progress.isDone(id)).length;
    ['wallLessons', 'wallXp', 'wallStreak'].forEach((id) => (el.querySelector('#' + id).textContent = 0));
    el.querySelector('.wall-got').hidden = done === 0; // nothing to show yet (e.g. Sign up on the front page)
    el.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    setTimeout(() => {
      count(el.querySelector('#wallLessons'), done);
      count(el.querySelector('#wallXp'), p.xp || 0);
      count(el.querySelector('#wallStreak'), AD.progress.currentStreak());
    }, reduce ? 0 : 400);
    el.querySelector('#wallGo').focus({ preventScroll: true });
  }

  // First locked Claude Code lesson, for the peek when the wall opens from Sign up.
  function firstLocked() {
    const list = AD.lessonsIn ? AD.lessonsIn('code') : AD.lessons || [];
    return list.find((l) => !AD.progress.isUnlocked(l)) || null;
  }

  function close() {
    if (!el) return;
    el.classList.remove('in');
    setTimeout(() => { el.hidden = true; }, reduce ? 0 : 450);
  }

  // Any element with data-signup opens the wall (no accounts yet: Sign up = Pro).
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-signup]');
    if (!b) return;
    e.preventDefault();
    open(null);
  });

  AD.wall = { open, close };
})();
