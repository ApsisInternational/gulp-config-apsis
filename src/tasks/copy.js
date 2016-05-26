import { taskMaker } from '../taskMaker';

function copyTasks(gulp, config) {
    taskMaker(gulp)
        .createTask({
            name: 'copy:dist',
            desc: 'Copy JS and HTML to dist/',
            fn: copyDist,
        });


    function copyDist() {
        gulp.src([
            config.paths.src.root + '**/*.js',
            config.paths.src.root + '**/*.json',
            config.paths.src.root + '**/*.html',
            config.paths.root + 'README.md',
            config.paths.root + 'CHANGELOG.md',
        ])
            .pipe(gulp.dest(config.paths.dist.root));
    }
}

export { copyTasks };
