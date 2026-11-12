window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "abstract-factory-01",
    pattern: "abstract-factory",
    type: "mc",
    difficulty: 3,
    tags: ["when-to-use", "compare"],
    prompt:
      "A data-access library supports Postgres and MySQL. For each vendor it produces a matching `Connection`, `Statement`, and `ResultSetMapper`, and mixing a Postgres connection with a MySQL mapper is a bug. A teammate proposes three separate Factory Method creators, one per product, each choosing the vendor from configuration. What is the strongest argument for a single Abstract Factory instead?",
    options: [
      "The vendor is chosen once, when one `DataAccessFactory` object is built, so every product the client creates comes from the same family; three separate creators could each be configured differently.",
      "Abstract Factory lets a new product type, such as `createTransactionLog`, be added without touching any existing concrete factory, which three Factory Method creators cannot do.",
      "Factory Method cannot return interface types such as `Connection`, whereas an Abstract Factory is allowed to return interfaces from each of its creation methods.",
      "Abstract Factory removes subclassing completely, since concrete factories are plain classes with no inheritance, which makes it easier to test than creator subclasses.",
    ],
    answer: 0,
    explanation:
      "The deciding signal is a family of related products that must be used together, with the family varying as a unit. One factory object, chosen once, enforces that consistency; with separate creators the client (or config) could pick different vendors for each product. The claim that a new product type can be added without touching any concrete factory is the opposite of the truth: adding a product type changes the abstract factory interface and every concrete factory. The claim that Factory Method cannot return interface types is false: Factory Method methods normally return the abstract product type. The claim that Abstract Factory removes subclassing is wrong: concrete factories implement or extend the abstract factory type, and the pattern is not defined by avoiding inheritance.",
    ref: "Ch. 4 Abstract Factory",
  },
  {
    id: "abstract-factory-02",
    pattern: "abstract-factory",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "inheritance-vs-composition"],
    prompt:
      "Which statement best contrasts how a client uses Abstract Factory with how it uses Factory Method?",
    options: [
      "Factory Method is used by composition, with the client handed a creator object to call. Abstract Factory is used by inheritance, with the client subclassing the factory to add products.",
      "Abstract Factory is used by composition: the client is handed a factory object and calls its methods. Factory Method uses inheritance: a subclass overrides a method the creator calls.",
      "Both are used only through composition, because factory classes never extend other classes and clients always receive an already-built factory instance in each case.",
      "Abstract Factory returns exactly one product per factory object, while Factory Method returns a whole family of related products from a single creator class and method.",
    ],
    answer: 1,
    explanation:
      "The book contrasts the two exactly this way: Abstract Factory delegates creation to another object (composition), and that object's interface has several creation methods for a family. Factory Method relies on subclassing so the creator's template-style code can call an overridable method. The claim that Factory Method is used by composition and Abstract Factory by inheritance reverses it. The claim that both are used only through composition is wrong because Factory Method is inheritance-based. The claim that Abstract Factory returns one product per factory reverses the products-per-factory relationship. Note that concrete factories in Abstract Factory are often implemented with factory methods, which is why the patterns appear together.",
    ref: "Ch. 4 Abstract Factory vs Factory Method",
  },
  {
    id: "abstract-factory-03",
    pattern: "abstract-factory",
    type: "tf",
    difficulty: 3,
    tags: ["structure", "compare"],
    prompt:
      "True or false: because a client typically needs only one factory per product family at any time, a concrete factory is often implemented as a Singleton.",
    answer: true,
    explanation:
      "True (GoF implementation note). A concrete factory is usually stateless or holds only configuration, and one instance per family is enough, so it is commonly a singleton. This does not mean the abstract factory type is a singleton, and clients should still receive it through a parameter or injection rather than calling a static accessor, which preserves the ability to substitute a different factory in tests or to support another family.",
    ref: "GoF Abstract Factory, Implementation",
  },
  {
    id: "abstract-factory-04",
    pattern: "abstract-factory",
    type: "match",
    difficulty: 3,
    tags: ["compare", "when-to-use"],
    prompt:
      "Match each scenario to the creational approach it most directly describes.",
    pairs: [
      [
        "A framework's base class has an abstract `createParser()` that each application subclass overrides",
        "Factory Method",
      ],
      [
        "A cross-platform UI toolkit hands the app one object that builds a matching button, checkbox, and scrollbar for the current OS",
        "Abstract Factory",
      ],
      [
        "A static method takes a string like \"csv\" and returns the right `Exporter` via an if/else",
        "Simple Factory (idiom)",
      ],
      [
        "A game spawns enemies by cloning a configured template instance",
        "Prototype",
      ],
    ],
    explanation:
      "Overridable creation in a base class is Factory Method. One object with several creation methods producing a consistent family is Abstract Factory. A single conditional-based creation method with no subclassing is the Simple Factory idiom (the book notes it is not a GoF pattern). Creating by copying an existing configured object is Prototype.",
    ref: "Ch. 4 Factory patterns",
  },
  {
    id: "abstract-factory-05",
    pattern: "abstract-factory",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "principles"],
    prompt:
      "This code uses an Abstract Factory, yet a bug appears: a dark-themed checkbox renders on a light-themed, Mac-styled form. What is the design mistake?\n\n```java\ninterface WidgetFactory { Button createButton(); Checkbox createCheckbox(); }\n\nclass Form {\n  Button submit;\n  Checkbox agree;\n  Form(Config cfg) {\n    WidgetFactory f1 = cfg.isMac() ? new MacFactory() : new WinFactory();\n    submit = f1.createButton();\n    WidgetFactory f2 = cfg.isDark() ? new DarkFactory() : new LightFactory();\n    agree = f2.createCheckbox();\n  }\n}\n```",
    options: [
      "`WidgetFactory` should be an abstract class, because interfaces by themselves cannot enforce that all the products created come from one consistent family of widgets.",
      "`Form` should call `new` on the concrete widget classes directly so that it does not have to choose among several different factories while it is being built.",
      "Each widget comes from a separately chosen factory, so the one-family guarantee is lost; `Form` should take one `WidgetFactory` and create every widget from it.",
      "`createButton` and `createCheckbox` should be static so that all the concrete factories share a single implementation of each method without any subclassing.",
    ],
    answer: 2,
    explanation:
      "Abstract Factory only guarantees consistency if the client obtains all related products from the same factory instance. Choosing factories per product moves the family decision back into the client and lets incompatible families be mixed. The fix is to select one factory once (in a composition root or by injection) and pass it into `Form`. Making `WidgetFactory` an abstract class is wrong: an interface works equally well. Calling `new` on the concrete widgets abandons the pattern and its abstraction. Making the creation methods static is wrong: static methods cannot be overridden by the concrete factories, so polymorphism would be lost.",
    ref: "Ch. 4 Abstract Factory",
  },
  {
    id: "abstract-factory-06",
    pattern: "abstract-factory",
    type: "short",
    difficulty: 3,
    tags: ["pros-cons"],
    prompt:
      "Adding a new **family** (for example a new database vendor) to an Abstract Factory design is easy, but adding a new **product type** (for example `createTransactionLog`) is painful. Explain why, and describe one way to reduce the pain.",
    modelAnswer:
      "A new family needs only one more concrete factory class and its products, with no change to existing code. A new product type needs a new method on the abstract factory interface, so every existing concrete factory must be modified to implement it, and the client code that uses the family may need updating too. Ways to reduce it: use a default method (or a base class) with a sensible default implementation, keep the family small and stable, or use a parameterized create method (at the price of type safety), or split the interface into smaller factories.",
    keyPoints: [
      "New family: add a concrete factory and products, existing code unchanged (open for extension)",
      "New product type: changes the abstract interface and forces every concrete factory to change",
      "Mitigation: default methods or base class, smaller interfaces, or parameterized creation with the type-safety trade-off",
    ],
    explanation:
      "The abstract factory interface encodes the set of product types, so it is fixed along that axis while being extensible along the family axis. This is the central trade-off of the pattern: choose it when families vary and the product set is stable.",
    ref: "Ch. 4 Abstract Factory; GoF consequences",
  }
);
