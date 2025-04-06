'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { User } from '@/models/user.models'

const UserDetail = () => {
	const { slug } = useParams()
	const [user, setUser] = useState<User | null>(null)
	const router = useRouter()

	useEffect(() => {
		const fetchUser = async () => {
			const response = await fetch(`https://reqres.in/api/users/${slug}`)
			const data = await response.json()
			setUser(data.data)
		}
		if (slug) fetchUser()
	}, [slug])

	if (!user) return <div>Loading...</div>

	return (
		<div>
			<h1>
				{user.first_name} {user.last_name}
			</h1>
			<Image
				src={user.avatar}
				alt={`${user.first_name} ${user.last_name}`}
				width={250}
				height={200}
			/>
			<p>Email: {user.email}</p>
			<button onClick={() => router.back()}>Go Back</button>
		</div>
	)
}

export default UserDetail
