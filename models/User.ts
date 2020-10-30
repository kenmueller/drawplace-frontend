import Coordinate, { getZeroCoordinate } from './Coordinate'

export default interface User {
	id: string
	cursor: Coordinate
	name: string
	color: string
}

export const getInitialUser = (): User => ({
	id: '',
	cursor: getZeroCoordinate(),
	name: '',
	color: '#000000'
})
