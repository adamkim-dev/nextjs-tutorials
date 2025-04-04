import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<ol>
					<li>NextJS Tutorial with Adam</li>
				</ol>
				<div className={styles.ctas}>
					<Link href="/admin" className={styles.cta}>
						Admin
					</Link>
					<Link href="/about-us" className={styles.cta}>
						About us
					</Link>
				</div>
			</main>
		</div>
	)
}
