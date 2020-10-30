import { useState, useCallback, useEffect } from 'react'

export interface WindowSize {
	width: number
	height: number
}

const useWindowSize = () => {
	const [size, setSize] = useState<WindowSize | null>(null)
	
	const updateSize = useCallback(() => {
		setSize({
			width: window.innerWidth,
			height: window.innerHeight
		})
	}, [setSize])
	
	useEffect(() => {
		updateSize()
		window.addEventListener('resize', updateSize)
		
		return () => window.removeEventListener('resize', updateSize)
	}, [updateSize])
	
	return size
}

export default useWindowSize
