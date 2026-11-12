window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "strategy-01",
    pattern: "strategy",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "what-is"],
    prompt:
      "A parcel-shipping `Order` object holds a `PricingPolicy` reference and delegates `price()` to it. Another team's `Ticket` object holds a `TicketState` reference and delegates `escalate()` to it. Both structures look identical in a class diagram. Which statement correctly separates **Strategy** from **State**?",
    options: [
      "In Strategy the concrete behaviors usually know about each other and swap themselves in response to input; in State the client picks one behavior up front and it stays fixed for the life of the context.",
      "In Strategy the client normally picks the behavior and the context does not change it on its own; in State the context's own state advances and the state objects (or the context) swap the current one.",
      "Strategy is built with composition and delegation to an interface, whereas State is built with inheritance, each state being a subclass of the context that overrides its behavior.",
      "Strategy objects must be stateless singletons shared by every context, while State objects must be created fresh for each context because they hold that context's current data.",
    ],
    answer: 1,
    explanation:
      "The structure is the same (a context delegating to an interface), so the difference is intent and who drives the change. Strategy encapsulates interchangeable algorithms chosen from outside; State models an object whose behavior changes as its internal state changes, usually with the state classes triggering transitions. The claim that Strategy behaviors swap themselves while State is fixed reverses this. The claim that State is built with inheritance is wrong because both patterns use composition plus delegation. The claim that Strategy objects must be shared singletons is wrong because Strategy objects may be stateless and shared, but nothing requires it, and State objects can also be shared when they hold no per-context data.",
    ref: "Ch. 10 State (comparison with Strategy)",
  },
  {
    id: "strategy-02",
    pattern: "strategy",
    type: "mc",
    difficulty: 3,
    tags: ["inheritance-vs-composition", "pros-cons"],
    prompt:
      "A navigation app has `Route` objects that can be planned as fastest, shortest, or most scenic, and also with or without toll roads. A developer proposes subclasses `FastestRoute`, `FastestNoTollRoute`, `ScenicRoute`, `ScenicNoTollRoute`, and so on. Why does moving the planning algorithm into a `Strategy` object fix the real problem here?",
    options: [
      "Strategy removes the need for the `Route` class to know that a planning algorithm exists at all, so `Route` no longer depends on any planning interface and can be compiled and tested alone.",
      "Each varying axis becomes its own behavior object chosen at runtime, so classes grow with behaviors not combinations, and a route can change behavior later.",
      "Strategy objects are lighter than subclasses, so the app uses less memory and starts faster because the JVM loads fewer class files and creates fewer long-lived route instances.",
      "Subclasses cannot override the same method twice, but strategies can be chained inside one `plan()` call so that both the scenic rule and the no-toll rule apply together.",
    ],
    answer: 1,
    explanation:
      "The pain is a combinatorial explosion of subclasses, plus behavior fixed at construction time. Composition lets each varying axis (ordering criterion, toll rule) be its own interface and swapped independently, even after the object exists. The claim that the Route no longer depends on any planning interface is wrong: the context still depends on the strategy interface; it is only decoupled from the concrete algorithms. The memory and startup claim is an unrelated performance promise that the pattern does not make (extra objects add a little overhead). The claim about chaining strategies invents chaining: plain Strategy selects one object per axis; combining rules is closer to Decorator or Chain of Responsibility.",
    ref: "Ch. 1 Strategy",
  },
  {
    id: "strategy-03",
    pattern: "strategy",
    type: "tf",
    difficulty: 3,
    tags: ["structure", "pros-cons"],
    prompt:
      "True or false: when a concrete strategy needs data that lives in the context, the context can either pass the needed values as parameters of the strategy method or pass itself so the strategy pulls what it wants, and passing the context itself trades fewer interface changes for tighter coupling between strategy and context.",
    answer: true,
    explanation:
      "True. Passing specific values keeps the strategy decoupled from the context, but the interface must anticipate every strategy's needs and some strategies will ignore parameters. Passing the context itself (or giving the strategy the data in its constructor) keeps the interface stable when needs change, but couples the strategy to the context's accessors. Choosing between these is the main interface-design trade-off in Strategy.",
    ref: "Ch. 1 Strategy",
  },
  {
    id: "strategy-04",
    pattern: "strategy",
    type: "multi",
    difficulty: 3,
    tags: ["pros-cons"],
    prompt:
      "Select the **genuine costs** of using the Strategy pattern (choose all that apply).",
    options: [
      "Clients must understand how the strategies differ in order to choose an appropriate one.",
      "The behavior of a context can no longer be changed after construction, because the strategy reference is fixed once the context exists.",
      "The strategy interface must fit every concrete strategy, so some strategies receive parameters they do not use.",
      "The context class must be modified every time a new concrete strategy is added, since it needs a branch to select the new one.",
      "The number of objects in the system increases.",
    ],
    answer: [0, 2, 4],
    explanation:
      "Real costs: clients must know the strategies to pick one (they must understand how the strategies differ); the shared interface is a lowest-common-denominator, leading to unused parameters or context-passing; and each strategy is an extra class and usually an extra object. The claim that behavior cannot change after construction is the opposite of the truth: swapping strategies at runtime through a setter is a key benefit. The claim that the context must change for each new strategy is also the opposite: the context depends only on the interface, so new strategies need no context change (Open/Closed Principle).",
    ref: "Ch. 1 Strategy; GoF consequences",
  },
  {
    id: "strategy-05",
    pattern: "strategy",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "trap"],
    prompt:
      "An API gateway gives each client its own `RateLimiter`, which delegates to a `Throttle` strategy. What is the bug?\n\n```java\ninterface Throttle { boolean allow(); }\n\nclass FixedWindowThrottle implements Throttle {\n  private final int limit;\n  private int used = 0;\n  FixedWindowThrottle(int limit) { this.limit = limit; }\n  public boolean allow() { return ++used <= limit; }\n}\n\nclass Gateway {\n  private static final Throttle SHARED = new FixedWindowThrottle(100);\n  RateLimiter limiterFor(String clientId) {\n    return new RateLimiter(SHARED);\n  }\n}\n```",
    options: [
      "`RateLimiter` should extend `FixedWindowThrottle` so it inherits `allow()` directly and no longer needs a separate strategy object, since delegation to an interface adds indirection for no benefit here.",
      "A `Throttle` should be an abstract class, because interfaces cannot safely be shared across several contexts at the same time and an abstract base can guard its own counter.",
      "One strategy instance with mutable per-client state (`used`) is shared by all limiters, so clients use each other's quota and the counter races across threads.",
      "`allow()` should be `static` so all contexts can call it without needing an instance, which also removes the shared field and the need to construct a throttle for each client.",
    ],
    answer: 2,
    explanation:
      "Sharing a single strategy instance is fine only when it is stateless (or the state is immutable/thread-safe). Here the counter belongs to one client's limiter, so a shared instance mixes clients' counts and is not thread-safe. Fix: create a `FixedWindowThrottle` per limiter (or keep the counter in the context and pass it in). Having `RateLimiter` extend `FixedWindowThrottle` undoes the composition the pattern is about. The claim that interfaces cannot be shared is false: interfaces can be shared freely. Making `allow()` static would remove polymorphism, which defeats the pattern.",
    ref: "Ch. 1 Strategy",
  },
  {
    id: "strategy-06",
    pattern: "strategy",
    type: "order",
    difficulty: 2,
    tags: ["flow", "smell"],
    prompt:
      "An `Invoice` class has a method `tax()` containing a long `switch` on country code. Put the steps of refactoring it to the Strategy pattern in a sensible order.",
    items: [
      "Identify the part that varies: the per-country branches of the switch",
      "Define a `TaxRule` interface with a method matching what the branches compute",
      "Move each branch into its own class implementing `TaxRule`",
      "Give `Invoice` a `TaxRule` field and make `tax()` delegate to it",
      "Supply the concrete rule from outside (constructor or setter) instead of switching internally",
    ],
    explanation:
      "First find the varying behavior (the switch), then extract an interface that expresses it, then move each branch into an implementing class. Only after the implementations exist can the context hold the interface type and delegate to it. The last step moves the choice of rule out of `Invoice` (to a client, factory, or configuration); skipping it leaves the context still deciding, which retains the original smell.",
    ref: "Ch. 1 Strategy; design principle 'encapsulate what varies'",
  }
);
