window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "confusable-01", pattern: "confusable", type: "mc", difficulty: 3, tags: ["compare", "trap", "inheritance-vs-composition"],
    prompt: "A reporting module has a `ReportExporter` whose export steps (open, writeHeader, writeRows, close) are the same for every format, but the way rows are serialized varies by format. A teammate says \"Template Method and Strategy solve this equally well, so pick either.\" Which statement about the **consequence** of the choice is correct?",
    options: [
      "Template Method needs an interface for the varying step, while Strategy needs an abstract base class that holds the fixed steps, so the two cannot share a skeleton.",
      "Strategy lets the fixed skeleton be reused by many formats, while Template Method cannot reuse the skeleton because every subclass must redefine the whole export sequence.",
      "With Template Method the serialization is fixed by the exporter's class, while with Strategy the same exporter object can swap serializers at runtime.",
      "Template Method is the only one of the two that lets the varying step be tested in isolation from the skeleton, because a subclass can be unit tested on its own."
    ],
    answer: 2,
    explanation: "Template Method varies the step through inheritance: the subclass you instantiate decides the behavior, so it cannot change for that object later. Strategy varies it through composition: the exporter holds a serializer reference that can be replaced at any time. The claim that Template Method needs an interface while Strategy needs an abstract base class swaps the two patterns' mechanisms (Strategy uses an interface, Template Method an abstract class). The claim that Strategy reuses the skeleton while Template Method cannot is backwards: the skeleton is exactly what Template Method reuses. The claim that only Template Method allows isolated testing is wrong because a Strategy object is the easiest thing to test in isolation. The trade-off: Template Method gives tighter reuse of the skeleton with less indirection, Strategy gives runtime flexibility and avoids a subclass per variant.",
    ref: "Ch. 8 Template Method"
  },
  {
    id: "confusable-02", pattern: "confusable", type: "mc", difficulty: 3, tags: ["compare", "trap"],
    prompt: "A parcel locker kiosk object behaves differently depending on whether it is `Idle`, `AwaitingPin`, `Dispensing`, or `OutOfService`. Code for both Strategy and State would show a context holding a reference to an object with the same interface. What most reliably tells you this is State rather than Strategy?",
    options: [
      "The behavior object is created with `new` inside the context rather than being passed in by the client, since a State object is always owned by its context.",
      "The behavior objects hold no per-context instance data, so one instance of each can be shared by every context, which Strategy objects can never do.",
      "The behavior objects themselves decide when the context moves to a different behavior object, and the client usually does not choose it.",
      "The context delegates its main method to the behavior object, which may call back into the context to read or change the context's data."
    ],
    answer: 2,
    explanation: "In State the transitions are driven from inside: a state handles an event and tells the context which state comes next, so the context appears to change class. In Strategy the client (or setup code) picks the algorithm and it normally stays put unless the client replaces it. Delegation with callbacks into the context is common to both. Whether the object is created inside the context or passed in is an implementation detail that varies in both patterns. Stateless sharing is possible for both too, and the book even notes states can be shared when they hold no per-context data.",
    ref: "Ch. 10 State"
  },
  {
    id: "confusable-03", pattern: "confusable", type: "mc", difficulty: 3, tags: ["compare", "trap"],
    prompt: "Both a Decorator and a Proxy hold a reference to an object with the same interface and forward calls to it. A `LazyImage` forwards `render()` to a `HighResImage` it creates only on the first call. A `Logged` class forwards `render()` to a `HighResImage` passed to its constructor and prints a log line first. Which classification is right and why?",
    options: [
      "Both are Decorators, because each wraps an object of the same interface and adds behavior around the delegated call, which is all a Decorator requires.",
      "`LazyImage` is a Decorator (it adds lazy loading); `Logged` is a Proxy (it intercepts calls and records them before forwarding to the real subject).",
      "Both are Proxies, because a Decorator must present a different interface from the one it wraps, and each of these classes adds an access concern.",
      "`LazyImage` is a Proxy (it controls access and manages the real subject's lifecycle); `Logged` is a Decorator (it adds a responsibility to a component it is given)."
    ],
    answer: 3,
    explanation: "The distinction is intent and who controls the wrapped object. A Proxy stands in for the real subject and controls access to it (lazy creation, remote access, protection), often creating or locating the subject itself. A Decorator is handed an existing component and adds responsibilities, and Decorators are designed to be stacked in any combination. Calling both Decorators ignores that distinction, and calling `LazyImage` a Decorator and `Logged` a Proxy swaps the labels. The claim that a Decorator must present a different interface is false: Decorators keep the same interface (it is Adapter that changes it).",
    ref: "Ch. 11 Proxy / Ch. 3 Decorator"
  },
  {
    id: "confusable-04", pattern: "confusable", type: "match", difficulty: 3, tags: ["compare", "trap"],
    prompt: "Match each pattern to what it does to the interface the client sees.",
    pairs: [
      ["Adapter", "Converts an existing interface into a different one the client expects"],
      ["Facade", "Offers a new, simpler interface over several subsystem classes"],
      ["Decorator", "Keeps the same interface and adds responsibilities"],
      ["Proxy", "Keeps the same interface and controls access to the real object"]
    ],
    explanation: "Adapter changes an interface so incompatible classes can work together. Facade does not convert one interface to another; it defines a new simplified one over many classes (and the subsystem stays directly accessible). Decorator and Proxy both preserve the interface, which is why they are easy to confuse: Decorator adds behavior (and is stackable), Proxy gates or defers access. Telling the first three apart is mostly about what happens to the interface: converted, simplified, or unchanged.",
    ref: "Ch. 7 Adapter and Facade"
  },
  {
    id: "confusable-05", pattern: "confusable", type: "multi", difficulty: 3, tags: ["compare", "pros-cons"],
    prompt: "A UI toolkit must build matching widget sets per platform (`WinButton` with `WinCheckbox`, `MacButton` with `MacCheckbox`). Choose the **two** statements that are true when comparing a single Factory Method with an Abstract Factory here.",
    options: [
      "Abstract Factory guarantees the button and checkbox created together belong to the same family; separate Factory Methods on unrelated creators do not.",
      "Adding a new product type such as `Slider` is easy with Abstract Factory, because the new method is added in one place and no existing concrete factory has to change.",
      "Abstract Factory is typically implemented as a group of factory methods, often one per product type.",
      "Factory Method relies on object composition (the client is handed a creator object), while Abstract Factory relies on inheritance (a subclass decides what to create).",
      "Abstract Factory is chosen when only one product needs to vary independently of the creator that uses it, with no need for related products to match."
    ],
    answer: [0, 2],
    explanation: "Guaranteeing that the button and checkbox belong to the same family is the point of Abstract Factory: consistency across a family. It is also true that each createX method in an Abstract Factory is itself a factory method. The claim that adding `Slider` is easy is wrong, and it is the known weakness: adding a product type changes the abstract interface, so every concrete factory must change. The claim about composition versus inheritance has it reversed: Factory Method uses inheritance (a subclass decides what to create) while Abstract Factory uses composition (the client is handed a factory object). The claim about one product varying independently describes a single Factory Method; Abstract Factory is for families.",
    ref: "Ch. 4 Factory patterns"
  },
  {
    id: "confusable-06", pattern: "confusable", type: "multi", difficulty: 3, tags: ["compare", "trap"],
    prompt: "A menu tree (`Menu` containing `MenuItem`s and sub-`Menu`s) must be printed with a vegetarian filter. Choose the **two** statements that correctly describe how Iterator and Composite relate here.",
    options: [
      "Composite models the part-whole structure; Iterator supplies a way to walk it without exposing its representation.",
      "Using an Iterator on the tree removes the need for `MenuItem` and `Menu` to share a component interface, since the iterator already hides which kind of node it returns.",
      "A tree traversal needs a stack of iterators or similar, because each `Menu` iterator may yield children that are themselves menus.",
      "An external iterator over a Composite can simply reuse the flat `ArrayList` iterator of each menu, since the tree is stored in lists and each list is already iterable.",
      "Iterator is a structural pattern and Composite is a behavioral pattern, which is why Iterator is applied on top of the tree that Composite builds."
    ],
    answer: [0, 2],
    explanation: "They solve different problems and cooperate: Composite builds the tree, Iterator traverses it. The book's CompositeIterator keeps a stack of iterators because a child can itself be a composite whose children must be visited before moving on. The claim that an Iterator removes the need for a shared component interface is wrong: that interface is what lets clients treat leaves and composites uniformly, and an Iterator does not replace it. The claim that each menu's flat list iterator can be reused is wrong: a list iterator only walks one level and would not descend into sub-menus. The claim that Iterator is structural and Composite behavioral swaps the categories: Iterator is behavioral, Composite is structural.",
    ref: "Ch. 9 Iterator and Composite"
  },
  {
    id: "confusable-07", pattern: "confusable", type: "mc", difficulty: 3, tags: ["compare", "trap"],
    prompt: "A print-job system must queue work, retry it later on another worker, and support cancel. Each queued item records the document and the printer to act on. Another part of the system sorts a document list using one of several interchangeable comparison rules. Which assignment of patterns is correct?",
    options: [
      "Queued jobs are Strategies, because the queue chooses which algorithm each worker runs; sort rules are Commands, because each rule is invoked as a unit of work.",
      "Queued jobs are Commands (a request bound to its receiver); sort rules are Strategies (interchangeable ways to do the same task).",
      "Both are Commands, because both are objects with a single method that a caller invokes without knowing what the method actually does.",
      "Both are Strategies, because both encapsulate behavior behind an interface that the calling code can swap at runtime."
    ],
    answer: 1,
    explanation: "A Command packages a request: it binds a receiver and an action so the request can be queued, logged, retried, or undone, and it is typically invoked once as a unit of work. A Strategy is an interchangeable algorithm for one task inside a context that stays in control. A single-method interface (the two \"both\" options) is not the test; the same shape fits both, so the intent decides. Calling queued jobs Strategies and sort rules Commands swaps them.",
    ref: "Ch. 6 Command / Ch. 1 Strategy"
  },
  {
    id: "confusable-08", pattern: "confusable", type: "short", difficulty: 3, tags: ["compare", "trap"],
    prompt: "A UI button needs to notify three independent widgets when clicked, and separately a toolbar button needs to run one undoable action on a document. Both could be described as \"callbacks\". Explain which of these is Observer and which is Command, and what differs in how the callback is modeled.",
    modelAnswer: "The three widgets are Observer: one subject, a one-to-many notification, observers register and unregister at runtime and each decides for itself what to do with the state change. The toolbar action is Command: the callback is an object that binds a receiver (the document) and an action, so it can be stored in a history and undone. Observer callbacks announce that something happened to any interested party; a Command is a request to do one specific thing to one specific receiver.",
    keyPoints: [
      "Observer: one-to-many notification of a state change, with dynamic registration",
      "Observers do not know about each other and choose their own reaction",
      "Command: request object bound to a receiver, one action",
      "Command supports queueing, logging, and undo; Observer does not"
    ],
    explanation: "Observer and Command both look like callbacks (Java's Swing listener is arguably both). The distinction is intent: Observer decouples a subject from an open-ended set of listeners that care about changes; Command decouples an invoker from the receiver and turns the request itself into an object you can undo or queue.",
    ref: "Ch. 2 Observer / Ch. 6 Command"
  },
  {
    id: "confusable-09", pattern: "confusable", type: "multi", difficulty: 3, tags: ["compare", "trap"],
    prompt: "A team replaces `ConfigRegistry` (a Singleton) with a class containing only static methods and static fields, saying \"it is the same thing\". Choose the **two** capabilities the Singleton had that the static class loses.",
    options: [
      "It can implement an interface, so callers can depend on the abstraction and a test can substitute a different implementation.",
      "It can hold per-instance state in fields, because a class with only static members is not allowed to declare fields.",
      "It can extend a base class and override its methods, which gives polymorphic behavior; static methods are only hidden, never overridden.",
      "It can be initialized lazily on first use, because a class of static members is always initialized when the JVM starts.",
      "It is automatically thread-safe, because the JVM serializes access to the single instance.",
      "It can keep its state private, while a class of static members must expose its fields to callers."
    ],
    answer: [0, 2],
    explanation: "A Singleton is still an object, so it can implement interfaces, extend a base class, override methods, and be passed as a parameter. Static methods cannot implement interface methods and are not polymorphic. A static class can hold (and hide) state in static fields, so the claims that it cannot hold per-instance state and that it cannot keep its state private are false. Java also initializes a class on first use, not at startup, so laziness is not lost. Neither approach is automatically thread-safe: the Singleton needs synchronization or an eager/holder idiom.",
    ref: "Ch. 5 Singleton"
  },
  {
    id: "confusable-10", pattern: "confusable", type: "mc", difficulty: 3, tags: ["compare", "trap"],
    prompt: "In a document editor, an abstract `Document` has a concrete method `open()` that calls an abstract `createPage()` and then `layout()`. Subclasses override `createPage()`. A reviewer says this is a Factory Method, another says Template Method. Who is right?",
    options: [
      "Both: `open()` is a template method, and the abstract step `createPage()` it calls is a factory method.",
      "Only the Template Method reviewer, because a Factory Method must be a static method on a separate factory class that clients call instead of using `new`.",
      "Only the Factory Method reviewer, because `createPage()` returns an object, and that alone is what makes a method a factory method.",
      "Neither: this is Abstract Factory, because the class has a group of related methods that together produce the objects its subclasses need."
    ],
    answer: 0,
    explanation: "Factory Method is often a specialization of Template Method in which the deferred step is object creation: the creator's concrete method (the template) uses a product whose class a subclass chooses. Both descriptions apply to different methods of the same class. A Factory Method does not need to be static or live on a separate class (the claim that it must be static on a separate factory class confuses it with the Simple Factory idiom). Returning an object alone is not enough (the claim that this alone makes a factory method ignores the algorithm skeleton around it). Abstract Factory is about families of products created through an object, not an abstract creator's single deferred step.",
    ref: "Ch. 4 Factory Method / Ch. 8 Template Method"
  },
  {
    id: "confusable-11", pattern: "confusable", type: "mc", difficulty: 3, tags: ["compare", "trap"],
    prompt: "`FancyShape` implements `Shape`, holds a `Shape` field, and its `draw()` draws a border and then calls `draw()` on the held shape. `Group` implements `Shape`, holds a `List<Shape>`, and its `draw()` calls `draw()` on each element. Which statement is most accurate?",
    options: [
      "`Group` is a Decorator, because it forwards the same call to every component it wraps, which is the defining behavior of a Decorator.",
      "Both are Composites, because both implement the same interface as the objects they hold and delegate `draw()` to them.",
      "`FancyShape` is a Decorator and `Group` a Composite; the difference is intent (adding behavior versus aggregating), not structure.",
      "`FancyShape` is a Composite with a single child, so the two classes are the same pattern and only the number of children differs."
    ],
    answer: 2,
    explanation: "Structurally they look alike: both implement the component interface and hold components of that interface. A Decorator wraps one component to add behavior and is typically stacked; a Composite holds a collection of children to treat a group as a single object. A Composite with a single child is a degenerate case, not a Decorator, because the intent is aggregation. Calling both Composites or both the same pattern ignores intent, and `Group` has no behavior it adds of its own, so it is not a Decorator.",
    ref: "Ch. 3 Decorator / Ch. 9 Composite"
  },
  {
    id: "confusable-12", pattern: "confusable", type: "mc", difficulty: 3, tags: ["compare", "trap", "inheritance-vs-composition"],
    prompt: "A `SimpleReportFactory` has a method `static Report create(String kind)` with an `if/else` that returns `new PdfReport()` or `new CsvReport()`. A `ReportService` abstract class instead has an abstract `createReport()` that its subclasses override, and its concrete `run()` calls `createReport()`. What is the key difference?",
    options: [
      "The Simple Factory defers the choice of product to subclasses, while the `ReportService` version centralizes the choice in one class that clients call.",
      "The Simple Factory cannot return different concrete types from one method, but a Factory Method can because its return type is an abstract class.",
      "The Simple Factory is one of the 23 GoF patterns and the Factory Method is only an idiom, so the Simple Factory suits framework code better.",
      "Simple Factory centralizes `new` in one class and is extended by editing it; Factory Method lets each subclass pick the product the creator's own code uses."
    ],
    answer: 3,
    explanation: "The Simple Factory (the book calls it more of an idiom than a pattern) moves the `new` and the conditional into one class so clients stop depending on concrete types, but adding a type means editing that class. In Factory Method the creator's own code (`run()`) works with the abstract product while subclasses decide which one, so the decision is made by subclass choice, and adding a product means adding a subclass. The claim that the Simple Factory defers the choice to subclasses swaps the two. The claim that a Simple Factory cannot return different concrete types is false: it returns whatever concrete type it wants. The claim that the Simple Factory is the GoF pattern is backwards: Factory Method is the GoF pattern; the Simple Factory is the idiom.",
    ref: "Ch. 4 Factory Method"
  }
);
