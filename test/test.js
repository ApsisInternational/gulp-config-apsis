const test = require('tape');
const helpers = require('../dist/helpers.js');


test('it should be able to run setupConfig with a config a object', t => {
    const config = helpers.setupConfig({
        paths: {
            bs: {
                files: ['**/*'],
            },
        },
    });

    t.assert(typeof config, 'object');
    t.end();
});

test('it should be able to run setupConfig without a config a object', t => {
    const config = helpers.setupConfig();

    t.assert(typeof config, 'object');
    t.end();
});
