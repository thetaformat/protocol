import { defineConfig } from 'tsup';

export default defineConfig([
	{
		outDir: 'dist',
		clean: false,
		format: ['esm'],
		minify: false,
		sourcemap: true,
		splitting: true,
		dts: false,
		target: 'node22',
		entry: ['src/index.ts'],
	},
]);
