import { taskMaker } from '../taskMaker';

import nib from 'nib';
import stylus from 'gulp-stylus';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';

function stylusTasks(gulp, config) {
    taskMaker(gulp)
        .createTask({
            name: 'stylus',
            desc: 'Compile stylus files into src/stylesheets.',
            fn: stylusFn,
            help: {
                aliases: [ 'styles' ],
            },
        })
        .createTask({
            name: 'stylus:tenko',
            fn: stylusTenko,
        })
        .createTask({
            name: 'stylus:dist',
            fn: stylusDist,
        });


    function getStylusOptions(_options = {}) {
        const defaultOptions = {
            use: nib(),
            compress: false,
        };

        if ( !!config.paths.stylusInclude ) {
            defaultOptions.include = config.paths.stylusInclude;
        }

        return Object.assign(defaultOptions, _options);
    }


    function stylusFn() {
        const options = getStylusOptions();

        return gulp.src(config.paths.src.stylesheets + '**/*.styl')
            .pipe(sourcemaps.init())
            .pipe(stylus(options))
            .pipe(autoprefixer())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(config.paths.src.stylesheets));
    }

    function stylusTenko(cb) {
        const options = getStylusOptions();

        // Preventing a race condition
        setTimeout(() => {
            gulp.src(config.paths.src.stylesheets + '**/*.styl')
                .pipe(sourcemaps.init())
                .pipe(stylus(options))
                .pipe(autoprefixer())
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(config.paths.src.stylesheets))
                .on('end', cb);
        }, config.options.stylusTenkoTimeout);
    }

    function stylusDist() {
        const options = getStylusOptions({
            compress: true,
        });

        return gulp.src(config.paths.src.stylesheets + '**/*.styl')
            .pipe(stylus(options))
            .pipe(autoprefixer())
            .pipe(gulp.dest(config.paths.dist.stylesheets));
    }
}

export { stylusTasks };
