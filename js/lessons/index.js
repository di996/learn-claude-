/* Lesson registry. Each lesson file calls AD.addLesson({...}).
 * Lessons belong to a track: 'code' (Claude Code, the default) or 'basics' (Claude Basics). */
(function () {
  const AD = (window.AD = window.AD || {});
  AD.lessons = AD.lessons || [];
  AD.trackOf = (l) => l.track || 'code';
  AD.addLesson = (l) => {
    AD.lessons.push(l);
    AD.lessons.sort((a, b) => a.n - b.n);
  };
  // Planned lessons that are not built yet. The dashboard shows them as "Coming soon".
  // Remove an entry when the real lesson is added. Source: lesson-index.md (23 Nov 2026).
  AD.upcoming = [
    { track: 'basics', n: 3, title: 'Share files and photos' },
    { track: 'basics', n: 4, title: "Fix it, don't start over" },
    { track: 'basics', n: 5, title: 'Projects and instructions' },
    { track: 'basics', n: 6, title: 'From chat to Claude Code' },
    { track: 'code', n: 8, title: 'Connect tools with MCP' },
    { track: 'code', n: 9, title: 'Automate with hooks' },
  ];
  AD.lessonsIn = (track) => AD.lessons.filter((l) => AD.trackOf(l) === track);
  AD.lessonById = (id) => AD.lessons.find((l) => l.id === id);
  AD.nextLesson = (id) => {
    const cur = AD.lessonById(id);
    if (!cur) return null;
    if (cur.next) return AD.lessonById(cur.next) || null; // e.g. last Basics lesson -> Claude Code lesson 1
    const list = AD.lessonsIn(AD.trackOf(cur));
    const i = list.indexOf(cur);
    return list[i + 1] || null;
  };
})();
