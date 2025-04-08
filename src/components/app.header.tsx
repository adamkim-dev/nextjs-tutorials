'use client'
import styles from '@/app/page.module.css'
import Image from 'next/image'
import Link from 'next/link'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'

export default function AppHeader() {
	return (
		<Navbar fixed="top" expand="lg" bg="dark" data-bs-theme="dark" className="bg-body-tertiary">
			<Container>
				<Navbar.Brand href="/">
					<Image
						className={styles.logo}
						src="/next.svg"
						alt="Next.js logo"
						width={90}
						height={38}
						priority
					/>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Item>
							<Link href="/users">Our Members</Link>
						</Nav.Item>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	)
}
