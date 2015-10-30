import { taskMaker } from '../taskMaker';

import runSequence from 'run-sequence';
import gutil from 'gulp-util';

function pullRequestTasks(gulp) {
    taskMaker(gulp)
        .createTask({
            name: 'pr',
            desc: 'Check if the code is ready for a PR',
            fn: pullrequest,
        });


    function pullrequest(done) {
        runSequence.use(gulp)(
            'eslint:fail',
            'test:fail',
            error => {
                if (error) {
                    gutil.log(error.message);
                } else {
                    gutil.log(gutil.colors.inverse(`Code is ready for a PR!`));
                    gutil.log(gutil.colors.blue('Operations performed:'));
                    gutil.log(gutil.colors.blue(' • Linted all JS'));
                    gutil.log(gutil.colors.blue(' • Ran all unit tests'));
                    gutil.log(gutil.colors.blue('============================='));
                    gutil.log(gutil.colors.inverse('What to do next:'));
                    gutil.log(gutil.colors.blue(' • Push this branch and create a PR on VS Online'));
                    gutil.log(gutil.colors.blue('============================='));
                }

                done(error);
                process.exit(error);
            }
        );
    }
}

export { pullRequestTasks };
