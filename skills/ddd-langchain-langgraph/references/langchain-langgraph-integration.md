# Fitting DDD into LangChain and LangGraph

## Keep responsibilities explicit
- Use LangChain to transform natural language into structured candidate data.
- Use domain models to validate and enforce business invariants.
- Use LangGraph to orchestrate workflow transitions using domain outcomes.

## Recommended layering
1. `infrastructure/langchain/*`: Prompt templates and model invocation.
2. `infrastructure/mapper/*`: Conversion between graph state and application DTOs.
3. `application/useCase/*`: Transaction script that validates, invokes domain behavior, and persists.
4. `domain/*`: Invariant enforcement, domain language, and decision rules.

## Route with domain outcomes
Use graph routing keys derived from domain state (`aggregate.lastAction`, domain policy result, or explicit use-case output). Do not route from raw model text directly.

## Common node contract
Define graph state with:
- request fields (`sessionId`, `latestUserInput`)
- decision fields (`intent`, `intentConfidence`, `nextNode`)
- output fields (`response`, `error`)

Use node sequence:
1. Map state to DTO.
2. Invoke use case.
3. Map aggregate/result back to state patch.
4. Route conditionally using `nextNode` or error status.

## Failure strategy
- Convert validation and domain errors to `Result.fail`.
- Store the error message in graph state (`error`).
- Route to a dedicated failure node that formats a safe response.

## Testing strategy
- Unit-test domain methods and use cases first.
- Add a thin workflow test that checks node routing decisions for success and failure.
- Keep model and network dependencies mocked in workflow tests.
