window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "smells-01", pattern: "smells", type: "mc", difficulty: 3, tags: ["smell", "trap", "compare"],
    prompt: "A notification service has this code, and a new channel is added every quarter. The channel for a `Notification` is chosen once when it is created and never changes.\n\n```java\nvoid send(Notification n) {\n  if (n.channel.equals(\"sms\")) { /* 30 lines */ }\n  else if (n.channel.equals(\"email\")) { /* 40 lines */ }\n  else if (n.channel.equals(\"push\")) { /* 25 lines */ }\n}\n```\n\nWhich fix is most appropriate, and why is the tempting alternative wrong?",
    options: [
      "Strategy: each channel becomes a `ChannelSender`; State is wrong because nothing here transitions between channels.",
      "State, because the behavior depends on a field of the object, and moving each branch into a state class removes the conditional from `send`.",
      "Template Method, because all channels share the \"send\" operation, so a base class can hold the common steps and each channel overrides the differing part.",
      "Observer, because several channels receive the same notification, so each channel registers with the notification and reacts when it is sent."
    ],
    answer: 0,
    explanation: "The branches select among interchangeable algorithms for one task, fixed at creation, which is Strategy. State would also remove an if/else, but it models behavior that changes as the object moves through conditions, with transitions between them; here there are none. Template Method would require a subclass of the notification per channel (or of the service), fixing the choice at class level and multiplying subclasses. Observer is about broadcasting one change to many listeners; here exactly one channel handles each notification.",
    ref: "Ch. 1 Strategy"
  },
  {
    id: "smells-02", pattern: "smells", type: "mc", difficulty: 3, tags: ["smell", "inheritance-vs-composition"],
    prompt: "A smoothie app has `Smoothie`, `SmoothieWithProtein`, `SmoothieWithProteinAndOat`, `SmoothieWithOatAndSoy`, and so on: a new class for every combination of add-ins, and prices are hard-coded in each. A new add-in doubles the number of classes. Which pattern removes the explosion, and what does it cost?",
    options: [
      "Template Method: a base `Smoothie` holds the common steps and each add-in overrides one, at the cost of a deeper hierarchy with more subclasses.",
      "Composite: add-ins are leaves in a tree under the base drink, at the cost of a restricted interface because add-ins cannot be nested.",
      "Abstract Factory: a factory builds each combination on demand, at the cost of a larger factory interface for every new add-in.",
      "Decorator: each add-in wraps the base drink and adds its own cost, at the price of many small objects and order-sensitive wrapping."
    ],
    answer: 3,
    explanation: "A class per combination is the signature of using inheritance to add optional responsibilities. Decorator adds them at runtime by wrapping, so N add-ins need N classes, not 2^N, and the same interface lets wrapped drinks be used anywhere a drink is expected. The cost is more objects and the fact that type checks on the concrete drink break. Template Method would deepen the hierarchy rather than reduce it. Composite models trees, not optional behavior on one object. Abstract Factory could create the combinations but would not remove the need for a class per combination.",
    ref: "Ch. 3 Decorator"
  },
  {
    id: "smells-03", pattern: "smells", type: "tf", difficulty: 3, tags: ["smell", "trap", "compare"],
    prompt: "True or false: a `ReportService` creates one product, a database connection, with `new MySqlConnection()` in 14 places, and the team wants to support Postgres next. Because only one product varies, an Abstract Factory would add no consistency benefit over a Factory Method or simple factory here; that benefit comes from sets of related products that must match.",
    answer: true,
    explanation: "True. There is a single product that varies, with no family of related objects that must stay consistent, so Abstract Factory (a factory interface with several create methods) is more machinery than needed. A simple factory or a Factory Method, or just dependency injection of a `Connection`-producing object, is enough. Abstract Factory earns its complexity when you must create sets of related products (for example connection, command, and reader for the same database) that must not be mixed.",
    ref: "Ch. 4 Abstract Factory"
  },
  {
    id: "smells-04", pattern: "smells", type: "short", difficulty: 3, tags: ["smell", "trap", "compare"],
    prompt: "A checkout controller directly calls `InventoryClient`, `PricingEngine`, `TaxCalculator`, `FraudScreen`, and `PaymentGateway` in a fixed sequence, and three other controllers repeat the same sequence. A colleague suggests an Adapter. Name the better pattern and explain why Adapter is the wrong choice.",
    modelAnswer: "Facade: define one `OrderPlacement` class with a simple `place(order)` method that runs the five calls, so controllers depend on one class instead of five subsystems and the duplicated sequence lives in one place. Adapter is wrong because none of these classes has an interface the client cannot use; the problem is too many classes and too much knowledge of them, not an incompatible interface. A Facade does not convert an interface, it simplifies access.",
    keyPoints: [
      "Facade: one simplified entry point over many subsystem classes",
      "Removes duplicated orchestration and reduces what controllers know",
      "Adapter converts one interface to another that the client expects",
      "No interface mismatch exists here"
    ],
    explanation: "The symptom is a client coupled to many classes (a Least Knowledge violation) rather than a mismatch between two interfaces. The subsystem classes remain available for callers who need finer control, which is a normal property of Facade.",
    ref: "Ch. 7 Facade"
  },
  {
    id: "smells-05", pattern: "smells", type: "multi", difficulty: 3, tags: ["smell", "trap"],
    prompt: "A report class prints a `List<Task>` with an indexed `for` loop in one method and a `TaskBoard[]` (an array of arrays) with nested `for` loops in another. A new `LinkedTaskStore` is coming. Choose the **two** accurate statements about the fix.",
    options: [
      "Introduce an Iterator for each store so the report calls `hasNext()` and `next()` regardless of the underlying structure.",
      "Composite is the right fix, because there are several collections of tasks and the report should treat them as one group.",
      "Adding `LinkedTaskStore` then requires no changes to the printing code as long as it returns an Iterator.",
      "The report should be changed to extend each store, so that it can iterate over the internal structure directly and efficiently.",
      "Singleton is needed so that only one iterator exists for all stores and the traversal state is shared between them."
    ],
    answer: [0, 2],
    explanation: "Duplicated traversal code that knows each collection's representation is the Iterator smell: encapsulate the traversal so the client is written once against `Iterator`. Composite applies when elements are in a part-whole hierarchy and leaves and groups must be treated uniformly; flat collections of the same kind are not that. Extending each store would couple the report to every representation through inheritance. A single iterator instance (the Singleton suggestion) would break traversal, because each traversal needs its own state.",
    ref: "Ch. 9 Iterator"
  },
  {
    id: "smells-06", pattern: "smells", type: "mc", difficulty: 3, tags: ["smell", "trap", "compare"],
    prompt: "A `Subscription` class has a `status` field (`TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELLED`), and every method (`renew()`, `cancel()`, `pause()`, `refund()`) begins with a `switch (status)` and sometimes assigns a new `status`. Which fix is right, and what is its cost?",
    options: [
      "Strategy: one `RenewalStrategy` chosen by the client for each subscription, with the client updating the status when a change is needed.",
      "State: one class per status, each deciding the next state; the cost is more classes and transition logic spread across them.",
      "Decorator: wrap `Subscription` with one wrapper per status, so each wrapper adds the behavior for that status on top of the base subscription.",
      "Observer: each status object registers with the subscription and is notified when the status changes, so it can react to the change."
    ],
    answer: 1,
    explanation: "Every method switching on the same field, with assignments that move between values, is the State smell: behavior depends on condition and the object transitions through it. State localizes each status's behavior and transitions in one class; the cost is more classes and that the full transition map is no longer visible in one place. Strategy would leave the client managing transitions, which the switches currently do for it. Decorator adds optional responsibilities and has no notion of the object's current condition. Observer notifies listeners; it does not select behavior.",
    ref: "Ch. 10 State"
  }
);
