import IO from 'socket.io-client'

import User, { getInitialUser } from './User'
import Line from './Line'
import Coordinate from './Coordinate'
import MouseEventCallback from './MouseEventCallback'

export default class Place {
	setName?(name: string): void
	
	private context: CanvasRenderingContext2D
	private io?: SocketIOClient.Socket
	private isDrawing: boolean = false
	private user: User = getInitialUser()
	private users: User[] = []
	private lines: Line[] = []
	
	private onMouseDown?: MouseEventCallback
	private onMouseMove?: MouseEventCallback
	private onMouseUp?: MouseEventCallback
	
	constructor(private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext('2d')
		this.io = IO(process.env.NEXT_PUBLIC_API_BASE_URL)
		
		this.context.font = '18px Muli, Arial, Helvetica, sans-serif'
		this.context.textAlign = 'center'
		
		this.io.on('name', (name: string) => {
			this.user.name = name
			this.setName?.(name)
			this.refresh()
		})
		
		this.io.on('users', (users: User[]) => {
			this.users = users
			this.refresh()
		})
		
		this.io.on('lines', (lines: Line[]) => {
			this.lines = lines
			this.refresh()
		})
		
		this.io.on('line', (line: Line) => {
			this.lines.push(line)
			this.drawLine(line)
		})
		
		this.onMouseDown = ({ offsetX: x, offsetY: y }) => {
			this.user.cursor = { x, y }
			this.isDrawing = true
		}
		
		this.onMouseMove = ({ offsetX: x, offsetY: y }) => {
			const oldCursor: Coordinate = {
				x: this.user.cursor.x,
				y: this.user.cursor.y
			}
			
			this.user.cursor = { x, y }
			
			this.refresh(() => {
				if (!this.isDrawing)
					return
				
				const line: Line = {
					from: oldCursor,
					to: this.user.cursor
				}
				
				this.drawLine(line)
				this.lines.push(line)
				this.io.emit('line', line)
			})
			
			this.io.emit('cursor', this.user.cursor)
		}
		
		this.onMouseUp = ({ offsetX: x, offsetY: y }) => {
			this.user.cursor = { x, y }
			this.isDrawing = false
		}
		
		this.canvas.addEventListener('mousedown', this.onMouseDown)
		this.canvas.addEventListener('mousemove', this.onMouseMove)
		this.canvas.addEventListener('mouseup', this.onMouseUp)
	}
	
	stop = () => {
		this.io?.close()
		this.canvas.removeEventListener('mousedown', this.onMouseDown)
		this.canvas.removeEventListener('mousemove', this.onMouseMove)
		this.canvas.removeEventListener('mouseup', this.onMouseUp)
	}
	
	refresh = (fn?: () => void) => {
		this.clear()
		this.drawLines()
		fn?.()
		this.drawUsers()
		this.drawText(this.user)
	}
	
	isName = (name: string) =>
		this.user.name === name
	
	private clear = () => {
		const { width, height } = this.canvas
		this.context.clearRect(0, 0, width, height)
	}
	
	private drawCursor = ({ x, y }: Coordinate) => {
		this.context.beginPath()
		this.context.arc(x, y, 5, 0, 2 * Math.PI)
		this.context.fill()
	}
	
	private drawText = (user: User) => {
		const { x, y } = user.cursor
		this.context.fillText(user.message ?? user.name, x, y - 20)
	}
	
	private drawUsers = () => {
		for (const user of this.users) {
			this.drawCursor(user.cursor)
			this.drawText(user)
		}
	}
	
	private drawLine = ({ from, to }: Line) => {
		this.context.beginPath()
		this.context.moveTo(from.x, from.y)
		this.context.lineTo(to.x, to.y)
		this.context.stroke()
	}
	
	private drawLines = () => {
		this.lines.forEach(this.drawLine)
	}
}
