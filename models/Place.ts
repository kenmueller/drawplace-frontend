import IO from 'socket.io-client'

import User, { getInitialUser } from './User'
import Line from './Line'
import Message, { JoinMessage } from './Message'
import Coordinate, { addCoordinates, subtractCoordinates, isZeroCoordinate, getZeroCoordinate, areCoordinatesEqual, areCoordinatesInOrder } from './Coordinate'
import Bounds from './Bounds'
import MouseEventCallback from './MouseEventCallback'
import KeyboardEventCallback from './KeyboardEventCallback'

const SPEED = 3

export default class Place {
	setName?(name: string): void
	setMessages?(messages: Message[]): void
	addMessage?(message: Message): void
	setUser?(user: User): void
	setUsers?(users: User[]): void
	setLocation?(location: Coordinate): void
	
	location: Coordinate = getZeroCoordinate()
	
	private context: CanvasRenderingContext2D
	private io?: SocketIOClient.Socket
	private isDrawing: boolean = false
	private didLoadMessages: boolean = false
	private pendingJoinMessage?: JoinMessage
	private user: User = getInitialUser()
	private lines: Line[] = []
	private movement: Coordinate = getZeroCoordinate()
	
	private onMouseDown?: MouseEventCallback
	private onMouseMove?: MouseEventCallback
	private onMouseUp?: MouseEventCallback
	
	private onKeyDown?: KeyboardEventCallback
	private onKeyUp?: KeyboardEventCallback
	
	constructor(private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext('2d')
		this.io = IO(process.env.NEXT_PUBLIC_API_BASE_URL)
		
		this.io.on('name', (name: string) => {
			this.user.name = name
			this.setName?.(name)
			this.addJoinMessage()
		})
		
		this.io.on('users', (users: User[]) => {
			this.setUsers?.(users)
		})
		
		this.io.on('lines', (lines: Line[]) => {
			this.lines = lines
			this.drawLines()
		})
		
		this.io.on('line', (line: Line) => {
			this.lines.push(line)
			this.drawLine(line)
		})
		
		this.io.on('messages', (messages: Message[]) => {
			this.didLoadMessages = true
			this.setMessages?.(messages)
			
			if (this.pendingJoinMessage)
				this.addMessage?.(this.pendingJoinMessage)
		})
		
		this.io.on('message', (message: Message) => {
			this.addMessage?.(message)
		})
		
		this.addMouseEventListeners()
		this.addMovementEventListeners()
	}
	
	stop = () => {
		this.io?.close()
		this.removeMouseEventListeners()
		this.removeMovementEventListeners()
	}
	
	refresh = () => {
		this.clear()
		this.drawLines()
	}
	
	changeName = (name: string) => {
		this.user.name = name
		this.setUser?.(this.user)
		this.io.emit('name', name)
	}
	
	isName = (name: string) =>
		this.user.name === name
	
	isLocation = (location: Coordinate) =>
		areCoordinatesEqual(this.location, location)
	
	get color() {
		return this.user.color
	}
	
	get bounds(): Bounds {
		return {
			lower: this.location,
			upper: addCoordinates(this.location, {
				x: this.canvas.width,
				y: this.canvas.height
			})
		}
	}
	
	changeColor = (color: string) => {
		this.user.color = color
		this.setUser?.(this.user)
		this.io.emit('color', color)
	}
	
	sendMessage = (body: string): Message => {
		this.io.emit('message', body)
		
		return {
			type: 'user',
			name: this.user.name,
			color: this.user.color,
			body
		}
	}
	
	changeLocation = (location: Coordinate) => {
		this.user.cursor = addCoordinates(
			this.user.cursor,
			subtractCoordinates(location, this.location)
		)
		this.location = location
		this.refresh()
	}
	
	private addMouseEventListeners = () => {
		this.canvas.addEventListener(
			'mousedown',
			this.onMouseDown = ({ offsetX: x, offsetY: y }) => {
				this.onCursorMove({ x, y })
				this.isDrawing = true
			}
		)
		
		this.canvas.addEventListener(
			'mousemove',
			this.onMouseMove = ({ offsetX: x, offsetY: y }) => {
				const oldCursor: Coordinate = {
					x: this.user.cursor.x,
					y: this.user.cursor.y
				}
				
				this.onCursorMove({ x, y })
				
				if (this.isDrawing) {
					const line: Line = {
						from: oldCursor,
						to: this.user.cursor,
						color: this.user.color
					}
					
					this.drawLine(line)
					this.lines.push(line)
					this.io.emit('line', line)
				}
				
				this.io.emit('cursor', this.user.cursor)
			}
		)
		
		this.canvas.addEventListener(
			'mouseup',
			this.onMouseUp = ({ offsetX: x, offsetY: y }) => {
				this.onCursorMove({ x, y })
				this.isDrawing = false
			}
		)
	}
	
	private removeMouseEventListeners = () => {
		this.canvas.removeEventListener('mousedown', this.onMouseDown)
		this.canvas.removeEventListener('mousemove', this.onMouseMove)
		this.canvas.removeEventListener('mouseup', this.onMouseUp)
	}
	
	private modifyMovement = (key: string, down: boolean) => {
		const delta = down ? SPEED : -SPEED
		
		switch (key.toLowerCase()) {
			case 'w':
				this.movement.y -= delta
				break
			case 'a':
				this.movement.x -= delta
				break
			case 's':
				this.movement.y += delta
				break
			case 'd':
				this.movement.x += delta
				break
		}
	}
	
	private addMovementEventListeners = () => {
		document.addEventListener(
			'keydown',
			this.onKeyDown = ({ repeat, key }) =>
				repeat ||
				document.activeElement instanceof HTMLInputElement ||
				this.modifyMovement(key, true)
		)
		
		document.addEventListener(
			'keyup',
			this.onKeyUp = ({ repeat, key }) =>
				repeat ||
				document.activeElement instanceof HTMLInputElement ||
				this.modifyMovement(key, false)
		)
		
		requestAnimationFrame(this.onMovementTick)
	}
	
	private removeMovementEventListeners = () => {
		document.removeEventListener('keydown', this.onKeyDown)
		document.removeEventListener('keyup', this.onKeyUp)
	}
	
	private onMovementTick = () => {
		if (!isZeroCoordinate(this.movement)) {
			this.user.cursor = addCoordinates(this.user.cursor, this.movement)
			this.location = addCoordinates(this.location, this.movement)
			this.refresh()
			this.setLocation?.(this.location)
		}
		
		requestAnimationFrame(this.onMovementTick)
	}
	
	private clear = () => {
		const { width, height } = this.canvas
		this.context.clearRect(0, 0, width, height)
	}
	
	private onCursorMove = (cursor: Coordinate) => {
		this.user.cursor = addCoordinates(this.location, cursor)
		this.setUser?.(this.user)
	}
	
	private drawLine = ({ from, to, color }: Line) => {
		const { location, bounds } = this
		const { x, y } = location
		
		if (!(
			areCoordinatesInOrder(bounds.lower, from, bounds.upper) ||
			areCoordinatesInOrder(bounds.lower, to, bounds.upper)
		))
			return
		
		this.context.strokeStyle = color
		this.context.beginPath()
		this.context.moveTo(from.x - x, from.y - y)
		this.context.lineTo(to.x - x, to.y - y)
		this.context.stroke()
	}
	
	private drawLines = () => {
		this.lines.forEach(this.drawLine)
	}
	
	private addJoinMessage = () => {
		const message: JoinMessage = {
			type: 'join',
			name: this.user.name
		}
		
		if (this.didLoadMessages)
			this.addMessage?.(message)
		else
			this.pendingJoinMessage = message
	}
}
