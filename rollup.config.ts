import { RollupOptions } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const pkg = require('./package.json');

const isDevelopment = (
  process.env.ROLLUP_WATCH === 'true'
  || process.env.NODE_ENV === 'development'
);

const input = './src/index.ts';

const plugins = [
  typescript({
    typescript: require('typescript'),
    useTsconfigDeclarationDir: true,
  }),
  nodeResolve(),
  commonjs({
    sourceMap: true,
  }),
  json(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(
      isDevelopment ? 'development' : 'production'
    ),
  }),
];

if (!isDevelopment) {
  // terser is slow, only run when building
  plugins.push(terser());
}

const config: RollupOptions = {
  input,
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'default',
  },
  plugins,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.devDependencies),
    'crypto',
    'buffer',
  ],
};

if (isDevelopment) {
  config.watch = {
    chokidar: {
      useFsEvents: false,
    },
    include: 'src/**',
    clearScreen: false,
  };
}

export default config;
