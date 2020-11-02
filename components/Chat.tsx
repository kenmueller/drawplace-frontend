import { useRef, useState, useCallback, useEffect, SetStateAction, FormEvent, ChangeEvent } from 'react'
import cx from 'classnames'

import Place from 'models/Place'
import Message from 'models/Message'
import MessageRow from './MessageRow'

import styles from 'styles/Chat.module.scss'

export interface ChatProps {
	className?: string
	place: Place | null
	messages: Message[]
	setMessages(messages: SetStateAction<Message[]>): void
}

const Chat = ({ className, place, messages, setMessages }: ChatProps) => {
	const container = useRef<HTMLDivElement | null>(null)
	const input = useRef<HTMLInputElement | null>(null)
	
	const [message, setMessage] = useState('')
	
	const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		if (!place)
			return
		
		setMessage('')
		setMessages(messages => [
			...messages,
			place.sendMessage(message)
		])
		
		input.current?.blur()
	}, [place, setMessage, setMessages, message, input])
	
	const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setMessage(event.target.value)
	}, [setMessage])
	
	const onKeyDown = useCallback((event: KeyboardEvent) => {
		if (
			document.activeElement instanceof HTMLInputElement ||
			!(input.current && event.key.toLowerCase() === 't')
		)
			return
		
		event.preventDefault()
		input.current.focus()
	}, [input])
	
	useEffect(() => {
		if (container.current)
			container.current.scrollTop = container.current.scrollHeight
	}, [container, messages])
	
	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [onKeyDown])
	
	return (
		<div className={cx(styles.root, className)}>
			<div className={styles.messages} ref={container}>
				{messages.map((message, i) =>
					<MessageRow key={i} messages={messages} message={message} i={i} />
				)}
			</div>
			<form className={styles.form} onSubmit={onSubmit}>
				<input
					className={styles.input}
					ref={input}
					required
					placeholder="type 't' to chat"
					value={message}
					onChange={onChange}
				/>
				<button className={styles.submit} disabled={!message}>
					send
				</button>
			</form>
		</div>
	)
}

export default Chat
