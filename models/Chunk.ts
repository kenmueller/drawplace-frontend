import Bounds from './Bounds'
import Coordinate from './Coordinate'
import Line from './Line'

export const CHUNK_DIMENSION = 2500

export default interface Chunk {
	id: string
	x: number
	y: number
	lines: Line[]
}

export const isChunkInBounds = (chunk: Coordinate, bounds: Bounds) =>
	chunk.x + CHUNK_DIMENSION >= bounds.lower.x &&
	chunk.x <= bounds.upper.x &&
	chunk.y <= bounds.upper.y &&
	chunk.y + CHUNK_DIMENSION >= bounds.lower.y
