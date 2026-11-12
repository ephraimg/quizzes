window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "adapter-01",
    pattern: "adapter",
    type: "mc",
    difficulty: 3,
    tags: ["inheritance-vs-composition", "structure"],
    prompt:
      "Your code uses a `Notifier` interface. You must reuse a vendor's concrete class `VendorSmsGateway`, and the vendor ships two subclasses (`VendorSmsGatewayEu`, `VendorSmsGatewayUs`) that you also need to support. Which adapter design fits best in Java?",
    options: [
      "A class adapter, `class SmsNotifier extends VendorSmsGateway implements Notifier`, which reuses the vendor's behavior through inheritance",
      "A class adapter, because adapting through inheritance is the only way to reuse the vendor's behavior in Java",
      "Three separate class adapters, one per vendor class, all implementing `Notifier`, each extending its own vendor subclass",
      "An object adapter: `SmsNotifier implements Notifier` and holds a `VendorSmsGateway` reference"
    ],
    answer: 3,
    explanation:
      "An object adapter uses composition: it holds a `VendorSmsGateway` and delegates, so one adapter class works with the vendor class and all its subclasses (any instance can be passed in). A class adapter extends one specific concrete class. Java allows it here because the target is an interface, but it then covers only that one vendor class, so the EU and US variants would each need their own adapter (the three separate class adapters), which is the maintenance cost composition avoids. Inheritance is not the only way to reuse behavior, which is why the claim that a class adapter is the only way to reuse the vendor's behavior is wrong. The class adapter's advantage (it can override adaptee behavior) does not outweigh that here.",
    ref: "Ch. 7 Adapter (object vs class adapters)"
  },
  {
    id: "adapter-02",
    pattern: "adapter",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "when-to-use"],
    prompt:
      "An existing `Logger` interface is used across the app. A new third-party class `AcmeTelemetry` has a `send(Event)` method that does the right job but has the wrong interface. Another wrapper is needed to add timestamp prefixes to any `Logger` without changing the `Logger` interface. Which pair of patterns do these two wrappers represent?",
    options: [
      "Both are Decorators, because both wrap one object, present a Logger-like type and delegate to it",
      "The first is a Facade (it simplifies a third-party API), the second an Adapter (it changes what a log call looks like)",
      "The first is an Adapter (converts the interface), the second a Decorator (same interface, added behavior)",
      "The first is a Proxy (it stands in for the telemetry service), the second an Adapter (it reshapes each log call)"
    ],
    answer: 2,
    explanation:
      "Adapter changes the interface of an existing object to match what the client expects, leaving behavior essentially the same. Decorator keeps the interface identical and adds responsibility, which is why decorators can be stacked and are transparent to the client, while an adapter changes the type the client sees. All of these patterns wrap an object, so 'wraps and delegates' cannot distinguish them; the intent does. A Facade simplifies a subsystem of many classes, and a Proxy controls access to an object with the same interface; neither fits either wrapper.",
    ref: "Ch. 7 Adapter, Decorator, Facade (compare)"
  },
  {
    id: "adapter-03",
    pattern: "adapter",
    type: "tf",
    difficulty: 3,
    tags: ["real-api", "trap", "pros-cons"],
    prompt:
      "True or false: when adapting a legacy `Enumeration` to the `Iterator` interface, the adapter can implement `remove()` by delegating to a matching method on the `Enumeration`.",
    answer: false,
    explanation:
      "False. `Enumeration` is read-only: it has only `hasMoreElements()` and `nextElement()`, with no removal, so there is nothing to delegate to. The book's EnumerationIterator adapter throws `UnsupportedOperationException` from `remove()`, which is what the `Iterator` contract allows for optional operations. The lesson is that an adapter can only translate what the adaptee can do. If the target interface has a required capability the adaptee lacks, the adapter has to refuse, emulate it, or the adaptation is a poor fit.",
    ref: "Ch. 7 Adapter (Enumeration to Iterator)"
  },
  {
    id: "adapter-04",
    pattern: "adapter",
    type: "multi",
    difficulty: 3,
    tags: ["pros-cons", "structure"],
    prompt: "Which statements about an object adapter are true? Select all that apply.",
    options: [
      "The client depends only on the Target interface and does not know an adaptee is involved",
      "It requires changing the source of the adaptee so that it implements the target interface and exposes the methods the client expects",
      "Because it holds the adaptee by composition, it can work with any subclass of the adaptee",
      "It can easily override individual adaptee methods, since it inherits from the adaptee and can replace their behavior",
      "If the vendor library is replaced, the changes are confined to the adapter class"
    ],
    answer: [0, 2, 4],
    explanation:
      "The point of Adapter is that the client codes against the Target and is unaware of the adaptee; composition lets one adapter wrap any subtype of the adaptee; and swapping the vendor library touches only the adapter. Not requiring changes to the adaptee is the whole reason to use it (the adaptee is often third-party code), so the claim that it requires changing the adaptee's source is false. Overriding adaptee methods through inheritance is the class adapter's strength, not the object adapter's; an object adapter reaches the adaptee only through its public interface.",
    ref: "Ch. 7 Adapter"
  },
  {
    id: "adapter-05",
    pattern: "adapter",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "trap"],
    prompt:
      "The `PaymentProcessor` contract says: 'returns a `Receipt` on success; throws `PaymentException` on any failure'. The legacy gateway's `int submit(int cents)` returns a transaction id on success and a negative error code on failure.\n\n```java\nclass LegacyGatewayAdapter implements PaymentProcessor {\n  private final LegacyGateway gateway;\n  LegacyGatewayAdapter(LegacyGateway gateway) { this.gateway = gateway; }\n  public Receipt charge(Money amount) {\n    int code = gateway.submit(amount.cents());\n    return new Receipt(code);\n  }\n}\n```\n\nWhat is the defect?",
    options: [
      "It adapts only the method signature, not the contract: a failure code becomes a bogus `Receipt` instead of a `PaymentException`",
      "It should extend `LegacyGateway` so it can call `submit` directly instead of holding the gateway in a field, which makes the adapter simpler",
      "The adapter must create the `LegacyGateway` itself instead of receiving it in the constructor, otherwise callers can pass in the wrong gateway subtype",
      "`LegacyGateway` should be changed to implement `PaymentProcessor` directly so that no adapter class is needed at all"
    ],
    answer: 0,
    explanation:
      "An adapter has to translate behavior and error semantics as well as method names. Here every negative error code is wrapped in a `Receipt`, so callers think the payment succeeded. The fix is to check `code` and throw a `PaymentException` for failures. Extending the gateway is not required (and would turn it into a class adapter for no gain). Injecting the adaptee through the constructor is good, since it lets you wrap subclasses and test with a fake. Changing `LegacyGateway` is usually impossible because it is legacy or third-party code, which is the situation Adapter exists for.",
    ref: "Ch. 7 Adapter"
  },
  {
    id: "adapter-06",
    pattern: "adapter",
    type: "short",
    difficulty: 3,
    tags: ["when-to-use", "pros-cons"],
    prompt:
      "Name two situations where writing an Adapter is the wrong choice, and say what to do instead in each.",
    modelAnswer:
      "(1) You own the adaptee or the client and the mismatch is just a rename or small signature difference: change the code directly (or refactor) instead of adding a layer. (2) The adaptee's semantics differ so much from the target (different units, transaction model, error handling, required operations it cannot support) that the adapter would be large, lossy or throw 'unsupported' often: redesign the target interface, or write a real translation component with its own tests rather than a thin wrapper. An adapter also adds one more indirection and class to maintain, so it is not worth it for a single call site.",
    explanation:
      "Adapter exists to make an unchangeable class fit an expected interface. When you control either side, or when the mismatch is semantic rather than syntactic, the wrapper adds indirection without solving the real problem, so refactoring or redesigning the interface is better.",
    keyPoints: [
      "Adapt only when you cannot or should not change the adaptee or client",
      "Direct change or refactoring beats an extra layer for simple mismatches",
      "A semantic (not just syntactic) mismatch makes a thin adapter lossy or misleading",
      "Each adapter adds an indirection and a class to maintain"
    ],
    ref: "Ch. 7 Adapter"
  }
);
