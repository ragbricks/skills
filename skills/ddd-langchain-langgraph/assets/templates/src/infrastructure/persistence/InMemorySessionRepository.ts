import { EntityId } from "@andireuter/js-domain-principles"
import { AgentSession } from "../../domain/aggregate/AgentSession"
import { type ISessionRepository } from "../../domain/repository/ISessionRepository"

class InMemorySessionRepository implements ISessionRepository {
  private readonly sessions = new Map<string, AgentSession>()

  async findById(id: EntityId): Promise<AgentSession | null> {
    return (this.sessions.get(id.toString) ?? null)
  }

  async save(session: AgentSession): Promise<void> {
    this.sessions.set(session.id.toString, session)
  }
}

export { InMemorySessionRepository }
