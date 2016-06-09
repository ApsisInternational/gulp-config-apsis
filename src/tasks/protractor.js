import { taskMaker } from '../taskMaker';

import protractor from 'gulp-protractor';
import gutil from 'gulp-util';
import runSequence from 'run-sequence';

function protractorTasks(gulp, config) {
    taskMaker(gulp)
        .createTask({
            name: 'protractor:run',
            desc: 'Run e2e tests with Protractor',
            fn: protractorFn,
        }).createTask({
            name: 'e2e',
            desc: 'Run e2e tests with Protractor',
            fn: e2eFn,
            help: {
                aliases: [ 'protractor' ],
            },
        });


    function protractorFn(cb) {
        gulp.src(config.paths.test.e2e + '/*.spec.js')
            .pipe(protractor.protractor({
                configFile: config.paths.config.protractor,
            }))
            .on('end', () => { cb(); })
            .on('error', e => { throw e;});
    }


    function e2eFn(done) {
        runSequence.use(gulp)(
            'serve',
            'protractor:run',
            error => {
                if (error) {
                    gutil.log(error.message);
                }

                done(error);
                process.exit(error);
            }
        );
    }
}

export { protractorTasks };
