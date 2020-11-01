import { NextPage } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { config } from '@fortawesome/fontawesome-svg-core'
import { ToastContainer } from 'react-toastify'

import 'styles/global.scss'

config.autoAddCss = false

const App: NextPage<AppProps> = ({ Component, pageProps }) => (
	<>
		<Head>
			<link key="fonts-googleapis-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />
			<link key="fonts-gstatic-preconnect" rel="preconnect" href="https://fonts.gstatic.com" />
			<link
				key="muli-font"
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Muli:wght@400;700;900&display=swap"
			/>
		</Head>
		<Component {...pageProps} />
		<ToastContainer />
	</>
)

export default App
