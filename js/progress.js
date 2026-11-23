/* Progress, XP and streak – stored in this browser only. */
(function () {
  const AD = (window.AD = window.AD || {});
  const KEY = 'agentdrills.progress.v1';
  let memory = null; // fallback when storage is blocked

  // days: practice days ('YYYY-MM-DD'), log: XP earned per completion ({ day, id, xp }).
  // Both added 23 Nov 2026 for the dashboard (streak grid and "Points today").
  const blank = () => ({ xp: 0, lessons: {}, streak: { count: 0, last: null }, unlockAll: false, days: [], log: [] });
  const MAX_DAYS = 60;
  const MAX_LOG = 100;

  const dayStr = (d = new Date()) => {
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };
  const yesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dayStr(d);
  };

  // Progress saved before 23 Nov 2026 has no practice days. Rebuild them from the
  // dates lessons were completed and from the current streak, so nothing looks lost.
  function backfillDays(p) {
    if (Array.isArray(p.days) && p.days.length) return p;
    const set = new Set();
    Object.values(p.lessons || {}).forEach((l) => {
      if (l && l.completedAt) set.add(dayStr(new Date(l.completedAt)));
    });
    if (p.streak && p.streak.last) {
      const [y, m, d] = p.streak.last.split('-').map(Number);
      for (let i = 0; i < Math.min(p.streak.count || 0, MAX_DAYS); i++) set.add(dayStr(new Date(y, m - 1, d - i)));
    }
    p.days = [...set].sort().slice(-MAX_DAYS);
    return p;
  }

  function load() {
    if (memory) return memory;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = Object.assign(blank(), JSON.parse(raw));
        if (!Array.isArray(p.log)) p.log = [];
        return backfillDays(p);
      }
    } catch (e) { /* ignore */ }
    return blank();
  }

  function save(p) {
    memory = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch (e) {
      memory = p;
    }
  }

  const progress = {
    get: load,

    /** Streak that is still "alive" (today or yesterday). */
    currentStreak() {
      const s = load().streak;
      if (s.last === dayStr() || s.last === yesterdayStr()) return s.count;
      return 0;
    },

    practicedToday() {
      return load().streak.last === dayStr();
    },

    /** The last n days (oldest first) as { day, practiced, today }. */
    recentDays(n) {
      const days = new Set(load().days);
      const out = [];
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const s = dayStr(d);
        out.push({ day: s, practiced: days.has(s), today: i === 0 });
      }
      return out;
    },

    /** XP earned today, one entry per completed lesson: [{ id, xp }]. */
    todayLog() {
      const today = dayStr();
      return load().log.filter((e) => e.day === today);
    },

    complete(id, xp, stars) {
      const p = load();
      const prev = p.lessons[id];
      const firstTime = !prev;
      // Replays earn a smaller XP bonus.
      const earned = firstTime ? xp : Math.round(xp / 4);
      p.xp += earned;
      p.lessons[id] = {
        stars: Math.max(stars, prev ? prev.stars : 0),
        completedAt: new Date().toISOString(),
      };
      const today = dayStr();
      if (p.streak.last !== today) {
        p.streak.count = p.streak.last === yesterdayStr() ? p.streak.count + 1 : 1;
        p.streak.last = today;
      }
      if (!p.days.includes(today)) p.days = p.days.concat(today).slice(-MAX_DAYS);
      p.log = p.log.concat({ day: today, id, xp: earned }).slice(-MAX_LOG);
      save(p);
      return { earned, firstTime, totalXp: p.xp, streak: p.streak.count };
    },

    isDone(id) {
      return !!load().lessons[id];
    },

    stars(id) {
      const l = load().lessons[id];
      return l ? l.stars : 0;
    },

    isUnlocked(lesson) {
      return !lesson.pro || load().unlockAll;
    },

    setUnlockAll(on) {
      const p = load();
      p.unlockAll = !!on;
      save(p);
    },

    reset() {
      memory = null;
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    },
  };

  AD.progress = progress;
})();
