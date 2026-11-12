window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "decorator-01",
    pattern: "decorator",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "what-is"],
    prompt:
      "A `StorageClient` interface has an `S3StorageClient` implementation. Two wrappers are written, both implementing `StorageClient` and both holding another `StorageClient`: `CompressingClient` (compresses bytes before delegating `put`) and `LazyClient` (creates the real client only on first use and rejects calls from unauthorized users). Which classification is the most accurate?",
    options: [
      "Both are Decorators, because both wrap a `StorageClient`, hold another `StorageClient`, and delegate calls to it while keeping the same interface.",
      "`CompressingClient` is a Decorator, adding a responsibility to each call; `LazyClient` is a Proxy, controlling creation of and access to the subject.",
      "`CompressingClient` is an Adapter, because it changes the data the underlying client receives and so converts what callers pass into what the client expects.",
      "Both are Proxies, because Decorator requires an abstract base class rather than an interface, and neither wrapper extends one.",
    ],
    answer: 1,
    explanation:
      "The class structure of Decorator and Proxy is nearly identical (same interface, hold a reference, delegate), so the intent decides. Decorator adds behavior or responsibilities, and decorators are meant to be stacked. Proxy controls access: lazy creation (virtual proxy), authorization (protection proxy), remote access. Calling both Decorators confuses structure with intent. Calling `CompressingClient` an Adapter is wrong: Adapter changes the interface, but here the interface stays `StorageClient`. Calling both Proxies is wrong: Decorator works with an interface or an abstract class; the requirement is only matching the component type.",
    ref: "Ch. 9 Decorator; Ch. 11 Proxy",
  },
  {
    id: "decorator-02",
    pattern: "decorator",
    type: "mc",
    difficulty: 3,
    tags: ["pros-cons", "trap"],
    prompt:
      "A notification service stores senders as `Sender` objects, some wrapped in decorators such as `RetrySender` and `AuditSender`. A new feature adds this check:\n\n```java\nif (sender instanceof SmsSender) {\n  ((SmsSender) sender).setSenderId(\"ACME\");\n}\n```\nAfter a refactor wraps every `SmsSender` in an `AuditSender`, the branch never runs and nothing fails to compile. What is the best diagnosis?",
    options: [
      "`instanceof` does not work with interface-typed references in Java, so the check could never have been valid even before the refactor.",
      "Decorators match the component interface but not its concrete type, so code that depends on a concrete class breaks once it is wrapped; expose it via the interface or configure before wrapping.",
      "`AuditSender` should extend `SmsSender` so the `instanceof` check still succeeds, since decorators ought to inherit from the component they wrap.",
      "The Decorator pattern forbids stacking more than one decorator on a component, so wrapping the `SmsSender` in several wrappers is itself the bug.",
    ],
    answer: 1,
    explanation:
      "This is the book's warning: code written against a concrete component type misbehaves when decorators are added, because the decorator is a different class. Fix by configuring the `SmsSender` before wrapping it, or by adding the operation to the `Sender` interface. The claim that `instanceof` fails on interface types is false: it works with interfaces. Making `AuditSender` extend `SmsSender` would make each decorator extend a specific concrete component, destroying its ability to wrap any component. The claim that stacking is forbidden is false: stacking multiple decorators is the point of the pattern.",
    ref: "Ch. 3 Decorator (type-specific code and decorators)",
  },
  {
    id: "decorator-03",
    pattern: "decorator",
    type: "tf",
    difficulty: 3,
    tags: ["inheritance-vs-composition", "interface-vs-abstract"],
    prompt:
      "True or false: a Decorator extends the same abstract class (or implements the same interface) as the component it wraps to achieve **type matching**, so it can stand in for the component and be wrapped by other decorators, while its behavior comes from delegating to the wrapped object.",
    answer: true,
    explanation:
      "True. The decorator shares the component type so it can be used anywhere the component is expected and so decorators can be stacked. The behavior comes from composition: the decorator holds a real component and delegates to it, adding its own behavior before or after. Inheriting behavior would lock it to a fixed superclass behavior at compile time, which is the rigidity Decorator is meant to avoid. This 'inheritance for type, composition for behavior' split is the central design insight of the chapter.",
    ref: "Ch. 3 Decorator",
  },
  {
    id: "decorator-04",
    pattern: "decorator",
    type: "match",
    difficulty: 3,
    tags: ["real-api", "participants"],
    prompt:
      "Match each `java.io` class to its role in the Decorator pattern.",
    pairs: [
      ["InputStream", "Component (abstract type)"],
      ["FileInputStream", "ConcreteComponent"],
      ["FilterInputStream", "Decorator (abstract wrapper holding a component)"],
      ["BufferedInputStream", "ConcreteDecorator"],
    ],
    explanation:
      "`InputStream` is the abstract component type. `FileInputStream` is a concrete component that does the base work of reading a file. `FilterInputStream` is the abstract decorator: it extends `InputStream` and holds an `InputStream`. `BufferedInputStream` extends `FilterInputStream` and adds buffering, so it is a concrete decorator. A well-known cost of this design is the proliferation of small classes and the need to stack several wrappers (for example buffer, then gzip, then file) to get the desired combination.",
    ref: "Ch. 3 Decorator (java.io)",
  },
  {
    id: "decorator-05",
    pattern: "decorator",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "structure"],
    prompt:
      "`EncryptedSender` is meant to encrypt every message before it goes out over the wire. What is wrong with it?\n\n```java\ninterface Sender { void send(String msg); }\n\nclass HttpSender implements Sender {\n  public void send(String msg) { /* POST msg */ }\n}\n\nabstract class SenderDecorator implements Sender {\n  protected final Sender inner;\n  SenderDecorator(Sender inner) { this.inner = inner; }\n}\n\nclass EncryptedSender extends SenderDecorator {\n  EncryptedSender(Sender inner) { super(inner); }\n  public void send(String msg) {\n    inner.send(msg);\n    String cipher = encrypt(msg);\n    audit(cipher);\n  }\n}\n```",
    options: [
      "`SenderDecorator` should be an interface, because decorators cannot be abstract classes when their concrete subclasses add behavior around `send` and call the wrapped object.",
      "It never calls `super.send`, so the decorator chain is broken and the wrapped sender is never reached by any message that passes through `EncryptedSender`.",
      "`encrypt` should be a static method on `Sender` so that every decorator in a chain can share the same encryption routine instead of each defining its own.",
      "It delegates first and transforms after, so plaintext is already sent; the ciphertext must be computed before delegating and passed to `inner.send`.",
    ],
    answer: 3,
    explanation:
      "A decorator chooses whether its added behavior runs before, after, or around the delegated call, and that choice matters. Here the inner sender transmits the original message, and the ciphertext is only used for an audit afterwards, so nothing is actually encrypted on the wire. Correct body: `inner.send(encrypt(msg));`. The claim that decorators cannot be abstract classes is false: the book's own `CondimentDecorator` is an abstract class. The claim that it never calls `super.send` is wrong: `SenderDecorator` is abstract and does not implement `send`, so there is no `super.send` to call; the delegation to `inner` is the chain. Making `encrypt` static is unrelated to the defect.",
    ref: "Ch. 3 Decorator",
  },
  {
    id: "decorator-06",
    pattern: "decorator",
    type: "order",
    difficulty: 3,
    tags: ["flow", "structure"],
    prompt:
      "A sender is built as `new LoggingSender(new RetrySender(new HttpSender()))`. `LoggingSender.send` logs 'start', delegates, then logs 'end'. `RetrySender.send` calls its inner sender and retries once if it throws. `HttpSender` fails on its first call and succeeds on its second. Put the events of a single `send` call in the order they occur.",
    items: [
      "LoggingSender logs 'start'",
      "RetrySender calls HttpSender (first attempt)",
      "HttpSender throws",
      "RetrySender calls HttpSender again (second attempt)",
      "HttpSender returns normally",
      "LoggingSender logs 'end'",
    ],
    explanation:
      "The outermost decorator receives the call first, so logging starts before anything else. It delegates to the retry decorator, which delegates to the real component. The failure is handled inside the retry decorator, so the logging decorator never sees it, and it logs 'end' only after the whole inner chain returns. Swapping the wrapping order (`RetrySender(LoggingSender(...))`) would log 'start' and 'end' on each attempt: decorator order changes behavior.",
    ref: "Ch. 3 Decorator",
  }
);
