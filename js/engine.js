/* Lesson runner: walks through a lesson's steps, checks answers, gives hints. */
(function () {
  const AD = (window.AD = window.AD || {});
  const $ = (id) => document.getElementById(id);

  const PRAISE = ['Nice!', 'Correct!', 'Exactly right.', 'You got it.', 'Perfect.', 'Nailed it.'];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function coach(kind, title, msg) {
    const el = $('coach');
    const face = kind === 'ok' ? '✅' : kind === 'bad' ? '💡' : '👉';
    el.className = 'coach ' + kind;
    el.innerHTML = `<span class="face" aria-hidden="true">${face}</span><div>${title ? `<b>${title}</b>` : ''}${msg ? AD.inline(msg) : ''}</div>`;
    el.hidden = false;
  }
  function clearCoach() { $('coach').hidden = true; }

  function floatXP(n) {
    const pill = $('xpPill');
    if (!pill) return;
    const r = pill.getBoundingClientRect();
    const f = document.createElement('div');
    f.className = 'xp-float';
    f.textContent = `+${n} XP`;
    f.style.left = r.left + 'px';
    f.style.top = r.bottom + 4 + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }

  function matches(rule, v) {
    if (!rule) return false;
    if (rule instanceof RegExp) return rule.test(v);
    if (typeof rule === 'function') return !!rule(v);
    return String(rule) === String(v);
  }

  function findHint(step, v) {
    const h = step.hints;
    if (Array.isArray(h)) {
      const hit = h.find((x) => matches(x.match, v));
      if (hit) return hit.msg;
    } else if (h && typeof h === 'object' && h[v] !== undefined) {
      return h[v];
    }
    return step.hint || 'Not quite — read the instruction again and try once more.';
  }

  async function runLesson(lesson, termEl) {
    // Claude Basics lessons play in a simulated chat; everything else in the terminal.
    const isChat = lesson.track === 'basics';
    if (isChat) document.body.classList.add('track-basics');
    const term = isChat
      ? new AD.Chat(termEl, lesson.chat || {})
      : new AD.Terminal(termEl, { files: lesson.files, cwd: lesson.cwd || '~', project: 'my-project' });
    AD.term = term; // handy for debugging

    // Touch-friendly key buttons
    document.querySelectorAll('[data-key]').forEach((b) =>
      b.addEventListener('click', () => term.pressKey(b.dataset.key))
    );
    // Keys pressed while focus is outside the terminal still count.
    let currentType = null;
    document.addEventListener('keydown', (e) => {
      if (e.target === term.$input || term.menuState) return;
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.key === 'Escape' && currentType === 'esc') term.pressKey('escape');
      if (e.key === 'Tab' && e.shiftKey && currentType === 'mode') {
        e.preventDefault();
        term.pressKey('shift+tab');
      }
    });
    const setPulse = (key) =>
      document.querySelectorAll('[data-key]').forEach((b) => b.classList.toggle('pulse', b.dataset.key === key));

    $('eyebrow').textContent = isChat ? `Claude Basics · Lesson ${lesson.n}` : `Lesson ${lesson.n}`;
    $('title').textContent = lesson.title;
    document.title = `${lesson.title} · AgentDrills`;

    if (isChat) {
      // The chat draws its own starting messages.
    } else if (lesson.start === 'claude') {
      term.cwd = '~/my-project';
      await term.stream([{ launch: true, instant: true }]);
    } else if (lesson.cwd) {
      term.render();
    }
    if (lesson.intro) await term.stream(lesson.intro);

    let xp = 0;
    let hintsUsed = 0;
    const steps = lesson.steps;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      $('bar').style.width = `${(i / steps.length) * 100}%`;
      $('stepCount').textContent = `Step ${i + 1} of ${steps.length}`;
      $('say').innerHTML = step.say;
      document.body.classList.add('lesson-ready'); // reveal the lesson (see .lesson in styles.css)
      $('choices').innerHTML = '';
      $('showAnswer').hidden = true;
      clearCoach();
      setPulse(null);

      if (step.before) await term.stream(step.before);

      let misses = 0;
      const miss = (v) => {
        misses++;
        hintsUsed++;
        coach('bad', 'Not quite.', findHint(step, v));
        if (misses >= 2 && step.type !== 'choice') $('showAnswer').hidden = false;
      };

      const type = step.type || (step.click ? 'click' : step.pick ? 'pick' : step.menu ? 'menu' : step.mode ? 'mode' : step.during ? 'esc' : step.choices ? 'choice' : 'input');
      currentType = type;

      if (type === 'input') {
        $('showAnswer').onclick = () => {
          hintsUsed++;
          term.fill(step.answer || '');
          coach('info', 'Here it is.', isChat ? 'Press Enter or tap send.' : 'Press Enter to run it.');
        };
        await term.prompt((raw) => {
          const v = raw.trim();
          if (matches(step.match, v)) return true;
          miss(v);
          return false;
        });
      } else if (type === 'mode') {
        setPulse('shift+tab');
        $('showAnswer').onclick = () => {
          hintsUsed++;
          coach('info', 'Hold Shift and press Tab.', 'On a phone or tablet, tap the **⇧ Shift+Tab** button under the terminal.');
        };
        await new Promise((resolve) => {
          const done = () => { off(); term.cancelPrompt(); resolve(); };
          const off = term.on('perm', (p) => {
            if (p === step.mode) return done();
            if (step.modeHints && step.modeHints[p]) coach('info', '', step.modeHints[p]);
          });
          term.prompt((v) => { miss(v); return false; });
        });
      } else if (type === 'esc') {
        setPulse('escape');
        $('showAnswer').onclick = () => {
          hintsUsed++;
          coach('info', 'Press the Esc key.', 'It is usually in the top-left corner of your keyboard. You can also tap **Esc** under the terminal.');
        };
        const hintTimer = setTimeout(() => { $('showAnswer').hidden = false; }, 9000);
        term.interrupted = false;
        await term.stream(step.during, { interruptible: true });
        clearTimeout(hintTimer);
        term.$live.innerHTML = '';
      } else if (type === 'menu') {
        const ok = Array.isArray(step.answer) ? step.answer : [step.answer];
        $('showAnswer').onclick = () => {
          hintsUsed++;
          if (term.menuState) term.menuState.reveal(ok[0]);
          coach('info', 'Highlighted for you.', `Pick option **${ok[0] + 1}**.`);
        };
        await term.menu(step.menu, (idx) => {
          if (ok.includes(idx)) return true;
          miss(idx);
          return false;
        });
      } else if (type === 'click') {
        // Chat only: click the right button (e.g. "attach", "retry", or a + menu item).
        const target = step.click;
        const via = step.via || (term.isMenuItem && term.isMenuItem(target) ? ['attach'] : []);
        term.setPulse(target);
        $('showAnswer').onclick = () => {
          hintsUsed++;
          term.setPulse(target);
          coach('info', 'Highlighted for you.', step.answerText || 'Press the highlighted button.');
        };
        await term.waitClick((id) => {
          if (id === target) return true;
          if (via.includes(id) || id === 'menu') return false;
          miss(id);
          return false;
        });
      } else if (type === 'pick') {
        // Chat only: choose the right file in the file picker.
        $('showAnswer').onclick = () => {
          hintsUsed++;
          coach('info', 'Here it is.', `Choose **${step.pick}**.`);
        };
        await term.pick(step.files || [step.pick], (name) => {
          if (name === step.pick) return true;
          miss(name);
          return false;
        });
      } else if (type === 'choice') {
        await new Promise((resolve) => {
          const box = $('choices');
          step.choices.forEach((c, idx) => {
            const b = document.createElement('button');
            b.className = 'choice';
            b.type = 'button';
            b.innerHTML = AD.inline(c.text);
            b.addEventListener('click', () => {
              if (box.dataset.done) return;
              if (c.right) {
                b.classList.add('right');
                box.dataset.done = '1';
                resolve();
              } else {
                b.classList.add('wrong');
                misses++; hintsUsed++;
                coach('bad', 'Not quite.', c.why || step.hint || 'Try another answer.');
              }
            });
            box.appendChild(b);
          });
        });
      } else if (type === 'info') {
        await new Promise((resolve) => {
          const b = document.createElement('button');
          b.className = 'btn small';
          b.textContent = step.button || 'Continue';
          b.addEventListener('click', resolve);
          $('choices').appendChild(b);
          b.focus();
        });
      }

      // Correct!
      setPulse(null);
      $('showAnswer').hidden = true;
      const gain = step.xp === undefined ? 10 : step.xp;
      if (gain) {
        xp += gain;
        $('xpVal').textContent = xp;
        floatXP(gain);
      }
      coach('ok', step.successTitle || pick(PRAISE), step.success || '');
      if (step.respond) await term.stream(step.respond);
      if (step.pause !== false) await AD.sleep(type === 'choice' ? 900 : 500);
    }

    $('bar').style.width = '100%';
    finish(lesson, xp, hintsUsed);
  }

  function finish(lesson, xp, hintsUsed) {
    const stars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;
    const res = AD.progress.complete(lesson.id, xp, stars);
    const next = AD.nextLesson(lesson.id);
    $('doneStars').innerHTML = [1, 2, 3].map((n) => `<span class="${n <= stars ? '' : 'off'}">⭐</span>`).join('');
    $('doneXp').textContent = `+${res.earned}`;
    $('doneStreak').textContent = `${res.streak} day${res.streak === 1 ? '' : 's'}`;
    $('doneHints').textContent = hintsUsed;
    $('doneTitle').textContent = stars === 3 ? 'Flawless!' : 'Lesson complete!';
    $('doneSub').textContent = lesson.summary || '';
    const nextBtn = $('doneNext');
    // DESIGN.md punkt 6–7 (25 Nov 2026): one button only. When the next lesson is locked,
    // the end card shows briefly and the full-screen wall slides up; "Not now" goes to the dashboard.
    const locked = next && !AD.progress.isUnlocked(next);
    if (next && !locked) {
      nextBtn.innerHTML = 'Next lesson <span aria-hidden="true">→</span>';
      nextBtn.href = `lesson.html?id=${next.id}`;
    } else if (!next) {
      nextBtn.textContent = 'Back to lessons';
      nextBtn.href = 'learn.html';
    }
    nextBtn.hidden = !!locked;
    $('done').hidden = false;
    if (locked) {
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      setTimeout(() => { if (AD.wall) AD.wall.open(next); else location.href = `learn.html?paywall=${next.id}`; }, reduce ? 0 : 1400);
    } else {
      nextBtn.focus();
    }
  }

  AD.runLesson = runLesson;
})();
