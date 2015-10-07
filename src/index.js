import { exec } from 'child_process';
import bs from 'browser-sync';
import { Server } from 'karma';
import del from 'del';
import runSequence from 'run-sequence';
import nib from 'nib';
import glob from 'glob';

/** Gulp plugins **/
import gulpHelp from 'gulp-help';
import gutil from 'gulp-util';
import git from 'gulp-git';
import eslint from 'gulp-eslint';
import bump from 'gulp-bump';
import stylus from 'gulp-stylus';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';


function deepAssign(target, ...rest) {
    let combined = target;
    rest.forEach(source => {
        combined = walkSource(combined, source);
    });

    return combined;
}

function walkSource(_target, _source) {
    Object.keys(_source).forEach(key => {
        const value = _source[key];

        if ( Array.isArray(value) ) {
            _target[key] = value.slice();
        } else if ( isObj(value) ) {
            _target[key] = deepAssign(_target[key] || {}, value);
        } else if ( value !== undefined ) {
            _target[key] = value;
        }
    });

    return _target;
}

function isObj(x) {
    const type = typeof x;
    return x !== null && (type === 'object' || type === 'function');
}

function setupConfig(_config) {
    const defaultConfig = {
        paths: {
            root: './',
            src: {
                root: 'src/',
                html: 'src/templates/',
                images: 'src/images/',
                javascript: 'src/javascript/',
                stylesheets: 'src/stylesheets/',
            },
            dist: {
                root: 'dist/',
                html: 'dist/templates/',
                images: 'dist/images/',
                javascript: 'dist/javascript/',
                stylesheets: 'dist/stylesheets/',
            },
            config: {
                karma: 'test/karma.conf.js',
            },
            test: {
                unit: 'test/unit/',
                e2e: 'test/e2e',
            },
            serve: 'demo/',
            lint: {
                js: ['src/**/*.js', 'test/**/*.js', 'demo/**/*.js'],
            },
            watch: {
                stylesheets: false,
                javascript: false,
            },
            stylusInclude: glob.sync(process.cwd() + '/jspm_packages/apsis/tenko*/'),
        },
        options: {
            'stylusTenkoTimeout': 500,
        },
    };

    return deepAssign({}, defaultConfig, _config);
}

class Apsis {
    constructor(_gulp, _config) {
        const gulp = gulpHelp(_gulp);
        this.config = setupConfig(_config);

        this.options = gutil.env;

        this.releaseFn(gulp, this.config);
        this.bumpFn(gulp, this.config);
        this.cleanFn(gulp, this.config);
        this.copyFn(gulp, this.config);
        this.defaultFn(gulp, this.config);
        this.eslintFn(gulp, this.config);
        this.gitFn(gulp, this.config);
        this.npmFn(gulp, this.config);
        this.serveFn(gulp, this.config);
        this.stylusFn(gulp, this.config);
        this.testFn(gulp, this.config);
        this.watchFn(gulp, this.config);
    }


    bumpFn(gulp, config) {
        gulp.task('bump', 'Bump the package version in package.json', () => {
            const type = gutil.env.bump || 'patch';

            gulp.src(config.paths.root + 'package.json')
                .pipe(bump({type}))
                .pipe(gulp.dest(config.paths.root));
        }, {
            options: {
                'bump [type]': 'what bump to perform. [ patch, minor, major ]',
            },
        });
    }


    cleanFn(gulp, config) {
        gulp.task('clean:dist', 'Delete the dist/ directory', () => {
            del([
                config.paths.dist.root,
            ]);
        });
    }


    copyFn(gulp, config) {
        gulp.task('copy:dist', 'Copy JS and HTML to dist/', () => {
            gulp.src([
                config.paths.src.root + '**/*.js',
                config.paths.src.root + '**/*.html',
            ])
                .pipe(gulp.dest(config.paths.dist.root));
        });
    }


    defaultFn(gulp) {
        gulp.task('default', 'Sets up the dev environment', () => {
            const taskArr = [
                [ 'stylus', 'eslint' ],
                'watch',
                'serve',
            ];

            if ( !this.options.skipinstall ) {
                taskArr.unshift('npm:install');
            } else {
                gutil.log(gutil.colors.red('Skipping npm installation process.'));
            }

            return runSequence.use(gulp).apply(gulp, taskArr);
        }, {
            options: {
                'skipinstall': 'add to skip npm install at the top of the task',
            },
        });
    }


    eslintFn(gulp, config) {
        gulp.task('eslint', 'Lint your JavaScript with ESLint', () => {
            return gulp.src(config.paths.lint.js)
                .pipe(eslint())
                .pipe(eslint.format());
        });

        gulp.task('eslint:fail', false, () => {
            return gulp.src(config.paths.lint.js)
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(eslint.failOnError());
        });
    }


    gitFn(gulp) {
        gulp.task('commit:bump', false, () => {
            return gulp.src('.')
                .pipe(git.add())
                .pipe(git.commit('[Prerelease] Bump version number'));
        });

        gulp.task('commit:dist', false, () => {
            return gulp.src('.')
                .pipe(git.add())
                .pipe(git.commit('[Prerelease] Update dist/ files'));
        });
    }


    npmFn(gulp) {
        gulp.task('npm:install', 'Run npm install', (cb) => {
            Apsis.runExec('npm install', cb);
        });

        gulp.task('npm:update', 'Run npm install', (cb) => {
            Apsis.runExec('npm update', cb);
        });
    }


    releaseFn(gulp) {
        gulp.task('release', done => {
            runSequence.use(gulp)(
                'clean:dist',
                'eslint:fail',
                [ 'copy:dist', 'stylus:dist' ],
                'commit:dist',
                'bump',
                'commit:bump',
                error => {
                    if (error) {
                        gutil.log(error.message);
                    } else {
                        gutil.log('RELEASE FINISHED SUCCESSFULLY');
                    }
                    done(error);
                }
            );
        });
    }


    serveFn(gulp, config) {
        const browserSync = bs.create();

        gulp.task('serve', 'Create a server instance on localhost:9000', () => {
            const browserSyncOptions = {
                port: 9000,
                startPath: config.paths.serve,
                files: [
                    config.paths.serve + '*.html',
                    config.paths.serve + '*.js',
                    config.paths.src + '**/*.js',
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
        }, {
            options: {
                'browser': 'Open the given browser on init',
            },
        });
    }


    stylusFn(gulp, config) {
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


        gulp.task('stylus', 'Compile stylus files into src/stylesheets.', () => {
            const options = getStylusOptions();

            return gulp.src(config.paths.src.stylesheets + '**/*.styl')
                .pipe(sourcemaps.init())
                .pipe(stylus(options))
                .pipe(autoprefixer())
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(config.paths.src.stylesheets));
        }, {
            aliases: [ 'styles' ],
        });

        gulp.task('stylus:tenko', false, cb => {
            const options = getStylusOptions();

            setTimeout(() => {
                gulp.src(config.paths.src.stylesheets + '**/*.styl')
                    .pipe(sourcemaps.init())
                    .pipe(stylus(options))
                    .pipe(autoprefixer())
                    .pipe(sourcemaps.write())
                    .pipe(gulp.dest(config.paths.src.stylesheets))
                    .on('end', cb);
            }, config.options.stylusTenkoTimeout);
        });

        gulp.task('stylus:dist', false, () => {
            const options = getStylusOptions({
                compress: true,
            });

            return gulp.src(config.paths.src.stylesheets + '**/*.styl')
                .pipe(stylus(options))
                .pipe(autoprefixer())
                .pipe(gulp.dest(config.paths.dist.stylesheets));
        });
    }


    testFn(gulp, config) {
        gulp.task('test', 'Run Karma tests', done => {
            new Server({
                configFile: process.cwd() + '/' + config.paths.config.karma,
            }, done).start();
        });

        gulp.task('tdd', 'Run Karma tests', done => {
            new Server({
                configFile: process.cwd() + '/' + config.paths.config.karma,
            }, done).start();
        });

        gulp.task('run-protractor', function(done) {
            Apsis.runExec('live-server --no-browser', done);
            Apsis.runExec('protractor test/protractor.conf.js', done);
        });
    }


    watchFn(gulp, config) {
        const stylusWatchPath = config.paths.watch.stylesheets || config.paths.src.stylesheets + '**/*.styl';
        let stylusTask = ['stylus'];

        if ( !!gutil.env.tenko ) {
            stylusTask = [ 'stylus:tenko' ];
        }

        gulp.task('watch', false, () => {
            gulp.watch(config.paths.lint.js, ['eslint']);
            gulp.watch(stylusWatchPath, stylusTask);
        }, {
            options: {
                'tenko': 'run a special tenko task, that makes it possible to used a linked Tenko package',
            },
        });
    }


    static runExec(cmd, cb) {
        exec(cmd, (err, stdout) => {
            gutil.log(stdout);

            cb(err);
        });
    }
}


function apsisGulpConfig(_gulp, _config) {
    return new Apsis(_gulp, _config);
}

export { apsisGulpConfig };
