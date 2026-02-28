import {
  Annotation, END, START, StateGraph
} from "@langchain/langgraph"
import { RunWorkflowUseCase } from "../../application/useCase/RunWorkflowUseCase"
import {
  AgentSessionStateMapper,
  type AgentGraphState
} from "../mapper/AgentSessionStateMapper"

const AgentGraphStateSchema = Annotation.Root({
  sessionId: Annotation<string>,
  latestUserInput: Annotation<string>,
  intent: Annotation<string | undefined>,
  intentConfidence: Annotation<number | undefined>,
  nextNode: Annotation<"respond" | "retrieve" | "tool_call" | "fail" | undefined>,
  response: Annotation<string | undefined>,
  error: Annotation<string | undefined>
})

const BuildAgentWorkflow = (runWorkflow: RunWorkflowUseCase) => {
  const graph = new StateGraph(AgentGraphStateSchema)

  graph.addNode("runDomainWorkflow", async (state: AgentGraphState) => {
    const dto = AgentSessionStateMapper.toDTO(state)
    const result = await runWorkflow.execute(dto)

    if (result.isFailure || result.value === undefined) {
      return ({
        error: result.error?.message ?? "Workflow execution failed",
        nextNode: "fail"
      })
    }

    return (AgentSessionStateMapper.toGraphPatch(result.value))
  })

  graph.addNode("respond", async (state: AgentGraphState) => {
    return ({
      response: `Handled '${state.intent ?? "unknown"}' without external retrieval or tools.`
    })
  })

  graph.addNode("retrieve", async (state: AgentGraphState) => {
    return ({
      response: `Retrieve documents before composing response for intent '${state.intent ?? "unknown"}'.`
    })
  })

  graph.addNode("tool_call", async (state: AgentGraphState) => {
    return ({
      response: `Invoke external tool(s) for intent '${state.intent ?? "unknown"}'.`
    })
  })

  graph.addNode("fail", async (state: AgentGraphState) => {
    return ({
      response: state.error ?? "The workflow failed unexpectedly."
    })
  })

  graph.addEdge(START, "runDomainWorkflow")
  graph.addConditionalEdges("runDomainWorkflow", (state: AgentGraphState) => {
    if (state.nextNode === "fail") {
      return ("fail")
    }
    if (state.nextNode === "retrieve") {
      return ("retrieve")
    }
    if (state.nextNode === "tool_call") {
      return ("tool_call")
    }
    return ("respond")
  })
  graph.addEdge("respond", END)
  graph.addEdge("retrieve", END)
  graph.addEdge("tool_call", END)
  graph.addEdge("fail", END)

  return (graph.compile())
}

export { BuildAgentWorkflow }
