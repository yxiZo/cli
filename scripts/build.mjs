#!/usr/bin/env zx

// zx docs: https://google.github.io/zx/

import * as esbuild from 'esbuild'

// esbuild 
// https://esbuild.github.io/content-types/#tsconfig-json
await esbuild.build({
    bundle: true,
    entryPoints: ['index.ts'],
    outfile: 'outputfile.cjs',
    format: 'cjs',
    platform: 'node',
    target: 'node14',
    plugins: []
})