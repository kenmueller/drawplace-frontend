export interface UserMessage {
	type: 'user'
	name: string
	color: string
	body: string
	fromSelf?: boolean
}

export interface JoinMessage {
	type: 'join'
	name: string
}

export interface LeaveMessage {
	type: 'leave'
	name: string
}

type Message = UserMessage | JoinMessage | LeaveMessage

export default Message
