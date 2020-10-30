import IO from 'socket.io-client'

export default class Place {
	private context: CanvasRenderingContext2D
	
	private io: SocketIOClient.Socket | null = null
	
	constructor(private canvas: HTMLCanvasElement) {
		this.context = canvas.getContext('2d')
	}
	
	start = () => {
		this.io = IO(process.env.NEXT_PUBLIC_API_BASE_URL)
	}
	
	stop = () => {
		this.io?.close()
	}
}
