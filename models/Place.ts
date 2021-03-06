import { Socket, io } from 'socket.io-client'

import User, { getInitialUser } from './User'
import Line, { getChunkIdForLine } from './Line'
import Message, { JoinMessage } from './Message'
import Coordinate, { addCoordinates, subtractCoordinates, isZeroCoordinate, getZeroCoordinate, areCoordinatesEqual, areCoordinatesInOrder } from './Coordinate'
import Bounds from './Bounds'
import MouseEventCallback from './MouseEventCallback'
import KeyboardEventCallback from './KeyboardEventCallback'
import Chunk, { isChunkInBounds } from './Chunk'

const SPEED = 3

export default class Place {
	setName?(name: string): void
	setMessages?(messages: Message[]): void
	addMessage?(message: Message): void
	setUser?(user: User): void
	setUsers?(users: User[]): void
	setLocation?(location: Coordinate): void
	setIsLoading?(isLoading: boolean): void
	
	location: Coordinate = getZeroCoordinate()
	bounds: Bounds
	
	private context: CanvasRenderingContext2D
	private io?: Socket
	private isDrawing: boolean = false
	private didLoadMessages: boolean = false
	private pendingJoinMessage?: JoinMessage
	private user: User = getInitialUser()
	private chunks: Chunk[] = []
	private movement: Coordinate = getZeroCoordinate()
	private keys: Set<string> = new Set()
	
	private onMouseDown?: MouseEventCallback
	private onMouseMove?: MouseEventCallback
	private onMouseUp?: MouseEventCallback
	
	private onKeyDown?: KeyboardEventCallback
	private onKeyUp?: KeyboardEventCallback
	
	constructor(private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext('2d')
		this.io = io(process.env.NEXT_PUBLIC_API_BASE_URL)
		
		this.bounds = this.getBounds()
		this.emitBounds()
		
		this.io.on('name', (name: string) => {
			this.user.name = name
			this.setName?.(name)
			this.addJoinMessage()
		})
		
		this.io.on('users', (users: User[]) => {
			this.setUsers?.(users)
		})
		
		this.io.on('chunk', (chunk: Chunk) => {
			this.chunks.push(chunk)
			this.drawChunk(chunk)
			this.setIsLoading?.(false)
		})
		
		this.io.on('line', (chunkId: string, line: Line) => {
			this.chunkWithId(chunkId)?.lines.push(line)
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
	
	changeName = (name: string) => {
		this.user.name = name
		this.setUser?.(this.user)
		this.io.emit('name', name)
	}
	
	isName = (name: string) =>
		this.user.name === name
	
	isLocation = (location: Coordinate) =>
		Number.isNaN(location.x) ||
		Number.isNaN(location.y) ||
		areCoordinatesEqual(this.location, location)
	
	get color() {
		return this.user.color
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
			body,
			fromSelf: true
		}
	}
	
	changeLocation = (location: Coordinate) => {
		this.user.cursor = addCoordinates(
			this.user.cursor,
			subtractCoordinates(location, this.location)
		)
		this.location = location
		this.changeBounds()
		this.emitCursor()
	}
	
	changeBounds = () => {
		this.bounds = this.getBounds()
		this.refresh()
		this.emitBounds()
	}
	
	setInitialLocation = (location: Coordinate) => {
		this.changeLocation(location)
		this.setLocation?.(location)
	}
	
	private getBounds = (): Bounds => ({
		lower: this.location,
		upper: addCoordinates(this.location, {
			x: this.canvas.width,
			y: this.canvas.height
		})
	})
	
	private emitBounds = () => {
		this.io.emit('bounds', this.bounds)
	}
	
	private refresh = () => {
		this.clear()
		this.drawChunks()
	}
	
	private emitCursor = () => {
		this.io.emit('cursor', this.user.cursor)
	}
	
	private chunkWithId = (id: string) =>
		this.chunks.find(chunk => chunk.id === id)
	
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
					this.chunkWithId(getChunkIdForLine(line))?.lines.push(line)
					this.io.emit('line', line)
				}
				
				this.emitCursor()
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
		key = key.toLowerCase()
		
		if (
			document.activeElement instanceof HTMLInputElement ||
			(down ? this.keys.has(key) : !this.keys.has(key))
		)
			return
		
		const delta = down ? SPEED : -SPEED
		
		switch (key) {
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
			default:
				return // Prevent unexpected key being added/removed to this.keys
		}
		
		down
			? this.keys.add(key)
			: this.keys.delete(key)
	}
	
	private addMovementEventListeners = () => {
		document.addEventListener(
			'keydown',
			this.onKeyDown = ({ key }) => this.modifyMovement(key, true)
		)
		
		document.addEventListener(
			'keyup',
			this.onKeyUp = ({ key }) => this.modifyMovement(key, false)
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
			this.setLocation?.(this.location)
			this.changeBounds()
			this.emitCursor()
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
	
	private drawChunk = (chunk: Chunk) => {
		if (isChunkInBounds(chunk, this.bounds))
			chunk.lines.forEach(this.drawLine)
	}
	
	private drawChunks = () => {
		this.chunks.forEach(this.drawChunk)
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
