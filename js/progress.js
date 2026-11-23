/* Progress, XP and streak – stored in this browser only. */
(function () {
  const AD = (window.AD = window.AD || {});
  const KEY = 'agentdrills.progress.v1';
  let memory = null; // fallback when storage is blocked

  const blank = () => ({ xp: 0, lessons: {}, streak: { count: 0, last: null }, unlockAll: false });

  const dayStr = (d = new Date()) => {
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };
  const yesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dayStr(d);
  };

  function load() {
    if (memory) return memory;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
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
