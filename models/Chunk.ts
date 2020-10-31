import Line from './Line'

export default interface Chunk {
	id: string
	x: number
	y: number
	lines: Line[]
}
