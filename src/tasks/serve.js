import { taskMaker } from '../taskMaker';

import bs from 'browser-sync';
import gutil from 'gulp-util';

function serveTasks(gulp, config) {
    const browserSync = bs.create();

    taskMaker(gulp)
        .createTask({
            name: 'serve',
            desc: 'Create a server instance on localhost:9000',
            fn: browsersync,
            help: {
                options: {
                    'browser': 'Open the given browser on init',
                },
            },
        });


    function browsersync() {
        const browserSyncOptions = {
            port: 9000,
            startPath: config.paths.serve,
            files: [
                config.paths.serve + '*.html',
                config.paths.serve + '*.js',
                config.paths.src.root + '**/*.js',
                config.paths.src.images + '**/*',
                config.paths.src.html + '*.html',
                config.paths.src.stylesheets + '*.css',
            ],
            open: !!gutil.env.browser,
            server: {
                baseDir: ['./'],
                middleware: (req, res, next) => {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    next();
                },
            },
        };

        if (!!gutil.env.browser ) {
            browserSyncOptions.browser = gutil.env.browser;
        }

        return browserSync.init(browserSyncOptions);
    }
}

export { serveTasks };
