import css from 'styled-jsx/css'

export default function hoverScrollCss() {
	return css`
		overflow-y: auto;
		overflow-x: hidden;
		/* width: 100%; */

		/* 스크롤 y 넓이값 예외처리 */
		/* margin-right: -10px; */

		&::-webkit-scrollbar {
			background-color: transparent;
		}

		&::-webkit-scrollbar-thumb,
		&::-webkit-scrollbar-track {
			background-color: transparent;
			box-shadow: none;
		}

		&:hover::-webkit-scrollbar {
			/* width: 8px; */
			/* height: 8px; */
			background-color: transparent;
		}

		&:hover::-webkit-scrollbar-thumb {
			/* border-radius: 10px; */
			background-color: rgba(0, 0, 0, 0.4);
		}
	`
}
