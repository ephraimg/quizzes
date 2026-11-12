(() => {
  "use strict";

  const STORE_KEY = "design-patterns-quiz-v1";

  const GROUPS = [
    { name: "Creational", keys: ["singleton", "factory-method", "abstract-factory"] },
    { name: "Structural", keys: ["decorator", "adapter", "facade", "composite", "proxy"] },
    {
      name: "Behavioral",
      keys: ["strategy", "observer", "command", "template-method", "iterator", "state"],
    },
    { name: "Cross-pattern", keys: ["confusable", "principles", "smells", "jdk", "compound"] },
  ];

  const LABELS = {
    singleton: "Singleton",
    "factory-method": "Factory Method",
    "abstract-factory": "Abstract Factory",
    decorator: "Decorator",
    adapter: "Adapter",
    facade: "Facade",
    composite: "Composite",
    proxy: "Proxy",
    strategy: "Strategy",
    observer: "Observer",
    command: "Command",
    "template-method": "Template Method",
    iterator: "Iterator",
    state: "State",
    confusable: "Confusable pairs",
    principles: "OO principles",
    smells: "Smell → pattern",
    jdk: "Patterns in the JDK",
    compound: "Compound / MVC",
  };

  const TYPE_LABELS = {
    mc: "Multiple choice",
    multi: "Select all",
    tf: "True / false",
    match: "Matching",
    order: "Ordering",
    short: "Short answer",
  };

  const QUESTIONS = (window.QUIZ_QUESTIONS || []).filter((q) => LABELS[q.pattern]);
  const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
  const app = document.getElementById("app");

  // ---------------------------------------------------------------- utilities

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, "");
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const KEYWORDS =
    "abstract|assert|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|try|void|volatile|while|true|false|var|record";
  const TOKEN = new RegExp(
    `(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|("(?:[^"\\\\\\n]|\\\\.)*")|(@\\w+)|\\b(${KEYWORDS})\\b|\\b([A-Z]\\w*)\\b|\\b(\\d+(?:\\.\\d+)?[LlFfDd]?)\\b`,
    "g",
  );

  function highlight(escaped) {
    return escaped.replace(TOKEN, (m, comment, str, ann, kw, type, num) => {
      const cls = comment ? "c" : str ? "s" : ann ? "a" : kw ? "k" : type ? "t" : "n";
      return `<span class="tok-${cls}">${m}</span>`;
    });
  }

  function inline(text) {
    return esc(String(text))
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  function md(text) {
    return String(text)
      .split(/```(?:\w+)?\n([\s\S]*?)```/g)
      .map((part, i) =>
        i % 2
          ? `<pre><code>${highlight(esc(part.replace(/\n$/, "")))}</code></pre>`
          : part
              .split(/\n{2,}/)
              .filter((p) => p.trim())
              .map((p) => `<p>${inline(p).replace(/\n/g, "<br>")}</p>`)
              .join(""),
      )
      .join("");
  }

  // ----------------------------------------------------------------- progress

  let prog = loadProgress();

  function loadProgress() {
    try {
      const p = JSON.parse(localStorage.getItem(STORE_KEY));
      if (p && p.q) return p;
    } catch (e) {
      /* storage unavailable or corrupt: start fresh */
    }
    return { q: {} };
  }

  // With `node serve.mjs` running, progress.json is the source of truth and the browser's
  // localStorage is a fallback copy. Without it, localStorage plus export/import is all there is.
  let fileMode = false;
  let saveFailed = false;
  let writeChain = Promise.resolve();

  function saveProgress() {
    const body = JSON.stringify(prog);
    try {
      localStorage.setItem(STORE_KEY, body);
    } catch (e) {
      /* storage unavailable: progress is kept for this page view only */
    }
    if (!fileMode) return;
    writeChain = writeChain
      .then(() => fetch("api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body, keepalive: true }))
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        saveFailed = false;
      })
      .catch(() => {
        saveFailed = true;
      });
  }

  async function syncFromServer() {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 1000);
      const r = await fetch("api/progress", { signal: ctl.signal });
      clearTimeout(timer);
      if (!r.ok) return;
      const remote = await r.json();
      if (!remote || typeof remote.q !== "object") return;
      fileMode = true;
      if (Object.keys(remote.q).length) prog = remote;
      else if (Object.keys(prog.q).length) saveProgress(); // first run: move browser progress into the file
    } catch (e) {
      /* no server (opened from disk or hosted statically): browser-only */
    }
  }

  function storageStatus() {
    if (fileMode && saveFailed) return "Could not write progress.json. Is `node serve.mjs` still running? Progress is kept in this browser meanwhile.";
    if (fileMode) return "Progress is saved to progress.json next to this quiz.";
    return "Progress is saved in this browser only. Run `node serve.mjs` in this folder to save it to a file instead.";
  }

  function exportProgress() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(prog, null, 2)], { type: "application/json" }));
    const a = h("a", { href: url, download: "design-patterns-progress.json" });
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importProgress() {
    const input = h("input", {
      type: "file",
      accept: "application/json,.json",
      onchange: async () => {
        try {
          const data = JSON.parse(await input.files[0].text());
          if (!data || typeof data.q !== "object" || Array.isArray(data.q)) throw new Error("bad shape");
          if (!confirm(`Replace current progress with the imported file (${Object.keys(data.q).length} questions)?`)) return;
          prog = data;
          saveProgress();
          renderHome();
        } catch (e) {
          notice = "That file is not a valid progress export.";
          renderHome();
        }
      },
    });
    input.click();
  }

  // Leitner boxes: 0 = unseen, 1 = just missed, 5 = well known.
  function recordResult(q, score) {
    const r = prog.q[q.id] || { box: 0, seen: 0, right: 0 };
    r.seen += 1;
    r.right += score;
    r.last = score;
    r.box = score === 1 ? Math.min(5, r.box + 1) : score === 0 ? 1 : Math.max(1, r.box);
    prog.q[q.id] = r;
    saveProgress();
  }

  function pickQuestions(pool, n, prioritizeWeak) {
    const scored = pool.map((q) => {
      const box = prog.q[q.id] ? prog.q[q.id].box : 0;
      return { q, s: prioritizeWeak ? box + Math.random() * 2.5 : Math.random() };
    });
    scored.sort((a, b) => a.s - b.s);
    return shuffle(scored.slice(0, n).map((x) => x.q));
  }

  // -------------------------------------------------------- question controls
  //
  // Each controller returns { el, ready(), grade(), lock(opts), state(), key?(n), onChange }.
  // `state()` captures everything needed to rebuild the same view for review.

  function choiceCtrl(q, saved) {
    const isTf = q.type === "tf";
    const multi = q.type === "multi";
    const options = isTf ? ["True", "False"] : q.options;
    const answer = new Set(isTf ? [q.answer ? 0 : 1] : multi ? q.answer : [q.answer]);
    const perm = saved ? saved.perm : isTf ? [0, 1] : shuffle(options.map((_, i) => i));
    const sel = new Set(saved ? saved.value : []);
    let locked = false;
    const ctrl = { onChange() {} };

    const buttons = perm.map((oi, pos) =>
      h(
        "button",
        { class: "opt" + (multi ? " multi" : ""), type: "button", onclick: () => choose(oi) },
        h("span", { class: "key" }, pos + 1),
        h("span", { class: "txt", html: inline(options[oi]) }),
      ),
    );

    function paint() {
      buttons.forEach((b, pos) => b.classList.toggle("selected", sel.has(perm[pos])));
    }

    function choose(oi) {
      if (locked) return;
      if (multi) {
        if (sel.has(oi)) sel.delete(oi);
        else sel.add(oi);
      } else {
        sel.clear();
        sel.add(oi);
      }
      paint();
      ctrl.onChange();
    }

    paint();
    return Object.assign(ctrl, {
      el: h(
        "div",
        {},
        multi ? h("p", { class: "hint" }, "Select all that apply.") : null,
        h("div", { class: "opt-list" }, buttons),
      ),
      ready: () => sel.size > 0,
      key: (n) => {
        if (n >= 1 && n <= perm.length) choose(perm[n - 1]);
      },
      grade: () => (sel.size === answer.size && [...sel].every((i) => answer.has(i)) ? 1 : 0),
      lock() {
        locked = true;
        buttons.forEach((b, pos) => {
          const oi = perm[pos];
          b.disabled = true;
          if (answer.has(oi)) b.classList.add("correct");
          else if (sel.has(oi)) b.classList.add("wrong");
        });
      },
      state: () => ({ perm, value: [...sel] }),
    });
  }

  function matchCtrl(q, saved) {
    const rights = saved ? saved.perm : shuffle(q.pairs.map((p) => p[1]));
    const vals = saved ? [...saved.value] : q.pairs.map(() => "");
    const ctrl = { onChange() {} };

    const rows = q.pairs.map(([left], i) => {
      const select = h(
        "select",
        {
          "aria-label": `Match for: ${left}`,
          onchange: (e) => {
            vals[i] = e.target.value;
            ctrl.onChange();
          },
        },
        h("option", { value: "" }, "Choose…"),
        rights.map((t) => h("option", { value: t }, t.replace(/`/g, ""))),
      );
      select.value = vals[i];
      return { select, row: h("div", { class: "match-row" }, h("div", { html: inline(left) }), select) };
    });

    return Object.assign(ctrl, {
      el: h(
        "div",
        {},
        h("p", { class: "hint" }, "Match each item on the left with its partner."),
        rows.map((r) => r.row),
      ),
      ready: () => vals.every(Boolean),
      grade: () => (q.pairs.every((p, i) => vals[i] === p[1]) ? 1 : 0),
      lock() {
        rows.forEach(({ select, row }, i) => {
          select.disabled = true;
          const ok = vals[i] === q.pairs[i][1];
          row.classList.add(ok ? "correct" : "wrong");
          if (!ok) {
            row.append(h("div", { class: "fix", html: "Correct: " + inline(q.pairs[i][1]) }));
          }
        });
      },
      state: () => ({ perm: rights, value: vals }),
    });
  }

  function orderCtrl(q, saved) {
    let cur;
    if (saved) cur = [...saved.value];
    else {
      cur = shuffle(q.items);
      while (q.items.length > 1 && cur.every((t, i) => t === q.items[i])) cur = shuffle(q.items);
    }
    let locked = false;
    const ctrl = { onChange() {} };
    const list = h("div", { class: "opt-list" });
    const fix = h("div");

    function move(i, d) {
      [cur[i], cur[i + d]] = [cur[i + d], cur[i]];
      render();
      ctrl.onChange();
    }

    function render() {
      list.replaceChildren(
        ...cur.map((t, i) =>
          h(
            "div",
            { class: "order-item" + (locked ? (t === q.items[i] ? " correct" : " wrong") : "") },
            h("span", { class: "pos" }, i + 1),
            h("span", { class: "txt", html: inline(t) }),
            locked
              ? null
              : h(
                  "span",
                  { class: "mv" },
                  h("button", { type: "button", "aria-label": "Move up", disabled: i === 0, onclick: () => move(i, -1) }, "↑"),
                  h(
                    "button",
                    { type: "button", "aria-label": "Move down", disabled: i === cur.length - 1, onclick: () => move(i, 1) },
                    "↓",
                  ),
                ),
          ),
        ),
      );
    }

    render();
    return Object.assign(ctrl, {
      el: h("div", {}, h("p", { class: "hint" }, "Put these in the correct order using the arrows."), list, fix),
      ready: () => true,
      grade: () => (cur.every((t, i) => t === q.items[i]) ? 1 : 0),
      lock() {
        locked = true;
        render();
        if (!cur.every((t, i) => t === q.items[i])) {
          fix.append(
            h("p", { class: "hint" }, "Correct order:"),
            h("ol", {}, q.items.map((t) => h("li", { html: inline(t) }))),
          );
        }
      },
      state: () => ({ value: cur }),
    });
  }

  function shortCtrl(q, saved) {
    const ctrl = { type: "short", onChange() {} };
    const textarea = h("textarea", { placeholder: "Write your answer from memory…", "aria-label": "Your answer" });
    textarea.value = saved ? saved.value.text : "";
    let grade = saved ? saved.value.grade : null;
    const reveal = h("div");

    return Object.assign(ctrl, {
      el: h("div", {}, textarea, reveal),
      ready: () => true,
      grade: () => grade ?? 0,
      lock({ onGrade } = {}) {
        textarea.disabled = true;
        const buttons = [];
        const choices = [
          ["Got it", 1],
          ["Partly", 0.5],
          ["Missed it", 0],
        ];
        const paintGrade = () =>
          buttons.forEach(([b, score]) => {
            b.classList.toggle("sel", grade === score);
            if (onGrade || grade !== null) b.disabled = grade !== null;
          });
        reveal.append(
          h(
            "div",
            { class: "model" },
            h("h4", {}, "Model answer"),
            h("div", { class: "prompt", html: md(q.modelAnswer) }),
            h("h4", { style: "margin-top:12px" }, "Did you cover these?"),
            h("ul", {}, q.keyPoints.map((k) => h("li", { html: inline(k) }))),
          ),
          onGrade || grade !== null
            ? h(
                "div",
                { class: "selfgrade row" },
                h("span", { class: "kbd" }, "Grade yourself:"),
                choices.map(([label, score]) => {
                  const b = h(
                    "button",
                    {
                      type: "button",
                      class: "btn",
                      onclick: () => {
                        if (grade !== null || !onGrade) return;
                        grade = score;
                        paintGrade();
                        onGrade(score);
                      },
                    },
                    label,
                  );
                  buttons.push([b, score]);
                  return b;
                }),
              )
            : null,
        );
        paintGrade();
      },
      state: () => ({ value: { text: textarea.value, grade } }),
    });
  }

  function makeCtrl(q, saved) {
    if (q.type === "match") return matchCtrl(q, saved);
    if (q.type === "order") return orderCtrl(q, saved);
    if (q.type === "short") return shortCtrl(q, saved);
    return choiceCtrl(q, saved);
  }

  // ------------------------------------------------------------------- shared

  function badgesFor(q) {
    return h(
      "div",
      { class: "badges" },
      h("span", { class: "badge" }, LABELS[q.pattern]),
      h("span", { class: "badge" }, TYPE_LABELS[q.type]),
      q.difficulty >= 3 ? h("span", { class: "badge hard" }, "Hard") : null,
    );
  }

  function feedbackFor(q, score) {
    const kind = score === 1 ? "good" : score === 0 ? "bad" : "partly";
    const verdict = score === 1 ? "Correct" : score === 0 ? "Not quite" : "Partly right";
    return h(
      "div",
      { class: "feedback " + kind },
      h("div", { class: "verdict" }, verdict),
      q.explanation ? h("div", { class: "prompt", html: md(q.explanation) }) : null,
      q.ref ? h("div", { class: "ref" }, "Book: " + q.ref) : null,
    );
  }

  function mount(...nodes) {
    app.replaceChildren(...nodes.flat().filter((n) => n != null && n !== false));
    window.scrollTo(0, 0);
  }

  // --------------------------------------------------------------------- home

  const pick = {
    patterns: new Set(QUESTIONS.map((q) => q.pattern)),
    types: new Set(Object.keys(TYPE_LABELS)),
    count: 20,
    mode: "practice",
    weak: true,
  };
  let notice = "";

  function countsByPattern() {
    const counts = {};
    for (const q of QUESTIONS) counts[q.pattern] = (counts[q.pattern] || 0) + 1;
    return counts;
  }

  function renderHome() {
    session = null;
    const counts = countsByPattern();
    const seenAll = QUESTIONS.filter((q) => prog.q[q.id]);
    const right = seenAll.reduce((n, q) => n + prog.q[q.id].right, 0);
    const attempts = seenAll.reduce((n, q) => n + prog.q[q.id].seen, 0);
    const missed = QUESTIONS.filter((q) => prog.q[q.id] && prog.q[q.id].last < 1);

    const progressGrid = h(
      "div",
      { class: "progress-grid" },
      GROUPS.flatMap((g) => g.keys)
        .filter((k) => counts[k])
        .map((k) => {
          const qs = QUESTIONS.filter((q) => q.pattern === k);
          const seen = qs.filter((q) => prog.q[q.id]);
          const mastered = seen.filter((q) => prog.q[q.id].box >= 4).length;
          const learning = seen.length - mastered;
          const pct = (n) => (n / qs.length) * 100 + "%";
          return h(
            "div",
            { class: "pstat" },
            h("div", { class: "name" }, LABELS[k]),
            h("div", { class: "bar" }, h("span", { class: "mastered", style: `width:${pct(mastered)}` }), h("span", { class: "learning", style: `width:${pct(learning)}` })),
            h("div", { class: "meta" }, `${mastered} known · ${learning} learning · ${qs.length - seen.length} new`),
          );
        }),
    );

    const startBtn = h("button", { class: "btn primary", type: "button", onclick: onStart });
    const missedBtn = h(
      "button",
      {
        class: "btn",
        type: "button",
        disabled: missed.length === 0,
        onclick: () => startSession(shuffle(missed), "practice"),
      },
      `Review missed (${missed.length})`,
    );

    function eligible() {
      return QUESTIONS.filter(
        (q) => pick.patterns.has(q.pattern) && pick.types.has(q.type) && !(pick.mode === "exam" && q.type === "short"),
      );
    }

    function refreshStart() {
      const n = eligible().length;
      startBtn.textContent = `Start quiz (${Math.min(n, pick.count === 0 ? n : pick.count)} questions)`;
      startBtn.disabled = n === 0;
    }

    function onStart() {
      const pool = eligible();
      startSession(pickQuestions(pool, pick.count === 0 ? pool.length : pick.count, pick.weak), pick.mode);
    }

    function chip(label, set, key, n) {
      const b = h(
        "button",
        {
          class: "chip",
          type: "button",
          "aria-pressed": String(set.has(key)),
          "data-key": key,
          onclick: () => {
            if (set.has(key)) set.delete(key);
            else set.add(key);
            b.setAttribute("aria-pressed", String(set.has(key)));
            refreshStart();
          },
        },
        label,
        n != null ? h("span", { class: "n" }, n) : null,
      );
      return b;
    }

    function setAll(container, set, keys, on) {
      for (const k of keys) {
        if (on) set.add(k);
        else set.delete(k);
      }
      container.querySelectorAll(".chip").forEach((c) => {
        if (keys.includes(c.dataset.key)) c.setAttribute("aria-pressed", String(on));
      });
      refreshStart();
    }

    const patternSection = h("div");
    for (const g of GROUPS) {
      const keys = g.keys.filter((k) => counts[k]);
      if (!keys.length) continue;
      const chips = h("div", { class: "chips" }, keys.map((k) => chip(LABELS[k], pick.patterns, k, counts[k])));
      patternSection.append(
        h(
          "div",
          { class: "group-label" },
          g.name,
          h("button", { class: "link", type: "button", onclick: () => setAll(chips, pick.patterns, keys, true) }, "all"),
          h("button", { class: "link", type: "button", onclick: () => setAll(chips, pick.patterns, keys, false) }, "none"),
        ),
        chips,
      );
    }

    const typeChips = h("div", { class: "chips" }, Object.entries(TYPE_LABELS).map(([k, label]) => chip(label, pick.types, k)));

    const countSel = h(
      "select",
      {
        id: "count",
        onchange: (e) => {
          pick.count = Number(e.target.value);
          refreshStart();
        },
      },
      [10, 20, 40, 0].map((n) => h("option", { value: n, selected: n === pick.count }, n === 0 ? "All matching" : n)),
    );

    const modeSel = h(
      "select",
      {
        id: "mode",
        onchange: (e) => {
          pick.mode = e.target.value;
          refreshStart();
        },
      },
      h("option", { value: "practice", selected: pick.mode === "practice" }, "Practice (feedback each question)"),
      h("option", { value: "exam", selected: pick.mode === "exam" }, "Exam: results at the end"),
    );

    const weakBox = h("input", {
      type: "checkbox",
      id: "weak",
      checked: pick.weak,
      onchange: (e) => {
        pick.weak = e.target.checked;
      },
    });

    mount(
      h("h1", {}, "Design Patterns Quiz"),
      h(
        "p",
        { class: "sub" },
        `${QUESTIONS.length} questions from Head First Design Patterns` +
          (attempts ? ` · ${seenAll.length} answered · ${Math.round((right / attempts) * 100)}% accuracy` : ""),
      ),
      notice ? h("p", { class: "note" }, notice) : null,
      h("h2", {}, "Your progress"),
      progressGrid,
      h("p", { class: "legend" }, "Known = answered correctly 4 times in a row. " + storageStatus()),
      h("h2", {}, "Build a quiz"),
      h(
        "div",
        { class: "card" },
        h("div", { class: "lab" }, "Patterns"),
        patternSection,
        h("div", { class: "group-label" }, "Question types"),
        typeChips,
        h(
          "div",
          { class: "opts-grid" },
          h("div", { class: "field" }, h("label", { for: "count" }, "Number of questions"), countSel),
          h("div", { class: "field" }, h("label", { for: "mode" }, "Mode"), modeSel),
          h(
            "div",
            { class: "field" },
            h("div", { class: "lab" }, "Selection"),
            h("label", { for: "weak", style: "font-weight:400;color:inherit" }, weakBox, " Prioritize new and weak questions"),
          ),
        ),
        h("p", { class: "note" }, "Exam mode skips short-answer questions because they need self-grading."),
        h("div", { class: "actions" }, h("div", { class: "row" }, startBtn, missedBtn), h("div", { class: "row" }, h("button", { class: "link", type: "button", onclick: exportProgress }, "Export progress"), h("button", { class: "link", type: "button", onclick: importProgress }, "Import progress"), h("button", { class: "link", type: "button", onclick: resetProgress }, "Reset progress"))),
      ),
    );
    notice = "";
    refreshStart();
  }

  function resetProgress() {
    if (!confirm("Erase all saved progress in this browser?")) return;
    prog = { q: {} };
    saveProgress();
    renderHome();
  }

  // --------------------------------------------------------------------- quiz

  let session = null;

  function startSession(questions, mode) {
    if (!questions.length) {
      notice = "No questions match that selection.";
      renderHome();
      return;
    }
    session = { questions, mode, idx: 0, results: [], phase: "answering", ctrl: null, primary: null };
    renderQuestion();
  }

  function renderQuestion() {
    const s = session;
    const q = s.questions[s.idx];
    const ctrl = makeCtrl(q);
    s.ctrl = ctrl;
    s.phase = "answering";

    const feedbackSlot = h("div");
    const primary = h("button", { class: "btn primary", type: "button", onclick: onPrimary }, q.type === "short" ? "Reveal answer" : "Submit");
    primary.disabled = !ctrl.ready();
    s.primary = primary;
    ctrl.onChange = () => {
      primary.disabled = !ctrl.ready();
    };

    function finish(score) {
      s.results.push({ q, score, state: ctrl.state() });
      recordResult(q, score);
      if (s.mode === "exam") {
        advance();
        return;
      }
      s.phase = "feedback";
      feedbackSlot.append(feedbackFor(q, score));
      primary.textContent = s.idx === s.questions.length - 1 ? "Finish" : "Next";
      primary.hidden = false;
      primary.disabled = false;
    }

    function onPrimary() {
      if (s.phase === "feedback") {
        advance();
        return;
      }
      if (q.type === "short") {
        primary.hidden = true;
        ctrl.lock({ onGrade: finish });
        return;
      }
      const score = ctrl.grade();
      ctrl.lock();
      finish(score);
    }

    function advance() {
      s.idx += 1;
      if (s.idx >= s.questions.length) renderResults();
      else renderQuestion();
    }

    mount(
      h(
        "div",
        { class: "topbar" },
        h("button", { class: "btn", type: "button", onclick: () => confirm("Leave this quiz? Answers so far are saved.") && renderHome() }, "Quit"),
        h("div", { class: "progress" }, h("span", { style: `width:${(s.idx / s.questions.length) * 100}%` })),
        h("div", { class: "count" }, `${s.idx + 1} / ${s.questions.length}`),
      ),
      h(
        "div",
        { class: "card" },
        badgesFor(q),
        h("div", { class: "prompt", html: md(q.prompt) }),
        h("div", { style: "margin-top:14px" }, ctrl.el),
        feedbackSlot,
        h("div", { class: "actions" }, h("span", { class: "kbd" }, q.type === "short" ? "" : "Keys: 1–9 to choose, Enter to continue"), primary),
      ),
    );
  }

  document.addEventListener("keydown", (e) => {
    if (!session || !session.ctrl || session.idx >= session.questions.length) return;
    const tag = e.target.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Enter") {
      if (session.primary && !session.primary.disabled && !session.primary.hidden) {
        e.preventDefault();
        session.primary.click();
      }
    } else if (/^[1-9]$/.test(e.key) && session.phase === "answering" && session.ctrl.key) {
      session.ctrl.key(Number(e.key));
    }
  });

  // ------------------------------------------------------------------ results

  function renderResults() {
    const s = session;
    const total = s.results.reduce((n, r) => n + r.score, 0);
    const pct = Math.round((total / s.results.length) * 100);
    const byPattern = {};
    for (const r of s.results) {
      const p = (byPattern[r.q.pattern] = byPattern[r.q.pattern] || { n: 0, score: 0 });
      p.n += 1;
      p.score += r.score;
    }
    const missed = s.results.filter((r) => r.score < 1);

    const rows = Object.entries(byPattern)
      .sort((a, b) => a[1].score / a[1].n - b[1].score / b[1].n)
      .map(([k, p]) =>
        h("tr", {}, h("td", {}, LABELS[k]), h("td", { class: "num" }, `${p.score} / ${p.n}`), h("td", { class: "num" }, Math.round((p.score / p.n) * 100) + "%")),
      );

    const reviews = [...s.results]
      .sort((a, b) => a.score - b.score)
      .map((r) => {
        const ctrl = makeCtrl(r.q, r.state);
        ctrl.lock();
        const kind = r.score === 1 ? "good" : r.score === 0 ? "bad" : "partly";
        return h(
          "details",
          { class: "review", open: r.score < 1 },
          h("summary", {}, h("span", { class: "mark " + kind }, r.score === 1 ? "✓" : r.score === 0 ? "✗" : "~"), h("span", { html: inline(r.q.prompt.split("\n")[0]) })),
          h("div", { class: "body" }, badgesFor(r.q), h("div", { class: "prompt", html: md(r.q.prompt) }), h("div", { style: "margin-top:14px" }, ctrl.el), feedbackFor(r.q, r.score)),
        );
      });

    mount(
      h("h1", {}, s.mode === "exam" ? "Exam results" : "Quiz complete"),
      h("div", { class: "card", style: "margin-top:16px" }, h("div", { class: "score" }, pct + "%"), h("p", { class: "sub" }, `${total} of ${s.results.length} points`)),
      h("h2", {}, "By topic (weakest first)"),
      h("div", { class: "card" }, h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, "Topic"), h("th", { class: "num" }, "Score"), h("th", { class: "num" }, "%"))), h("tbody", {}, rows))),
      h("div", { class: "actions" }, h("div", { class: "row" }, h("button", { class: "btn primary", type: "button", onclick: renderHome }, "New quiz"), h("button", { class: "btn", type: "button", disabled: missed.length === 0, onclick: () => startSession(shuffle(missed.map((r) => BY_ID.get(r.q.id))), "practice") }, `Retry missed (${missed.length})`))),
      h("h2", {}, "Review"),
      reviews,
    );
  }

  syncFromServer().then(renderHome);
})();
