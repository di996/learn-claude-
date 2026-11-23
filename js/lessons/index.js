/* Lesson registry. Each lesson file calls AD.addLesson({...}). */
(function () {
  const AD = (window.AD = window.AD || {});
  AD.lessons = AD.lessons || [];
  AD.addLesson = (l) => {
    AD.lessons.push(l);
    AD.lessons.sort((a, b) => a.n - b.n);
  };
  AD.lessonById = (id) => AD.lessons.find((l) => l.id === id);
  AD.nextLesson = (id) => {
    const i = AD.lessons.findIndex((l) => l.id === id);
    return i >= 0 ? AD.lessons[i + 1] : null;
  };
})();
