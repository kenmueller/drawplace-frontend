import { useRef, useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { ColorChangeHandler, ChromePicker } from 'react-color'
import cx from 'classnames'

import Place from 'models/Place'
import Message from 'models/Message'
import User from 'models/User'
import { getZeroCoordinate } from 'models/Coordinate'
import useUpdate from 'hooks/useUpdate'
import useWindowSize from 'hooks/useWindowSize'

import styles from 'styles/Home.module.scss'
import Cursor from 'components/Cursor'

const Home: NextPage = () => {
	const place = useRef<Place | null>(null)
	const messagesRef = useRef<HTMLDivElement | null>(null)
	const messageInput = useRef<HTMLInputElement | null>(null)
	
	const [name, setName] = useState('')
	const [message, setMessage] = useState('')
	const [messages, setMessages] = useState<Message[]>([])
	const [user, setUser] = useState<User | null>(null)
	const [users, setUsers] = useState<User[]>([])
	const [location, setLocation] = useState(getZeroCoordinate())
	const [locationX, setLocationX] = useState(location.x)
	const [locationY, setLocationY] = useState(location.y)
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	
	const update = useUpdate()
	const size = useWindowSize()
	
	const onNameInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value)
	}, [setName])
	
	const onMessageInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setMessage(event.target.value)
	}, [setMessage])
	
	const onNameSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		if (place.current?.isName(name) ?? true)
			return
		
		place.current.changeName(name)
		update()
	}, [place, name, update])
	
	const onMessageSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		if (!place.current)
			return
		
		setMessage('')
		setMessages(messages => [
			...messages,
			place.current.sendMessage(message)
		])
	}, [place, message])
	
	const onLocationSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		console.log(location, { x: locationX, y: locationY })
	}, [location, locationX, locationY])
	
	const onLocationChange = useCallback((
		event: ChangeEvent<HTMLInputElement>,
		setLocation: (location: number) => void
	) => {
		const value = parseInt(event.target.value, 10)
		
		if (!Number.isNaN(value))
			setLocation(value)
	}, [])
	
	const onLocationXChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		onLocationChange(event, setLocationX)
	}, [onLocationChange, setLocationX])
	
	const onLocationYChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		onLocationChange(event, setLocationY)
	}, [onLocationChange, setLocationY])
	
	const onColorChange: ColorChangeHandler = useCallback(({ hex }) => {
		if (!place.current || place.current.color === hex)
			return
		
		place.current.changeColor(hex)
		update()
	}, [place, update])
	
	const onKeyDown = useCallback((event: KeyboardEvent) => {
		if (
			document.activeElement instanceof HTMLInputElement ||
			!(messageInput.current && event.key.toLowerCase() === 't')
		)
			return
		
		event.preventDefault()
		messageInput.current.focus()
	}, [messageInput])
	
	useEffect(() => {
		if (!canvas)
			return
		
		place.current = new Place(canvas)
		
		place.current.setName = setName
		
		place.current.setMessages = setMessages
		place.current.addMessage = message =>
			setMessages(messages => [...messages, message])
		
		place.current.setUser = user => {
			setUser(user)
			update()
		}
		place.current.setUsers = setUsers
		
		place.current.setLocation = location => {
			setLocation(location)
			update()
		}
		
		return place.current.stop
	}, [canvas, place, setName, setMessages, setUser, setUsers, setLocation, update])
	
	useEffect(() => {
		place.current?.refresh()
	}, [place, size])
	
	useEffect(() => {
		if (messagesRef.current)
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight
	}, [messagesRef, messages])
	
	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [onKeyDown])
	
	return (
		<>
			<Head>
				<link key="api-preconnect" rel="preconnect" href={process.env.NEXT_PUBLIC_API_BASE_URL} />
				<title key="title">drawplace</title>
			</Head>
			<nav className={styles.navbar}>
				<h1 className={styles.title}>
					draw
					<span className={styles.titleEmphasized}>place</span>
				</h1>
				<form className={styles.nameForm} onSubmit={onNameSubmit}>
					<input
						className={styles.nameInput}
						required
						placeholder="username"
						value={name}
						onChange={onNameInputChange}
					/>
					<button
						className={styles.nameSubmit}
						disabled={!name || (place.current?.isName(name) ?? true)}
					>
						save
					</button>
				</form>
				<form className={styles.locationForm} onSubmit={onLocationSubmit}>
					<div className={styles.location}>
						<label className={styles.locationLabel} htmlFor="location-x-input">
							x
						</label>
						<input
							className={styles.locationInput}
							id="location-x-input"
							required
							type="number"
							value={locationX}
							onChange={onLocationXChange}
						/>
					</div>
					<div className={styles.location}>
						<label className={styles.locationLabel} htmlFor="location-y-input">
							y
						</label>
						<input
							className={styles.locationInput}
							id="location-y-input"
							required
							type="number"
							value={locationY}
							onChange={onLocationYChange}
						/>
					</div>
					<button
						className={styles.locationSubmit}
						disabled={location.x === locationX && location.y === locationY}
					>
						go
					</button>
				</form>
				<ChromePicker
					className={styles.color}
					color={place.current?.color ?? '#000000'}
					onChangeComplete={onColorChange}
				/>
				<div className={styles.chat}>
					<div className={styles.messages} ref={messagesRef}>
						{messages.map((message, i) => (
							<p
								key={i}
								className={cx(styles.message, {
									[styles.logMessage]: message.type !== 'user'
								})}
								style={{
									color: message.type === 'user'
										? message.color
										: undefined
								}}
							>
								{message.type === 'user'
									? <><b>{message.name}:</b> {message.body}</>
									: <><b>{message.name}</b> {message.type === 'join' ? 'joined' : 'left'}</>
								}
							</p>
						))}
					</div>
					<form className={styles.messageForm} onSubmit={onMessageSubmit}>
						<input
							className={styles.messageInput}
							ref={messageInput}
							required
							placeholder="type 't' to chat"
							value={message}
							onChange={onMessageInputChange}
						/>
						<button className={styles.messageSubmit} disabled={!message}>
							send
						</button>
					</form>
				</div>
			</nav>
			{size && <canvas className={styles.canvas} ref={setCanvas} {...size} />}
			{user && <Cursor user={user} />}
			{users.map(user => <Cursor key={user.id} user={user} />)}
		</>
	)
}

export default Home
