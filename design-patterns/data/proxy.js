window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "proxy-01",
    pattern: "proxy",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "what-is"],
    prompt: "A `CachingPriceService` and a `LoggingPriceService` both implement the `PriceService` interface and both wrap another `PriceService`. A colleague says one is a Decorator and the other is a Proxy, \"because they are the same structure\". Which statement best separates the two patterns?",
    options: [
      "A Proxy exposes a different interface than the object it wraps, translating each call into the subject's own methods, whereas a Decorator keeps exactly the same interface as the component it wraps",
      "A Decorator can wrap only one object at a time, so it cannot be chained, while a Proxy can hold references to several subjects and pick among them for each request",
      "A Proxy stands in for its subject and controls access to it (creation, location, permissions, caching), often deciding whether the real subject is used at all; a Decorator layers responsibilities onto a component it was given, and is meant to be stacked",
      "A Proxy is always created by the real subject it stands in for, which hands the proxy out to clients in its own place, while a Decorator is always created and wired up by the client that wants the extra behavior, and neither pattern allows the other arrangement"
    ],
    answer: 2,
    explanation: "Both wrap an object that has the same interface, so the class diagram alone does not tell them apart; intent does. A Proxy controls access to the subject (lazy creation, remote location, authorization, caching) and often owns or builds the subject itself. A Decorator adds behavior to a component the client supplies, and the client can stack several. The claim that a Proxy exposes a different interface describes Adapter, not Proxy: proxy and decorator both preserve the interface. The claim that a Decorator can wrap only one object is false (a decorator wraps one component per layer and can be chained, and a proxy also has one subject). The claim about who always creates each wrapper invents creation rules; nothing in either pattern says who calls the constructor. So `CachingPriceService` is a caching proxy if it controls access to the price, and `LoggingPriceService` is a decorator if it only adds behavior.",
    ref: "Ch. 11 Proxy"
  },
  {
    id: "proxy-02",
    pattern: "proxy",
    type: "mc",
    difficulty: 3,
    tags: ["pros-cons", "trap"],
    prompt: "A virtual proxy for an expensive `HeavyReport` creates the real object the first time `render()` is called:\n\n```java\nclass ReportProxy implements Report {\n    private HeavyReport real;\n    public String render() {\n        if (real == null) {\n            real = new HeavyReport();\n        }\n        return real.render();\n    }\n}\n```\n\nA single `ReportProxy` is shared by all request threads of a web application. What is the problem, and the usual remedy?",
    options: [
      "Two threads can both see `real == null` and each build a `HeavyReport`, and one may see a partially constructed object; guard the lazy initialization with `synchronized`, a `volatile` field plus double-checked locking, or a holder class",
      "A virtual proxy must always create its subject in its own constructor so that the reference is final and safely published, which means lazy creation on first use is wrong in the first place",
      "The `Report` interface should be replaced by an abstract class, so that the proxy can inherit one shared creation routine and the subject is built before the first request arrives",
      "Nothing is wrong, because a reference assignment is atomic in Java, so at worst one thread's object is discarded and no thread can ever observe a half-built `HeavyReport`"
    ],
    answer: 0,
    explanation: "Lazy creation is the defining job of a virtual proxy, but it adds a check-then-act race: without synchronization, two threads can both create the expensive object, and without a happens-before edge a thread may observe a non-null reference to a not fully initialized object. Remedies: a synchronized accessor, a `volatile` field with double-checked locking, or an initialization-on-demand holder. The claim that the subject must be created in the proxy's constructor is backwards (eager creation would give up the whole benefit of a virtual proxy). Replacing the interface with an abstract class does not address concurrency. The claim that nothing is wrong is false: the assignment is atomic, but the check-then-assign sequence is not, and without safe publication another thread can see the reference before the object's fields.",
    ref: "Ch. 11 Proxy"
  },
  {
    id: "proxy-03",
    pattern: "proxy",
    type: "tf",
    difficulty: 3,
    tags: ["real-api", "interface-vs-abstract"],
    prompt: "If `AccountImpl implements Account`, an object returned by `Proxy.newProxyInstance(loader, new Class<?>[] { Account.class }, handler)` can be cast to `AccountImpl`.",
    answer: false,
    explanation: "False. `java.lang.reflect.Proxy` generates a class at run time that implements the interfaces you list; it does not extend or relate to `AccountImpl`, so the cast throws `ClassCastException`. Clients must hold the proxy through the interface type (`Account`). This is also why JDK dynamic proxies cannot proxy a class that implements no interface; for that, frameworks use subclass-generating libraries such as CGLIB or ByteBuddy. It is a practical reason to program to interfaces when proxies may be applied later.",
    ref: "Ch. 11 Proxy, dynamic proxy"
  },
  {
    id: "proxy-04",
    pattern: "proxy",
    type: "match",
    difficulty: 3,
    tags: ["what-is", "participants"],
    prompt: "Match each proxy variant to the situation in which it is the right fit.",
    pairs: [
      ["Remote proxy", "A local object that represents a service running in another JVM and hides the network call behind a method call"],
      ["Virtual proxy", "A cheap placeholder for an object that is expensive to create, which builds it only on first real use"],
      ["Protection proxy", "A wrapper that allows or denies each call depending on who the caller is"],
      ["Caching proxy", "A wrapper that stores results of costly calls and answers repeated requests without touching the subject"],
      ["Smart reference", "A wrapper that does bookkeeping around each access, such as reference counting, locking or tracking usage"]
    ],
    explanation: "All five wrap a subject behind the same interface; they differ in what they control. Remote proxies control location (RMI stubs). Virtual proxies control creation time. Protection proxies control access rights, often through a `java.lang.reflect.InvocationHandler`. Caching proxies control how often the subject is called, and smart references add accounting around calls. The shared structure is why the variants are classified by intent, not by class diagram.",
    ref: "Ch. 11 Proxy"
  },
  {
    id: "proxy-05",
    pattern: "proxy",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "real-api"],
    prompt: "A protection proxy for bank accounts is built with a JDK dynamic proxy:\n\n```java\nclass ReadOnlyHandler implements InvocationHandler {\n    private final Account account;\n    ReadOnlyHandler(Account account) { this.account = account; }\n\n    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {\n        if (method.getName().equals(\"withdraw\")) {\n            throw new IllegalAccessException(\"read-only view\");\n        }\n        return method.invoke(proxy, args);\n    }\n}\n```\n\nCalling `getBalance()` on the proxy never returns normally; it ends in a `StackOverflowError`. Why?",
    options: [
      "`IllegalAccessException` is a checked exception, so it cannot be thrown from `invoke`, and the runtime wrapping that results keeps re-entering the handler until the stack is exhausted",
      "`method.getName()` returns the name of the generated proxy class rather than the name of the called method, so the `withdraw` check never matches and every call falls through to the forwarding line",
      "`ReadOnlyHandler` must also implement `Account`, because without it the JDK cannot forward the call and falls back to re-dispatching it through the proxy",
      "The handler forwards the call to `proxy`, which is the proxy itself, so each call re-enters `invoke`; it should invoke the method on `account`"
    ],
    answer: 3,
    explanation: "The first parameter of `invoke` is the proxy instance. Calling `method.invoke(proxy, args)` dispatches back through the proxy to the same handler, endlessly. The real subject (`account`) is the target. The claim about `IllegalAccessException` is wrong because `invoke` is declared `throws Throwable` (throwing a checked exception the interface method does not declare would surface as `UndeclaredThrowableException`, but that is a separate matter and not a stack overflow). The claim about `getName()` is wrong: `getName()` returns the called method's name. The claim that the handler must implement `Account` is wrong: the handler is the proxy's invocation callback and does not implement the subject interface (the generated proxy class does).",
    ref: "Ch. 11 Proxy, protection proxy"
  },
  {
    id: "proxy-06",
    pattern: "proxy",
    type: "short",
    difficulty: 3,
    tags: ["pros-cons", "structure"],
    prompt: "In Java RMI, the client calls methods on a stub that acts as a remote proxy, and every method of a `Remote` interface must declare `RemoteException`. What does this requirement tell you about the limits of the Proxy pattern's goal of making the proxy look like the real subject?",
    modelAnswer: "A remote proxy can hide where the object lives, but it cannot hide the fact that a network is involved. Calls can fail through timeouts, lost connections or a dead server, and arguments and return values must be serializable and are copied rather than shared. The `Remote` interface therefore has to expose `RemoteException`, so the proxy is not fully transparent: the client has to handle failures that a local call would not have. Because the proxy and the real object share one interface, that interface carries the failure contract: every caller that holds the interface type must handle or declare the exception, even when the implementation behind it is local and could omit it from its own `throws` clause.",
    keyPoints: [
      "A remote proxy hides location but not network failure",
      "RemoteException on every interface method exposes the failure mode to the client",
      "Arguments and results are serialized, so they are copied and must be serializable",
      "Because proxy and subject share one interface, transparency is limited and every caller of the interface type inherits the failure contract"
    ],
    ref: "Ch. 11 Proxy, remote proxy"
  }
);
