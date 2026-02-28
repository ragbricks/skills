import { EntityId, type IRepository } from "@andireuter/js-domain-principles"
import { AgentSession } from "../aggregate/AgentSession"

interface ISessionRepository extends IRepository<AgentSession> {
  findById(id: EntityId): Promise<AgentSession | null>
  save(session: AgentSession): Promise<void>
}

export type { ISessionRepository }
