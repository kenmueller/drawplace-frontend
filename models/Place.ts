import IO from 'socket.io-client'

export default class Place {
	private context: CanvasRenderingContext2D
	
	private io?: SocketIOClient.Socket
	private onMouseMoveCallback?: (event: MouseEvent) => void
	
	constructor(private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext('2d')
	}
	
	start = () => {
		this.io = IO(process.env.NEXT_PUBLIC_API_BASE_URL)
		
		this.onMouseMoveCallback = ({ clientX, clientY }) => {
			this.clear()
			
			this.context.beginPath()
			this.context.arc(clientX, clientY, 5, 0, 2 * Math.PI)
			this.context.fill()
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
}
