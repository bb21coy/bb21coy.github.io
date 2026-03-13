import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
	const isProd = mode === 'production'

	return {
		plugins: [react()],
		server: {
			host: true,
			port: 5173,
		},
		resolve: {
			alias: isProd
				? {
					react: 'preact/compat',
					'react-dom': 'preact/compat',
					'react-dom/test-utils': 'preact/test-utils',
					'react/jsx-runtime': 'preact/jsx-runtime'
				}
				: {}
		}
	}
})
