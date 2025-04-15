import Footer from '@/components/app.footer'
import AppHeader from '@/components/app.header'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Container } from 'react-bootstrap'
import { ToastContainer } from 'react-toastify'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Home',
	description: 'OK OK',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<AppHeader />
				<Container
					className="no-scrollbar"
					style={{
						height: 'calc(100vh - 50px)',
						paddingTop: '64px',
						overflowY: 'auto',
					}}
				>
					{children}
				</Container>
				<Footer />
				<ToastContainer />
			</body>
		</html>
	)
}
