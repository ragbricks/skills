import { Result, type IValidator } from "@andireuter/js-domain-principles"
import { type RunWorkflowDTO } from "../dto/RunWorkflowDTO"

class RunWorkflowValidator implements IValidator<RunWorkflowDTO> {
  validate(value: RunWorkflowDTO): Result<RunWorkflowDTO> {
    if (!value.sessionId.trim()) {
      return (Result.fail(new Error("sessionId is required")))
    }

    if (!value.userInput.trim()) {
      return (Result.fail(new Error("userInput is required")))
    }

    return (Result.ok(value))
  }
}

export { RunWorkflowValidator }
