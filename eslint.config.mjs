import tamiaTypeScript from 'eslint-config-tamia/typescript';

const config = [
  ...tamiaTypeScript,
  {
    ignores: ['out/', 'samples/'],
  },
];

export default config;
