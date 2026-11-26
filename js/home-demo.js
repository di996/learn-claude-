/* Front page: the self-playing lesson clip under "How it works".
   Design: DESIGN.md, "Forsiden under toppen: 'Kort og skarp'" (approved 26 Nov 2026).
   Types a typo, shows the real hint from lesson 1, then the right command, and loops.
   The three steps next to it light up with the coach line. */
(function () {
  const coach = document.getElementById('homeCoach');
  const body = document.getElementById('homeTerm');
  const steps = document.getElementById('homeSteps');
  if (!coach || !body || !steps) return;

  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const PS = '<span class="g">~/my-project $</span> ';
  const WELCOME = '<span class="a">✻</span> Welcome to Claude Code!<br><span class="d">  cwd: ~/my-project</span>';
  const STATES = {
    ask: ['3/5', 'Type <code>claude</code> and press Enter.'],
    hint: ['HINT', 'Close. The command is just <code>claude</code>.'],
    good: ['+10 XP', 'Claude Code is running.'],
  };

  function say(key) {
    coach.className = 'home-coach' + (key === 'ask' ? '' : ' ' + key);
    coach.innerHTML = `<small>${STATES[key][0]}</small><span>${STATES[key][1]}</span>`;
    steps.classList.add('live');
    steps.querySelectorAll('li').forEach((li) => li.classList.toggle('on', li.dataset.k === key));
  }

  function line(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    body.appendChild(d);
    return d;
  }

  async function type(text) {
    const d = line(PS + '<span class="t"></span><span class="home-cursor"></span>');
    const t = d.querySelector('.t');
    for (const ch of text) { t.textContent += ch; await wait(90); }
    await wait(400);
    d.querySelector('.home-cursor').remove();
  }

  async function run() {
    body.innerHTML = '<div><span class="g">~ $</span> cd my-project</div>';
    say('ask');
    await wait(900);
    await type('claude-code');
    say('hint');
    await wait(1800);
    await type('claude');
    const w = line(WELCOME);
    w.className = 'home-welcome home-fade';
    say('good');
    await wait(3200);
  }

  if (reduce) {
    body.innerHTML = '<div><span class="g">~ $</span> cd my-project</div>';
    line(PS + 'claude-code');
    line(PS + 'claude');
    line(WELCOME).className = 'home-welcome';
    say('good');
    return;
  }

  let started = false;
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting || started) return;
    started = true;
    io.disconnect();
    for (;;) await run();
  }, { threshold: 0.4 });
  io.observe(body);
})();
