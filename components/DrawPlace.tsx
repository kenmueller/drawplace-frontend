import { useRef, useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import copy from 'copy-to-clipboard'
import { toast } from 'react-toastify'
import { ColorChangeHandler, ChromePicker } from 'react-color'
import cx from 'classnames'

import Place from 'models/Place'
import Message from 'models/Message'
import User from 'models/User'
import Coordinate, { getZeroCoordinate } from 'models/Coordinate'
import Bounds from 'models/Bounds'
import useUpdate from 'hooks/useUpdate'
import useWindowSize from 'hooks/useWindowSize'
import Cursor from './Cursor'

import styles from 'styles/DrawPlace.module.scss'

interface Query {
	x?: string
	y?: string
}

export interface DrawPlaceProps {
	withInitialCoordinates?: boolean
}

const DrawPlace = ({ withInitialCoordinates = false }: DrawPlaceProps) => {
	const { x, y } = useRouter().query as Query
	
	const place = useRef<Place | null>(null)
	const messagesRef = useRef<HTMLDivElement | null>(null)
	const messageInput = useRef<HTMLInputElement | null>(null)
	
	const [name, setName] = useState('')
	const [message, setMessage] = useState('')
	const [messages, setMessages] = useState<Message[]>([])
	const [user, setUser] = useState<User | null>(null)
	const [users, setUsers] = useState<User[]>([])
	const [locationX, setLocationX] = useState('0')
	const [locationY, setLocationY] = useState('0')
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	
	const update = useUpdate()
	const size = useWindowSize()
	
	const bounds: Bounds = place.current?.bounds ?? {
		lower: getZeroCoordinate(),
		upper: getZeroCoordinate()
	}
	
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
		
		if (document.activeElement instanceof HTMLInputElement)
			document.activeElement.blur()
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
		
		if (document.activeElement instanceof HTMLInputElement)
			document.activeElement.blur()
	}, [place, message])
	
	const onLocationSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		const location: Coordinate = {
			x: parseInt(locationX, 10),
			y: parseInt(locationY, 10)
		}
		
		if (place.current?.isLocation(location) ?? true)
			return
		
		place.current.changeLocation(location)
		update()
		
		if (document.activeElement instanceof HTMLInputElement)
			document.activeElement.blur()
	}, [locationX, locationY, place, update])
	
	const onLocationXChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setLocationX(event.target.value)
	}, [setLocationX])
	
	const onLocationYChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setLocationY(event.target.value)
	}, [setLocationY])
	
	const copyLocation = useCallback(() => {
		if (!place.current)
			return
		
		const { x, y } = place.current.location
		const extension = `/${x}/${y}`
		
		copy(`https://draw.place${extension}`)
		toast.success('Copied your drawing\'s link. Send it to your friends!')
		
		;(document.activeElement as any).blur?.()
	}, [place])
	
	const onColorChange: ColorChangeHandler = useCallback(({ hex }) => {
		if (!place.current || place.current.color === hex)
			return
		
		place.current.changeColor(hex)
		update()
	}, [place, update])
	
	const onKeyDown = useCallback((event: KeyboardEvent) => {
		if (document.activeElement instanceof HTMLInputElement) {
			if (event.key === 'Escape')
				document.activeElement.blur()
			
			return
		}
		
		if (!(messageInput.current && event.key.toLowerCase() === 't'))
			return
		
		event.preventDefault()
		messageInput.current.focus()
	}, [messageInput])
	
	useEffect(() => {
		if (!canvas || place.current || (withInitialCoordinates && !(x && y)))
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
		
		place.current.setLocation = ({ x, y }) => {
			setLocationX(x.toString())
			setLocationY(y.toString())
		}
		
		if (withInitialCoordinates) {
			const location: Coordinate = {
				x: parseInt(x, 10),
				y: parseInt(y, 10)
			}
			
			if (!(Number.isNaN(location.x) || Number.isNaN(location.y)))
				place.current.setInitialLocation(location)
		}
	}, [canvas, place, withInitialCoordinates, x, y, setName, setMessages, setUser, setUsers, setLocationX, setLocationY, update])
	
	useEffect(() => {
		place.current?.changeBounds()
	}, [place, size])
	
	useEffect(() => {
		if (messagesRef.current)
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight
	}, [messagesRef, messages])
	
	useEffect(() => {
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [onKeyDown])
	
	useEffect(() => (
		() => place.current?.stop()
	), [place])
	
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
				<p className={styles.movement}>
					<span className={styles.movementIndicator}>move with</span>
					W A S D
				</p>
				<button className={styles.copyLocation} onClick={copyLocation}>
					save drawing
				</button>
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
						disabled={place.current?.isLocation({
							x: parseInt(locationX, 10),
							y: parseInt(locationY, 10)
						}) ?? true}
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
			{user && <Cursor user={user} location={bounds.lower} />}
			{users.map(user => (
				<Cursor key={user.id} user={user} location={bounds.lower} bounds={bounds} />
			))}
		</>
	)
}

export default DrawPlace
