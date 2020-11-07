import { PropsWithChildren } from 'react'
import cx from 'classnames'

import styles from 'styles/Toast.module.scss'

export interface ToastProps extends PropsWithChildren<{}> {
	hiding: boolean
}

const Toast = ({ hiding, children }: ToastProps) => (
	<p className={cx(styles.root, { [styles.hiding]: hiding })}>
		{children}
	</p>
)

export default Toast
