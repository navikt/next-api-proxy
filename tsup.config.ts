import { defineConfig } from 'tsup'

export default defineConfig({
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    metafile: true,
    format: 'esm',
    entry: ['src/index.ts'],
})
