import { taskMaker } from '../taskMaker';

import { Server } from 'karma';
import { parseConfig } from 'karma/lib/config';


function testTasks(gulp, config) {
    const karmaConfigFilePath = process.cwd() + '/' + config.paths.config.karma;

    taskMaker(gulp)
        .createTask({
            name: 'test',
            desc: 'Run Karma tests',
            fn: runTests,
        })
        .createTask({
            name: 'tdd',
            desc: 'Run continous Karma tests',
            fn: runTdd,
        });

    function runKarma(configFilePath, options, cb) {
        const parsedKarmaConfig = parseConfig(configFilePath, {});

        Object.keys(options).forEach(key => {
            parsedKarmaConfig[key] = options[key];
        });

        Server.start(parsedKarmaConfig, exitCode => {
            cb();
            process.exit(exitCode);
        });
    }


    function runTests(done) {
        runKarma(karmaConfigFilePath, {
            singleRun: true,
        }, done);
    }

    function runTdd(done) {
        runKarma(karmaConfigFilePath, {}, done);
    }
}

export { testTasks };
