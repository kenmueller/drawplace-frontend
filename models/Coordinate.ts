export default interface Coordinate {
	x: number
	y: number
}

export const getZeroCoordinate = (): Coordinate => ({
	x: 0,
	y: 0
})

export const isZeroCoordinate = ({ x, y }: Coordinate) =>
	!(x || y)

export const areCoordinatesEqual = (a: Coordinate, b: Coordinate) =>
	a.x === b.x && a.y === b.y

export const areCoordinatesInOrder = (a: Coordinate, b: Coordinate, c: Coordinate) =>
	a.x <= b.x && b.x <= c.x && a.y <= b.y && b.y <= c.y

export const addCoordinates = (a: Coordinate, b: Coordinate): Coordinate => ({
	x: a.x + b.x,
	y: a.y + b.y
})
