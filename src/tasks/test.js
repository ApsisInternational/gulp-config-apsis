import { taskMaker } from '../taskMaker';

import gutil from 'gulp-util';
import runSequence from 'run-sequence';

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
            name: 'test:ci',
            fn: runTestsAndExit,
        })
        .createTask({
            name: 'tdd',
            desc: 'Run continous Karma tests',
            fn: runTdd,
        });

    function runKarma(configFilePath, options, cb, exitFn) {
        const parsedKarmaConfig = parseConfig(configFilePath, {});
        const exit = !exitFn ? generateExitFn(cb) : exitFn;

        Object.keys(options).forEach(key => {
            parsedKarmaConfig[key] = options[key];
        });

        Server.start(parsedKarmaConfig, exit);
    }


    function runTests(done) {
        runSequence.use(gulp)(
            'stylus',
            () => {
                runKarma(karmaConfigFilePath, {
                    singleRun: true,
                }, done);
            }
        );
    }

    function runTdd(done) {
        runSequence.use(gulp)(
            'stylus',
            () => {
                runKarma(karmaConfigFilePath, {}, done);
            }
        );
    }

    function runTestsAndFailOnFail(done) {
        runSequence.use(gulp)(
            'stylus',
            () => {
                runKarma(karmaConfigFilePath, { singleRun: true }, done, exitCode => {
                    parseTestResults(exitCode, done);
                });
            }
        );
    }

    function runTestsAndExit(done) {
        runSequence.use(gulp)(
            'stylus',
            () => {
                runKarma(karmaConfigFilePath, { singleRun: true }, done, exitCode => {
                    parseTestResults(exitCode, done);
                    process.exit(exitCode);
                });
            }
        );
    }


    function parseTestResults(exitCode, done) {
        if (exitCode === 1) {
            gutil.log(gutil.colors.red('=========================='));
            gutil.log(gutil.colors.red('Unit tests failed, exiting.'));
            gutil.log(gutil.colors.red('=========================='));

            done('Unit tests failed');
        } else {
            done();
        }
    }

    function generateExitFn(cb) {
        return exitCode => {
            cb();
            process.exit(exitCode);
        };
    }
}

export { testTasks };
