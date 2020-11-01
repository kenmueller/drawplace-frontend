import { NextPage } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'

import { src as icon } from 'images/icon.svg'

import 'styles/global.scss'

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
			<link key="icon" rel="icon" href={icon} />
			<meta key="theme-color" name="theme-color" content="white" />
			<meta key="og-site-name" property="og:site_name" content="drawplace" />
			<meta key="og-type" property="og:type" content="website" />
			<meta key="twitter-card" name="twitter:card" content="summary_large_image" />
			<meta key="twitter-site" name="twitter:site" content="@drawplace" />
			<meta key="twitter-creator" name="twitter:creator" content="@drawplace" />
			<meta key="twitter-domain" name="twitter:domain" content="draw.place" />
		</Head>
		<Component {...pageProps} />
		<ToastContainer />
	</>
)

export default App
