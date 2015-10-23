import { taskMaker } from '../taskMaker';

import gutil from 'gulp-util';

function watchTasks(gulp, config) {
    const stylusWatchPath = config.paths.watch.stylesheets || config.paths.src.stylesheets + '**/*.styl';
    let stylusTask = ['stylus'];

    if ( !!gutil.env.tenko ) {
        stylusTask = [ 'stylus:tenko' ];
    }

    taskMaker(gulp)
        .createTask({
            name: 'watch',
            fn: watch,
            help: {
                options: {
                    'tenko': 'run a special tenko task, that makes it possible to used a linked Tenko package',
                },
            },
        });

    function watch() {
        gulp.watch(config.paths.lint.js, ['eslint']);
        gulp.watch(stylusWatchPath, stylusTask);
    }
}

export { watchTasks };
