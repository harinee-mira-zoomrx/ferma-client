import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const projectRootDir = path.dirname(filename);

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@components': path.resolve(
				projectRootDir,
				'../src/lib/components'
			),
			'@appComponents': path.resolve(
				projectRootDir,
				'../src/lib/appComponents'
			),
			'@stores': path.resolve(projectRootDir, '../src/lib/stores'),
			'@utils': path.resolve(projectRootDir, '../src/lib/utils'),
			'@models': path.resolve(projectRootDir, '../src/lib/models'),
			'@svg': path.resolve(projectRootDir, '../src/assets/svg'),
			'@img': path.resolve(projectRootDir, '../src/assets/img'),
		},
	},
	plugins: [
		svelte({ configFile: './config/svelte.config.js' }),
		splitVendorChunkPlugin(),
	],
	build: {
		target: 'es2015',
	},
	css: {
		postcss: './config/postcss.congif.js',
	}
});
