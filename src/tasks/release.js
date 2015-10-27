import { taskMaker } from '../taskMaker';

import fs from 'fs';

import runSequence from 'run-sequence';
import gutil from 'gulp-util';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import conventionalChangelog from 'conventional-changelog';


function releaseTasks(gulp) {
    taskMaker(gulp)
        .createTask({
            name: 'release',
            desc: 'Run a series of tasks to build, commit and tag your project',
            fn: release,
        })
        .createTask({
            name: 'release:changelog',
            desc: 'Generate a changelog for a new release',
            fn: releaseChangelog,
        })
        .createTask({
            name: 'release:suggestion',
            desc: 'Suggest what kind of version bump to perform',
            fn: releaseSuggestion,
            help: {
                aliases: ['suggestion'],
            },
        });


    function release(done) {
        let versionTask = 'version:branch';

        if (gutil.env.bump) {
            versionTask = 'version';
        }

        runSequence.use(gulp)(
            'clean:dist',
            'eslint:fail',
            'test:fail',
            [ 'copy:dist', 'stylus:dist' ],
            'commit:dist',
            versionTask,
            'commit:version',
            error => {
                if (error) {
                    gutil.log(error.message);
                } else {
                    const pkg = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8'));

                    gutil.log(gutil.colors.inverse(`Release ${pkg.version} finished successfully! :D`));
                    gutil.log(gutil.colors.blue('Operations performed:'));
                    gutil.log(gutil.colors.blue(' • Linted all JS'));
                    gutil.log(gutil.colors.blue(' • Ran all unit tests'));
                    gutil.log(gutil.colors.blue(' • Copied JS files to dist/'));
                    gutil.log(gutil.colors.blue(' • Compiled Stylus files to dist/'));
                    gutil.log(gutil.colors.blue(' • Committed dist files'));
                    gutil.log(gutil.colors.blue(` • Bumped version to ${pkg.version}`));
                    gutil.log(gutil.colors.blue(' • Committed new version'));
                    gutil.log(gutil.colors.blue('============================='));
                    gutil.log(gutil.colors.inverse('What to do next:'));
                    gutil.log(gutil.colors.blue(` • Finish the release by running git flow release finish ${pkg.version}`));
                    gutil.log(gutil.colors.blue('============================='));
                }

                done(error);
                process.exit(error);
            }
        );
    }

    function releaseChangelog() {
        conventionalChangelog({ preset: 'angular'})
            .pipe(process.stdout);
    }

    function releaseSuggestion(done) {
        conventionalRecommendedBump({preset: 'angular'}, (n, releaseAs) => {
            gutil.log(gutil.colors.inverse('Recommended bump:', releaseAs));
            done();
        });
    }
}

export { releaseTasks };
