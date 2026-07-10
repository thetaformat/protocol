import { defineConfig } from 'tsup';

export default defineConfig([
	{
		outDir: 'dist',
		clean: false,
		format: ['esm'],
		minify: false,
		sourcemap: false,
		splitting: false,
		dts: {
			compilerOptions: {
				ignoreDeprecations: '6.0',
			},
		},
		target: 'node22',
		entry: ['index.ts'],
	},
]);
