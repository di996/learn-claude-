/* Simulated chat window for the Claude Basics track.
 * Scripted and dependency-free, like terminal.js. Nothing here talks to a real model.
 * It offers the same small interface the lesson engine uses on the terminal
 * (prompt, fill, cancelPrompt, stream) plus waitClick() and pick() for button steps.
 */
(function () {
  const AD = (window.AD = window.AD || {});
  const esc = (s) => AD.escapeHtml(s);
  const inline = (s) => AD.inline(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    folder: '<path d="M3 7h6l2 2h10v10H3z"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-4 4 3 3-2 6 4"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/>',
    retry: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  };
  const icon = (name) => `<svg class="ci" viewBox="0 0 24 24" aria-hidden="true">${ICON[name] || ICON.file}</svg>`;

  // Tiny renderer: `code`, **bold**, "- " bullet lists and "1. " numbered lists.
  function renderLines(lines) {
    let html = '';
    let list = null;
    const close = () => { if (list) { html += `</${list}>`; list = null; } };
    lines.forEach((l) => {
      const ul = /^- (.*)/.exec(l);
      const ol = /^\d+\. (.*)/.exec(l);
      if (ul || ol) {
        const want = ul ? 'ul' : 'ol';
        if (list !== want) { close(); html += `<${want}>`; list = want; }
        html += `<li>${inline((ul || ol)[1])}</li>`;
      } else {
        close();
        if (l !== '') html += `<p>${inline(l)}</p>`;
      }
    });
    close();
    return html;
  }

  class Chat {
    constructor(el, opts = {}) {
      this.el = el;
      this.opts = opts;
      this.menuItems = opts.menu || [{ id: 'upload', label: 'Add files or photos', icon: 'file' }];
      this.attachment = null;
      this.menuState = null; // the engine checks this on the terminal; chats have no key menus
      this.interrupted = false;
      this.build();
      (opts.messages || []).forEach((m) => {
        if (m.user !== undefined) this.addUser(m.user, m.file);
        else if (m.text !== undefined) this.addClaude(m.text, true);
      });
    }

    /* ---------- DOM ---------- */
    build() {
      const o = this.opts;
      this.el.classList.add('chat');
      this.el.setAttribute('aria-label', 'Simulated chat');
      this.el.innerHTML = `
        <nav class="chat-side" aria-label="Chats">
          <button class="chat-item chat-close" type="button" data-act="menu" aria-label="Close chats">${icon('close')}</button>
          <button class="chat-item new" type="button" data-act="new-chat">${icon('plus')}New chat</button>
          <button class="chat-item" type="button" data-act="projects">${icon('folder')}Projects</button>
          <p class="chat-sec">Recents</p>
          ${(o.recents || []).map((r) => `<button class="chat-item recent" type="button" data-act="recent">${esc(r)}</button>`).join('')}
        </nav>
        <div class="chat-main">
          <div class="chat-bar">
            <button class="chat-ibtn chat-menubtn" type="button" data-act="menu" aria-label="Open chats">${icon('menu')}</button>
            <span class="chat-title"></span>
            <span class="chat-stamp" title="This is a practice simulation">SIMULATION</span>
          </div>
          <div class="chat-log" role="log" aria-live="polite"></div>
          <div class="chat-live"></div>
          <div class="chat-comp">
            <div class="chat-box">
              <div class="chat-attach" hidden></div>
              <textarea rows="1" placeholder="${esc(o.placeholder || 'Reply to Claude…')}" aria-label="Message" enterkeyhint="send"></textarea>
              <div class="chat-tools">
                <button class="chat-ibtn chat-plus" type="button" data-act="attach" aria-label="Add files and more" aria-haspopup="menu">${icon('plus')}</button>
                <div class="chat-pop" hidden role="menu"></div>
                <button class="chat-send" type="button" data-act="send" aria-label="Send">${icon('send')}</button>
              </div>
            </div>
            <p class="chat-note">Practice simulation · not the real Claude app · not affiliated with Anthropic</p>
          </div>
        </div>`;
      const q = (s) => this.el.querySelector(s);
      this.$title = q('.chat-title');
      this.$log = q('.chat-log');
      this.$live = q('.chat-live');
      this.$input = q('textarea');
      this.$pop = q('.chat-pop');
      this.$attach = q('.chat-attach');
      this.$side = q('.chat-side');
      this.setTitle(o.title || 'New chat');

      this.$input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.submit(this.$input.value.trim());
        }
      });
      this.$input.addEventListener('input', () => this.autosize());
      this.el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b || !this.el.contains(b)) return;
        this.onAct(b.dataset.act, b);
      });
      document.addEventListener('click', (e) => {
        if (!this.$pop.hidden && !e.target.closest('.chat-tools')) this.closePop();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { this.closePop(); this.$side.classList.remove('open'); }
      });
    }

    autosize() {
      this.$input.style.height = 'auto';
      this.$input.style.height = Math.min(this.$input.scrollHeight, 140) + 'px';
    }

    setTitle(t) { this.$title.textContent = t; }

    scroll() { this.$log.scrollTop = this.$log.scrollHeight; }

    focus() {
      // Avoid popping up the phone keyboard over the lesson text.
      if (window.matchMedia && matchMedia('(pointer: fine)').matches) this.$input.focus({ preventScroll: true });
    }

    /* ---------- clicks ---------- */
    onAct(id, btn) {
      if (id === 'attach') {
        if (this.$pop.hidden || this.$pop.dataset.kind !== 'menu') this.openMenu();
        else this.closePop();
      } else if (id === 'menu') {
        this.$side.classList.toggle('open');
      } else if (id === 'send') {
        this.submit(this.$input.value.trim());
        return;
      } else if (id.startsWith('file:')) {
        this.closePop();
      } else if (this.isMenuItem(id)) {
        this.closePop();
      }
      if (id === 'new-chat' || id === 'projects' || id === 'recent') this.$side.classList.remove('open');
      if (this._click) {
        const c = this._click;
        if (c.check(id)) {
          this._click = null;
          this.setPulse(null);
          c.resolve(id);
        }
      }
    }

    isMenuItem(id) { return this.menuItems.some((m) => m.id === id); }

    openMenu() {
      this.$pop.dataset.kind = 'menu';
      this.$pop.innerHTML = this.menuItems
        .map((m) => `<button type="button" role="menuitem" data-act="${esc(m.id)}">${icon(m.icon)}${esc(m.label)}</button>`)
        .join('');
      this.$pop.hidden = false;
      if (this._pulse && this.isMenuItem(this._pulse)) this.setPulse(this._pulse);
    }

    openPicker(files) {
      this.$pop.dataset.kind = 'files';
      this.$pop.innerHTML =
        `<p class="chat-pop-h">Choose a file</p>` +
        files.map((f) => `<button type="button" role="menuitem" data-act="file:${esc(f)}">${icon(/\.(png|jpe?g|gif|webp)$/i.test(f) ? 'image' : 'file')}${esc(f)}</button>`).join('');
      this.$pop.hidden = false;
    }

    closePop() { this.$pop.hidden = true; this.$pop.dataset.kind = ''; }

    /** Highlight the button the learner should press (null clears it). */
    setPulse(id) {
      this._pulse = id;
      this.el.querySelectorAll('.pulse').forEach((b) => b.classList.remove('pulse'));
      if (!id) return;
      if (this.isMenuItem(id)) {
        if (!this.$pop.hidden && this.$pop.dataset.kind === 'menu') {
          const it = this.$pop.querySelector(`[data-act="${CSS.escape(id)}"]`);
          if (it) it.classList.add('pulse');
        } else {
          this.el.querySelector('[data-act="attach"]').classList.add('pulse');
        }
        return;
      }
      const sel = `[data-act="${CSS.escape(id)}"]`;
      const all = this.el.querySelectorAll(sel);
      const target = all[all.length - 1]; // e.g. Retry under the latest answer
      if (target) target.classList.add('pulse');
      if (target && target.closest('.chat-side') && !this.$side.classList.contains('open')) {
        const m = this.el.querySelector('.chat-menubtn');
        if (m && getComputedStyle(m).display !== 'none') m.classList.add('pulse');
      }
    }

    /** Wait for a click on a chat button. `check(id)` returns true to accept. */
    waitClick(check) {
      this.$input.readOnly = true;
      return new Promise((resolve) => {
        this._click = { check, resolve: (v) => { this.$input.readOnly = false; resolve(v); } };
      });
    }

    /** Show a file picker and wait for the right file. */
    pick(files, check) {
      this.openPicker(files);
      return new Promise((resolve) => {
        this._click = {
          check: (id) => {
            if (!id.startsWith('file:')) {
              if (id === 'attach') setTimeout(() => this.openPicker(files), 0);
              return false;
            }
            const name = id.slice(5);
            if (check(name)) { this.setAttachment(name); return true; }
            setTimeout(() => this.openPicker(files), 0);
            return false;
          },
          resolve,
        };
      });
    }

    setAttachment(name) {
      this.attachment = name;
      this.$attach.hidden = !name;
      this.$attach.innerHTML = name ? `<span class="chat-file">${icon('file')}${esc(name)}</span>` : '';
    }

    /* ---------- typing ---------- */
    prompt(check) {
      this.$input.readOnly = false;
      this.focus();
      return new Promise((resolve) => { this._pending = { check, resolve }; });
    }

    submit(v) {
      const p = this._pending;
      if (!p || !v) { if (!v) this.shake(); return; }
      if (!p.check(v)) { this.shake(); return; }
      this._pending = null;
      this.$input.value = '';
      this.autosize();
      this.addUser(v, this.attachment);
      this.setAttachment(null);
      p.resolve(v);
    }

    cancelPrompt() {
      if (!this._pending) return;
      const p = this._pending;
      this._pending = null;
      this.$input.value = '';
      p.resolve(null);
    }

    fill(text) {
      this.$input.value = text;
      this.autosize();
      this.$input.focus({ preventScroll: true });
    }

    shake() {
      const b = this.el.querySelector('.chat-box');
      b.classList.remove('shake');
      void b.offsetWidth;
      b.classList.add('shake');
    }

    // The engine calls these on the terminal; they do nothing in a chat.
    pressKey() {}
    on() { return () => {}; }
    render() {}

    /* ---------- messages ---------- */
    addUser(text, file) {
      const d = document.createElement('div');
      d.className = 'chat-u';
      d.innerHTML = (file ? `<span class="chat-file">${icon('file')}${esc(file)}</span>` : '') + inline(text);
      this.$log.appendChild(d);
      this.scroll();
    }

    addClaude(text, instant) {
      const lines = Array.isArray(text) ? text : [text];
      const wrap = document.createElement('div');
      wrap.className = 'chat-c';
      wrap.innerHTML =
        `<div class="chat-cmsg"><span class="chat-ava" aria-hidden="true">C</span><div class="chat-ctext">${renderLines(lines)}</div></div>` +
        `<div class="chat-acts"><button class="chat-ibtn" type="button" data-act="copy" aria-label="Copy">${icon('copy')}</button></div>`;
      this.$log.appendChild(wrap);
      if (!instant && !reduce()) this.fadeWords(wrap.querySelector('.chat-ctext'));
      this.scroll();
      return wrap;
    }

    // Reveal the answer word by word (~60 ms per word).
    fadeWords(root) {
      const words = [];
      const walk = (n) => {
        n.childNodes.forEach((c) => {
          if (c.nodeType === 3) {
            const frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const s = document.createElement('span');
              s.className = 'chat-w';
              s.textContent = part;
              words.push(s);
              frag.appendChild(s);
            });
            c.replaceWith(frag);
          } else if (c.nodeType === 1) walk(c);
        });
      };
      walk(root);
      words.forEach((w, i) => setTimeout(() => { w.classList.add('on'); if (i % 8 === 0) this.scroll(); }, 60 * i));
      return words.length * 60;
    }

    /* ---------- scripted output ---------- */
    async stream(script) {
      for (const it of script) await this.play(it);
      return 'done';
    }

    async play(it) {
      if (it.wait) return sleep(it.wait);
      if (it.title !== undefined) { this.setTitle(it.title); return; }
      if (it.newChat) {
        this.$log.innerHTML = '';
        this.setTitle(it.newChat === true ? 'New chat' : it.newChat);
        return sleep(200);
      }
      if (it.retry) {
        const last = [...this.$log.querySelectorAll('.chat-c')].pop();
        if (last) last.remove();
        return sleep(150);
      }
      if (it.user !== undefined) { this.addUser(it.user, it.file); return sleep(250); }
      if (it.think !== undefined) return sleep(Math.min(it.think || 600, 900));
      if (it.text !== undefined) {
        await sleep(it.delay || 350);
        const wrap = this.addClaude(it.text);
        const words = wrap.querySelectorAll('.chat-w').length;
        return sleep(reduce() ? 100 : Math.min(words * 60, 2500) + 150);
      }
      if (it.html !== undefined) {
        const d = document.createElement('div');
        d.className = it.cls || '';
        d.innerHTML = it.html;
        this.$log.appendChild(d);
        this.scroll();
      }
    }
  }

  AD.Chat = Chat;
})();
