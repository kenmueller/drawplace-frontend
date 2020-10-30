import { useState, useEffect, useRef } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'

import Place from 'models/Place'
import useWindowSize from 'hooks/useWindowSize'

import styles from 'styles/Home.module.scss'

const Home: NextPage = () => {
	const place = useRef<Place | null>(null)
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	const size = useWindowSize()
	
	useEffect(() => (
		canvas
			? (place.current = new Place(canvas)).stop
			: undefined
	), [canvas, place])
	
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
			<h1 className={styles.title}>
				draw
				<span className={styles.titleEmphasized}>place</span>
			</h1>
			{size && <canvas className={styles.canvas} ref={setCanvas} {...size} />}
		</>
	)
}

export default Home
