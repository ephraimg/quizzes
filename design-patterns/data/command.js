window.QUIZ_QUESTIONS = window.QUIZ_QUESTIONS || [];
window.QUIZ_QUESTIONS.push(
  {
    id: "command-01",
    pattern: "command",
    type: "mc",
    difficulty: 3,
    tags: ["structure", "flow"],
    prompt:
      "A spreadsheet app models 'set cell value' as a Command so users can undo. The command is created with the target `Cell` and the new value. What must `execute()` do so that `undo()` can work later?",
    options: [
      "Nothing extra: `undo()` can simply call `execute()` again with the opposite value, since the command already holds the cell and the new value",
      "Ask the Invoker to snapshot the whole sheet before each call, because commands must not hold any state of their own",
      "Record the cell's current value before overwriting it, so `undo()` can restore it",
      "Make the Receiver (`Cell`) keep a history list of past values so that the command itself can stay stateless"
    ],
    answer: 2,
    explanation:
      "A ConcreteCommand holds the receiver and the parameters of the request, and for undo it also needs the state that the action destroys. The new value is already in the command, but the old value exists only in the receiver at the moment before `execute()` runs, so `execute()` must capture it. 'Opposite value' only works for naturally invertible actions (such as toggling), not for overwrites. Commands are allowed to be stateful (that is how undo, queues and logging work), and it is the Invoker's job to keep a history of command objects, not a snapshot of the receiver. Putting history in the Receiver would couple it to the undo mechanism, which the pattern keeps out.",
    ref: "Ch. 6 Command (undo)"
  },
  {
    id: "command-02",
    pattern: "command",
    type: "mc",
    difficulty: 3,
    tags: ["compare", "when-to-use"],
    prompt:
      "A mailer has a `TaxCalculator` whose algorithm varies by country, and a nightly job runner that stores 'send invoice to customer 42' requests, retries failures and persists them across restarts. Which pairing of pattern to need fits best?",
    options: [
      "Command for the tax calculator, because each country's rule is a request object; Strategy for the job requests, because jobs are interchangeable",
      "Strategy for both, since both encapsulate behavior behind an interface and let the caller stay unaware of the concrete class",
      "Command for both, since both wrap a method call and its arguments in an object that can be passed around",
      "Strategy for the tax calculator (swappable algorithm), Command for the stored job requests (queued, retried, persisted)"
    ],
    answer: 3,
    explanation:
      "Strategy swaps interchangeable algorithms that compute the same kind of result (tax rules), and the context calls it as part of its own work. Command turns a request, with its receiver and arguments, into an object that can be queued, logged, retried, persisted and possibly undone, so the invoker can treat 'work to do later' uniformly. Both look like 'an object with one method', which is why the options that merge them are tempting, but the intent differs: Strategy is how to do something, Command is a request to do something, with a lifetime independent of the caller.",
    ref: "Ch. 6 Command (queues, logging), Ch. 1 Strategy"
  },
  {
    id: "command-03",
    pattern: "command",
    type: "tf",
    difficulty: 2,
    tags: ["structure", "principles"],
    prompt:
      "True or false: the Command pattern decouples the Invoker from the Receiver, but a ConcreteCommand is still coupled to its Receiver because it stores a reference to it and calls its methods.",
    answer: true,
    explanation:
      "True. The Invoker only knows the `Command` interface and its `execute()` method; it never learns what receiver does the work. The coupling does not vanish; it is concentrated in the ConcreteCommand, which binds one Receiver to one action. That is why the Client (which wires receiver into command) and the ConcreteCommand classes are the places that change when receivers change, while the Invoker stays untouched. The pattern relocates coupling, it does not remove it.",
    ref: "Ch. 6 Command (participants)"
  },
  {
    id: "command-04",
    pattern: "command",
    type: "match",
    difficulty: 3,
    tags: ["participants", "structure"],
    prompt:
      "A print server queues jobs for workers. Match each piece of code to its role in the Command pattern.",
    pairs: [
      ["`interface Job { void execute(); }`", "Command"],
      ["`class PrintJob implements Job` holding a `Printer` and a `Document`, with `execute()` calling `printer.print(doc)`", "ConcreteCommand"],
      ["`class Printer` with the `print(Document)` method", "Receiver"],
      ["A worker loop: `while (true) queue.take().execute();`", "Invoker"],
      ["Code that does `queue.add(new PrintJob(printer, doc))`", "Client"]
    ],
    explanation:
      "The Command interface declares `execute()`. The ConcreteCommand binds a Receiver to an action and implements `execute()` by calling it. The Receiver knows how to do the real work and has no idea it is being invoked through a command. The Invoker (the worker loop) only calls `execute()`. The Client creates the ConcreteCommand and supplies its Receiver. Note that the `queue.add(...)` code is the Client, not the Invoker, because it creates and wires the command; the worker is the Invoker because it triggers it.",
    ref: "Ch. 6 Command (class diagram)"
  },
  {
    id: "command-05",
    pattern: "command",
    type: "mc",
    difficulty: 3,
    tags: ["spot-the-bug", "trap"],
    prompt:
      "An undoable volume control. The speaker starts at volume 3.\n\n```java\nclass SetVolumeCommand implements Command {\n  private final Speaker speaker;\n  private final int level;\n  private int previous;\n  SetVolumeCommand(Speaker s, int level) { this.speaker = s; this.level = level; }\n  public void execute() { previous = speaker.getVolume(); speaker.setVolume(level); }\n  public void undo()    { speaker.setVolume(previous); }\n}\n\n// client\nCommand c = new SetVolumeCommand(speaker, 8);\nc.execute(); history.push(c);\nc.execute(); history.push(c);   // user presses the button again\n```\n\nThe user then undoes twice. What is the volume afterwards, and why?",
    options: [
      "3, because each `undo()` restores the volume saved by its own `execute()` call, so the history unwinds to the original level",
      "8, because the second `execute()` overwrote `previous` with 8, so both undos restore 8",
      "5, because the two undos step the volume down by half of the change each time, so it ends midway between 3 and 8",
      "0, because `previous` is only assigned on the first `execute()` and is reset to its default value by the second one"
    ],
    answer: 1,
    explanation:
      "The same command instance was executed and pushed twice. `previous` is one field, so the second `execute()` replaced the saved 3 with 8, and both undo calls then set the volume to 8; the original 3 is lost. A command that stores undo state is per-invocation, so the Client (or Invoker) should create a new command object for every user action. The answer 3 would be right only with two distinct instances. Nothing averages or steps the volume (`undo()` just assigns `previous`), and `previous` is assigned from `getVolume()` on each `execute()`, so it is never reset to 0.",
    ref: "Ch. 6 Command (undo, history)"
  },
  {
    id: "command-06",
    pattern: "command",
    type: "short",
    difficulty: 3,
    tags: ["structure", "pros-cons", "trap"],
    prompt:
      "A `MacroCommand` wraps `[DebitAccount, CreditAccount, SendReceipt]` and runs them in order. Describe how its `undo()` should work and name one thing that makes undoing a macro harder than undoing a single command.",
    modelAnswer:
      "`MacroCommand.undo()` should call `undo()` on the sub-commands in reverse order (SendReceipt, CreditAccount, DebitAccount), because later steps may depend on the effects of earlier ones. It is harder than a single command because a step can fail partway, leaving some steps applied, and some actions cannot truly be undone (an email already sent). You must decide whether to compensate (send a correction), skip, or make irreversible steps last or exclude them.",
    explanation:
      "Command encapsulates a request as an object, so a macro is itself a Command holding other Commands. Undo must reverse the order because later steps may depend on earlier ones. Irreversible side effects and partial failure are why undo of composite requests needs a compensation policy, not just a loop.",
    keyPoints: [
      "Undo sub-commands in reverse order of execution",
      "A macro is itself a Command that holds a list of Commands",
      "Partial failure leaves some steps applied and needs compensation or rollback logic",
      "Some side effects (sent emails, external calls) are not reversible"
    ],
    ref: "Ch. 6 Command (macro commands)"
  }
);
