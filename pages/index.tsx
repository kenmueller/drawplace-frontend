import { useRef, useState, useCallback, useEffect, ChangeEvent, FormEvent } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { ColorChangeHandler, ChromePicker } from 'react-color'

import Place from 'models/Place'
import useUpdate from 'hooks/useUpdate'
import useWindowSize from 'hooks/useWindowSize'

import styles from 'styles/Home.module.scss'

const Home: NextPage = () => {
	const place = useRef<Place | null>(null)
	
	const [name, setName] = useState('')
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	
	const update = useUpdate()
	const size = useWindowSize()
	
	const onNameInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value)
	}, [setName])
	
	const onNameSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		
		if (place.current?.isName(name) ?? true)
			return
		
		place.current.changeName(name)
		update()
	}, [place, name, update])
	
	const onColorChange: ColorChangeHandler = useCallback(({ hex }) => {
		if (!place.current || place.current.color === hex)
			return
		
		place.current.changeColor(hex)
		update()
	}, [place, update])
	
	useEffect(() => {
		if (!canvas)
			return
		
		place.current = new Place(canvas)
		place.current.setName = setName
		
		return place.current.stop
	}, [canvas, place, setName])
	
	useEffect(() => {
		if (place.current)
			place.current.refresh()
	}, [place, size])
	
	return (
		<>
			<Head>
				<link key="api-preconnect" rel="preconnect" href={process.env.NEXT_PUBLIC_API_BASE_URL} />
				<title key="title">drawplace</title>
			</Head>
			<nav className={styles.navbar}>
				<h1 className={styles.title}>
					draw
					<span className={styles.titleEmphasized}>place</span>
				</h1>
				<form className={styles.nameForm} onSubmit={onNameSubmit}>
					<input
						className={styles.nameInput}
						required
						placeholder="username"
						value={name}
						onChange={onNameInputChange}
					/>
					<button
						className={styles.nameSubmit}
						disabled={!name || (place.current?.isName(name) ?? true)}
					>
						save
					</button>
				</form>
				<ChromePicker
					className={styles.color}
					color={place.current?.color ?? '#000000'}
					onChangeComplete={onColorChange}
				/>
			</nav>
			{size && <canvas className={styles.canvas} ref={setCanvas} {...size} />}
		</>
	)
}

export default Home
