window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "observer-01",
    pattern: "observer",
    type: "mc",
    difficulty: 3,
    tags: ["pros-cons", "structure"],
    prompt:
      "A `PortfolioFeed` subject tracks 30 fields per instrument. Some observers (a price chart) need only the last price, while others (a risk engine) need five fields. A team is choosing between the push model (`update(price, volume, bid, ask, ...)`) and the pull model (`update(Subject s)` with observers calling getters). Which analysis is correct?",
    options: [
      "Pull makes observers depend on nothing but the `Observer` interface and a plain value, so it has lower coupling than push because observers never see the subject's concrete type.",
      "Push is better here because it avoids observers holding a reference to the subject, and the subject is in the best position to know which fields each observer needs.",
      "Pull fits: each observer reads only what it needs and adding a field leaves `update` unchanged, but observers become coupled to the subject's getters and need a reference to it.",
      "Push and pull differ only in performance and convenience; the coupling between subject and observers is identical because both sides still share one `update` call.",
    ],
    answer: 2,
    explanation:
      "With push, every new or removed field changes the `update` signature for all observers, and observers that need only part of the data still receive everything. Pull isolates observers from that change but requires them to know the subject's accessors (and creates a risk of reading inconsistent state if the subject mutates between calls). The claim that pull observers depend on nothing but the `Observer` interface is wrong: they couple to the subject's concrete interface. The claim that the subject knows what each observer needs is backwards: it cannot, which is the problem. The claim that the coupling is identical is wrong: the models differ mainly in the coupling and the shape of the interface.",
    ref: "Ch. 2 Observer (push vs pull)",
  },
  {
    id: "observer-02",
    pattern: "observer",
    type: "mc",
    difficulty: 3,
    tags: ["compare"],
    prompt:
      "A message-queue topic or an event bus is often described as 'Observer at scale'. Which difference from the classic GoF Observer is accurate?",
    options: [
      "A broker or bus sits between publishers and subscribers, so neither side holds references to or needs the type of the other; in classic Observer the subject keeps its own observer list.",
      "A bus guarantees synchronous delivery to subscribers in registration order for every publisher, whereas the classic Observer pattern is always asynchronous and unordered.",
      "Classic Observer requires every observer to be wired in at compile time through the subject's constructor, while a bus lets subscribers register and unregister while the system runs.",
      "A bus is really a Mediator that forbids many-to-many communication between components, whereas Observer is always one-to-many and never involves an intermediary object.",
    ],
    answer: 0,
    explanation:
      "In classic Observer the subject itself maintains the list of observers and calls them directly (one-to-many, direct reference). An event bus or broker inserts an intermediary that decouples publisher from subscriber even further, and typically allows many publishers and many subscribers. The claim about synchronous, ordered bus delivery is wrong on both counts: classic Observer is normally synchronous and specifies no order, and buses are often asynchronous. The claim about compile-time wiring is wrong because classic Observer supports runtime registration (that is the point of `registerObserver`). The claim that a bus forbids many-to-many communication is wrong because a bus supports many-to-many.",
    ref: "Ch. 2 Observer; Ch. 12 Compound patterns (MVC)",
  },
  {
    id: "observer-03",
    pattern: "observer",
    type: "tf",
    difficulty: 3,
    tags: ["trap", "principles"],
    prompt:
      "True or false: the Observer pattern guarantees that observers are notified in the order they registered, so an observer may safely rely on another observer having already updated.",
    answer: false,
    explanation:
      "False. The pattern specifies no notification order, and a design in which one observer depends on another having run first is fragile (and a sign the two should be coordinated explicitly, for example by chaining or by one observer deriving state from the subject). Even among implementations the order varies: `java.util.Observable` notifies in reverse registration order, while a typical `ArrayList`-based subject goes in registration order. Relying on either is coupling by accident.",
    ref: "Ch. 2 Observer; java.util.Observable caveats",
  },
  {
    id: "observer-04",
    pattern: "observer",
    type: "multi",
    difficulty: 3,
    tags: ["pros-cons", "trap"],
    prompt:
      "Select the **real hazards** of a naive Observer implementation (choose all that apply).",
    options: [
      "An observer that is never unregistered stays reachable from the subject's list, so it cannot be garbage collected (the 'lapsed listener' leak).",
      "The Subject must be an abstract class rather than an interface, so a concrete subject cannot also extend any other base class of its own.",
      "If one observer's `update` throws and the notify loop does not catch it, the remaining observers are not notified.",
      "Observers cannot be added to or removed from the subject after it has been constructed, because the observer list is fixed at creation time.",
      "If every setter on the subject calls `notifyObservers()`, changing several fields triggers redundant notifications, some with half-updated state.",
    ],
    answer: [0, 2, 4],
    explanation:
      "The never-unregistered observer is the classic leak. A failing observer can starve the rest unless the loop isolates failures. As for the setters, the book points out that deciding who triggers the notification matters; calling it from every setter produces redundant and inconsistent updates, so often the client triggers it after a batch of changes. The claim that the Subject must be an abstract class is false: it can be an interface (the book uses interfaces for both roles). The claim that observers cannot be added or removed later is false: dynamic registration is the pattern's defining feature.",
    ref: "Ch. 2 Observer (who triggers the update?)",
  },
  {
    id: "observer-05",
    pattern: "observer",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "trap"],
    prompt:
      "A thermostat subject notifies alarms. An alarm is meant to fire once and then stop listening. What is the problem?\n\n```java\nclass Thermostat implements Subject {\n  private final List<Observer> observers = new ArrayList<>();\n  private int temp;\n  public void registerObserver(Observer o) { observers.add(o); }\n  public void removeObserver(Observer o) { observers.remove(o); }\n  public void notifyObservers() {\n    for (Observer o : observers) o.update(temp);\n  }\n}\n\nclass OneShotAlarm implements Observer {\n  private final Subject subject;\n  OneShotAlarm(Subject s) { subject = s; s.registerObserver(this); }\n  public void update(int temp) {\n    if (temp > 90) { fire(); subject.removeObserver(this); }\n  }\n}\n```",
    options: [
      "The observer holds a reference to the subject, which creates a circular dependency between the two classes that the Java compiler rejects when it resolves the constructor call.",
      "`removeObserver` runs inside `update`, modifying the list that `notifyObservers` is iterating, which can throw `ConcurrentModificationException`; iterate over a copy.",
      "`registerObserver` should be called from the subject's constructor rather than from the observer's constructor, because only the subject may decide who is notified and when.",
      "`notifyObservers` should pass the whole `Thermostat` instead of an `int`, because the push model is not allowed when a class implements the `Subject` interface in this design.",
    ],
    answer: 1,
    explanation:
      "Observers that unregister themselves during a callback are common (one-shot listeners). Removing from an `ArrayList` while a for-each is iterating it fails fast with `ConcurrentModificationException` (the exact failure depends on the position of the removed element, which makes the bug intermittent). The fix is to loop over a snapshot (`new ArrayList<>(observers)`) or use `CopyOnWriteArrayList`. The claim about a circular dependency is false: circular references compile fine and the observer storing its subject is normal in the pull model. The claim that the subject's constructor should register observers is wrong: observers register themselves, since the subject cannot know who wants updates. The claim that push is not allowed is wrong: push is a legitimate model.",
    ref: "Ch. 2 Observer",
  },
  {
    id: "observer-06",
    pattern: "observer",
    type: "short",
    difficulty: 3,
    tags: ["principles", "what-is"],
    prompt:
      "Observer is described as giving *loose coupling* between subject and observers. State exactly what the subject depends on, and name one coupling that still remains even in a well-built Observer design.",
    modelAnswer:
      "The subject depends only on the abstract `Observer` interface (it knows an observer implements `update`), not on any concrete observer class, so observers can be added, removed or replaced at runtime without changing the subject. Coupling that remains: observers that use the pull model depend on the subject's getters; with push, both sides depend on the shape of the data passed to `update`; and there is hidden temporal coupling (observers run synchronously inside the subject's notify call and can slow it or fail it).",
    keyPoints: [
      "Subject knows only the Observer interface and a list of such objects",
      "New observers need no change to the subject (Open/Closed)",
      "Remaining coupling: pull observers depend on the subject's accessors, or push observers depend on the update signature",
      "Synchronous notification ties the subject's timing and failures to its observers",
    ],
    explanation:
      "Loose coupling here is about knowledge: the subject's only knowledge of observers is the interface they implement. It does not mean zero dependency. The data contract (what `update` carries or what getters exist) and the timing of notification are dependencies that remain.",
    ref: "Ch. 2 Observer; design principle 'strive for loosely coupled designs'",
  }
);
