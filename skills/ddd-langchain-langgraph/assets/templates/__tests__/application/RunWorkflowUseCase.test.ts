import { RunWorkflowUseCase } from "../../src/application/useCase/RunWorkflowUseCase"
import { InMemorySessionRepository } from "../../src/infrastructure/persistence/InMemorySessionRepository"
import { type IntentClassifier } from "../../src/application/useCase/RunWorkflowUseCase"

class FakeIntentClassifier implements IntentClassifier {
  async invoke(): Promise<{ intent: string, confidence: number }> {
    return ({
      intent: "support",
      confidence: 0.92
    })
  }
}

test("runs workflow use case and persists aggregate state", async () => {
  const repository = new InMemorySessionRepository()
  const useCase = new RunWorkflowUseCase(repository, new FakeIntentClassifier())

  const result = await useCase.execute({
    sessionId: "session-1",
    userInput: "I need help with my billing plan"
  })

  expect(result.isSuccess).toBe(true)
  expect(result.value?.resolvedIntent?.value).toBe("support")
})
