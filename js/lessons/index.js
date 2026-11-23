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
