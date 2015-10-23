import { taskMaker } from '../taskMaker';

import runSequence from 'run-sequence';
import gutil from 'gulp-util';


function defaultTask(gulp) {
    const options = gutil.env;

    taskMaker(gulp)
        .createTask({
            name: 'default',
            desc: 'Sets up the dev environment',
            fn: defaultFn,
            help: {
                options: {
                    'skipinstall': 'add to skip npm install at the top of the task',
                },
            },
        });

    function defaultFn() {
        const taskArr = [
            [ 'stylus', 'eslint' ],
            'watch',
            'serve',
        ];

        if ( !options.skipinstall ) {
            taskArr.unshift('npm:install');
        } else {
            gutil.log(gutil.colors.red('Skipping npm installation process.'));
        }

        return runSequence.use(gulp).apply(gulp, taskArr);
    }
}

export { defaultTask };
