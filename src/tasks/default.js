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
                    'install': 'add to skip npm install at the top of the task',
                },
            },
        });

    function defaultFn() {
        const taskArr = [
            [ 'stylus', 'eslint' ],
            'watch',
            'serve',
        ];

        if ( options.install ) {
            gutil.log(gutil.colors.red('Running npm installation process.'));
            taskArr.unshift('npm:install');
        }

        return runSequence.use(gulp).apply(gulp, taskArr);
    }
}

export { defaultTask };
