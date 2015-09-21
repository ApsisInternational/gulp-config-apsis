import { exec } from 'child_process';
import bs from 'browser-sync';
import { Server } from 'karma';
import del from 'del';
import runSequence from 'run-sequence';
import nib from 'nib';

/** Gulp plugins **/
import gulpHelp from 'gulp-help';
import gutil from 'gulp-util';
import gif from 'gulp-if';
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
        src: 'src/',
        karmaConf: 'test/karma.conf.js',
        stylesheets: 'stylesheets/',
        jsSrc: 'javascript/',
        test: 'test/',
        unitTests: 'test/unit/',
        serve: 'demo/',
        dist: {
            root: 'dist/',
            stylesheets: 'dist/stylesheets/',
        },
    };

    return Object.assign(defaultConfig, _config);
}

class Apsis {
    constructor(_gulp, _config) {
        const gulp = gulpHelp(_gulp);


        this.config = setupConfig(_config);

        this.config.lint = [
            this.config.src + '**/*.js',
            this.config.test + '**/*.js',
            this.config.serve + '**/*.js',
        ];

        this.bumpFn(gulp, this.config);
        this.cleanFn(gulp, this.config);
        this.copyFn(gulp, this.config);
        this.defaultFn(gulp, this.config);
        this.eslintFn(gulp, this.config);
        this.gitFn(gulp, this.config);
        this.npmFn(gulp, this.config);
        this.releaseFn(gulp, this.config);
        this.serveFn(gulp, this.config);
        this.stylusFn(gulp, this.config);
        this.testFn(gulp, this.config);
        this.watchFn(gulp, this.config);
    }


    bumpFn(gulp) {
        gulp.task('bump', 'Bump the package version in package.json', () => {
            const type = gutil.env.bump || 'patch';

            gulp.src('./package.json')
                .pipe(bump({type}))
                .pipe(gulp.dest('./'));
        }, {
            options: {
                'bump': 'what bump to perform. [ patch, minor, major]',
            },
        });
    }


    cleanFn(gulp, config) {
        gulp.task('clean:dist', 'Delete the dist/ directory', () => {
            del([
                config.dist.root,
            ]);
        });
    }


    copyFn(gulp, config) {
        gulp.task('copy:dist', 'Copy JS and HTML to dist/', () => {
            gulp.src([ 'src/**/*.js', 'src/**/*.html' ])
                .pipe(gulp.dest(config.dist.root));
        });
    }


    defaultFn(gulp) {
        gulp.task('default', 'Sets up the dev environment', () => {
            return runSequence([
                'npm:install',
                'clean',
                [ 'stylus', 'eslint' ],
                'watch',
                'serve',
            ]);
        });
    }


    eslintFn(gulp, config) {
        gulp.task('eslint', 'Lint your JavaScript with ESLint', () => {
            const condition = !!gutil.env.kill ? true : false;

            return gulp.src(config.lint)
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(gif(condition, eslint.failOnError()));
        });

        gulp.task('eslint:fail', false, () => {
            return gulp.src(config.lint)
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
            runSequence(
                'clean',
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


    serveFn(gulp) {
        const browserSync = bs.create();

        gulp.task('serve', 'Create a server instance on localhost:9000', () => {
            const browserSyncOptions = {
                port: 9000,
                startPath: 'demo/',
                files: [
                    'demo/*.html',
                    'demo/*.js',
                    'src/javascript/*.js',
                    'src/images/**/*',
                    'src/templates/*.html',
                    'src/stylesheets/*.css',
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

            if ( !!config.stylusInclude ) {
                defaultOptions.include = config.stylusInclude;
            }

            return Object.assign(defaultOptions, _options);
        }


        gulp.task('stylus', 'Compile stylus files into src/stylesheets.', () => {
            const options = getStylusOptions();

            return gulp.src(config.stylesheets + '**/*.styl')
                .pipe(sourcemaps.init())
                .pipe(stylus(options))
                .pipe(autoprefixer())
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(config.stylesheets));
        }, {
            aliases: [ 'styles' ],
        });

        gulp.task('stylus:dist', false, () => {
            const options = getStylusOptions({
                compress: true,
            });

            return gulp.src(config.stylesheets + '**/*.styl')
                .pipe(stylus(options))
                .pipe(autoprefixer())
                .pipe(gulp.dest(config.dist.stylesheets));
        });
    }


    testFn(gulp) {
        gulp.task('test', 'Run Karma tests', done => {
            new Server({
                configFile: process.cwd() + '/test/karma.conf.js',
            }, done).start();
        });

        gulp.task('tdd', 'Run Karma tests', done => {
            new Server({
                configFile: process.cwd() + '/test/karma.conf.js',
            }, done).start();
        });
    }


    watchFn(gulp, config) {
        gulp.task('watch', false, () => {
            gulp.watch(config.lint, ['eslint']);
            gulp.watch(config.stylesheets + '**/*.styl', ['stylus']);
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
