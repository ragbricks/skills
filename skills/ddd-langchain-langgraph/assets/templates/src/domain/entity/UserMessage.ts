import { Entity, EntityId } from "@andireuter/js-domain-principles"

interface UserMessageProps {
  text: string
  createdAt: Date
}

class UserMessage extends Entity<UserMessageProps> {
  constructor(props: UserMessageProps, id?: EntityId) {
    super(props, id)
  }

  static create(text: string): UserMessage {
    return (new UserMessage({
      text: text.trim(),
      createdAt: new Date()
    }))
  }

  get text(): string {
    return (this.props.text)
  }

  get createdAt(): Date {
    return (this.props.createdAt)
  }
}

export { UserMessage, type UserMessageProps }
