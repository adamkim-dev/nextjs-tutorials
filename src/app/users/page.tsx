'use client'
import { User } from '@/models/user.models'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

const AdminPage = () => {
	const router = useRouter()
	const [users, setUsers] = useState<User[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const fetchUsers = async () => {
		const response = await fetch('https://reqres.in/api/users?page=2')
		const data = await response.json()
		setUsers(data.data)
		setIsLoading(false)
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	const navigateToUserDetail = (id: number) => {
		router.push(`/users/${id}`)
	}

	if (isLoading) {
		return <div>Loading...</div>
	}

	return (
		<Container>
			<Row style={{ gap: '1rem' }}>
				{users.map((user: User) => (
					<Col key={user.id} className="mb-4">
						<Card style={{ width: '18rem' }}>
							<Card.Img
								variant="top"
								width={250}
								height={200}
								style={{ objectFit: 'cover' }}
								src={user.avatar}
							/>
							<Card.Body>
								<Card.Title>{user.first_name}</Card.Title>
								<Card.Text>{user.email}</Card.Text>
								<Button variant="primary" onClick={() => navigateToUserDetail(user.id)}>
									View detail
								</Button>
							</Card.Body>
						</Card>
					</Col>
				))}
			</Row>
		</Container>
	)
}

export default AdminPage
