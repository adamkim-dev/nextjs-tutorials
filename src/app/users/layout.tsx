import { Metadata } from 'next'
import React from 'react'
import { Container } from 'react-bootstrap'

export const metadata: Metadata = {
	title: 'Layout User',
	description: 'OK OK',
}
export default function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return <Container style={{ padding: '40px 0' }}>{children}</Container>
}
