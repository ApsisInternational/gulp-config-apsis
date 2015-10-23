import { taskMaker } from '../taskMaker';

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
                aliases: 'suggestion',
            },
        });


    function release(done) {
        runSequence.use(gulp)(
            'clean:dist',
            'eslint:fail',
            [ 'copy:dist', 'stylus:dist' ],
            'commit:dist',
            'version',
            'commit:version',
            error => {
                if (error) {
                    gutil.log(error.message);
                } else {
                    gutil.log('RELEASE FINISHED SUCCESSFULLY');
                }
                done(error);
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
