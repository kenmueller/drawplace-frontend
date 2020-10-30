import { stringify } from 'querystring'
import Coordinate from './Coordinate'

export default interface User {
	id: string
	cursor: Coordinate
	name: string
	color: string
}

export const getInitialUser = (): User => ({
	id: '',
	cursor: { x: 0, y: 0 },
	name: '',
	color: '#000000'
})
