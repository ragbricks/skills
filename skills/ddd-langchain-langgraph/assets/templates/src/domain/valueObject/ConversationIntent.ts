import { Result, ValueObject } from "@andireuter/js-domain-principles"

type AllowedIntent = "support" | "sales" | "triage"

interface ConversationIntentProps {
  value: AllowedIntent
  confidence: number
}

class ConversationIntent extends ValueObject<ConversationIntentProps> {
  private constructor(props: ConversationIntentProps) {
    super(props)
  }

  static create(intent: string, confidence: number): Result<ConversationIntent> {
    const normalizedIntent = intent.trim().toLowerCase()
    const allowed: AllowedIntent[] = ["support", "sales", "triage"]

    if (!allowed.includes(normalizedIntent as AllowedIntent)) {
      return (Result.fail(new Error(`Unknown intent: ${intent}`)))
    }

    if (confidence < 0 || confidence > 1) {
      return (Result.fail(new Error("Intent confidence must be in range 0..1")))
    }

    return (Result.ok(
      new ConversationIntent({
        value: normalizedIntent as AllowedIntent,
        confidence
      })
    ))
  }

  get value(): AllowedIntent {
    return (this.props.value)
  }

  get confidence(): number {
    return (this.props.confidence)
  }
}

export { ConversationIntent, type AllowedIntent, type ConversationIntentProps }
