# Design Patterns Quiz

A self-contained quiz for solidifying knowledge of the patterns in *Head First Design Patterns* (Freeman & Robson). Open `index.html` in a browser. No build step, no server.

## Running and saving progress

- **Saved to a file (recommended):** run `node serve.mjs --open` in this folder. Progress is written to `progress.json` next to the quiz (gitignored), so you can close the browser, restart, or switch browsers and continue. The server listens on `localhost` only. Set `PORT` to change the port.
- **Browser only:** open `index.html` directly. Progress lives in that browser's localStorage. Use "Export progress" and "Import progress" on the home page to move it between browsers or back it up.
- The first time you start the server, existing browser progress is copied into `progress.json`.

## Files

- `index.html`, `style.css`, `app.js` — the quiz app
- `data/*.js` — the question bank, one file per pattern or cross-pattern topic; each file pushes onto `window.QUIZ_QUESTIONS`
- `validate.mjs` — schema and quality checks for the question bank: `node validate.mjs`

## Adding questions

Create or edit a file in `data/`, add its `<script>` tag to `index.html` (and to `validate.mjs`'s file list if it is not auto-discovered), then run `node validate.mjs`.

```js
window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  { id: "strategy-01", pattern: "strategy", type: "mc", difficulty: 3, /* ... */ },
);
```

## Question schema

Common fields (all types):

| Field | Meaning |
|---|---|
| `id` | Unique, `<pattern>-NN`, e.g. `strategy-01` |
| `pattern` | One of the pattern keys below |
| `type` | `mc`, `multi`, `tf`, `match`, `order`, `short` |
| `difficulty` | `2` (medium) or `3` (hard). No `1`: easy questions are not allowed |
| `tags` | One or more of: `what-is`, `when-to-use`, `structure`, `inheritance-vs-composition`, `interface-vs-abstract`, `pros-cons`, `compare`, `spot-the-bug`, `principles`, `smell`, `real-api`, `participants`, `flow`, `trap` |
| `prompt` | The question text. Supports `` `inline code` ``, `**bold**`, and fenced ```` ```java ```` blocks |
| `explanation` | Required for every type except `short` (where `modelAnswer` serves). Why the answer is right and why the tempting wrong answers are wrong |
| `ref` | Optional. Book reference, e.g. `"Ch. 8 Template Method"` |

Type-specific fields:

| Type | Fields |
|---|---|
| `mc` | `options`: 3-5 strings. `answer`: index of the one correct option |
| `multi` | `options`: 4-6 strings. `answer`: array of correct indices (2 or more, not all) |
| `tf` | `answer`: `true` or `false` |
| `match` | `pairs`: 4-6 `[left, right]` arrays. The app shuffles the right column |
| `order` | `items`: strings in the correct order. The app shuffles them |
| `short` | `modelAnswer`: string. `keyPoints`: 2-5 strings the learner self-checks against |

Pattern keys: `strategy`, `observer`, `decorator`, `factory-method`, `abstract-factory`, `singleton`, `command`, `adapter`, `facade`, `template-method`, `iterator`, `composite`, `state`, `proxy` (14 chapter patterns), plus cross-pattern keys `confusable`, `principles`, `smells`, `jdk`, `compound`.

## Quality rules

1. **Not too easy.** If someone who skimmed the chapter could answer without thinking, rewrite it. A true/false question like "Singleton ensures one instance" is rejected. Test the subtle consequence instead (for example, what double-checked locking needs `volatile` for).
2. **One defensible answer.** If a knowledgeable reader could argue for two options, rewrite it.
3. **Plausible distractors.** Wrong options are real misconceptions or answers that are right for a neighboring pattern. No joke options.
4. **No tells.** No "all of the above" or "none of the above". Vary the correct answer's position and length. The correct option is not always the longest.
5. **Fresh domains** for about half the questions (not only the book's duck, pizza, and gumball stories). The other half may use book scenarios.
6. **Java code** must be valid and minimal. Use book terminology (`Subject`/`Observer`, `Component`/`Decorator`, `Invoker`/`Receiver`, `Context`/`State`, and so on).
7. **No positional references.** The app shuffles options, so never write "Option 2", "the first option", or "the last option". Quote or paraphrase the option's content instead.
8. `explanation` names the pattern's intent and, for confusable pairs, what separates it from the neighbor.
