import Bounds from './Bounds'
import { addCoordinates, areCoordinatesInOrder } from './Coordinate'
import Line from './Line'

export const CHUNK_DIMENSION = 10000

export default interface Chunk {
	id: string
	x: number
	y: number
	lines: Line[]
}

export const isChunkInBounds = (chunk: Chunk, bounds: Bounds) =>
	areCoordinatesInOrder(bounds.lower, chunk, bounds.upper) ||
	areCoordinatesInOrder(
		bounds.lower,
		addCoordinates(chunk, { x: CHUNK_DIMENSION, y: CHUNK_DIMENSION }),
		bounds.upper
	)
