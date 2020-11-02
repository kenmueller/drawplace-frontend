import cx from 'classnames'

import Message, { UserMessage } from 'models/Message'

import styles from 'styles/MessageRow.module.scss'

const shouldShowName = (messages: Message[], message: UserMessage, i: number) => {
	if (message.fromSelf)
		return false
	
	const previousMessage = messages[i - 1]
	
	return !(
		previousMessage?.type === 'user' &&
		message.name === previousMessage.name &&
		message.color === previousMessage.color
	)
}

export interface MessageProps {
	messages: Message[]
	message: Message
	i: number
}

const MessageRow = ({ messages, message, i }: MessageProps) => {
	if (message.type !== 'user')
		return (
			<p className={cx(styles.root, styles.log)}>
				<b className={styles.logName}>{message.name}</b> {
					message.type === 'join' ? 'joined' : 'left'
				}
			</p>
		)
	
	const showsName = shouldShowName(messages, message, i)
	
	return (
		<div className={cx(styles.root, styles.user, {
			[styles.showsName]: showsName,
			[styles.self]: message.fromSelf
		})}>
			{showsName && <p className={styles.name}>{message.name}</p>}
			<p className={styles.body} style={{ color: message.color }}>
				{message.body}
			</p>
		</div>
	)
}

export default MessageRow
