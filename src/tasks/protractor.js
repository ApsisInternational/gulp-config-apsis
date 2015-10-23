import { taskMaker } from '../taskMaker';

import protractor from 'gulp-protractor';

function protractorTasks(gulp, config) {
    taskMaker(gulp)
        .createTask({
            name: 'e2e',
            desc: 'Run e2e tests with Protractor',
            fn: protractorFn,
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
}

export { protractorTasks };
