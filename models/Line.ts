import Coordinate, { getChunkIdForCoordinate } from './Coordinate'

export default interface Line {
	from: Coordinate
	to: Coordinate
	color: string
}

export const getChunkIdForLine = ({ from }: Line) =>
	getChunkIdForCoordinate(from)
