// Shared progress tracking for the flashcard-style quizzes (css, java, javascript, react, sql,
// system-design). Progress is kept in this browser's localStorage, one entry per quiz folder.
//
// Questions are keyed by a hash of their text, so renumbering a quiz's data does not misattribute
// saved progress. Ratings use Leitner boxes: "Got it" moves a question up one box (max 5), "Need
// practice" drops it back to box 1. A question counts as known from box 3 up (three "Got it" in a row).

window.QuizProgress = (() => {
  const KNOWN_BOX = 3;
  const dir = location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "").split("/").pop() || "root";
  const KEY = "quizbit-progress:" + dir;

  function load() {
    try {
      const p = JSON.parse(localStorage.getItem(KEY));
      if (p && p.q && p.viewed) return p;
    } catch (e) {
      /* storage unavailable or corrupt: start fresh */
    }
    return { q: {}, viewed: {} };
  }

  let state = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable: progress lasts for this page view only */
    }
  }

  function id(q) {
    let h = 5381;
    for (const c of q.question) h = ((h * 33) ^ c.codePointAt(0)) >>> 0;
    return h.toString(36);
  }

  const box = (q) => (state.q[id(q)] ? state.q[id(q)].box : 0);

  return {
    isViewed: (q) => Boolean(state.viewed[id(q)]),

    markViewed(q) {
      if (!q || state.viewed[id(q)]) return;
      state.viewed[id(q)] = 1;
      save();
    },

    rate(q, gotIt) {
      const r = state.q[id(q)] || { box: 0, seen: 0, right: 0 };
      r.seen += 1;
      if (gotIt) {
        r.right += 1;
        r.box = Math.min(5, r.box + 1);
      } else {
        r.box = 1;
      }
      r.last = gotIt ? 1 : 0;
      state.q[id(q)] = r;
      save();
    },

    knownCount: (questions) => questions.filter((q) => box(q) >= KNOWN_BOX).length,

    // New and weak questions first, with some randomness so repeat sessions differ.
    weakFirst(questions, limit = 25) {
      return questions
        .map((q) => ({ q, s: box(q) + Math.random() * 2 }))
        .sort((a, b) => a.s - b.s)
        .slice(0, limit)
        .map((x) => x.q);
    },

    reset() {
      state = { q: {}, viewed: {} };
      save();
    },
  };
})();
