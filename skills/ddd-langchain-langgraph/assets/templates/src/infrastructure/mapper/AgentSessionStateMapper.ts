import { type RunWorkflowDTO } from "../../application/dto/RunWorkflowDTO"
import { AgentSession } from "../../domain/aggregate/AgentSession"

interface AgentGraphState {
  sessionId: string
  latestUserInput: string
  intent?: string
  intentConfidence?: number
  nextNode?: "respond" | "retrieve" | "tool_call" | "fail"
  response?: string
  error?: string
}

class AgentSessionStateMapper {
  static toDTO(state: AgentGraphState): RunWorkflowDTO {
    return ({
      sessionId: state.sessionId,
      userInput: state.latestUserInput
    })
  }

  static toGraphPatch(session: AgentSession): Partial<AgentGraphState> {
    const intent = session.resolvedIntent
    const intentToNode: Record<string, AgentGraphState["nextNode"]> = {
      support: "respond",
      sales: "tool_call",
      triage: "retrieve"
    }

    return ({
      intent: intent?.value,
      intentConfidence: intent?.confidence,
      nextNode: intent?.value ? intentToNode[intent.value] : undefined
    })
  }
}

export { AgentSessionStateMapper, type AgentGraphState }
