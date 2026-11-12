window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "factory-method-01",
    pattern: "factory-method",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "what-is"],
    prompt:
      "A reporting module has `static Exporter ExporterFactory.create(String format)` containing an `if/else` that returns `PdfExporter`, `CsvExporter`, and so on. A teammate says 'that is the Factory Method pattern'. What is the accurate response?",
    options: [
      "Correct: any method that returns a new object is a factory method, and the pattern is defined by that alone, whatever class holds the method.",
      "Correct, but only because the method is static; factories that need an instance of their class are Abstract Factory instead.",
      "Not quite: that is the Simple Factory idiom. Factory Method has subclasses of a creator override a method that the creator's other code uses via the product interface.",
      "Not quite: it would become Factory Method only if it returned an interface instead of a concrete class, because the pattern is about hiding return types.",
    ],
    answer: 2,
    explanation:
      "Simple Factory centralizes creation in one class or method but is not extensible by subclassing and needs modification for each new type. Factory Method is an inheritance-based pattern: a creator declares (often abstract) `createX()`, its own operations use the result via the product interface, and subclasses decide which concrete product is created. The claim that any method returning a new object is a factory method overgeneralizes. The claim that it is a factory method because it is static is wrong: `static` is not what distinguishes it (a static method cannot even be overridden), and Abstract Factory is about families of products. The claim that it needs to return an interface is wrong: the existing method may already return an interface; the missing part is the creator hierarchy.",
    ref: "Ch. 4 Factory Method (Simple Factory vs Factory Method)",
  },
  {
    id: "factory-method-02",
    pattern: "factory-method",
    type: "mc",
    difficulty: 3,
    tags: ["pros-cons", "inheritance-vs-composition"],
    prompt:
      "A `Parser` creator has a **parameterized factory method** `abstract Document create(String type)`. Subclasses implement it with a `switch`. What is the main trade-off of this variant compared with one factory method per product?",
    options: [
      "It needs more creator subclasses than one factory method per product, since each product type must get its own creator class to hold the switch and nothing else.",
      "One creator can produce many products from a single method, but callers pass a string or enum, so bad values fail at runtime and new products mean editing a switch.",
      "It cannot return an interface type, only concrete classes, because a `switch` over a string has to construct something specific in every branch of the method.",
      "It can only be used if the creator is a concrete class rather than abstract, since an abstract method cannot take a parameter in Java at all.",
    ],
    answer: 1,
    explanation:
      "Parameterization is convenient and was shown in the book (the pizza store chooses a pizza by type), but it trades compile-time checks for a runtime lookup and concentrates a conditional in each creator, reducing the extensibility Factory Method is meant to provide. The claim that it needs more creator subclasses is backwards: it needs fewer. The claim that it cannot return an interface type is false: return types are normally the abstract product. The claim that it requires a concrete creator is false: abstract methods can take parameters and the creator can still be abstract.",
    ref: "Ch. 4 Factory Method; GoF implementation notes",
  },
  {
    id: "factory-method-03",
    pattern: "factory-method",
    type: "tf",
    difficulty: 3,
    tags: ["structure", "interface-vs-abstract"],
    prompt:
      "True or false: in the Factory Method pattern the Creator class must be abstract and the factory method must have no default implementation.",
    answer: false,
    explanation:
      "False. In the book's example the creator (`PizzaStore`) is abstract with an abstract factory method, but the GoF pattern also allows a concrete creator that supplies a **default** product, with subclasses overriding the method only when they need a different product. Another common form is a hook method with a sensible default. What is required is that creation goes through an overridable method, not that it is abstract.",
    ref: "Ch. 4 Factory Method; GoF",
  },
  {
    id: "factory-method-04",
    pattern: "factory-method",
    type: "multi",
    difficulty: 3,
    tags: ["structure", "principles"],
    prompt:
      "Select all statements that are true about a typical Factory Method design (choose all that apply).",
    options: [
      "The creator's non-creation code can be written against the Product interface without knowing which concrete product it receives.",
      "The factory method should be `static` so clients can call it without instantiating a creator, avoiding the cost of a creator object.",
      "Switching to a different concrete product usually means using a different Creator subclass, which is chosen when the creator object is built rather than by rewiring an existing one.",
      "The creator base class decides which concrete product to build by testing a type flag passed in by its subclasses or its callers.",
      "It supports the Dependency Inversion Principle: the high-level creator and the low-level concrete products both depend on the Product abstraction.",
    ],
    answer: [0, 2, 4],
    explanation:
      "Writing the creator's other code against the Product interface is the heart of the pattern. Needing a different Creator subclass to switch products is a real consequence of using inheritance: the product choice is tied to the creator subclass, unlike Abstract Factory or Strategy where an object is injected and can be swapped. The Dependency Inversion point is the book's own argument. The claim that the factory method should be `static` is false: static methods cannot be overridden polymorphically. The type-flag claim describes the conditional-driven creation that the pattern replaces.",
    ref: "Ch. 4 Factory Method; Dependency Inversion Principle",
  },
  {
    id: "factory-method-05",
    pattern: "factory-method",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "trap"],
    prompt:
      "A UI base class calls its factory method from the constructor. What goes wrong at runtime?\n\n```java\nenum Theme { LIGHT, DARK }\n\nabstract class Dialog {\n  protected final Button ok;\n  Dialog() { ok = createButton(); }\n  protected abstract Button createButton();\n}\n\nclass ThemedDialog extends Dialog {\n  private final Theme theme = Theme.DARK;\n  protected Button createButton() { return new ThemedButton(theme); }\n}\n```",
    options: [
      "Nothing goes wrong; `theme` is `final` and initialized with a constant, so it is always `DARK` by the time any code in the class hierarchy can read it.",
      "`createButton` is `protected`, so `Dialog` cannot call it from its own constructor even though `Dialog` itself is the class that declares the method.",
      "The code does not compile, because Java forbids calling an abstract method from inside a constructor of the class that declares that method.",
      "`createButton` runs in the `Dialog` constructor before `ThemedDialog`'s field initializers, so `theme` is still `null`.",
    ],
    answer: 3,
    explanation:
      "In Java the superclass constructor runs before the subclass's field initializers. A factory method invoked from the base constructor therefore executes on a partially constructed subclass object, so `theme` (an enum value, not a compile-time constant) is still `null`. Fix: don't call overridable factory methods in constructors; create the product lazily or in an `init()` method called after construction. The claim that nothing goes wrong would be true only for a compile-time constant such as a `static final String`. The claim that `protected` blocks the call is false: protected members are accessible within the class. The claim that the code does not compile is false: the call compiles fine, which is why this trap is dangerous.",
    ref: "Ch. 4 Factory Method; Java initialization order",
  },
  {
    id: "factory-method-06",
    pattern: "factory-method",
    type: "short",
    difficulty: 3,
    tags: ["principles"],
    prompt:
      "The book says Factory Method follows the Dependency Inversion Principle and 'inverts' the dependencies. Explain what is inverted, compared with a `PizzaStore` that uses `new` on concrete pizza classes.",
    modelAnswer:
      "Without the pattern, the high-level `PizzaStore` depends directly on every low-level concrete pizza class, so dependencies flow downward from policy to details. With Factory Method, the store depends only on the abstract `Pizza` and the abstract `createPizza` method, and the concrete pizzas also depend on (implement) the `Pizza` abstraction. Both high-level and low-level code now depend on the abstraction, so the dependency arrow from the high-level component to the concrete classes is gone. Concrete choice happens in the store subclasses.",
    keyPoints: [
      "High-level store no longer depends on concrete product classes",
      "Both store and concrete products depend on the Product abstraction",
      "Concrete instantiation moves into creator subclasses",
    ],
    explanation:
      "The 'inversion' is that the low-level concrete classes now point toward an abstraction owned by the high-level code, rather than the high-level code pointing at the low-level classes. The book also notes the principle is a guideline: it is acceptable to instantiate stable classes (like `String`) directly.",
    ref: "Ch. 4 Factory Method; Dependency Inversion Principle",
  }
);
