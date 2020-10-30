import { useCallback, useState } from 'react'

const useUpdate = () => {
	const [, setState] = useState({})
	
	return useCallback(() => setState({}), [setState])
}

export default useUpdate
