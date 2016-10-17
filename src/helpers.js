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


function setupConfig(_config = {}) {
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
            bs: {
                files: [],
            },
            stylusInclude: glob.sync(process.cwd() + '/jspm_packages/apsis/tenko*/'),
        },
        options: {
            'stylusTenkoTimeout': 500,
        },
    };

    defaultConfig.paths.bs.files = [
        defaultConfig.paths.serve + '*.html',
        defaultConfig.paths.serve + '*.js',
        defaultConfig.paths.serve + '*.ts',
        defaultConfig.paths.src.root + '**/*.js',
        defaultConfig.paths.src.root + '**/*.ts',
        defaultConfig.paths.src.images + '**/*',
        defaultConfig.paths.src.root + '**/*.html',
        defaultConfig.paths.src.stylesheets + '*.css',
    ];

    if (_config && _config.paths && _config.paths.bs && Array.isArray(_config.paths.bs.files)) {
        _config.paths.bs.files = defaultConfig.paths.bs.files.concat(_config.paths.bs.files);
    }

    return deepAssign({}, defaultConfig, _config);
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
