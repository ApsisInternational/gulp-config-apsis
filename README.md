GULP CONFIG FOR APSIS
===

Gulp is a great task runner, but when your work is spread out across several modules it gets complicated to keep everything in sync. This package is an attempt to remedy that problem.

When you install gulp-config-apsis you get a package with a slew of pre-configured gulp tasks. All that you have to do is to import the tasks in your gulp file, and possibly configure the tasks with your paths. While this package comes with a default set of paths, that might not suit your needs.

The folder structure that is pre-configured is that which you get by running our [Yo generator](https://github.com/ApsisInternational/generator-apsis).

## Installation

Install gulp and this package from npm: `npm install --save-dev gulp gulp-config-apsis`.

## Usage

Add the following to your gulpfile

```js
import gulp from 'gulp';
import { apsisGulpConfig } from './dist/index';

apsisGulpConfig(gulp, {});
```

The `{}` in the function call is the optional configuration. Currently it is only paths that are configurable and the defaults are:

```js
{
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
        stylusInclude: glob.sync(process.cwd() + '/jspm_packages/apsis/tenko*/'),
    },
    options: {
        'stylusTenkoTimeout': 500,
    },
}
```

You can now run the tasks as you would run any gulp task, e.g. `gulp serve` from the command line.

## Tasks

We will try to keep this list of tasks up to date, but the recommended way to get a list of all tasks is to run `gulp help` from your command line.

- **clean:dist**: Delete the *dist/* directory
- **copy:dist**: Copy JS and HTML to dist/
- **default**: Sets up the dev environment
  - Options
    - `--skipinstall`: skip npm install at the top of the task
- **e2e**: Run e2e tests with Protractor Aliases: protractor
- **eslint**: Lint your JavaScript with ESLint
- **help**: Display this help text.
- **npm:install**: Run npm install
- **npm:update**: Run npm install
- **release**: Run a series of tasks to build, commit and tag your project
- **serve**: Create a server instance on localhost:9000
  - Options
    - `--browser`: Open the given browser on init
- **stylus**: Compile stylus files into src/stylesheets. Aliases: styles
- **tdd**: Run Karma tests
- **test**: Run Karma tests
- **version**: Bump the package version in package.json
  - Aliases: bump
  - Option
    - `--bump [type]`: what bump to perform. [ patch, minor, major ]

## License

MIT
