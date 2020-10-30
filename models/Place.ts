import IO from 'socket.io-client'

import Coordinate from './Coordinate'
import Line from './Line'
import MouseEventCallback from './MouseEventCallback'

export default class Place {
	private context: CanvasRenderingContext2D
	private io?: SocketIOClient.Socket
	private cursor?: Coordinate
	private isDrawing = false
	private cursors: Coordinate[] = []
	private lines: Line[] = []
	
	private onMouseDown?: MouseEventCallback
	private onMouseMove?: MouseEventCallback
	private onMouseUp?: MouseEventCallback
	
	constructor(private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext('2d')
		this.io = IO(process.env.NEXT_PUBLIC_API_BASE_URL)
		
		this.io.on('cursors', (cursors: Coordinate[]) => {
			this.cursors = cursors
			this.refresh()
		})
		
		this.io.on('lines', (lines: Line[]) => {
			this.lines = lines
			this.drawLines()
		})
		
		this.io.on('line', (line: Line) => {
			this.lines.push(line)
			this.drawLine(line)
		})
		
		this.onMouseDown = ({ offsetX: x, offsetY: y }) => {
			this.cursor = { x, y }
			this.isDrawing = true
		}
		
		this.onMouseMove = ({ offsetX: x, offsetY: y }) => {
			if (this.isDrawing) {
				const line: Line = {
					from: { x: this.cursor.x, y: this.cursor.y },
					to: { x, y }
				}
				
				this.drawLine(line)
				this.lines.push(line)
				this.io.emit('line', line)
			}
			
			this.io.emit('cursor', this.cursor = { x, y })
		}
		
		this.onMouseUp = ({ offsetX: x, offsetY: y }) => {
			this.cursor = { x, y }
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
	
	refresh = () => {
		this.clear()
		this.drawLines()
		this.drawCursors()
	}
	
	private clear = () => {
		const { width, height } = this.canvas
		this.context.clearRect(0, 0, width, height)
	}
	
	private drawCursor = ({ x, y }: Coordinate) => {
		this.context.beginPath()
		this.context.arc(x, y, 5, 0, 2 * Math.PI)
		this.context.fill()
	}
	
	private drawCursors = () => {
		this.cursors.forEach(this.drawCursor)
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
