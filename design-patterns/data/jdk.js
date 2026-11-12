window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "jdk-01", pattern: "jdk", type: "match", difficulty: 3, tags: ["real-api", "compare"],
    prompt: "Match each Java library element to the design pattern it is a well-known example of.",
    pairs: [
      ["`new BufferedReader(reader)`", "Decorator"],
      ["`new InputStreamReader(System.in)`", "Adapter"],
      ["`Runtime.getRuntime()`", "Singleton"],
      ["`Collections.sort(list, comparator)`", "Strategy"],
      ["`Proxy.newProxyInstance(...)`", "Proxy"],
      ["Passing a `Runnable` to an `Executor`", "Command"]
    ],
    explanation: "BufferedReader wraps another Reader and adds buffering while keeping the Reader interface (Decorator). InputStreamReader converts a byte stream into the character-oriented Reader interface (Adapter). Runtime.getRuntime() returns the single Runtime instance (Singleton). The sort algorithm is fixed and the Comparator supplies the interchangeable comparison (Strategy). java.lang.reflect.Proxy builds a dynamic proxy that routes calls to an InvocationHandler (Proxy). A Runnable is a request packaged as an object that the Executor (invoker) runs later, which is the Command shape (the JDK does not name it that, and it has no undo).",
    ref: "Various chapters"
  },
  {
    id: "jdk-02", pattern: "jdk", type: "mc", difficulty: 3, tags: ["real-api", "trap"],
    prompt: "Which of these is the best-known example of **Template Method** in the Java standard library?",
    options: [
      "`Collections.sort(list, comparator)`, where the sorting routine fixes the overall procedure and the caller supplies the comparison step as a separate object",
      "`InputStream.read(byte[], int, int)`, whose default implementation repeatedly calls the abstract `read()` that subclasses implement",
      "`new BufferedInputStream(new FileInputStream(path))`, where one stream wraps another and adds buffering behind the same interface",
      "`Arrays.asList(array)`, which lets code written against `List` operate on an array by presenting the array through that interface"
    ],
    answer: 1,
    explanation: "`InputStream` is an abstract class whose bulk-read method is a concrete skeleton built on the one abstract single-byte `read()` that subclasses supply, which is the Template Method structure. `Collections.sort` with a comparator is Strategy (behavior passed in, not inherited). Wrapping one stream in another is Decorator. `Arrays.asList` presents an array through the `List` interface, which is usually cited as an Adapter.",
    ref: "Ch. 8 Template Method"
  },
  {
    id: "jdk-03", pattern: "jdk", type: "multi", difficulty: 3, tags: ["real-api", "trap"],
    prompt: "Choose the **two** statements about Java's Iterator support that are correct.",
    options: [
      "The enhanced for loop over any `Iterable` calls its `iterator()` method.",
      "The enhanced for loop over an array uses an `Iterator` that the compiler creates for the array, which is why arrays work with it.",
      "Since Java 8, `Iterator.remove()` has a default implementation that throws `UnsupportedOperationException`.",
      "The iterators of `ArrayList` ignore structural changes made to the list during iteration and keep returning the original elements.",
      "`Iterable` requires a `next()` method and `Iterator` requires `iterator()`, so every collection implements both interfaces itself."
    ],
    answer: [0, 2],
    explanation: "For-each over an Iterable is compiled to calls on the object's `iterator()`. `remove()` became a default method in Java 8, so read-only iterators need not implement it. For arrays the compiler generates an indexed loop with no Iterator (so the claim about a compiler-created array Iterator is false). ArrayList's iterator is fail-fast and throws `ConcurrentModificationException` when the list is structurally modified outside the iterator (so the claim that ArrayList iterators ignore changes is false). The claim about `Iterable` requiring `next()` swaps the interfaces: `Iterable` has `iterator()`, and `Iterator` has `hasNext()` and `next()`.",
    ref: "Ch. 9 Iterator"
  },
  {
    id: "jdk-04", pattern: "jdk", type: "tf", difficulty: 3, tags: ["real-api", "trap"],
    prompt: "True or false: `java.lang.reflect.Proxy.newProxyInstance` can create a dynamic proxy for a concrete class that implements no interface, by subclassing it at runtime.",
    answer: false,
    explanation: "False. The JDK dynamic proxy is built from a list of interfaces: the generated proxy class implements them and routes every method call to an `InvocationHandler`. It cannot proxy a class that has no interface to implement. Proxying concrete classes requires a bytecode library that generates subclasses, such as those used by some frameworks. This is also why the book calls the result a dynamic proxy: the proxy class is created at runtime rather than written by hand.",
    ref: "Ch. 11 Proxy"
  },
  {
    id: "jdk-05", pattern: "jdk", type: "mc", difficulty: 3, tags: ["real-api", "pros-cons"],
    prompt: "`java.util.Observable` (deprecated since Java 9) is a poor model of the Observer pattern in its design. Which statement describes a genuine design problem with it?",
    options: [
      "It supports only the push style: `notifyObservers(arg)` hands data to `update`, and there is no way for an observer to pull state from the subject.",
      "It is a class, so a subject that already extends another class cannot reuse it, and the protected `setChanged()` blocks use by composition.",
      "Observers must be registered at compile time, because `addObserver` can only be called from the subject's constructor, so no one can subscribe later.",
      "It can notify only a single observer at a time, so a subject with several observers needs a list of its own Observable objects."
    ],
    answer: 1,
    explanation: "Because `Observable` is a concrete class, using it means inheriting from it, which is impossible if the subject already has a superclass and goes against favoring composition. Its `setChanged()` method is protected, so a helper `Observable` held as a field cannot be told a change happened unless you subclass it. The remaining claims are false: observers can register at runtime with `addObserver`, `notifyObservers()` passes the observable to `update`, which lets observers pull, and `notifyObservers(arg)` supports push. It supports many observers. Newer code uses `java.beans.PropertyChangeListener` or its own interfaces.",
    ref: "Ch. 2 Observer"
  }
);
