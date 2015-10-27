import { taskMaker } from '../taskMaker';

import { exec } from 'child_process';

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
        })
        .createTask({
            name: 'version:branch',
            fn: versionFromBranch,
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

    function versionFromBranch(done) {
        let versionNumber;

        exec('git rev-parse --abbrev-ref HEAD', (err, stdout) => {
            if (err) return done(err);

            if (stdout) versionNumber = stdout.trim().match(/release\/(.+)/, 'i')[1];

            if (typeof versionNumber !== 'string' || versionNumber.length !== 5) {
                throw new Error('Could not read version number from branch');
            }

            gulp.src(config.paths.root + 'package.json')
                .pipe(bump({version: versionNumber}))
                .pipe(gulp.dest(config.paths.root))
                .on('end', done);
        });
    }
}

export { versionTasks };
