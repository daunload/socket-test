'use client'

import { $network } from '@/lib/network/NetworkManager'
import { REQUEST_CODE } from '@/lib/network/RequestCode'
import { useEffect } from 'react'

export default function ChatPage() {
	useEffect(() => {
		const listenerId = $network.on(({ responseCode, data }) => {
			console.log('Received response:', responseCode, data)
		})

		$network.connect(process.env.NEXT_PUBLIC_WS_URL!)?.then(() => {
			$network.send(REQUEST_CODE.REQUEST_CODE_VERSIONCHECK)
		})

		return () => {
			$network.disconnect(listenerId)
		}
	}, [])

	return <div>Chat Page</div>
}
