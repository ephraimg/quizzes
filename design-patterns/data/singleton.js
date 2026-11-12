window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "singleton-01",
    pattern: "singleton",
    type: "mc",
    difficulty: 3,
    tags: ["structure", "trap"],
    prompt:
      "A trading app creates its exchange-rate registry lazily with double-checked locking:\n\n```java\npublic class RateRegistry {\n  private static volatile RateRegistry instance;\n  private RateRegistry() { /* loads rates */ }\n  public static RateRegistry getInstance() {\n    if (instance == null) {\n      synchronized (RateRegistry.class) {\n        if (instance == null) {\n          instance = new RateRegistry();\n        }\n      }\n    }\n    return instance;\n  }\n}\n```\n\nWhat specific failure does the `volatile` modifier prevent here?",
    options: [
      "Two threads both entering the synchronized block at the same time, each constructing and publishing its own `RateRegistry`",
      "The JVM garbage-collecting the registry between calls, since the only reference to it is a static field of the class itself",
      "A thread outside the lock seeing a non-null `instance` whose constructor has not finished running",
      "Subclasses overriding `getInstance()` and returning a different registry object to callers that use the base class"
    ],
    answer: 2,
    explanation:
      "Without `volatile`, the JVM may reorder 'allocate memory, assign the reference, run the constructor'. A second thread can then pass the unsynchronized first `if (instance == null)` check, see a non-null reference, and use a half-built object. `volatile` (with Java 5+ memory semantics) forbids that reordering. Two threads both constructing the registry is not what `volatile` prevents: the second null check inside the synchronized block is what stops double creation. Garbage collection is not a risk because a static field is a GC root. Subclass overriding is not possible because `getInstance()` is static and the constructor is private, so neither can be overridden. Intent of Singleton: one instance with a global access point; DCL is just one way to do lazy, thread-safe creation.",
    ref: "Ch. 5 Singleton (double-checked locking)"
  },
  {
    id: "singleton-02",
    pattern: "singleton",
    type: "mc",
    difficulty: 3,
    tags: ["inheritance-vs-composition", "interface-vs-abstract", "pros-cons"],
    prompt:
      "You implement a Singleton as a single-element enum (`enum AuditLog { INSTANCE; ... }`). It handles serialization and reflection attacks for free. Which limitation still applies?",
    options: [
      "Deserializing a saved `AuditLog.INSTANCE` produces a second instance unless you add a `readResolve()` method to the enum",
      "It cannot extend a domain base class, because every enum already extends `java.lang.Enum`",
      "It cannot implement an interface such as `Auditor`, because enums are implicitly final and may not declare supertypes",
      "A caller can create a second instance by invoking the private enum constructor through reflection with `setAccessible(true)`"
    ],
    answer: 1,
    explanation:
      "Enums implicitly extend `Enum`, and Java has single class inheritance, so an enum singleton cannot extend a domain base class. It can implement interfaces (so the claim that it cannot implement an interface is wrong, and this makes the enum singleton easy to hide behind an interface); enums are implicitly final only in the sense that they cannot be subclassed. Serialization is handled by the enum machinery (only the constant name is written, and deserialization returns the existing constant), so `readResolve()` is not needed. Reflection cannot instantiate enum constants: `Constructor.newInstance` throws for enum types. The remaining trade-off is that you give up the class hierarchy: the enum cannot extend a base class.",
    ref: "Ch. 5 Singleton (Java enum)"
  },
  {
    id: "singleton-03",
    pattern: "singleton",
    type: "tf",
    difficulty: 3,
    tags: ["trap", "pros-cons"],
    prompt:
      "True or false: in an application server that loads the same Singleton class through two different class loaders (for example, two deployed web apps with their own copy of the jar), each class loader can end up with its own 'single' instance.",
    answer: true,
    explanation:
      "True. A static field belongs to a class, and a class is identified by its name plus its defining class loader. Two loaders that each define the class produce two classes with two separate static fields, so two instances coexist in one JVM. The book warns about this under multiple class loaders. The 'one instance' guarantee is therefore 'one per class loader', and sharing the class from a common parent loader (or using an external registry) is needed for a true JVM-wide singleton.",
    ref: "Ch. 5 Singleton (class loaders)"
  },
  {
    id: "singleton-04",
    pattern: "singleton",
    type: "multi",
    difficulty: 3,
    tags: ["pros-cons", "principles", "smell"],
    prompt: "Which statements about the costs of the classic Singleton are accurate? Select all that apply.",
    options: [
      "Callers fetch it through a static call, so the dependency is hidden from constructors and is hard to replace with a fake in unit tests",
      "The class manages its own lifecycle in addition to its real job, which strains the single responsibility principle",
      "Making the constructor private makes `getInstance()` thread-safe automatically, because no outside code can call `new` concurrently",
      "A private constructor makes it hard to subclass, because subclasses cannot call it",
      "It can only be created eagerly at class-load time, so it cannot hold lazily loaded resources or defer expensive setup"
    ],
    answer: [0, 1, 3],
    explanation:
      "Hidden dependencies and poor testability, mixed responsibilities, and the subclassing problem (private constructor; you need a protected constructor or a registry, which is then no longer strictly one instance) are the standard criticisms. A private constructor only controls who can call `new`, not what happens when two threads call `getInstance()` concurrently, so thread safety needs synchronization, an eager static, a holder class, or an enum. Lazy creation is explicitly possible (lazy `getInstance()`, DCL, holder idiom), so the claim that it can only be created eagerly is wrong.",
    ref: "Ch. 5 Singleton"
  },
  {
    id: "singleton-05",
    pattern: "singleton",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "trap"],
    prompt:
      "This class is meant to be the single configuration holder. It is also written to disk between runs and read back with `ObjectInputStream`.\n\n```java\npublic class AppConfig implements Serializable {\n  private static final AppConfig INSTANCE = new AppConfig();\n  private String region = \"eu\";\n  private AppConfig() { }\n  public static AppConfig getInstance() { return INSTANCE; }\n}\n```\n\nWhich problem breaks the singleton guarantee?",
    options: [
      "Eager initialization of `INSTANCE` is not thread-safe, so two threads calling `getInstance()` at once can create two objects",
      "Deserialization creates a new `AppConfig` unless the class defines `readResolve()` returning `INSTANCE`",
      "`INSTANCE` is final, so the instance can never be replaced with a fake, which makes any test of the class impossible",
      "The private constructor prevents `ObjectInputStream` from loading the class at all, so the config can never be read back"
    ],
    answer: 1,
    explanation:
      "Reading a `Serializable` object builds a fresh instance without calling the constructor (serialization bypasses it), so the application now holds a second `AppConfig`. Adding `private Object readResolve() { return INSTANCE; }` (or switching to an enum) fixes it. The claim that eager initialization is not thread-safe is wrong: static field initialization runs once, under the class-initialization lock, so it is thread-safe. The claim about `final` blocking test fakes describes a real testability cost of Singleton in general, but it does not break the 'one instance' guarantee and is not the defect asked about. The claim that the private constructor blocks loading is wrong because serialization does not need an accessible constructor.",
    ref: "Ch. 5 Singleton"
  },
  {
    id: "singleton-06",
    pattern: "singleton",
    type: "short",
    difficulty: 3,
    tags: ["when-to-use", "compare", "principles"],
    prompt:
      "A teammate wants to make `PaymentGatewayClient` a classic Singleton so every class can call `PaymentGatewayClient.getInstance()`. Explain when this is the wrong tool, and what you would use to still have just one instance in production.",
    modelAnswer:
      "Classic Singleton is wrong when many classes need to be tested with a fake gateway, or when 'one instance' is only a deployment choice rather than a real invariant. The static `getInstance()` hides the dependency, couples every caller to the concrete class, and makes substituting a test double hard. Instead, give the class a normal public constructor behind an interface, create it once at application startup, and inject it into the classes that need it (for example, a DI container's singleton scope). You get one instance in production without global access, and tests can pass their own implementation.",
    explanation:
      "A classic Singleton trades testability and explicit dependencies for convenient global access. Because the pattern guarantees one instance but also makes that instance globally reachable, it fits only when one instance is a true invariant. Injecting a single shared instance keeps the one-instance lifetime without the static coupling.",
    keyPoints: [
      "Static global access hides dependencies and couples callers to the concrete class",
      "Hard to substitute a fake or mock in tests",
      "'One instance' is a lifecycle decision, not necessarily a class invariant",
      "Alternative: inject a single shared instance (DI singleton scope or composition root) behind an interface"
    ],
    ref: "Ch. 5 Singleton"
  }
);
