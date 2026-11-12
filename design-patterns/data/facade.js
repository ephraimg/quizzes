window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "facade-01",
    pattern: "facade",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "structure"],
    prompt:
      "A `ChatRoom` object receives messages from `User` objects and forwards each message to the other users; users hold a reference to the `ChatRoom` and send everything through it. An `OrderFacade` wraps inventory, billing and shipping classes behind `placeOrder()`. What is the structural difference between the two central objects?",
    options: [
      "None: both give clients one simplified entry point in place of many objects, so both are Facades and differ only in how many classes sit behind them",
      "Subsystem classes never reference the facade and calls flow one way; the chat room's colleagues hold a reference to it and talk through it in both directions",
      "The chat room is the Facade over the users, while `OrderFacade` is really a Mediator, because it coordinates the order in which the services are called",
      "The facade adds new behavior of its own on top of the subsystem, whereas the chat room only relays each message unchanged and contains no logic"
    ],
    answer: 1,
    explanation:
      "The chat room is a Mediator: colleagues hold a reference to it, send requests to it, and it calls back into them, so communication is two-way and the mediator centralizes interaction between peers. A Facade offers a simplified entry point; the subsystem classes are unaware of it and keep working without it, so dependencies run from facade to subsystem only. `OrderFacade` is not a Mediator even though it sequences calls: the services never talk back through it. And a facade can contain coordination logic, so 'adds behavior vs relays' does not separate them. The distinction is intent and direction of knowledge, not that both are a 'central class'.",
    ref: "Ch. 7 Facade (compare to Mediator, GoF)"
  },
  {
    id: "facade-02",
    pattern: "facade",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "what-is"],
    prompt:
      "A class `ReportGateway` wraps a single large class, `LegacyReportEngine` (about 40 methods), and exposes just three methods: `monthlySummary()`, `export(Format)` and `schedule(Cron)`. It is not made to match any interface the client already expects. Which pattern is it?",
    options: [
      "Facade, because its purpose is to give a simpler interface; the number of wrapped classes does not matter",
      "Adapter, because it wraps a legacy class and exposes different method names than the original does",
      "Decorator, because it wraps a single object and forwards calls to it while changing what the client can call",
      "Proxy, because it stands between the client and the engine and controls which of its methods can be reached"
    ],
    answer: 0,
    explanation:
      "Intent decides the pattern, not the count of wrapped classes. A Facade simplifies a complex interface (even one class with a large surface); an Adapter converts an interface into one the client already expects, and there is no such target here. A Decorator keeps the same interface and adds behavior, and a Proxy keeps the same interface and controls access. `ReportGateway` has a new, smaller interface that is not meant to satisfy an existing contract, so it is a Facade. The common mistake is to say 'Facade wraps many, Adapter wraps one'.",
    ref: "Ch. 7 Facade vs Adapter"
  },
  {
    id: "facade-03",
    pattern: "facade",
    type: "tf",
    difficulty: 2,
    tags: ["pros-cons", "trap"],
    prompt:
      "True or false: adding a Facade in front of a subsystem does not by itself stop clients from calling the subsystem classes directly when they need finer control.",
    answer: true,
    explanation:
      "True. A Facade provides a convenient entry point but does not hide or seal the subsystem; the subsystem classes stay public and usable, and the book explicitly keeps them available for clients that need them. To actually force access through the facade you must restrict visibility yourself (package-private classes, modules, or API boundaries). This is both a benefit (flexibility for advanced use) and a risk (clients can still bypass the facade and couple to the subsystem).",
    ref: "Ch. 7 Facade"
  },
  {
    id: "facade-04",
    pattern: "facade",
    type: "multi",
    difficulty: 3,
    tags: ["pros-cons", "principles"],
    prompt: "Which statements about the Facade pattern are accurate? Select all that apply.",
    options: [
      "A Facade guarantees that the subsystem can only be used through it, because the subsystem classes are hidden from clients",
      "Clients become decoupled from subsystem classes, so refactoring the subsystem mostly affects the facade",
      "A facade can grow into a god class that knows every workflow, so you may split it into several smaller facades",
      "A Facade removes the complexity of the subsystem, because after introducing it the subsystem has fewer classes and simpler logic",
      "It supports the Principle of Least Knowledge by letting a client talk to one object instead of many"
    ],
    answer: [1, 2, 4],
    explanation:
      "Decoupling clients from the subsystem, the god-class risk (the remedy is several focused facades), and the support for Least Knowledge are the real properties. The 'guarantees exclusive use' statement is false because the pattern does not enforce exclusive access; subsystem classes stay public unless you restrict their visibility. The 'removes the complexity' statement is false because the subsystem stays as complex as before; the facade only hides that complexity from typical clients.",
    ref: "Ch. 7 Facade, Principle of Least Knowledge"
  },
  {
    id: "facade-05",
    pattern: "facade",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "principles"],
    prompt:
      "A checkout facade for an online shop:\n\n```java\npublic class CheckoutFacade {\n  private final InventoryService inventory;\n  private final BillingService billing;\n  private final ShippingService shipping;\n  // constructor omitted\n  public InventoryService getInventory() { return inventory; }\n  public void checkout(Cart cart) {\n    inventory.reserve(cart);\n    billing.charge(cart.total());\n    shipping.schedule(cart);\n  }\n}\n```\n\nWhat undermines the pattern's purpose?",
    options: [
      "The facade holds references to three services, but a facade should be stateless so it can be shared safely between callers",
      "`checkout` should return a value such as a confirmation object instead of `void`, so callers can tell whether the order succeeded",
      "`getInventory()` hands out a subsystem object, so clients can couple to it again and the facade stops simplifying anything",
      "The facade is not a Singleton, so several facade instances can exist and each coordinates its own set of service calls"
    ],
    answer: 2,
    explanation:
      "Exposing a subsystem object through a getter makes callers talk to `InventoryService` directly (violating Least Knowledge) and brings back the coupling the facade was meant to remove; any change to that service again ripples to clients. Holding references to the subsystem is exactly what a facade does, so the claim that a facade should be stateless is wrong. Return type is a separate API decision, and a facade need not be a Singleton: nothing in the pattern requires a single instance, and making it one would add global state for no benefit.",
    ref: "Ch. 7 Facade, Principle of Least Knowledge"
  },
  {
    id: "facade-06",
    pattern: "facade",
    type: "short",
    difficulty: 3,
    tags: ["principles", "pros-cons"],
    prompt:
      "Explain how a Facade supports the Principle of Least Knowledge, and describe one situation where adding a Facade makes a design worse.",
    modelAnswer:
      "Least Knowledge says an object should only talk to its immediate friends. Without a facade, a client calls several subsystem classes and must know their types and call order; with one it talks to a single object, so fewer classes depend on the subsystem's internals. A facade makes a design worse when it becomes a catch-all class that mirrors every subsystem method (it just adds a pass-through layer), when it grows into a god class holding many unrelated workflows, or when the subsystem is already simple, so the facade is only an extra layer that has to be kept in sync.",
    explanation:
      "Facade gives clients a simpler entry point so they know fewer classes, which is Least Knowledge applied to a subsystem. It becomes a cost when it only forwards calls, grows into a god class, or wraps something already simple, because the extra layer must still be kept in sync.",
    keyPoints: [
      "Client interacts with one object rather than many subsystem classes",
      "Fewer classes depend on subsystem internals and call order",
      "A facade that only forwards one-to-one adds a layer without simplifying",
      "God-class growth or wrapping something already simple makes it a cost"
    ],
    ref: "Ch. 7 Facade, Principle of Least Knowledge"
  }
);
