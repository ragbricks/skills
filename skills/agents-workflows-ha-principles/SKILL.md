---
name: agents-workflows-ha-principles
description: This skill describes how to design agents and workflows with LangChain and orchestrated with LangGraph using Hexagonal Architecture (Ports & Adapters).
license: CC BY 4.0
metadata:
  author: Ragbricks
  version: "1.0.0"
---

# Agents and Workflows with Hexagonal Architecture (LangChain + LangGraph)

This skill explains how to design **workflows** and **agents** using LangChain and LangGraph, while applying **Hexagonal Architecture (Ports & Adapters)** so your core logic stays testable, maintainable, and vendor-agnostic.

LangGraph distinguishes the two patterns:
- **Workflows**: predetermined code paths designed to operate in a certain order.
- **Agents**: dynamic systems that define their own processes and tool usage.  
Reference: LangChain LangGraph “Workflows and agents” docs.

---

## 1) Agents vs workflows

### Workflows (structured)
A workflow is a governed sequence of steps (with explicit branching) where you decide the order and routing. Some steps can be AI-powered, but the overall orchestration remains controlled and repeatable.

### Agents (goal-driven)
An agent is given a goal plus a toolset, and it dynamically plans, executes, evaluates outcomes, and iterates toward completion. It may loop and change strategy based on intermediate results.

### Rule of thumb
When you need more complexity than a single call, **workflows provide predictability for well-defined tasks**, while **agents are better when flexibility and dynamic decision-making are required**.  
References: Orkes “Agents vs Workflows”, Anthropic “Building effective agents”, and LangGraph docs.

---

## 2) When to use which

Use **workflows** when:
- You can define a mostly stable step sequence (even if some steps use AI).
- You need strong auditability, deterministic gates, and easier debugging.
- You want controlled retries and explicit approval checkpoints.

Use **agents** when:
- The path to a goal is hard to predefine (high variability / open-ended tasks).
- The system must choose which tools to call and in what order.
- Iteration loops (“try → evaluate → adjust”) are essential.

**Hybrid is common**: a workflow can contain embedded agent loops as internal steps, giving you a controlled shell with flexible sub-components.

---

## 3) Hexagonal Architecture applied to agentic systems

Hexagonal Architecture keeps the **core** independent from external systems by introducing:

- **Inbound ports** (how runs are started/controlled) + **inbound adapters** (REST, webSocket, workers).
- **Outbound ports** (what the core needs) + **outbound adapters** (datastores, external APIs, queues, retrieval, graph DB).

In this skill, there are two “cores” protected by ports:
1) **Domain core**: rules, policies, decisions, validations, explanations.
2) **Orchestration core**: LangGraph workflow graph *or* LangGraph agent loop.

---

## 4) How HA looks for workflows

Workflows have predetermined paths, so the HA boundary is direct: each node calls ports.

```text
Inbound Adapters                  Application Core (Workflow)
REST / webSocket / Worker  --->  LangGraph workflow graph (nodes/edges/state)
                                      |
                                      | Outbound Ports (interfaces)
                                      v
                          Domain rules + policies + decisions
                                      |
                                      v
                               Outbound Adapters
                    dataSources / tools / cache / retrieval / queues / graph
```

### Typical workflow ports
- `RunWorkflowPort`: start/resume/cancel
- `HumanInteractionPort`: approve/deny/annotate
- `DataSourcePort`: read/write operations
- `ToolRegistryPort`: controlled tool invocation
- `CachePort`, `QueuePort`, `RetrieverPort`
- `KnowledgeGraphPort`

### What you gain
- Clear, enforceable gates (policy checks, approvals, retries).
- Deterministic unit tests (mock ports; no network).
- Easy vendor swaps (replace adapters only).

---

## 5) How HA looks for agents

Agents are dynamic, so HA adds one key discipline: separate **decision-making** from **side effects**.

```text
Inbound Adapters                 Application Core (Agent Loop)
REST / Chat / webSocket  --->   LangGraph agent loop (plan/act/reflect)
                                     |
                                     | Outbound Ports (interfaces)
                                     v
                          Domain rules + safety/policy checks
                                     |
                                     v
                              Outbound Adapters
                  tool execution / dataSources / cache / queues / graph
```

### Typical agent ports
- `AgentSessionPort`: load/save session or durable run state
- `ToolRegistryPort`: allowed tools + invocation boundary
- `DataSourcePort`: read/write operations
- `EffectPort`: side effects with idempotency + replay safety
- `PolicyPort`: constraints, permissions, “must-not-do” rules
- `CachePort`, `QueuePort`, `RetrieverPort`, `KnowledgeGraphPort`

### What you gain
- Keep the agent loop “pure-ish” (decide) while pushing side effects behind ports (act).
- Constrain autonomy via `PolicyPort` + `HumanInteractionPort` without rewriting the agent.
- Test decisions by replaying tool transcripts against mocked ports.

---

## 6) Recommended adapters: Redis + Memgraph

Hexagonal Architecture makes infrastructure optional: your core depends on ports, not on specific systems. Redis and Memgraph are strong fits for agentic runtime needs, implemented as outbound adapters.

### Redis (cache, retrieval, queues)
Map Redis behind:
- `CachePort`: caching, idempotency locks, dedupe keys
- `QueuePort`: background jobs, retries, backpressure
- `RetrieverPort`: similarity / hybrid retrieval for context selection

**Why it complements HA**
- Redis remains a replaceable adapter. The core never imports Redis SDKs.
- Your workflows/agents become safer under retries via locks and idempotency patterns.

### Memgraph (knowledge graph)
Map Memgraph behind:
- `KnowledgeGraphPort`: upsert nodes/edges, query relationships, traverse neighbors

**Why it complements HA**
- Graph queries become a capability behind an interface (test with fakes/mocks).
- The graph can provide structured evidence (relationship paths) for explanations and approvals, without coupling the core to a graph vendor.

---

## 7) Capability-based hexagonal folder structure

This structure works for both workflows and agents, keeps naming consistent, and supports scaling by grouping code by capability.

```text
/src
  /shared
    /domain
      entities/
      domainServices/
      events/
      ports/
    /application
      dto/
      policies/
    /adapters
      /outbound
        cache/
        retrieval/
        queue/
        knowledgeGraph/
        dataSources/
        tools/
    /infrastructure
      config/
      persistence/
      transport/

  /capabilities
    /<capabilityName>
      /domain
        entities/
        domainServices/
        events/
        ports/
      /application
        workflows/              # LangGraph graphs (workflow style)
          <workflow>.graph.ts
        agents/                 # LangGraph graphs (agent-loop style)
          <agent>.graph.ts
        useCases/
        dto/
      /adapters
        /inbound
          rest/
          webSocket/
          worker/
        /outbound
          dataSources/
          cache/
          retrieval/
          queue/
          knowledgeGraph/
          tools/
      /infrastructure
        config/
        persistence/
        transport/
```

---

## 8) Test structure

Choose one:

**A) Dedicated test tree**
```text
/tests
  /shared
    domain/
    application/
    adapters/
  /capabilities
    /<capabilityName>
      domain/
      application/
      adapters/
```

**B) Co-located tests**
```text
/src/capabilities/<capabilityName>/application/workflows/__tests__/
/src/capabilities/<capabilityName>/application/agents/__tests__/
```

---

## 9) Build checklist

- Design ports first (`dataSources`, `tools`, `effects`, `cache`, `retrieval`, `queue`, `knowledgeGraph`).
- Keep LangGraph nodes thin: orchestration + calls to ports.
- Put business rules in `domainServices`, not adapters.
- Treat retries as normal:
  - idempotent `EffectPort` operations
  - `CachePort` locks/dedupe keys
- Persist evidence for decisions:
  - retrieval outputs, graph query outputs, tool outputs, human approvals.

---

## References
- Orkes: “Agentic AI Explained: Agents vs Workflows”
- LangChain Docs (LangGraph): “Workflows and agents” (Python + JavaScript)
- Anthropic: “Building effective agents”
