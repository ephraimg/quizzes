window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "iterator-01",
    pattern: "iterator",
    type: "mc",
    difficulty: 3,
    tags: ["what-is", "principles"],
    prompt: "A `PlaylistLibrary` exposes `Track nextTrack()` and `void reset()` and keeps the cursor in a private field. A UI thread and a background exporter both need to walk the library at the same time, and they keep corrupting each other's position. Which consequence of applying the Iterator pattern addresses this problem most directly?",
    options: [
      "The library becomes immutable as soon as any iterator has been created, so no traversal can ever observe a change made by another client",
      "The library synchronizes every call to `next()` on a lock it owns, so the two clients take turns advancing the single shared cursor",
      "Each traversal gets its own `Iterator` object that carries its own cursor, so any number of traversals can be in progress independently",
      "The library hands every client a private snapshot copy of its tracks when traversal starts, so no traversal state is ever shared between clients"
    ],
    answer: 2,
    explanation: "Iterator moves the traversal state out of the aggregate and into a separate object, one per traversal. That is what lets two clients walk the same collection independently. The claim that the library becomes immutable is invented: the pattern does not freeze the aggregate (ArrayList iterators are in fact fail-fast on modification). The shared-lock claim describes locking, which the pattern does not provide; two interleaved clients sharing one cursor would still corrupt each other, and iterators from ArrayList are not thread-safe either. The private-snapshot claim is a defensive-copy technique and is not part of Iterator. Note that the pattern gives independent cursors, not safety against concurrent modification of the underlying data.",
    ref: "Ch. 9 Iterator"
  },
  {
    id: "iterator-02",
    pattern: "iterator",
    type: "mc",
    difficulty: 3,
    tags: ["interface-vs-abstract", "inheritance-vs-composition"],
    prompt: "Java models traversal with the `Iterator` and `Iterable` interfaces. Suppose instead it had offered an abstract class `AbstractAggregate` that holds a cursor field and implements `hasNext()`/`next()` for subclasses. Which is the strongest reason the interface design is better?",
    options: [
      "Aggregates that already extend another class (for example a persistence base class) could not also inherit from `AbstractAggregate`, and a cursor stored in the aggregate would bring back the shared-traversal-state problem",
      "An abstract class cannot be instantiated inline the way an interface can, so no aggregate could return a small anonymous traversal object and every traversal would need a named top-level class",
      "Once the JIT has compiled the hot path, a method call through an interface reference is measurably faster than one through an abstract class reference, and that speed-up matters in the tight loops that traversals usually run in",
      "An abstract class holding the cursor would force every aggregate to expose its internal storage to clients, because the base class would have to index into the elements directly"
    ],
    answer: 0,
    explanation: "Java has single class inheritance, so a class-based contract can only be adopted by classes that are free to pick that superclass. An interface lets array-wrapping classes and domain objects with an existing hierarchy participate. Also, putting the cursor on the aggregate (the abstract-class design) puts traversal state back into the collection, which is exactly what Iterator removes. The claim about anonymous instantiation is false: anonymous subclasses of abstract classes are legal. The JIT speed claim is not a design reason, and not generally true. The exposure-of-internals claim confuses inheritance with encapsulation; an abstract base class does not force exposure of internals.",
    ref: "Ch. 9 Iterator"
  },
  {
    id: "iterator-03",
    pattern: "iterator",
    type: "tf",
    difficulty: 3,
    tags: ["trap", "real-api"],
    prompt: "In a single thread, calling `list.remove(...)` on an `ArrayList` inside a for-each loop over that list, while the iterator is positioned at the second-to-last element, ends the loop without throwing `ConcurrentModificationException`, so the last element is silently skipped.",
    answer: true,
    explanation: "True. `hasNext()` only compares the cursor with the current size. After removing an element at the second-to-last position, the cursor equals the new size, so `hasNext()` returns false and the modification check inside `next()` never runs. This is one reason the ArrayList documentation calls fail-fast behavior best-effort: it detects bugs but is not a correctness guarantee. Iterator decouples traversal from the aggregate; it does not by itself promise safe traversal of a changing collection. Use `Iterator.remove()` or a concurrent collection when the data changes during traversal.",
    ref: "Ch. 9 Iterator"
  },
  {
    id: "iterator-04",
    pattern: "iterator",
    type: "multi",
    difficulty: 3,
    tags: ["compare", "pros-cons"],
    prompt: "Iterator as presented in the book is an **external** iterator (the client drives with `hasNext()`/`next()`). Java also offers **internal** iteration through `forEach(Consumer)` and streams. Select all statements that are true.",
    options: [
      "A client can pair the i-th elements of two collections by advancing two external iterators in step, which a single `forEach` call on one of them cannot do directly",
      "Internal iteration lets the collection decide how the loop runs (for example a specialized loop over its own backing array) without any change to the client code",
      "In the book's Iterator pattern, the aggregate pushes each element to a callback that the client supplies when it starts the traversal, and the client never calls `next()` itself",
      "With an external iterator, the aggregate itself must keep the current position of every traversal in progress, so that a client which stops can resume the traversal later",
      "An external iterator lets the client use ordinary loop control (`break`, `continue`, interleaved work) between elements"
    ],
    answer: [0, 1, 4],
    explanation: "External iteration hands control to the client: it can pause, stop, and advance several iterators in step (pairing elements in step, and `break`/`continue`). Internal iteration inverts control, so the collection owns the loop and can optimize it. The callback claim describes internal iteration/Observer-style callbacks, not the book's Iterator. The claim that the aggregate keeps every position is the opposite of the pattern: the position lives in the iterator object, not in the aggregate. Distinguishing who owns the loop and who owns the cursor is the key point.",
    ref: "Ch. 9 Iterator"
  },
  {
    id: "iterator-05",
    pattern: "iterator",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "participants"],
    prompt: "A restaurant menu stores items in a fixed-capacity array and exposes an iterator:\n\n```java\npublic class ArrayMenu implements Iterable<MenuItem> {\n    private static final int MAX = 10;\n    private final MenuItem[] items = new MenuItem[MAX];\n    private int count = 0;\n\n    public void add(MenuItem item) { items[count++] = item; }\n\n    public Iterator<MenuItem> iterator() {\n        return new Iterator<MenuItem>() {\n            private int position = 0;\n            public boolean hasNext() { return position < items.length; }\n            public MenuItem next() { return items[position++]; }\n        };\n    }\n}\n```\n\nA menu with 3 items is added and a client runs `for (MenuItem i : menu) System.out.println(i.getName());`. It crashes with a `NullPointerException`. What is the defect?",
    options: [
      "`position` should be a `static` field so that all iterators over the menu share one cursor and never revisit a slot",
      "`ArrayMenu` should extend an abstract `Iterator` base class instead of implementing `Iterable`, so the cursor logic lives in one place",
      "`next()` must be `synchronized`, otherwise the write made by `add` is not guaranteed to be visible when the array is read",
      "`hasNext()` bounds the traversal by the array capacity, not by the stored count"
    ],
    answer: 3,
    explanation: "The iterator must traverse the aggregate's logical contents, not its backing storage. With capacity 10 and 3 items, `hasNext()` stays true for seven empty slots and `next()` returns null. It should compare against `count`. Making `position` static would break independent traversals, which is the whole benefit of the pattern. Extending an abstract `Iterator` base class is wrong: Iterator is an interface and the aggregate side is `Iterable`, which the code already uses correctly. Adding `synchronized` is unrelated to the NPE; synchronization would not change which slots are read. (A fuller iterator would also throw `NoSuchElementException` past the end, but that is not what causes this crash.)",
    ref: "Ch. 9 Iterator"
  },
  {
    id: "iterator-06",
    pattern: "iterator",
    type: "short",
    difficulty: 3,
    tags: ["compare", "structure"],
    prompt: "Iterator and Composite are used together in the book's menu example. Describe how an external iterator walks a Composite tree without recursion in the client, and explain why a leaf's `createIterator()` returns a null iterator (one whose `hasNext()` always returns false) instead of the Java value `null`.",
    modelAnswer: "The composite iterator keeps a stack of iterators, starting with the iterator over the root's children. On `next()` it takes the next component from the top iterator and, if that component is a composite, pushes the component's own iterator onto the stack before returning it. On `hasNext()` it looks at the top iterator, pops it if it is exhausted and tries the one below, and reports false once the stack is empty. The stack remembers where each level of the tree left off, so the client needs no recursion. A leaf's `createIterator()` returns a null iterator rather than `null` so that callers can ask any component for an iterator and loop over it without a null check: a leaf simply contributes nothing to the walk. The same idea means the traversal can push every component's iterator without special-casing leaves, because a leaf's iterator is empty and is popped at once.",
    keyPoints: [
      "State is a stack of iterators, one per tree level that is still being walked",
      "Composites' iterators are pushed as they are visited, so descent happens lazily as the client calls next()",
      "Exhausted iterators are popped to resume the parent level",
      "The null iterator for leaves avoids null checks and lets callers treat every component's createIterator() the same way"
    ],
    ref: "Ch. 9 Iterator and Composite"
  }
);
