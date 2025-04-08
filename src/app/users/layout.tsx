import React from 'react'
import { Container } from 'react-bootstrap'

export default function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return <Container style={{ padding: '40px 0' }}>{children}</Container>
}
