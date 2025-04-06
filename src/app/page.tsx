import styles from './page.module.css'

export default async function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<div className={styles.ctas}>NEXTJS TUTORIALS</div>
			</main>
		</div>
	)
}
