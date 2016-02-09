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

            if (stdout) {
                const versionRegex = /release\/([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{1,2})/;
                versionNumber = stdout.trim().match(versionRegex, 'i');
            }

            // versionNumber should be an array with three matches, eg.
            // [ 'release/1.0.0', '1', '0', '0' ]

            if ( !Array.isArray(versionNumber) || versionNumber.length !== 4) {
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
