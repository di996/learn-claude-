// Plays every lesson to the end screen in an invisible browser and reports
// the first step that does not move on, plus any console errors.
//
// Usage (the site must be running on http://localhost:8000):
//   ~/.local/node/bin/node scripts/test_lessons.mjs                       all lessons in lesson.html
//   ~/.local/node/bin/node scripts/test_lessons.mjs js/lessons/08-clear.js  one lesson file (also one not on the site yet)
//   ~/.local/node/bin/node scripts/test_lessons.mjs modes start-session   lessons by id
//
// It answers with each lesson's own data: `answer` on typing and menu steps, the
// `right: true` choice on quizzes, Shift+Tab on mode steps, Esc on "during" steps,
// the Continue button on info steps, and the target button/file on chat steps.
// Each lesson runs in a fresh browser profile with test-Pro on, so your own
// progress is never touched. Exit code 1 if any lesson fails.
//
// Playwright is borrowed from ole/vaerktoej/node_modules, and the browser is the
// installed Google Chrome, so nothing extra has to be downloaded.

import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE_URL || "http://localhost:8000/";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROGRESS_KEY = "agentdrills.progress.v1";
const READY_MS = 20000;   // how long a step may take to become answerable
const ADVANCE_MS = 20000; // how long a correct answer may take to move on
const PARALLEL = 1; // python3 -m http.server handles one request at a time

let chromium;
try {
  const require = createRequire(resolve(ROOT, "ole/vaerktoej/package.json"));
  ({ chromium } = require("playwright"));
} catch {
  console.error("Kunne ikke finde Playwright i ole/vaerktoej/node_modules.");
  process.exit(2);
}

// ---------- which lessons ----------
const lessonFilesOnSite = () => {
  const html = readFileSync(resolve(ROOT, "lesson.html"), "utf8");
  return [...html.matchAll(/<script src="(js\/lessons\/[^"]+\.js)"><\/script>/g)]
    .map((m) => m[1])
    .filter((f) => !f.endsWith("/index.js"));
};
const idOf = (file) => {
  const m = readFileSync(resolve(ROOT, file), "utf8").match(/\bid:\s*['"]([^'"]+)['"]/);
  return m ? m[1] : null;
};

const siteFiles = lessonFilesOnSite();
const args = process.argv.slice(2);
let jobs; // { id, file, inject }
if (!args.length) {
  jobs = siteFiles.map((file) => ({ id: idOf(file), file, inject: false }));
} else {
  jobs = args.map((a) => {
    if (a.endsWith(".js")) {
      const abs = resolve(process.cwd(), a);
      if (!existsSync(abs)) { console.error(`Filen findes ikke: ${a}`); process.exit(2); }
      const file = relative(ROOT, abs).split("\\").join("/");
      if (file.startsWith("..")) { console.error(`Lektionsfilen skal ligge i projektmappen: ${a}`); process.exit(2); }
      return { id: idOf(file), file, inject: !siteFiles.includes(file) };
    }
    const file = siteFiles.find((f) => idOf(f) === a);
    if (!file) { console.error(`Ingen lektion med id "${a}" i lesson.html.`); process.exit(2); }
    return { id: a, file, inject: false };
  });
}
for (const j of jobs) if (!j.id) { console.error(`Fandt intet id i ${j.file}.`); process.exit(2); }

// ---------- check the server ----------
try {
  const r = await fetch(BASE + "lesson.html");
  if (!r.ok) throw new Error(r.status);
} catch {
  console.error(`Siden svarer ikke på ${BASE}. Start den med: python3 -m http.server 8000`);
  process.exit(2);
}

// ---------- at most 4 requests to the test server at a time ----------
const slot = (() => {
  let free = 4; const queue = [];
  return {
    take: () => (free > 0 ? (free--, Promise.resolve()) : new Promise((r) => queue.push(r))),
    give: () => (queue.length ? queue.shift()() : free++),
  };
})();

// ---------- play one lesson ----------
async function play(browser, job) {
  const t0 = Date.now();
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(([key]) => {
    try {
      const p = JSON.parse(localStorage.getItem(key) || "{}");
      p.unlockAll = true;
      localStorage.setItem(key, JSON.stringify(p));
    } catch (e) {}
  }, [PROGRESS_KEY]);

  // Every file from the test server goes through here: at most 4 at a time and
  // up to 3 tries, because python3 -m http.server drops connections when Chrome
  // asks for many files at once. A lesson file that is not on the site yet is
  // added to lesson.html for this run only; a lesson with the same id is replaced.
  await ctx.route((url) => url.href.startsWith(BASE), async (route) => {
    let res, lastErr;
    for (let k = 0; k < 3 && !res; k++) {
      await slot.take();
      try { res = await route.fetch(); } catch (e) { lastErr = e; } finally { slot.give(); }
      if (!res) await new Promise((r) => setTimeout(r, 150));
    }
    if (!res) { errors.push(`kunne ikke hente ${route.request().url().replace(BASE, "/")} efter 3 forsøg (${lastErr && lastErr.message.split("\n")[0]})`); return route.abort(); }
    if (job.inject && /\/lesson\.html(\?.*)?$/.test(route.request().url())) {
      const tag =
        `<script>(function(){var add=AD.addLesson;AD.addLesson=function(l){AD.lessons=AD.lessons.filter(function(x){return x.id!==l.id});add(l)};})();</script>\n` +
        `  <script src="${job.file}"></script>\n  <script src="js/engine.js"></script>`;
      const html = (await res.text()).replace('<script src="js/engine.js"></script>', tag);
      return route.fulfill({ response: res, body: html, headers: { ...res.headers(), "content-type": "text/html" } });
    }
    return route.fulfill({ response: res });
  });

  const page = await ctx.newPage();
  // "Failed to load resource" is reported again, with the file name, by requestfailed/response below.
  page.on("console", (m) => { if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => errors.push(`kunne ikke hente ${r.url().replace(BASE, "/")} (${(r.failure() || {}).errorText || "ukendt"})`));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url().replace(BASE, "/")}`); });

  const result = { id: job.id, file: job.file, ok: false, steps: 0, fail: null, errors };
  try {
    await page.goto(`${BASE}lesson.html?id=${encodeURIComponent(job.id)}`);
    if (!page.url().includes("lesson.html")) throw new Error(`siden sendte videre til ${page.url().replace(BASE, "/")}`);
    await page.waitForFunction(() => window.AD && AD.term && document.body.classList.contains("lesson-ready"), null, { timeout: READY_MS })
      .catch(() => { throw new Error("lektionen startede ikke"); });

    const steps = await page.evaluate((id) => {
      const l = AD.lessonById(id);
      return l.steps.map((s) => ({
        type: s.type || (s.click ? "click" : s.pick ? "pick" : s.menu ? "menu" : s.mode ? "mode" : s.during ? "esc" : s.choices ? "choice" : "input"),
        answer: s.answer, mode: s.mode, click: s.click, via: s.via, pick: s.pick,
        right: s.choices ? s.choices.findIndex((c) => c.right) : -1,
      }));
    }, job.id);
    result.steps = steps.length;

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const label = `trin ${i + 1} af ${steps.length} (${s.type})`;
      await page.waitForFunction((n) => document.getElementById("stepCount").textContent.startsWith(`Step ${n} `), i + 1, { timeout: READY_MS })
        .catch(() => { throw new Error(`${label}: trinnet blev aldrig vist`); });

      const advanced = (timeout = ADVANCE_MS) => page.waitForFunction(
        (n) => !document.getElementById("done").hidden || document.getElementById("stepCount").textContent.startsWith(`Step ${n} `),
        i + 2, { timeout });
      const ready = (fn, what) => page.waitForFunction(fn, null, { timeout: READY_MS })
        .catch(() => { throw new Error(`${label}: ${what}`); });

      if (s.type === "input") {
        if (typeof s.answer !== "string" || !s.answer) throw new Error(`${label}: trinnet har intet answer`);
        await ready(() => !!AD.term._pending, "skrivefeltet blev aldrig klar");
        await page.locator(".term-input, .chat textarea, textarea").first().fill(s.answer);
        await page.keyboard.press("Enter");
        await advanced().catch(() => { throw new Error(`${label}: svaret "${s.answer}" blev ikke godtaget`); });
      } else if (s.type === "menu") {
        const idx = Array.isArray(s.answer) ? s.answer[0] : s.answer;
        if (typeof idx !== "number") throw new Error(`${label}: trinnet har intet answer`);
        await ready(() => !!AD.term.menuState, "menuen blev aldrig vist");
        await page.locator(`.term-menu .opt[data-i="${idx}"]`).click();
        await advanced().catch(() => { throw new Error(`${label}: punkt ${idx + 1} blev ikke godtaget`); });
      } else if (s.type === "mode") {
        await ready(() => !!AD.term._pending, "skrivefeltet blev aldrig klar");
        await page.locator(".term-input").focus();
        let ok = false;
        for (let k = 0; k < 6 && !ok; k++) {
          await page.keyboard.press("Shift+Tab");
          ok = await advanced(1500).then(() => true, () => false);
        }
        if (!ok) {
          const perm = await page.evaluate(() => AD.term.perm);
          throw new Error(`${label}: blev ikke "${s.mode}" efter 6 × Shift+Tab (står på "${perm}")`);
        }
      } else if (s.type === "esc") {
        let ok = false;
        for (let k = 0; k < 10 && !ok; k++) {
          await page.waitForTimeout(500);
          await page.keyboard.press("Escape");
          ok = await advanced(1500).then(() => true, () => false);
        }
        if (!ok) throw new Error(`${label}: Esc stoppede ikke Claude`);
      } else if (s.type === "choice") {
        if (s.right < 0) throw new Error(`${label}: ingen svarmulighed har right: true`);
        await ready(() => document.querySelectorAll("#choices .choice").length > 0, "svarknapperne blev aldrig vist");
        await page.locator("#choices .choice").nth(s.right).click();
        await advanced().catch(() => { throw new Error(`${label}: det rigtige svar gik ikke videre`); });
      } else if (s.type === "info") {
        await ready(() => !!document.querySelector("#choices button"), "Continue-knappen blev aldrig vist");
        await page.locator("#choices button").first().click();
        await advanced().catch(() => { throw new Error(`${label}: Continue gik ikke videre`); });
      } else if (s.type === "click") {
        await ready(() => !!AD.term._click, "knap-trinnet blev aldrig klar");
        const isMenu = await page.evaluate((t) => !!(AD.term.isMenuItem && AD.term.isMenuItem(t)), s.click);
        const via = s.via || (isMenu ? ["attach"] : []);
        for (const v of via) await page.locator(`[data-act="${v}"]`).first().click();
        await page.locator(`[data-act="${s.click}"]:visible`).first().click();
        await advanced().catch(() => { throw new Error(`${label}: klik på "${s.click}" gik ikke videre`); });
      } else if (s.type === "pick") {
        await ready(() => !!AD.term._click, "filvælgeren blev aldrig klar");
        await page.locator(`[data-act="file:${s.pick}"]:visible`).first().click();
        await advanced().catch(() => { throw new Error(`${label}: filen "${s.pick}" blev ikke godtaget`); });
      } else {
        throw new Error(`${label}: testprogrammet kender ikke denne trin-type`);
      }
    }

    await page.waitForFunction(() => !document.getElementById("done").hidden, null, { timeout: ADVANCE_MS })
      .catch(() => { throw new Error("slutskærmen blev aldrig vist"); });
    result.ok = true;
  } catch (e) {
    result.fail = (e.message || String(e)).split("\n")[0];
  }
  result.seconds = (Date.now() - t0) / 1000;
  await ctx.close();
  return result;
}

// ---------- run ----------
const browser = await chromium.launch({ executablePath: CHROME });
const results = new Array(jobs.length);
let next = 0;
await Promise.all(Array.from({ length: Math.min(PARALLEL, jobs.length) }, async () => {
  while (next < jobs.length) {
    const i = next++;
    let r = await play(browser, jobs[i]);
    // The small test server sometimes drops a connection. Try such a lesson once more.
    // A dropped file can cause follow-up errors (e.g. "AD.runLesson is not a function"), so one dropped file is enough.
    const serverHiccup = (x) => x.errors.some((e) => /ERR_CONNECTION_RESET|ERR_SOCKET_NOT_CONNECTED|ERR_EMPTY_RESPONSE/.test(e));
    if (serverHiccup(r)) { r = await play(browser, jobs[i]); r.retried = true; }
    results[i] = r;
  }
}));
await browser.close();

const pad = (s, n) => String(s).padEnd(n);
const w = Math.max(...results.map((r) => r.id.length));
let passed = 0;
for (const r of results) {
  const ok = r.ok && !r.errors.length;
  if (ok) passed++;
  const secs = r.seconds.toFixed(1).replace(".", ",") + " s";
  if (r.ok) console.log(`${ok ? "✓ bestået " : "✗ FEJLEDE "}  ${pad(r.id, w)}  ${pad(r.steps + " trin", 8)} ${secs}${r.retried ? "  (prøvet 2 gange, testserveren tabte en fil)" : ""}`);
  else console.log(`✗ FEJLEDE   ${pad(r.id, w)}  ${r.fail}`);
  for (const e of [...new Set(r.errors)]) console.log(`             konsolfejl: ${e}`);
}
console.log(`\n${passed} af ${results.length} bestået`);
process.exit(passed === results.length ? 0 : 1);
