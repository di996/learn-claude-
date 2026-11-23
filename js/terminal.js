/* Simulated Claude Code terminal.
 * A scripted, dependency-free imitation of the Claude Code TUI used for lessons
 * and the landing-page demo. Nothing here talks to a real model.
 */
(function () {
  const AD = (window.AD = window.AD || {});

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Escape, then allow `code` and **bold** in authored text.
  const inline = (s) =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const SLASH = [
    ['/help', 'Show help and available commands'],
    ['/init', 'Initialize a new CLAUDE.md file with codebase documentation'],
    ['/clear', 'Clear conversation history and free up context'],
    ['/compact', 'Clear conversation history but keep a summary in context'],
    ['/context', 'Visualize current context usage'],
    ['/memory', 'Edit Claude memory files'],
    ['/model', 'Set the AI model for Claude Code'],
    ['/permissions', 'Manage allow & deny tool permission rules'],
    ['/resume', 'Resume a conversation'],
    ['/review', 'Review a pull request'],
    ['/config', 'Open config panel'],
    ['/exit', 'Exit the REPL'],
  ];

  const DEFAULT_FILES = [
    'README.md',
    'package.json',
    'src/app.js',
    'src/utils.js',
    'src/storage.js',
    'src/index.html',
    'src/styles.css',
    'tests/utils.test.js',
    'tests/app.test.js',
  ];

  const SPIN = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
  const WORDS = ['Thinking', 'Pondering', 'Reading', 'Considering', 'Working', 'Noodling'];
  const PERM_ORDER = ['normal', 'accept', 'plan'];

  class Terminal {
    constructor(el, opts = {}) {
      this.el = el;
      this.opts = opts;
      this.files = opts.files || DEFAULT_FILES;
      this.agents = opts.agents ? opts.agents.slice() : []; // subagents known to @-autocomplete
      this.cwd = opts.cwd || '~';
      this.project = opts.project || 'my-project';
      this.mode = 'shell';
      this.perm = 'normal';
      this.speed = opts.speed || 1;
      this.history = [];
      this.hIdx = -1;
      this.listeners = {};
      this.waiting = false;
      this.busy = false;
      this.popupItems = [];
      this.popupSel = 0;
      this.interrupted = false;
      this.build();
    }

    /* ---------- DOM ---------- */
    build() {
      this.el.classList.add('term');
      this.el.innerHTML = `
        <div class="term-bar" aria-hidden="true"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="term-title"></span></div>
        <div class="term-body" tabindex="-1">
          <div class="term-log" role="log" aria-live="polite"></div>
          <div class="term-live"></div>
          <div class="term-inputwrap shell">
            <label class="term-line"><span class="term-ps"></span><input class="term-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="send" aria-label="Terminal input"></label>
            <div class="term-popup" hidden></div>
            <div class="term-footer"><span class="f-left">? for shortcuts</span><span class="f-right"></span></div>
          </div>
        </div>`;
      const q = (s) => this.el.querySelector(s);
      this.$title = q('.term-title');
      this.$body = q('.term-body');
      this.$log = q('.term-log');
      this.$live = q('.term-live');
      this.$wrap = q('.term-inputwrap');
      this.$ps = q('.term-ps');
      this.$input = q('.term-input');
      this.$popup = q('.term-popup');
      this.$footR = q('.f-right');

      this.$input.addEventListener('keydown', (e) => this.onKeydown(e));
      this.$input.addEventListener('input', () => this.updatePopup());
      this.$body.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (window.getSelection && String(window.getSelection())) return;
        this.focus();
      });
      this.$popup.addEventListener('mousedown', (e) => {
        const it = e.target.closest('.pi');
        if (!it) return;
        e.preventDefault();
        this.popupSel = Number(it.dataset.i);
        this.acceptPopup();
      });
      this.setBusy(true);
      this.render();
    }

    render() {
      const claude = this.mode === 'claude';
      this.$wrap.classList.toggle('claude', claude);
      this.$wrap.classList.toggle('shell', !claude);
      this.$title.textContent = claude ? `${this.project} — claude` : `${this.project} — zsh`;
      if (claude) {
        this.$ps.innerHTML = '&gt;';
        this.$input.placeholder = this.opts.placeholder || 'Try "how does this codebase work?"';
      } else {
        this.$ps.innerHTML = `<span class="cwd">${escapeHtml(this.cwd)}</span> $`;
        this.$input.placeholder = '';
      }
      let r = '';
      if (this.perm === 'accept') r = '<span class="m-accept">⏵⏵ accept edits on</span> <span class="t-faint">(shift+tab to cycle)</span>';
      if (this.perm === 'plan') r = '<span class="m-plan">⏸ plan mode on</span> <span class="t-faint">(shift+tab to cycle)</span>';
      this.$footR.innerHTML = r;
    }

    setBusy(b) {
      this.busy = b;
      this.$wrap.classList.toggle('busy', b);
      this.$input.readOnly = b;
    }

    focus() {
      if (this.opts.noFocus) return;
      try { this.$input.focus({ preventScroll: true }); } catch (e) { this.$input.focus(); }
    }

    scroll() {
      this.$body.scrollTop = this.$body.scrollHeight;
    }

    append(html, cls) {
      const d = document.createElement('div');
      if (cls) d.className = cls;
      d.innerHTML = html;
      this.$log.appendChild(d);
      this.scroll();
      return d;
    }

    shake() {
      const t = this.$wrap;
      t.classList.remove('term-shake');
      void t.offsetWidth;
      t.classList.add('term-shake');
    }

    /* ---------- events ---------- */
    on(name, fn) {
      (this.listeners[name] = this.listeners[name] || []).push(fn);
      return () => (this.listeners[name] = this.listeners[name].filter((f) => f !== fn));
    }
    emit(name, data) {
      (this.listeners[name] || []).slice().forEach((fn) => fn(data));
    }

    /** Programmatic key press (used by touch key buttons). */
    pressKey(combo) {
      if (this.menuState) {
        if (combo === 'escape') this.menuState.escape();
        return;
      }
      if (combo === 'shift+tab') this.cyclePerm();
      if (combo === 'escape') this.handleEsc();
      this.emit('key', combo);
      this.focus();
    }

    cyclePerm() {
      if (this.mode !== 'claude') return;
      const i = PERM_ORDER.indexOf(this.perm);
      this.perm = PERM_ORDER[(i + 1) % PERM_ORDER.length];
      this.render();
      this.emit('perm', this.perm);
    }

    handleEsc() {
      if (!this.$popup.hidden) { this.closePopup(); return; }
      this.interrupted = true;
      this.emit('esc');
    }

    onKeydown(e) {
      const popupOpen = !this.$popup.hidden && this.popupItems.length;
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        this.cyclePerm();
        this.emit('key', 'shift+tab');
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.handleEsc();
        this.emit('key', 'escape');
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        if (popupOpen) this.acceptPopup(true);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        if (popupOpen) {
          this.popupSel = (this.popupSel + dir + this.popupItems.length) % this.popupItems.length;
          this.drawPopup();
          return;
        }
        if (this.busy || !this.history.length) return;
        if (this.hIdx === -1) this.hIdx = this.history.length;
        this.hIdx = Math.max(0, Math.min(this.history.length, this.hIdx - dir));
        this.$input.value = this.history[this.hIdx] || '';
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.busy || !this.waiting) return;
        if (popupOpen && this.popupItems[this.popupSel]) {
          const it = this.popupItems[this.popupSel];
          if (it.kind === 'file') { this.acceptPopup(); return; }
          // Slash: complete then submit (like the real thing)
          if (this.$input.value.trim() !== it.value) this.$input.value = it.value;
        }
        this.closePopup();
        const v = this.$input.value.trim();
        if (!v) return;
        this.submit(v);
      }
    }

    /* ---------- autocomplete ---------- */
    updatePopup() {
      if (this.mode !== 'claude') return this.closePopup();
      const v = this.$input.value;
      let items = [];
      if (/^\/[\w-]*$/.test(v)) {
        items = SLASH.filter(([c]) => c.startsWith(v)).slice(0, 7).map(([c, d]) => ({ kind: 'slash', value: c, label: c, desc: d }));
      } else {
        const m = v.match(/(^|\s)@([\w./-]*)$/);
        if (m) {
          const part = m[2].toLowerCase();
          // Already a complete path: nothing left to suggest.
          if (this.files.some((f) => f.toLowerCase() === part)) return this.closePopup();
          if (this.agents.some((a) => 'agent-' + a.toLowerCase() === part)) return this.closePopup();
          const agentItems = this.agents
            .filter((a) => ('agent-' + a).toLowerCase().includes(part))
            .map((a) => ({ kind: 'agent', value: 'agent-' + a, label: '@agent-' + a, desc: 'agent' }));
          const fileItems = this.files
            .filter((f) => f.toLowerCase().includes(part))
            .map((f) => ({ kind: 'file', value: f, label: '@' + f, desc: '' }));
          items = agentItems.concat(fileItems).slice(0, 7);
        }
      }
      this.popupItems = items;
      this.popupSel = 0;
      if (!items.length) return this.closePopup();
      this.$popup.hidden = false;
      this.drawPopup();
    }

    drawPopup() {
      this.$popup.innerHTML =
        this.popupItems
          .map((it, i) => `<div class="pi${i === this.popupSel ? ' sel' : ''}" data-i="${i}"><span class="pn">${escapeHtml(it.label)}</span><span>${escapeHtml(it.desc)}</span></div>`)
          .join('') + '<div class="hint">↑↓ to navigate · tab to complete · enter to select</div>';
      this.scroll();
    }

    acceptPopup(fromTab) {
      const it = this.popupItems[this.popupSel];
      if (!it) return;
      if (it.kind === 'slash') {
        this.$input.value = it.value;
      } else {
        this.$input.value = this.$input.value.replace(/@[\w./-]*$/, '@' + it.value + ' ');
      }
      this.closePopup();
      this.focus();
      if (it.kind === 'slash' && fromTab) this.updatePopup();
    }

    closePopup() {
      this.$popup.hidden = true;
      this.popupItems = [];
    }

    /* ---------- prompting ---------- */
    /**
     * Wait for the user to submit a line. `check(value)` returns true to accept
     * (input is echoed and cleared) or false to keep the text so they can fix it.
     */
    prompt(check) {
      this.waiting = true;
      this.setBusy(false);
      this.focus();
      return new Promise((resolve) => {
        this._pending = { check, resolve };
      });
    }

    submit(v) {
      const p = this._pending;
      if (!p) return;
      const ok = p.check ? p.check(v) : true;
      if (!ok) { this.shake(); return; }
      this.history.push(v);
      this.hIdx = -1;
      this._pending = null;
      this.waiting = false;
      this.$input.value = '';
      this.setBusy(true);
      this.echo(v);
      p.resolve(v);
    }

    /** Stop waiting for input without resolving with a value. */
    cancelPrompt() {
      if (!this._pending) return;
      const p = this._pending;
      this._pending = null;
      this.waiting = false;
      this.$input.value = '';
      this.closePopup();
      this.setBusy(true);
      p.resolve(null);
    }

    /** Put text in the input (used by "Show answer"). */
    fill(text) {
      this.$input.value = text;
      this.focus();
      this.updatePopup();
    }

    echo(v) {
      if (this.mode === 'claude') {
        this.append(`&gt; ${escapeHtml(v)}`, 't-user');
      } else {
        this.append(`<span class="t-ps"><span class="cwd">${escapeHtml(this.cwd)}</span> $</span> ${escapeHtml(v)}`);
      }
    }

    /* ---------- menus (permission prompts etc.) ---------- */
    /**
     * Show a numbered menu. `check(index)` returns true to accept the choice.
     * Returns a Promise resolving to the chosen index.
     */
    menu(spec, check) {
      this.setBusy(true);
      this.$wrap.hidden = true;
      const box = document.createElement('div');
      box.className = 'term-menu';
      let sel = 0;
      const opts = spec.options;
      box.innerHTML =
        (spec.title ? `<div class="mt">${inline(spec.title)}</div>` : '') +
        (spec.body ? `<div class="mb">${spec.bodyHtml ? spec.body : inline(spec.body)}</div>` : '') +
        (spec.question ? `<div class="mq">${inline(spec.question)}</div>` : '') +
        opts.map((o, i) => `<button type="button" class="opt" data-i="${i}"><span class="car">❯</span><span>${i + 1}. ${inline(o)}</span></button>`).join('') +
        `<div class="mf">↑↓ to select · enter to confirm${opts.some((o) => /\(esc\)/.test(o)) ? ' · esc to cancel' : ''}</div>`;
      this.$live.appendChild(box);
      this.scroll();
      const btns = [...box.querySelectorAll('.opt')];
      const draw = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
      draw();

      return new Promise((resolve) => {
        const choose = (i) => {
          sel = i; draw();
          if (check && !check(i)) {
            box.classList.remove('term-shake'); void box.offsetWidth; box.classList.add('term-shake');
            return;
          }
          cleanup();
          box.remove();
          this.$wrap.hidden = false;
          resolve(i);
        };
        const onKey = (e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
            draw();
          } else if (e.key === 'Enter') {
            e.preventDefault(); choose(sel);
          } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= opts.length) {
            e.preventDefault(); choose(Number(e.key) - 1);
          } else if (e.key === 'Escape') {
            e.preventDefault(); escape();
          } else if (e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            const k = opts.findIndex((o) => /\(shift\+tab\)/.test(o));
            if (k >= 0) choose(k);
          }
        };
        const escape = () => {
          const k = opts.findIndex((o) => /\(esc\)/.test(o));
          if (k >= 0) choose(k);
        };
        btns.forEach((b, i) => b.addEventListener('click', () => choose(i)));
        document.addEventListener('keydown', onKey, true);
        this.menuState = {
          escape,
          reveal: (i) => btns.forEach((b, j) => b.classList.toggle('reveal', j === i)),
        };
        const cleanup = () => {
          document.removeEventListener('keydown', onKey, true);
          this.menuState = null;
        };
        // Blur the text input so arrow keys don't scroll the page.
        this.$input.blur();
        btns[0].focus({ preventScroll: true });
      });
    }

    /* ---------- scripted output ---------- */
    async stream(script, opts = {}) {
      this.interrupted = false;
      for (const item of script) {
        if (opts.interruptible && this.interrupted) return 'interrupted';
        await this.play(item, opts);
      }
      return 'done';
    }

    wait(ms) {
      return sleep(ms / this.speed);
    }

    async play(it, opts) {
      if (it.wait) return this.wait(it.wait);
      if (it.cwd) { this.cwd = it.cwd; this.render(); return; }
      if (it.perm) { this.perm = it.perm; this.render(); return; }
      if (it.clear) { this.$log.innerHTML = ''; this.render(); return this.wait(200); }
      if (it.launch) return this.launch(it);
      if (it.exit) {
        this.mode = 'shell'; this.perm = 'normal'; this.render();
        return this.wait(150);
      }
      if (it.think !== undefined) return this.think(it, opts);
      if (it.type !== undefined) return this.autoType(it.type);
      if (it.user !== undefined) { this.echo(it.user); return this.wait(250); }
      if (it.text !== undefined) {
        await this.wait(it.delay || 250);
        const lines = Array.isArray(it.text) ? it.text : [it.text];
        this.append(`<span class="bul">⏺</span><div>${lines.map((l) => `<p>${l === '' ? '&nbsp;' : inline(l)}</p>`).join('')}</div>`, 't-msg');
        return this.wait(150);
      }
      if (it.tool) {
        await this.wait(it.delay || 450);
        const cls = 't-msg tool' + (it.error ? ' err' : '');
        this.append(`<span class="bul">⏺</span><div><b>${escapeHtml(it.tool)}</b>(${escapeHtml(it.arg || '')})</div>`, cls);
        // Writing .claude/agents/<name>.md creates a subagent: offer it in @-autocomplete from now on.
        const agentFile = it.tool === 'Write' && /(?:^|\/)\.claude\/agents\/([\w-]+)\.md$/.exec(it.arg || '');
        if (agentFile && !this.agents.includes(agentFile[1])) this.agents.push(agentFile[1]);
        if (it.out) this.out(it.out);
        if (it.diff) this.diff(it.diff);
        return this.wait(200);
      }
      if (it.out) { this.out(it.out); return this.wait(120); }
      if (it.shell !== undefined) {
        await this.wait(it.delay || 200);
        this.append(escapeHtml(it.shell), 't-pre');
        return this.wait(80);
      }
      if (it.html !== undefined) {
        this.append(it.html, it.cls);
        return this.wait(it.delay || 80);
      }
    }

    out(text) {
      const lines = Array.isArray(text) ? text : [text];
      lines.forEach((l, i) => this.append(`<span></span><span class="elb">${i === 0 ? '⎿' : ''}</span><span>${inline(l)}</span>`, 't-out'));
    }

    diff(lines) {
      const d = document.createElement('div');
      d.className = 't-diff';
      d.innerHTML = lines
        .map(([sg, code, ln]) => {
          const cls = sg === '+' ? 'add' : sg === '-' ? 'rem' : '';
          return `<div class="dl ${cls}"><span class="ln">${ln || ''}</span><span class="sg">${sg === ' ' ? '' : sg}</span><span>${escapeHtml(code)}</span></div>`;
        })
        .join('');
      this.$log.appendChild(d);
      this.scroll();
    }

    async launch(it) {
      this.mode = 'claude';
      this.perm = 'normal';
      this.render();
      await this.wait(it.instant ? 0 : 450);
      this.append(
        `<div class="t-welcome"><div class="w-title"><span class="star">✻</span> Welcome to <b>Claude Code</b>!</div>` +
          `<div class="t-dim">&nbsp;</div>` +
          `<div class="t-dim">  /help for help, /status for your current setup</div>` +
          `<div class="t-dim">&nbsp;</div>` +
          `<div class="t-dim">  cwd: /Users/you/${escapeHtml(this.project)}</div></div>`
      );
      if (it.note) this.append(inline(it.note), 't-dim');
      return this.wait(it.instant ? 0 : 200);
    }

    async think(it, opts) {
      const el = document.createElement('div');
      el.className = 't-spin';
      this.$live.appendChild(el);
      const word = it.label || WORDS[Math.floor(Math.random() * WORDS.length)];
      const start = Date.now();
      let i = 0;
      const draw = () => {
        const s = Math.floor((Date.now() - start) / 1000);
        el.innerHTML = `<span>${SPIN[i++ % SPIN.length]}</span><span class="lbl">${escapeHtml(word)}…</span><span class="meta">(${s}s · esc to interrupt)</span>`;
      };
      draw();
      this.scroll();
      const timer = setInterval(draw, 120);
      const ms = it.think === Infinity ? Infinity : (it.think || 900) / this.speed;
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        if (opts && opts.interruptible && this.interrupted) break;
        await sleep(60);
      }
      clearInterval(timer);
      el.remove();
    }

    async autoType(text) {
      this.setBusy(false);
      this.$input.value = '';
      for (const ch of text) {
        this.$input.value += ch;
        await this.wait(35 + Math.random() * 40);
      }
      await this.wait(350);
      this.$input.value = '';
      this.setBusy(true);
      this.echo(text);
    }

    /** Remove all output and reset to a fresh shell. */
    reset() {
      this.$log.innerHTML = '';
      this.$live.innerHTML = '';
      this.mode = 'shell';
      this.perm = 'normal';
      this.cwd = this.opts.cwd || '~';
      this.render();
    }
  }

  AD.Terminal = Terminal;
  AD.escapeHtml = escapeHtml;
  AD.inline = inline;
  AD.sleep = sleep;
})();
