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

            if (!stdout) {
                process.exit(1);
                throw new Error('Could not read from branch');
            }

            const versionRegex = /release\/([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{1,2})/;
            versionNumber = stdout.trim().match(versionRegex, 'i');

            if ( !Array.isArray(versionNumber) || versionNumber.length !== 4) {
                process.exit(1);
                throw new Error('Could not read version number from branch');
            }

            versionNumber.shift();

            gulp.src(config.paths.root + 'package.json')
                .pipe(bump({version: versionNumber.join('.')}))
                .pipe(gulp.dest(config.paths.root))
                .on('end', done);
        });
    }
}

export { versionTasks };
