import { taskMaker } from '../taskMaker';

import del from 'del';

function cleanTasks(gulp, config) {
    taskMaker(gulp)
        .createTask({
            name: 'clean:dist',
            desc: 'Delete the dist/ directory',
            fn: clean,
        });


    function clean() {
        del([
            config.paths.dist.root,
        ]);
    }
}

export { cleanTasks };
