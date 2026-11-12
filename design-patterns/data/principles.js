window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "principles-01", pattern: "principles", type: "match", difficulty: 3, tags: ["principles", "compare"],
    prompt: "\"Identify the aspects of your application that vary and separate them from what stays the same.\" Match each pattern to the thing it pulls out and encapsulates.",
    pairs: [
      ["Strategy", "A family of interchangeable algorithms"],
      ["State", "Behavior that depends on the object's current condition, with transitions"],
      ["Factory Method", "Which concrete class gets instantiated"],
      ["Iterator", "How a collection is traversed"],
      ["Command", "A request, bundled with its receiver, so invocation is separate from execution"]
    ],
    explanation: "Each pattern is this one principle applied to a different axis of change. State differs from Strategy in that what is encapsulated is behavior tied to the context's condition, including the knowledge of the next state. Template Method also applies the principle, but by keeping the invariant steps fixed in a superclass and encapsulating the varying steps in subclasses.",
    ref: "Ch. 1 Design Principle"
  },
  {
    id: "principles-02", pattern: "principles", type: "mc", difficulty: 3, tags: ["principles", "inheritance-vs-composition", "pros-cons"],
    prompt: "A team follows \"favor composition over inheritance\" and models a flight booking with stacked Decorators (`Insured(Priority(Baggage(BaseFare)))`). Which is a **real cost** of this design compared with subclassing?",
    options: [
      "Checks on the concrete type (`instanceof BaseFare`) no longer see the base object, and many small objects exist whose wrapping order can matter.",
      "Every combination must be declared at compile time as its own class, so adding a new combination of add-ons means writing and compiling a new class.",
      "A Decorator can only add behavior after the wrapped call returns, never before it, so a surcharge cannot be applied ahead of the base fare.",
      "Decorators must modify the source of the wrapped component to expose a hook, which breaks the open-closed principle for that component."
    ],
    answer: 0,
    explanation: "Composition buys runtime flexibility and avoids a subclass per combination, but it has costs: type-dependent logic breaks because a wrapper is not an instance of the wrapped class, there are more objects to understand and debug, and order can change results (for example a surcharge applied before versus after a discount). Needing a compile-time class for every combination is the problem Decorator solves, not causes. The claim that a Decorator can only act after the wrapped call is false; a Decorator can run code before, after, or around delegation. The claim that Decorators must modify the component's source is false; Decorator extends behavior without modifying the component.",
    ref: "Ch. 3 Decorator"
  },
  {
    id: "principles-03", pattern: "principles", type: "multi", difficulty: 3, tags: ["principles", "pros-cons"],
    prompt: "\"Strive for loosely coupled designs between objects that interact.\" Choose the **two** statements that are accurate about coupling in Observer.",
    options: [
      "The Subject depends only on the `Observer` interface, not on any concrete observer class.",
      "Observers never need a reference to the Subject, whichever data-passing style (push or pull) the design uses.",
      "New observers can be added or removed at runtime without modifying the Subject.",
      "The Subject guarantees a notification order, so observers can safely depend on each other having already run.",
      "Observers are fully decoupled from the data format the Subject publishes, so the Subject can change it freely."
    ],
    answer: [0, 2],
    explanation: "The coupling Observer removes is the Subject's knowledge of concrete listeners, which is why listeners can come and go dynamically. It is not total decoupling: in the pull style observers hold a Subject reference and call getters, and every observer still depends on the shape of the data it receives (so the claim about full decoupling from the data format is false). The claim that observers never need a Subject reference is false for that pull style. The claim that the Subject guarantees notification order is false: notification order is an implementation detail and observers should not depend on it (or on each other).",
    ref: "Ch. 2 Observer"
  },
  {
    id: "principles-04", pattern: "principles", type: "mc", difficulty: 3, tags: ["principles", "smell", "trap"],
    prompt: "To satisfy open-closed, a payments class was refactored to use a `PaymentStrategy` interface. A new `PaymentStrategyFactory.create(String type)` still contains `switch (type) { case \"card\": ...; case \"wire\": ... }`. Which assessment is most accurate?",
    options: [
      "The design is now fully closed for modification, because the `switch` was moved into a factory and no longer appears in the payments class itself.",
      "Payment logic is closed to new types, but the factory is still edited for each one; a contained violation that a registry or lookup removes.",
      "The design has regressed: moving the switch into a factory makes extension harder than before, because every caller now also depends on the factory class.",
      "Strategy was the wrong pattern; the original class should have stayed as it was, since any `switch` on a type string is always a violation of open-closed."
    ],
    answer: 1,
    explanation: "Open-closed is relative to a kind of change. Adding a payment type no longer touches the payments class or existing strategies, but the one place that maps a name to a strategy is still modified. That is usually acceptable, and it can be reduced further by registering strategies in a map or discovering them (for example with `ServiceLoader`). The claim that the design is fully closed overclaims. The claim that the design regressed is wrong because the change touches one small place instead of every call site. The claim that Strategy was the wrong pattern is wrong because a switch confined to one creation point is not a design flaw in itself.",
    ref: "Ch. 3 Open-Closed Principle"
  },
  {
    id: "principles-05", pattern: "principles", type: "multi", difficulty: 3, tags: ["principles", "spot-the-bug"],
    prompt: "\"Depend upon abstractions. Do not depend upon concrete classes.\" Choose the **two** lines that depend on a concrete class in a way the principle warns against.",
    options: [
      "`private final OrderRepository repo;` assigned from a constructor parameter",
      "`private final MySqlOrderRepository repo = new MySqlOrderRepository();` in `OrderService`",
      "`Pizza pizza = createPizza(type);` where `createPizza` is abstract in `PizzaStore`",
      "`Pizza pizza = new NYStyleCheesePizza();` inside `PizzaStore.orderPizza`",
      "`List<String> names = new ArrayList<>();` inside a factory method that returns `List<String>`"
    ],
    answer: [1, 3],
    explanation: "The second and fourth lines make a high-level class (`OrderService`, `PizzaStore`) depend on a low-level concrete class, so the high-level code must change when the detail changes. The first depends on an abstraction supplied from outside, and the third uses a Factory Method so the store depends only on `Pizza`. The last instantiates a concrete collection but exposes only the `List` abstraction; the book's guidelines allow instantiating concrete classes when they are stable or hidden behind an abstraction.",
    ref: "Ch. 4 Dependency Inversion Principle"
  },
  {
    id: "principles-06", pattern: "principles", type: "multi", difficulty: 3, tags: ["principles", "spot-the-bug"],
    prompt: "The Principle of Least Knowledge says a method should only invoke methods of: the object itself, objects passed in as parameters, objects it creates, and the object's components. In the method below, which **three** calls are allowed?\n\n```java\nclass Checkout {\n  private final TaxTable table;\n  double total(Order order) {\n    double a = order.subtotal();\n    String zip = order.getCustomer().getAddress().zip();\n    double b = table.rateFor(zip);\n    Receipt r = new Receipt();\n    r.print(a * b);\n    return a * b;\n  }\n}\n```",
    options: [
      "`order.subtotal()`",
      "`order.getCustomer().getAddress().zip()`",
      "`table.rateFor(zip)`",
      "`r.print(a * b)`"
    ],
    answer: [0, 2, 3],
    explanation: "`order` is a parameter, `table` is a component field, and `r` was created in the method, so calls 1, 3, and 4 are allowed. `order.getCustomer().getAddress().zip()` reaches through two returned objects (a customer and an address) that this class has no direct relationship with, so it is the violation; the fix is a method on `Order` such as `order.shippingZip()`.",
    ref: "Ch. 7 Principle of Least Knowledge"
  },
  {
    id: "principles-07", pattern: "principles", type: "mc", difficulty: 3, tags: ["principles", "spot-the-bug", "inheritance-vs-composition"],
    prompt: "The Hollywood Principle (\"Don't call us, we'll call you\") guards against dependency rot. In a `CaffeineBeverage` hierarchy, a `Tea` subclass overrides `prepareRecipe()` itself and calls the inherited `boilWater()` and `pourInCup()` helpers directly in its own order. What is the best description of what went wrong?",
    options: [
      "The subclass now drives the algorithm, so the base class no longer controls the sequence and every subclass duplicates (and can change) it.",
      "It violates the Liskov substitution principle, because `Tea` overrides `prepareRecipe()` and so can no longer be used wherever a `CaffeineBeverage` is expected.",
      "It breaks encapsulation, because a subclass should never call inherited helper methods and should only use its own fields to avoid tight coupling.",
      "It is Strategy instead of Template Method, which is simply a different valid design that gives the same guarantees about step order and reuse."
    ],
    answer: 0,
    explanation: "In Template Method the high-level class owns the algorithm skeleton (usually `final`) and calls down to the low-level subclass for specific steps. When the subclass takes over the skeleton, the control flow is inverted: the base class can no longer guarantee the order, and every subclass repeats the sequence, so a change to the algorithm means editing every subclass. Tea is still substitutable, so Liskov is not the issue. Calling inherited protected helpers is normal, so encapsulation is not the issue. It is not Strategy, because there is no separate strategy object, only an overridden skeleton.",
    ref: "Ch. 8 Hollywood Principle"
  },
  {
    id: "principles-08", pattern: "principles", type: "short", difficulty: 3, tags: ["principles", "pros-cons", "trap"],
    prompt: "A class should have only one reason to change. Explain how Composite, and Iterator when used on an aggregate, each trade off or protect this principle, and why the book says Composite \"trades the Single Responsibility Principle for transparency\".",
    modelAnswer: "Without Iterator, a collection class has two responsibilities: managing its items and traversing them. Extracting traversal into an Iterator gives each class one reason to change, so Iterator protects SRP. Composite does the opposite: the component class holds both child-management operations (add/remove) and leaf operations (print, price), so one class has two responsibilities. That is deliberate: it makes leaves and composites look identical to the client (transparency), at the cost of leaf nodes inheriting methods that do not make sense for them (they throw or do nothing), so you give up some safety.",
    keyPoints: [
      "Iterator separates traversal from collection management, which supports SRP",
      "Composite's component interface mixes child management with leaf behavior",
      "The trade is uniform treatment of leaves and composites (transparency)",
      "The cost is leaves exposing operations that are meaningless for them"
    ],
    explanation: "SRP is a design principle with trade-offs: Composite consciously accepts a class with two responsibilities to get transparency, whereas Iterator is a clean application of the principle by moving traversal out of the aggregate.",
    ref: "Ch. 9 Iterator and Composite"
  }
);
