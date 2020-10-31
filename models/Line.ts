import Coordinate from './Coordinate'

export default interface Line {
	from: Coordinate
	to: Coordinate
	color: string
}

export const getChunkIdForLine = ({ from: { x, y } }: Line) =>
	`${Math.floor(x / 1000)}x${Math.floor(y / 1000)}`
