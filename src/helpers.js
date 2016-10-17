import { exec } from 'child_process';
import gutil from 'gulp-util';
import glob from 'glob';

function runExec(cmd, cb) {
    exec(cmd, (err, stdout) => {
        gutil.log(stdout);

        cb(err);
    });
}

export { runExec };


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
                protractor: 'test/protractor.conf.js',
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
            bs: {},
            stylusInclude: glob.sync(process.cwd() + '/jspm_packages/apsis/tenko*/'),
        },
        options: {
            'stylusTenkoTimeout': 500,
        },
    };

    const config = deepAssign({}, defaultConfig, _config);

    config.paths.bs.files = [].concat(_config.paths.bs.files, [
        config.paths.serve + '*.html',
        config.paths.serve + '*.js',
        config.paths.serve + '*.ts',
        config.paths.src.root + '**/*.js',
        config.paths.src.root + '**/*.ts',
        config.paths.src.images + '**/*',
        config.paths.src.root + '**/*.html',
        config.paths.src.stylesheets + '*.css',
    ]);

    return config;
}

export { setupConfig };


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

        if (Array.isArray(value)) {
            _target[key] = value.slice();
        } else if (isObj(value)) {
            _target[key] = deepAssign(_target[key] || {}, value);
        } else if (value !== undefined) {
            _target[key] = value;
        }
    });

    return _target;
}


function isObj(x) {
    const type = typeof x;
    return x !== null && (type === 'object' || type === 'function');
}
