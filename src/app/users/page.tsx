'use client'
import { useUsers } from '@/hook/useUsers.hook'
import { User } from '@/models/user.models'
import { useRouter } from 'next/navigation'
import { Col, Container, Row } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

const AdminPage = () => {
	const router = useRouter()
	const { users, isLoading, setPageIndex, removeUser } = useUsers()

	const navigateToUserDetail = (id: number) => {
		router.push(`/users/${id}`)
	}

	return (
		<Container>
			<Row style={{ gap: '1rem' }}>
				<Container className="d-flex justify-content-between mb-4">
					<Button variant="link" onClick={() => setPageIndex((prev) => prev - 1)}>
						Previous
					</Button>
					<Button variant="link" onClick={() => setPageIndex((prev) => prev + 1)}>
						Next
					</Button>
				</Container>
				{isLoading ? (
					<div>Loading...</div>
				) : (
					users?.map((user: User) => (
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
									<div className="d-flex justify-content-between">
										<Button variant="primary" onClick={() => navigateToUserDetail(user.id)}>
											View detail
										</Button>
										<Button variant="danger" onClick={() => removeUser(user.id)}>
											Remove User
										</Button>
									</div>
								</Card.Body>
							</Card>
						</Col>
					))
				)}
			</Row>
		</Container>
	)
}

export default AdminPage
