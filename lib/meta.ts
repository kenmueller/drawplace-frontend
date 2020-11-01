import share from 'images/share.png'

export const title = 'drawplace'
export const description = 'An infinite map where you can draw with other people in real-time. Share your drawings! Make something new.'
export const data = {
	__html: JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				url: 'https://draw.place',
				name: 'drawplace',
				description,
				inLanguage: 'en-US'
			},
			{
				'@type': 'Organization',
				url: 'https://draw.place',
				logo: {
					'@type': 'ImageObject',
					url: `https://draw.place${share.src}`,
					width: `${share.width}px`,
					height: `${share.height}px`
				}
			}
		]
	})
}
