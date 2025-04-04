'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

const AboutUs = () => {
	const router = useRouter()
	return (
		<div>
			<button onClick={() => router.push('/admin')}>Go to Admin</button>
		</div>
	)
}

export default AboutUs
