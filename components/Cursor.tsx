import User from 'models/User'

import styles from 'styles/Cursor.module.scss'

const RADIUS = 5
const DIAMETER = RADIUS * 2

export interface CursorProps {
	user: User
}

const Cursor = ({ user }: CursorProps) => (
	<div
		className={styles.root}
		style={{
			left: user.cursor.x - RADIUS,
			top: user.cursor.y - DIAMETER,
			color: user.color
		}}
		data-name={user.name}
	>
		<svg className={styles.cursor}>
			<circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="currentColor" />
		</svg>
	</div>
)

export default Cursor
