import IO from 'socket.io-client'

import Cursor from './Cursor'

export default class Place {
	private context: CanvasRenderingContext2D
	
	private io?: SocketIOClient.Socket
	private cursors?: Cursor[]
	
	private onMouseMoveCallback?: (event: MouseEvent) => void
	
	constructor(private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext('2d')
	}
	
	start = () => {
		this.io = IO(process.env.NEXT_PUBLIC_API_BASE_URL)
		
		this.io.on('cursors', (cursors: Cursor[]) => {
			this.cursors = cursors
		})
		
		this.onMouseMoveCallback = ({ clientX: x, clientY: y }) => {
			const cursor: Cursor = { x, y }
			
			this.clear()
			
			this.drawCursor(cursor)
			this.cursors?.forEach(this.drawCursor)
			
			this.io.emit('cursor', cursor)
		}
		
		this.canvas.addEventListener('mousemove', this.onMouseMoveCallback)
	}
	
	stop = () => {
		this.io?.close()
		this.canvas.removeEventListener('mousemove', this.onMouseMoveCallback)
	}
	
	private clear = () => {
		const { width, height } = this.canvas
		this.context.clearRect(0, 0, width, height)
	}
	
	private drawCursor = ({ x, y }: Cursor) => {
		this.context.beginPath()
		this.context.arc(x, y, 5, 0, 2 * Math.PI)
		this.context.fill()
	}
}
