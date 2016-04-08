import { taskMaker } from '../taskMaker';

import git from 'gulp-git';

function gitTasks(gulp) {
    taskMaker(gulp)
        .createTask({
            name: 'commit:version',
            desc: false,
            fn: commitVersion,
        })
        .createTask({
            name: 'commit:dist',
            desc: false,
            fn: commitDist,
        });


    function commitVersion() {
        return gulp.src('.')
            .pipe(git.add())
            .pipe(git.commit('chore: Bump version number and create changelog pre-release'));
    }

    function commitDist() {
        return gulp.src('.')
            .pipe(git.add())
            .pipe(git.commit('chore: Update dist/ files pre-release'));
    }
}

export { gitTasks };
