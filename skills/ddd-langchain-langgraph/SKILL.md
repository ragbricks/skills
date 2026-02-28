---
name: ddd-langchain-langgraph
description: Build and refactor TypeScript systems with domain-driven design using this repository's primitives (`Entity`, `AggregateRoot`, `ValueObject`, `Result`, `UseCase`, `ValidationDecorator`) and integrate them into LangChain and LangGraph workflows. Use when creating agent/workflow architectures, bounded-context templates, or LLM orchestration where domain invariants must stay outside prompt and graph layers.
---

# DDD LangChain LangGraph

## Overview
Design bounded-context code where business rules live in `domain/`, orchestration lives in `application/`, and LLM + graph tooling lives in `infrastructure/`. Use bundled templates to scaffold consistent files quickly.

## Execute Workflow
1. Identify the bounded context, aggregate root, and invariant list.
2. Model value objects, entities, and aggregate behavior with this repo's domain primitives.
3. Implement a use case that accepts an explicit DTO and returns `Result<T>`.
4. Add validators using `ValidationDecorator` before invoking domain behavior.
5. Add mappers that translate graph state into DTOs and aggregates.
6. Add LangChain chain builders and LangGraph node orchestration in infrastructure only.
7. Add tests that assert both success and failure branches.

## Enforce Boundaries
- Keep `domain/` free of LangChain, LangGraph, HTTP, database, and prompt imports.
- Keep prompt/model calls in infrastructure adapters.
- Keep state translation in mapper classes, not aggregate constructors.
- Return recoverable failures with `Result.fail(error)`.
- Treat every LLM output as untrusted input and validate before creating value objects.

## Use Bundled Resources
- Read `references/domain-driven-design.md` when modeling aggregates and invariants.
- Read `references/langchain-langgraph-integration.md` when wiring chain and graph orchestration.
- Copy templates with:

```bash
./skills/ddd-langchain-langgraph/scripts/copy_templates.sh <target-project-root>
```

- Adapt names in `assets/templates/src/` to the bounded context (`AgentSession`, `RunWorkflowUseCase`, etc.).

## Template Mapping
- `assets/templates/src/domain/*`: Value objects, entities, aggregates, domain services, repositories.
- `assets/templates/src/application/*`: DTO, validator, and use case.
- `assets/templates/src/infrastructure/mapper/*`: Mapping between graph state and domain DTO/aggregate.
- `assets/templates/src/infrastructure/langchain/*`: Prompt + model chain template.
- `assets/templates/src/infrastructure/langgraph/*`: Stateful graph orchestration template.
- `assets/templates/src/infrastructure/persistence/*`: Repository implementation template.

## Completion Checklist
- Place each invariant in exactly one domain model method or factory.
- Delegate each graph node decision to a use case or domain service.
- Use DTOs or mappers at each cross-layer handoff.
- Validate LLM output before persisting or mutating aggregates.
- Cover success and failure `Result` branches in tests.
