window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "composite-01",
    pattern: "composite",
    type: "mc",
    difficulty: 3,
    tags: ["pros-cons", "principles"],
    prompt: "In a file-system model, the abstract `Node` class declares `add(Node)`, `remove(Node)`, `getChild(int)` and `size()`, with defaults that throw `UnsupportedOperationException`. `Directory` overrides them; `File` does not. What is the real cost of this design, and what does it buy?",
    options: [
      "It costs run-time speed, because every call on a `Node` is dispatched dynamically and can never be inlined by the JIT, and in exchange it buys thread safety for concurrent updates to the tree",
      "It costs compile-time type safety, since `file.add(x)` compiles and fails at run time, and it buys transparency: clients treat files and directories uniformly through `Node`",
      "It costs nothing at run time or compile time, because `File` simply inherits methods it never has to call, and the compiler still rejects `file.add(x)`",
      "It costs the ability to nest directories more than one level deep, because `getChild` returns a `Node` that cannot itself hold children, and it buys a simpler `Directory` class with fewer methods"
    ],
    answer: 1,
    explanation: "This is the transparency-versus-safety trade-off of Composite. Putting child-management methods on the shared component type lets clients treat every node the same way, with no `instanceof`, but a leaf now exposes operations that make no sense for it, and misuse shows up only at run time. The alternative (declaring child management only on the composite) is safer but forces clients to check types. The performance and thread-safety story is invented. The claim that it costs nothing ignores the real cost. The claim about nesting depth is backwards: nesting depth is unlimited because children are themselves `Node`s.",
    ref: "Ch. 9 Composite"
  },
  {
    id: "composite-02",
    pattern: "composite",
    type: "mc",
    difficulty: 3,
    tags: ["structure", "inheritance-vs-composition"],
    prompt: "A designer models an org chart as follows:\n\n```java\nclass Department {\n    private final List<Employee> staff = new ArrayList<>();\n    private final List<Department> subDepartments = new ArrayList<>();\n    int headcount() {\n        int n = staff.size();\n        for (Department d : subDepartments) n += d.headcount();\n        return n;\n    }\n}\n```\n\nManagement then asks for a third kind of member, `Contractor`, that can also appear in a department. Which statement best diagnoses the design?",
    options: [
      "The design is fine: separate typed lists give better compile-time type safety, and supporting a new kind of member only needs one more list and one more line in each method",
      "`Department` should extend `Employee`, so that a department can be stored in the staff list and inherit its `headcount()` behavior from the existing hierarchy",
      "Every new member kind forces a new list and edits to every operation in `Department`, because no common component type is shared by leaves and composites",
      "`headcount()` should be written iteratively with an explicit stack instead of recursively, because the recursion is what prevents a single list from holding all member types"
    ],
    answer: 2,
    explanation: "Composite introduces a common `Component` type so a composite can hold `List<Component>` and treat leaves and sub-composites identically. Here the container distinguishes member kinds by storing separate lists, so every operation must handle each list, and each new kind of member edits `Department` (open/closed violation). The claim that the design is fine sees the type safety but misses the cost. Making `Department` extend `Employee` uses inheritance to share code, which is the wrong relationship (a department is not an employee) and still gives no uniform child type. Rewriting `headcount()` iteratively confuses recursion with the real problem; an iterative traversal over separate lists still needs a list per kind.",
    ref: "Ch. 9 Composite"
  },
  {
    id: "composite-03",
    pattern: "composite",
    type: "tf",
    difficulty: 3,
    tags: ["principles", "pros-cons"],
    prompt: "Head First Design Patterns says the Composite pattern deliberately trades the Single Responsibility Principle for transparency: the component class has responsibilities for both the hierarchy (managing children) and the operations on the items.",
    answer: true,
    explanation: "True. The book calls this out explicitly: a Composite-style `MenuComponent` carries both child management and the item-level operations, so a class has more than one reason to change. In exchange, clients can treat leaves and composites uniformly. This trade-off is why Composite has safe variants (child management only on the composite) that give up transparency instead. It is also not a defect of a bad implementation; it is a known cost of the pattern's most common form.",
    ref: "Ch. 9 Composite"
  },
  {
    id: "composite-04",
    pattern: "composite",
    type: "match",
    difficulty: 3,
    tags: ["participants", "structure"],
    prompt: "Match each participant of Composite to its role, using a document-layout engine where a `Page` contains `Section`s, which contain `Paragraph`s and `Image`s, and the engine calls `render()` on the root.",
    pairs: [
      ["Component (`LayoutElement`)", "Declares the operations, such as `render()`, that every element of the tree supports"],
      ["Leaf (`Image`)", "Does the real work for its own case and has no children"],
      ["Composite (`Section`)", "Holds child elements and implements operations largely by delegating to them"],
      ["Client (layout engine)", "Works with the whole tree only through the Component type"],
      ["Aggregate result (page height)", "Computed by a composite from its children, for example by summing their heights"]
    ],
    explanation: "Component is the common type; leaf and composite both implement it. A leaf has no children and does the actual work; a composite stores children (typed as Component, so they can be leaves or other composites) and implements operations by delegating or aggregating. The client needs to know nothing about whether it holds one image or a whole section. The last pair shows that composite operations often combine child results, while the first four are the pattern's structural roles.",
    ref: "Ch. 9 Composite"
  },
  {
    id: "composite-05",
    pattern: "composite",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "principles"],
    prompt: "In a shopping catalogue, `Product` (leaf) and `Category` (composite) both extend `CatalogNode`:\n\n```java\nclass Category extends CatalogNode {\n    private final List<CatalogNode> children = new ArrayList<>();\n    @Override\n    public int productCount() {\n        int count = 0;\n        for (CatalogNode n : children) {\n            if (n instanceof Product) {\n                count++;\n            }\n        }\n        return count;\n    }\n}\n```\n\nA `Category` holding two products and a sub-category with five products reports `2`. What is the defect?",
    options: [
      "The method type-checks children instead of delegating `productCount()` to each child, so nested categories are skipped and any new leaf type would be ignored too",
      "The loop should also count `Category` children (`n instanceof Category`), so that each sub-category contributes to the total as one more catalogue entry",
      "`Product` should be a subclass of `Category`, so that the `instanceof` check is unnecessary and every node can be iterated as a container",
      "`productCount()` should be `static` and take the root node as a parameter, so that a single call can be made on the whole tree"
    ],
    answer: 0,
    explanation: "Composite's point is uniform treatment: call the same method on every child and let each node do the right thing (a `Product` returns 1, a `Category` returns the sum of its children). The `instanceof` branch breaks uniformity, so the sub-category's five products are never counted, and any future leaf class also vanishes from the total. Counting `Category` children as products would still not descend into them. Making `Product` a subclass of `Category` inverts the relationship (a product is not a container). Making `productCount()` static does not change how children are inspected, and a static method cannot see the instance's `children` field.",
    ref: "Ch. 9 Composite"
  },
  {
    id: "composite-06",
    pattern: "composite",
    type: "short",
    difficulty: 3,
    tags: ["compare", "structure"],
    prompt: "Composite and Decorator both rely on recursive composition and a shared component interface. Explain how they differ in structure and in intent.",
    modelAnswer: "A Decorator wraps exactly one component and adds responsibilities (behavior before or after delegating); its goal is to extend an object's behavior dynamically, and decorators are usually stacked in a chain chosen by the client. A Composite holds any number of children and its goal is to represent part-whole hierarchies so clients can treat a single object and a group of objects the same way; it typically aggregates child results (sum, count, render all) rather than adding new behavior to a single wrapped object. Both use the same type for parent and child, but Decorator is a one-to-one wrapper, Composite is one-to-many.",
    keyPoints: [
      "Decorator has one wrapped component; Composite has many children",
      "Decorator intent: add responsibilities dynamically; Composite intent: part-whole tree with uniform treatment",
      "Composite operations usually aggregate child results; Decorator operations usually add behavior around one delegate call",
      "Both are recursive and share a common supertype, which is why they are confusable"
    ],
    ref: "Ch. 3 Decorator, Ch. 9 Composite"
  }
);
