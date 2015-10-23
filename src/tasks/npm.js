import { taskMaker } from '../taskMaker';
import { runExec } from '../helpers';

function npmTasks(gulp) {
    taskMaker(gulp)
        .createTask({
            name: 'npm:install',
            desc: 'Run npm install',
            fn: npmInstall,
        })
        .createTask({
            name: 'npm:update',
            desc: 'Run npm update',
            fn: npmUpdate,
        });

    function npmInstall(done) {
        runExec('npm install', done);
    }

    function npmUpdate(done) {
        runExec('npm update', done);
    }
}

export { npmTasks };
