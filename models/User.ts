import { stringify } from 'querystring'
import Coordinate from './Coordinate'

export default interface User {
	cursor: Coordinate
	name: string
	color: string
	message: string | null
}

export const getInitialUser = (): User => ({
	cursor: { x: 0, y: 0 },
	name: '',
	color: '#000000',
	message: null,
})
