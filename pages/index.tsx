import { useState, useEffect } from 'react'
import Head from 'next/head'

import Place from 'models/Place'
import useWindowSize from 'hooks/useWindowSize'

const Home = () => {
	const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
	const size = useWindowSize()
	
	useEffect(() => {
		if (!canvas)
			return
		
		const place = new Place(canvas)
		place.start()
		
		return place.stop
	}, [canvas])
	
	return (
		<>
			<Head>
				<title key="title">drawplace</title>
			</Head>
			{size && <canvas ref={setCanvas} {...size} />}
		</>
	)
}

export default Home
