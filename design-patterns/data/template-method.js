window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "template-method-01",
    pattern: "template-method",
    type: "mc",
    difficulty: 3,
    tags: ["inheritance-vs-composition", "compare", "when-to-use"],
    prompt:
      "An `ExportJob` base class defines a final `run()` that calls abstract `readRows()` and `format(rows)` steps; `CsvExportJob` and `JsonExportJob` subclass it. A new requirement says the same running `ExportJob` object must switch from CSV to JSON output while it is processing a long job. What does that tell you?",
    options: [
      "Add a setter on `ExportJob` that swaps which subclass's `format` implementation is used while `run()` is already executing",
      "Make `run()` non-final so the object can change class at runtime and pick up the other subclass's `format` method",
      "Make `format` a hook with an empty default, so subclasses can opt out and a second subclass can take over mid-run",
      "Template Method fixes variation at class level, so you need composition (Strategy) for the formatting step"
    ],
    answer: 3,
    explanation:
      "In Template Method the variable steps are chosen by the subclass, so an object's behavior is set when it is created and cannot change without creating a different object. When variation must change at runtime, composition fits: give `ExportJob` a `Formatter` Strategy that can be replaced. A setter that swaps subclass behavior is impossible, since the class of an object cannot change. Dropping `final` does not make an object change class, and a hook with an empty default does not allow switching. The trade-off: Template Method is simpler and reuses the shared skeleton, but is less flexible than Strategy.",
    ref: "Ch. 8 Template Method vs Strategy"
  },
  {
    id: "template-method-02",
    pattern: "template-method",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "structure"],
    prompt:
      "In a document editor, an abstract `Application.openDocument()` calls the abstract method `createDocument()` and then `doc.open()`. Subclasses such as `SpreadsheetApp` implement `createDocument()`. How are Factory Method and Template Method related here?",
    options: [
      "They are unrelated: Factory Method is creational and Template Method is behavioral, so a single class cannot use both at once",
      "Factory Method is typically one deferred step inside a template method: `openDocument()` owns the algorithm and calls the abstract `createDocument()`, which subclasses implement",
      "Template Method is a special case of Factory Method in which every step of the algorithm is itself a method that creates an object",
      "They are the same mechanism under two names, and the only difference is whether the abstract method happens to be named `create...`"
    ],
    answer: 1,
    explanation:
      "A Factory Method is often a primitive operation inside a template method: the superclass algorithm (`openDocument`) calls a deferred creation step that subclasses implement, and the base class never learns the concrete type. Their categories differ, but patterns frequently combine, so 'cannot use both' is wrong. The reverse relationship and the 'same pattern' options are wrong: Template Method is about a whole algorithm skeleton with varying steps, and Factory Method is about which object gets created.",
    ref: "Ch. 8 Template Method, Ch. 4 Factory Method"
  },
  {
    id: "template-method-03",
    pattern: "template-method",
    type: "tf",
    difficulty: 3,
    tags: ["real-api", "trap"],
    prompt:
      "True or false: `Arrays.sort(Object[])` is a textbook Template Method, because the sort algorithm is fixed in the sort method and subclasses supply `compareTo`.",
    answer: false,
    explanation:
      "False. The book points out that `Arrays.sort()` follows the spirit of Template Method (a fixed algorithm with one step supplied by the caller's objects), but it is not the classic form: it is a static utility, and what varies is not provided by subclassing a superclass that calls its own abstract methods. The elements implement `Comparable`, and the sort calls `compareTo` on them, which is closer to using composition with a callback (Strategy). Classic Template Method needs inheritance, with the template method defined in a superclass that invokes overridden subclass methods.",
    ref: "Ch. 8 Template Method (sorting with Template Method)"
  },
  {
    id: "template-method-04",
    pattern: "template-method",
    type: "match",
    difficulty: 3,
    tags: ["participants", "structure"],
    prompt:
      "An abstract `ReportGenerator` has these members. Match each member to its role in Template Method.",
    pairs: [
      ["`public final void generate()` calling the steps below in order", "Template method"],
      ["`protected abstract String fetchData()`: every subclass must implement it", "Primitive (abstract) operation"],
      ["`protected void archive() { }`: empty by default, optionally overridden", "Hook"],
      ["`private void writeHeader()`: the same for all subclasses", "Concrete operation"],
      ["`protected boolean includeSummary() { return true; }`: `generate()` tests it before a step", "Conditional hook"]
    ],
    explanation:
      "The template method defines the algorithm skeleton and is usually final so subclasses cannot reorder it. Primitive operations are abstract steps subclasses must supply. A hook is a concrete method (often empty) that subclasses may override. A concrete operation is shared implementation in the superclass, and could be private or final. A conditional hook returns a value the template uses to decide whether a step runs. The distinguishing question for hooks vs abstract methods: is the step required (abstract) or optional (hook)?",
    ref: "Ch. 8 Template Method (hooks)"
  },
  {
    id: "template-method-05",
    pattern: "template-method",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "trap"],
    prompt:
      "```java\nabstract class Exporter {\n  Exporter() { init(); }\n  protected abstract void init();\n  public final void export() { /* uses init's result */ }\n}\n\nclass CsvExporter extends Exporter {\n  private final java.util.List<String> columns = new java.util.ArrayList<>();\n  @Override protected void init() { columns.add(\"id\"); }\n}\n\nnew CsvExporter();\n```\n\nWhat happens, and why?",
    options: [
      "A `NullPointerException`: `Exporter()` runs `init()` before `CsvExporter`'s field initializers, so `columns` is still null",
      "It works: `columns` is final, so it is initialized at class load time before any constructor runs, and `init()` sees an empty list",
      "A compile error, because an abstract class cannot declare a constructor and a constructor may not call an abstract method",
      "`columns` contains \"id\" afterwards, because `CsvExporter`'s field initializers run before the superclass constructor body"
    ],
    answer: 0,
    explanation:
      "Java constructs a subclass object by running the superclass constructor first and subclass field initializers afterwards. When `Exporter()` calls the overridden `init()`, dispatch goes to `CsvExporter.init()`, but `columns` has not been assigned yet, so `columns.add` throws a NullPointerException. Calling overridable steps from a constructor is a trap for Template Method: the hook runs on an incompletely initialized subclass. Move the call into a normal method that is invoked after construction (for example, the template method itself). Abstract classes can have constructors, and `final` instance fields are not initialized at class load time.",
    ref: "Ch. 8 Template Method"
  },
  {
    id: "template-method-06",
    pattern: "template-method",
    type: "short",
    difficulty: 3,
    tags: ["pros-cons", "principles", "smell"],
    prompt:
      "Template Method is called an application of the Hollywood Principle. State what that principle means here, and give two risks of using Template Method with a deep or large inheritance hierarchy.",
    modelAnswer:
      "Hollywood Principle: 'Don't call us, we'll call you.' The high-level superclass owns the algorithm and calls the low-level subclass steps when it decides to, so subclasses never call the template method's steps in their own order and dependencies point from subclasses to the superclass. Risks: (1) subclasses are tightly coupled to the superclass, including assumptions about call order and hook semantics, so changing the base class can break many subclasses (fragile base class); (2) too many abstract steps or hooks force subclasses to write boilerplate and make the skeleton hard to understand, and variation along more than one axis multiplies subclasses, in which case composition (Strategy) is a better fit.",
    explanation:
      "The Hollywood Principle says high-level components call low-level ones, not the reverse; Template Method applies it because the superclass drives the algorithm and calls subclass steps. The cost is inheritance coupling: subclasses depend on the superclass call order and hook semantics, which is why composition is often chosen for wide variation.",
    keyPoints: [
      "Hollywood Principle: the high-level class calls the low-level subclass, not the reverse",
      "Fragile base class: subclasses depend on call order and hook semantics of the superclass",
      "Many abstract steps cause boilerplate and subclass explosion",
      "Prefer composition (Strategy) when variation is on several axes or must change at runtime"
    ],
    ref: "Ch. 8 Template Method, Hollywood Principle"
  }
);
