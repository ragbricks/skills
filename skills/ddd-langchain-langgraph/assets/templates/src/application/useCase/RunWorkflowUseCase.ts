import {
  EntityId,
  Result,
  type UseCase,
  ValidationDecorator
} from "@andireuter/js-domain-principles"
import { type RunWorkflowDTO } from "../dto/RunWorkflowDTO"
import { RunWorkflowValidator } from "../validator/RunWorkflowValidator"
import { AgentSession } from "../../domain/aggregate/AgentSession"
import { UserMessage } from "../../domain/entity/UserMessage"
import { ConversationIntent } from "../../domain/valueObject/ConversationIntent"
import { type ISessionRepository } from "../../domain/repository/ISessionRepository"

interface IntentClassifier {
  invoke(input: { input: string }): Promise<{ intent: string, confidence: number }>
}

class RunWorkflowUseCase implements UseCase<AgentSession> {
  private readonly validation = new ValidationDecorator<RunWorkflowDTO>()
    .add(new RunWorkflowValidator())

  constructor(
    private readonly repository: ISessionRepository,
    private readonly intentClassifier: IntentClassifier
  ) { }

  async execute(dto: RunWorkflowDTO): Promise<Result<AgentSession>> {
    const validationResult = this.validation.validate(dto)

    if (validationResult.isFailure) {
      return (Result.fail(validationResult.error ?? new Error("Invalid request payload")))
    }

    try {
      const sessionId = new EntityId(dto.sessionId)
      const existingSession = await this.repository.findById(sessionId)
      const session = existingSession ?? new AgentSession({}, sessionId)

      const messageResult = session.registerMessage(UserMessage.create(dto.userInput))
      if (messageResult.isFailure) {
        return (Result.fail(messageResult.error ?? new Error("Could not register message")))
      }

      const intentOutput = await this.intentClassifier.invoke({ input: dto.userInput })
      const intentResult = ConversationIntent.create(
        intentOutput.intent,
        intentOutput.confidence
      )
      if (intentResult.isFailure || intentResult.value === undefined) {
        return (Result.fail(intentResult.error ?? new Error("Could not resolve intent")))
      }

      const resolveResult = session.resolveIntent(intentResult.value)
      if (resolveResult.isFailure) {
        return (Result.fail(resolveResult.error ?? new Error("Intent below confidence threshold")))
      }

      const actionResult = session.markAction(intentResult.value.value)
      if (actionResult.isFailure) {
        return (Result.fail(actionResult.error ?? new Error("Could not update action route")))
      }

      await this.repository.save(session)
      return (Result.ok(session))
    } catch (error: unknown) {
      return (Result.fail(error as Error))
    }
  }
}

export { RunWorkflowUseCase, type IntentClassifier }
