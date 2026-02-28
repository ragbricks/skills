import { type DomainService } from "@andireuter/js-domain-principles"
import { type AllowedIntent } from "../valueObject/ConversationIntent"

interface IntentRoutingPolicy extends DomainService {
  route(intent: AllowedIntent): "respond" | "retrieve" | "tool_call"
}

export type { IntentRoutingPolicy }
