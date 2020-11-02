import { useCallback } from 'react'
import { ColorChangeHandler, ChromePicker } from 'react-color'
import cx from 'classnames'

import styles from 'styles/ColorPicker.module.scss'

export interface ColorPickerProps {
	className?: string
	color: string
	setColor(color: string): void
}

const ColorPicker = ({ className, color, setColor }: ColorPickerProps) => {
	const onChange: ColorChangeHandler = useCallback(({ hex }) => {
		setColor(hex)
	}, [setColor])
	
	return (
		<ChromePicker
			className={cx(styles.root, className)}
			color={color}
			onChangeComplete={onChange}
		/>
	)
}

export default ColorPicker
