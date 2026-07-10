import { defineConfig } from 'tsup';

export default defineConfig([
	{
		outDir: 'dist',
		clean: false,
		format: ['esm'],
		minify: false,
		sourcemap: true,
		splitting: true,
		dts: {
			compilerOptions: {
				ignoreDeprecations: '6.0',
			},
		},
		target: 'node22',
		entry: ['index.ts'],
	},
]);
