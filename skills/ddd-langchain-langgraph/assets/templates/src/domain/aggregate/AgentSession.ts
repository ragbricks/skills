import { AggregateRoot, EntityId, Result } from "@andireuter/js-domain-principles"
import { UserMessage } from "../entity/UserMessage"
import { ConversationIntent } from "../valueObject/ConversationIntent"

interface AgentSessionProps {
  history: UserMessage[]
  resolvedIntent?: ConversationIntent
  lastAction?: string
}

class AgentSession extends AggregateRoot<AgentSessionProps> {
  constructor(props?: Partial<AgentSessionProps>, id?: EntityId) {
    super({
      history: props?.history ?? [],
      resolvedIntent: props?.resolvedIntent,
      lastAction: props?.lastAction
    }, id)
  }

  registerMessage(message: UserMessage): Result<AgentSession> {
    if (!message.text.length) {
      return (Result.fail(new Error("Message cannot be empty")))
    }

    this.props.history.push(message)
    return (Result.ok(this))
  }

  resolveIntent(intent: ConversationIntent): Result<AgentSession> {
    if (intent.confidence < 0.5) {
      return (Result.fail(new Error("Intent confidence too low to route")))
    }

    this.props.resolvedIntent = intent
    return (Result.ok(this))
  }

  markAction(action: string): Result<AgentSession> {
    if (!action.trim()) {
      return (Result.fail(new Error("Action must be a non-empty string")))
    }

    this.props.lastAction = action
    return (Result.ok(this))
  }

  get history(): UserMessage[] {
    return (this.props.history)
  }

  get resolvedIntent(): ConversationIntent | undefined {
    return (this.props.resolvedIntent)
  }

  get lastAction(): string | undefined {
    return (this.props.lastAction)
  }
}

export { AgentSession, type AgentSessionProps }
