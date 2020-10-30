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

export const addCoordinates = (a: Coordinate, b: Coordinate) => {
	a.x += b.x
	a.y += b.y
}
