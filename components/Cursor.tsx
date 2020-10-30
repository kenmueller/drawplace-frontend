import User from 'models/User'
import Bounds from 'models/Bounds'
import Coordinate, { areCoordinatesInOrder } from 'models/Coordinate'

import styles from 'styles/Cursor.module.scss'

const RADIUS = 5
const DIAMETER = RADIUS * 2

export interface CursorProps {
	user: User
	location: Coordinate
	bounds?: Bounds
}

const Cursor = ({ user, location, bounds }: CursorProps) =>
	!bounds || areCoordinatesInOrder(bounds.lower, user.cursor, bounds.upper)
		? (
			<div
				className={styles.root}
				style={{
					left: user.cursor.x - RADIUS - location.x,
					top: user.cursor.y - DIAMETER - location.y,
					color: user.color
				}}
				data-name={user.name}
			>
				<svg className={styles.cursor}>
					<circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="currentColor" />
				</svg>
			</div>
		)
		: null

export default Cursor
