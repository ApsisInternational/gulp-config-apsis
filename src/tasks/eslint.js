import { taskMaker } from '../taskMaker';

import eslint from 'gulp-eslint';

function eslintTasks(gulp, config) {
    taskMaker(gulp)
        .createTask({
            name: 'eslint',
            desc: 'Lint your JavaScript with ESLint',
            fn: eslintFn,
        })
        .createTask({
            name: 'eslint:fail',
            desc: false,
            fn: eslintFail,
        });


    function eslintFn() {
        return gulp.src(config.paths.lint.js)
            .pipe(eslint())
            .pipe(eslint.format());
    }


    function eslintFail() {
        return gulp.src(config.paths.lint.js)
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failOnError());
    }
}

export { eslintTasks };
