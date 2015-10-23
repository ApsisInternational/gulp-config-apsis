import { taskMaker } from '../taskMaker';

import bump from 'gulp-bump';
import gutil from 'gulp-util';

function versionTasks(gulp, config) {
    taskMaker(gulp)
        .createTask({
            name: 'version',
            desc: 'Bump the package version in package.json',
            fn: version,
            help: {
                options: {
                    'bump [type]': 'what bump to perform. [ patch, minor, major ]',
                },
                aliases: [ 'bump' ],
            },
        });


    function version() {
        const type = gutil.env.bump || 'patch';

        gulp.src(config.paths.root + 'package.json')
            .pipe(bump({type}))
            .pipe(gulp.dest(config.paths.root));
    }
}

export { versionTasks };
