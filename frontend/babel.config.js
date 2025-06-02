module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                node: 'current',
            },
        }],
        ['@babel/preset-react', {
            runtime: 'automatic',
            development: process.env.NODE_ENV === 'development',
        }],
        '@babel/preset-typescript',
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-transform-class-properties',
        '@babel/plugin-transform-object-rest-spread',
    ],
    env: {
        test: {
            presets: [
                ['@babel/preset-env', {
                    targets: {
                        node: 'current',
                    },
                }],
                ['@babel/preset-react', {
                    runtime: 'automatic',
                    development: true,
                }],
                '@babel/preset-typescript',
            ],
        },
    },
};