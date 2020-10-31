import Line from './Line'

export const CHUNK_DIMENSION = 10000

export default interface Chunk {
	id: string
	x: number
	y: number
	lines: Line[]
}
