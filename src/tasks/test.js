import { taskMaker } from '../taskMaker';

import gutil from 'gulp-util';

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
            name: 'test:fail',
            fn: runTestsAndFailOnFail,
        })
        .createTask({
            name: 'tdd',
            desc: 'Run continous Karma tests',
            fn: runTdd,
        });

    function runKarma(configFilePath, options, cb, exitFn) {
        const parsedKarmaConfig = parseConfig(configFilePath, {});
        const exit = !exitFn ?  generateExitFn(cb) : exitFn;

        Object.keys(options).forEach(key => {
            parsedKarmaConfig[key] = options[key];
        });

        Server.start(parsedKarmaConfig, exit);
    }


    function runTests(done) {
        runKarma(karmaConfigFilePath, {
            singleRun: true,
        }, done);
    }

    function runTdd(done) {
        runKarma(karmaConfigFilePath, {}, done);
    }

    function runTestsAndFailOnFail(done) {
        runKarma(karmaConfigFilePath, { singleRun: true }, done, exitCode => {
            if (exitCode === 1) {
                gutil.log(gutil.colors.red('=========================='));
                gutil.log(gutil.colors.red('Unit tests failed, exiting.'));
                gutil.log(gutil.colors.red('=========================='));

                done('Unit tests failed');
            } else {
                done();
            }
        });
    }

    function generateExitFn(cb) {
        return exitCode => {
            cb();
            process.exit(exitCode);
        };
    }
}

export { testTasks };
