window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "compound-01", pattern: "compound", type: "match", difficulty: 3, tags: ["participants", "compare"],
    prompt: "In the book's MVC discussion and the DJ View example, match each relationship to the pattern at work.",
    pairs: [
      ["Model notifies several views when its state changes", "Observer"],
      ["The view delegates user actions to a replaceable controller", "Strategy"],
      ["The view is built from nested display widgets treated uniformly", "Composite"],
      ["A heart-rate model is made to fit the interface the DJ view expects", "Adapter"]
    ],
    explanation: "Model to view is Observer: the model does not know view classes, which is what lets many views share one model. View to controller is Strategy: the view is configured with a controller object that decides how to respond to input, so you can swap the controller without changing the view. Nested panels, buttons, and labels are Composite. In the DJ View chapter a heart-rate model is wrapped in an adapter implementing the beat-model interface so the same view can display it.",
    ref: "Ch. 12 Compound Patterns"
  },
  {
    id: "compound-02", pattern: "compound", type: "mc", difficulty: 3, tags: ["participants", "trap"],
    prompt: "In MVC the view is wired to the controller as a Strategy. Which consequence does that buy that wiring them with Observer would not?",
    options: [
      "Several controllers are automatically notified whenever the model changes, so each one can refresh whichever part of the view it is responsible for.",
      "The view no longer needs to know the model interface, because the controller reads the model's state on its behalf and hands the view display data.",
      "The view can be given a different controller (for example a read-only one) to change how input is handled without modifying the view.",
      "The model can run without any view attached, because the view is the only party that depends on the controller and the controller never touches the model."
    ],
    answer: 2,
    explanation: "Strategy makes the controller an interchangeable algorithm for interpreting user input; the view just holds a controller and asks it what to do. Notifying parties of model changes is the model-to-view Observer relationship, so the claim about several controllers being notified describes the wrong link. The view still reads state from the model (the claim that it no longer needs the model interface is false), and the ability to run a model with no views comes from the Observer relationship, not the Strategy between view and controller (the claim that the model runs without a view).",
    ref: "Ch. 12 MVC"
  },
  {
    id: "compound-03", pattern: "compound", type: "multi", difficulty: 3, tags: ["participants", "trap"],
    prompt: "In the book's duck simulator, ducks are given a `QuackCounter` Decorator, a `Flock` Composite, a duck factory, and an Observer for a `Quackologist`. Choose the **two** statements that describe how these fit together.",
    options: [
      "The Abstract Factory creates ducks already wrapped in the decorator, so the simulator cannot forget to count quacks.",
      "`QuackCounter` changes the `Quackable` interface by adding a counter method, so the simulator can call it on any duck it holds.",
      "Registering an observer on a `Flock` must propagate to each duck in the flock, because the flock is the one object the client registers with.",
      "A `GooseAdapter` is a Decorator because it adds a `quack()` method to a goose without changing the goose class itself.",
      "The Observer pattern replaces the Composite, since the flock notifies its members and so no separate group object is needed."
    ],
    answer: [0, 2],
    explanation: "Putting the Decorator inside the factory means client code asks for a duck and always gets a counted one. The Composite (`Flock`) implements the same `Quackable` and observable interface as its members, so registering an observer on the flock has to be forwarded to every member, or the observer would miss the individual ducks. Decorator does not change the interface, so the claim that `QuackCounter` changes the `Quackable` interface is false. The Adapter changes the Goose interface to Quackable; it does not just add behavior, so calling `GooseAdapter` a Decorator is wrong. The patterns coexist rather than replacing each other, so Observer does not replace Composite.",
    ref: "Ch. 12 Duck Simulator"
  },
  {
    id: "compound-04", pattern: "compound", type: "order", difficulty: 3, tags: ["flow", "participants"],
    prompt: "In the DJ View example, the user presses Start. Put the steps in the order they happen.",
    items: [
      "The view receives the click and calls `controller.start()`",
      "The controller calls `model.on()`",
      "The model sets its BPM and notifies its registered BPM observers",
      "The view's observer method runs and pulls the new value from the model with `model.getBPM()`",
      "The view redraws the BPM display with the new value"
    ],
    explanation: "The view does not interpret input; it hands it to the controller (Strategy). The controller manipulates the model and the model announces its change through Observer without knowing the view's class. The view then pulls the current value and updates itself. The model never calls the view directly, and the controller does not push the BPM into the display.",
    ref: "Ch. 12 DJ View"
  },
  {
    id: "compound-05", pattern: "compound", type: "short", difficulty: 3, tags: ["participants", "principles"],
    prompt: "The DJ View was reused with a `HeartModel` that has no `setBPM`/`on`/`off` methods. Explain how the view was reused without changing it, and what you give up.",
    modelAnswer: "A HeartAdapter implements the BeatModelInterface that the view already depends on and wraps the HeartModel, translating calls: getBPM returns the heart rate, registerObserver passes through, and the operations that make no sense for a heart (setBPM, on, off) do nothing or throw. The view depends only on the interface, so it works unchanged; the book also supplies a separate HeartController that implements the controller interface, since the original controller's start/stop operations do not apply. The cost is that the interfaces now contain methods that are not meaningful for every model.",
    keyPoints: [
      "Adapter implements the model interface the view depends on",
      "It wraps the HeartModel and delegates what maps, such as the rate",
      "Unsupported operations are no-ops or throw",
      "The view stays unchanged because it depends on the interface"
    ],
    explanation: "This is Adapter used inside MVC: it changes the interface of an existing class (HeartModel) to the one clients expect. It works because the view was written against an interface (program to an interface), not a concrete model.",
    ref: "Ch. 12 DJ View"
  }
);
