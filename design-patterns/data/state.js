window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "state-01",
    pattern: "state",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "inheritance-vs-composition"],
    prompt: "State and Strategy have nearly identical class diagrams: a context holds a reference to an interface and delegates to it. Which statement correctly captures how they differ in practice?",
    options: [
      "State relies on inheritance to switch behavior, because each state subclasses the context, while Strategy relies on composition and delegation to a separate algorithm object",
      "In State, the concrete states usually drive the changes: they know their successors and swap themselves into the context. In Strategy, the client typically picks the strategy and it stays until replaced",
      "In State the context is created without any behavior object and receives its first state lazily when the first request arrives, while in Strategy the context always owns its algorithm object from the moment it is constructed",
      "State objects must be singletons so that transitions can compare them with `==`, while strategy objects must be created per context so that each keeps its own configuration"
    ],
    answer: 1,
    explanation: "Both patterns use composition plus delegation to an interface, with implementations hidden behind it (the claim that State relies on inheritance is wrong: states do not subclass the context, and both patterns use composition, with inheritance only in implementing the interface). The difference is intent and who changes the collaborator: State models an object whose behavior changes with its internal condition, usually with states triggering transitions; Strategy lets a client pick an interchangeable algorithm. The claim that a State context starts with no behavior object is wrong because it also starts with an initial state. The claim about singletons is made up: neither pattern requires singletons (and singleton states cause trouble if they hold per-context fields).",
    ref: "Ch. 10 State"
  },
  {
    id: "state-02",
    pattern: "state",
    type: "mc",
    difficulty: 3,
    tags: ["pros-cons", "principles"],
    prompt: "A team replaces a large `switch` on an `OrderStatus` enum (PLACED, PAID, SHIPPED, CANCELLED) with State classes. Which of the following is a genuine drawback of the State version that the `switch` version does not have?",
    options: [
      "The `Order` context can no longer change its behavior at run time, because the current state object is fixed once the order is constructed and only that object's own fields can vary afterwards",
      "The order's behavior can no longer be unit tested in isolation, because the state classes are hidden behind the context and cannot be instantiated by a test",
      "Transition rules are spread across state classes that refer to each other, so reading the life cycle means opening many classes, and a new state can force edits in existing ones",
      "Clients must now know which state an order is in before calling `ship()`, because the context no longer rejects calls that are illegal in the current state"
    ],
    answer: 2,
    explanation: "State localizes behavior per state but scatters the transition table: each state knows its successors, so a new state (for example RETURNED) can require edits to existing states that transition into it, and the total number of classes grows. That is the real cost, and it is the price for removing the big conditionals from the context. The claim that the context can no longer change behavior is backwards: switching state at run time is the point. The claim that behavior cannot be unit tested is false; each state can be tested in isolation, which is easier than a monolithic switch. The claim that clients must know the state is also backwards: clients keep calling the same context methods without caring about the state.",
    ref: "Ch. 10 State"
  },
  {
    id: "state-03",
    pattern: "state",
    type: "tf",
    difficulty: 3,
    tags: ["trap", "structure"],
    prompt: "If each concrete State keeps a field referring to its Context (set once in the state's constructor), the same state instances can safely be shared across many Context objects to save memory.",
    answer: false,
    explanation: "False. A state that stores a particular context in a field is bound to that context, so sharing it makes one context's transitions act on another. To share states (as singletons or flyweights), they must be stateless with respect to the context and receive the context as a method parameter, for example `state.pay(order)`. The trade-off is that the book's per-context states are simple but create objects on every transition, while shared states save allocations but require the parameter-passing style.",
    ref: "Ch. 10 State"
  },
  {
    id: "state-04",
    pattern: "state",
    type: "multi",
    difficulty: 3,
    tags: ["structure", "participants"],
    prompt: "A video-upload service has a `Context` called `Upload` with states Queued, Processing, Published and Failed. Select all statements that are true of a correct State-pattern implementation.",
    options: [
      "`Upload` delegates state-dependent requests such as `cancel()` to its current state object",
      "A state that does not support an action (for example `cancel()` on Published) can reject it itself, so the context has no conditional checks for that rule",
      "`Upload` must be subclassed once per state so that each subclass overrides the behavior, and the client swaps the object's class by creating a new subclass instance",
      "Only the `Upload` context may call `setState()`; a state object must never trigger a transition, because the states are not allowed to know about each other",
      "To the client, the upload appears to change its class when its state changes, although the object stays the same"
    ],
    answer: [0, 1, 4],
    explanation: "Delegation to the current state, states rejecting illegal actions themselves and the appearance of a changing class (the book's wording) all describe State. Subclassing `Upload` once per state is the inheritance-based alternative the pattern avoids: behavior changes by swapping a composed object, and the context's class never varies. The claim that states must never trigger a transition is false: in the book's gumball machine the states call the machine's `setState()` themselves; putting transitions in the context is a valid alternative, but nothing forbids states from doing it.",
    ref: "Ch. 10 State"
  },
  {
    id: "state-05",
    pattern: "state",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "flow"],
    prompt: "An order context delegates to a state, and states drive the transitions:\n\n```java\nclass Order {\n    private OrderState state = new Paid();\n    void setState(OrderState s) { this.state = s; }\n    void ship() { state.ship(this); }\n    void dispatchToCarrier() { /* books a courier */ }\n}\n\nclass Paid implements OrderState {\n    public void ship(Order order) {\n        order.dispatchToCarrier();\n    }\n}\n```\n\nA support agent double-clicks the Ship button; the two clicks are handled one after the other, and a courier is booked twice. Which change fixes the defect at its source?",
    options: [
      "Make `Order.ship()` `synchronized`, so the two clicks are serialized and the second one waits for the first to finish",
      "In `Paid.ship()`, after dispatching, call `order.setState(new Shipped())`, and give `Shipped.ship()` behavior that does not book a courier",
      "Replace the `OrderState` interface with an abstract class, so that `ship()` can have a default body shared by every state",
      "Make `Paid` a singleton, so that only one instance can ever exist and therefore dispatch a courier"
    ],
    answer: 1,
    explanation: "The state performs the action but never moves the context on, so the order stays Paid and every later `ship()` call repeats the dispatch. In State, the effect of an action must include the transition, and the next state decides what repeated actions mean. Making `ship()` synchronized only serializes the clicks; the second one would still book a courier. Replacing the interface with an abstract class changes nothing about the missing transition. Making `Paid` a singleton does not stop a second call either, and shared states cannot keep per-order data.",
    ref: "Ch. 10 State"
  },
  {
    id: "state-06",
    pattern: "state",
    type: "short",
    difficulty: 3,
    tags: ["structure", "pros-cons"],
    prompt: "The State pattern leaves open where transition logic lives: inside the concrete states (each decides its successor) or inside the context (for example a transition table). Compare the two options and say when you would choose each.",
    modelAnswer: "With transitions in the states, each state class is self-contained and the context stays small. Adding a state is local, but states depend on each other (each names its successors), so the life cycle is scattered over many classes. With transitions in the context, the whole state graph is visible in one place and the state classes can stay independent and reusable, but the context grows and must be edited whenever the life cycle changes, which tends to reintroduce conditionals. Choose state-driven transitions when the rules are fixed and tied to each state's behavior, as in a vending machine. Choose context-driven or table-driven transitions when the graph changes often or must be inspected and configured as data.",
    keyPoints: [
      "State-driven: local behavior and a small context, but states are coupled to successors",
      "Context-driven: the life cycle is visible in one place and states stay independent, but the context grows and may regain conditionals",
      "Choice depends on how stable the transition rules are and whether they need to be viewed or configured centrally",
      "Either way, behavior stays delegated to the state object"
    ],
    ref: "Ch. 10 State"
  }
);
