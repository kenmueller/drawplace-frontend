import { useRef, useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useDelayedUnmount from 'use-delayed-unmount'
import copy from 'copy-to-clipboard'
import { toast } from 'react-toastify'
import { Svg } from 'react-optimized-image'

import Place from 'models/Place'
import Message from 'models/Message'
import User from 'models/User'
import Coordinate, { getZeroCoordinate } from 'models/Coordinate'
import Bounds from 'models/Bounds'
import { title, description, data } from 'lib/meta'
import useUpdate from 'hooks/useUpdate'
import useWindowSize from 'hooks/useWindowSize'
import ColorPicker from './ColorPicker'
import Chat from './Chat'
import Cursor from './Cursor'

import icon from 'images/icon.svg'
import { src as share } from 'images/share.png'

import styles from 'styles/DrawPlace.module.scss'
import Toast from './Toast'

const onKeyDown = (event: KeyboardEvent) => {
	if (document.activeElement instanceof HTMLInputElement && event.key === 'Escape')
		document.activeElement.blur()
}

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
	
	const [name, setName] = useState('')
	const [messages, setMessages] = useState<Message[]>([])
	const [user, setUser] = useState<User | null>(null)
	const [users, setUsers] = useState<User[]>([])
	const [locationX, setLocationX] = useState('0')
	const [locationY, setLocationY] = useState('0')
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	
	const [[isLoading, isStoppingLoading], setIsLoading] = useDelayedUnmount(true, 150)
	
	const update = useUpdate()
	const size = useWindowSize()
	
	const url = `https://draw.place${x && y ? `/${x}/${y}` : ''}`
	const bounds: Bounds = place.current?.bounds ?? {
		lower: getZeroCoordinate(),
		upper: getZeroCoordinate()
	}
	
	const onNameInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value)
	}, [setName])
	
	const onNameSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		if (place.current?.isName(name) ?? true)
			return
		
		place.current.changeName(name)
		update()
		
		if (document.activeElement instanceof HTMLInputElement)
			document.activeElement.blur()
	}, [place, name, update])
	
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
		toast.success('Copied a link to your location. Send it to your friends!')
		
		;(document.activeElement as any).blur?.()
	}, [place])
	
	const setColor = useCallback((color: string) => {
		if (!place.current || place.current.color === color)
			return
		
		place.current.changeColor(color)
		update()
	}, [place, update])
	
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
		
		place.current.setIsLoading = setIsLoading
	}, [canvas, place, withInitialCoordinates, x, y, setName, setMessages, setUser, setUsers, setLocationX, setLocationY, setIsLoading, update])
	
	useEffect(() => {
		place.current?.changeBounds()
	}, [place, size])
	
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
				<link key="canonical" rel="canonical" href={url} />
				<meta key="description" name="description" content={description} />
				<meta key="og-url" property="og:url" content={url} />
				<meta key="og-image" property="og:image" content={share} />
				<meta key="og-title" property="og:title" content={title} />
				<meta key="og-description" property="og:description" content={description} />
				<meta key="twitter-image" name="twitter:image" content={share} />
				<meta key="twitter-title" name="twitter:title" content={title} />
				<meta key="twitter-description" name="twitter:description" content={description} />
				<script key="data" type="application/ld+json" dangerouslySetInnerHTML={data} />
				<title key="title">{title}</title>
			</Head>
			<nav className={styles.navbar}>
				<Svg className={styles.icon} src={icon} />
				<div className={styles.titleContainer}>
					<h1 className={styles.title}>
						draw
						<span className={styles.titleEmphasized}>place</span>
					</h1>
					<p className={styles.subtitle}>for allie</p>
				</div>
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
					share location
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
				<ColorPicker
					className={styles.color}
					color={place.current?.color ?? '#000000'}
					setColor={setColor}
				/>
				<Chat
					className={styles.chat}
					place={place.current}
					messages={messages}
					setMessages={setMessages}
				/>
			</nav>
			{size && <canvas className={styles.canvas} ref={setCanvas} {...size} />}
			{user && <Cursor user={user} location={bounds.lower} />}
			{users.map(user => (
				<Cursor key={user.id} user={user} location={bounds.lower} bounds={bounds} />
			))}
			{isLoading && <Toast hiding={isStoppingLoading}>Loading...</Toast>}
		</>
	)
}

export default DrawPlace
