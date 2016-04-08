import { taskMaker } from '../taskMaker';

import fs from 'fs';

import runSequence from 'run-sequence';
import gutil from 'gulp-util';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import conventionalChangelog from 'gulp-conventional-changelog';

const headerPartial = '{{#if isPatch}}##{{else}}#{{/if}} [{{version}}](http://tfs/tfs/Apsis/JSPM/_git/wizard#path=%2F&version=GTv{{version}}){{#if title}} "{{title}}"{{/if}}{{#if date}} ({{date}}){{/if}}';
const commitPartial = `* {{header}} {{#if @root.linkReferences}}([{{shortHash}}]({{#if @root.host}}{{@root.host}}/{{/if}}{{#if @root.owner}}{{@root.owner}}/{{/if}}{{@root.repository}}/{{@root.commit}}/{{hash}})){{else}}{{hash~}}{{/if}} {{~!-- commit references --}}{{#if references}}, closes{{~#each references}} {{#if @root.linkReferences}}[{{#if this.owner}}{{this.owner}}/{{/if}}{{this.repository}}#{{this.issue}}]({{#if @root.host}}{{@root.host}}/{{/if}}{{#if this.repository}}{{#if this.owner}}{{this.owner}}/{{/if}}{{this.repository}}{{else}}{{#if @root.owner}}{{@root.owner}}/{{/if}}{{@root.repository}}{{/if}}/{{@root.issue}}/{{this.issue}}){{else}}{{#if this.owner}}{{this.owner}}/{{/if}}{{this.repository}}#{{this.issue}}{{/if}}{{/each}}{{/if}}\n`;
const mainTemplate = `{{> header}}

{{#each commitGroups}}

{{#if title}}
### {{title}}

{{/if}}
{{#each commits}}
{{> commit root=@root}}
{{/each}}
{{/each}}

{{> footer}}

`;

export function releaseTasks(gulp) {
    taskMaker(gulp)
        .createTask({
            name: 'release',
            desc: 'Run a series of tasks to build, commit and tag your project',
            fn: release,
        })
        .createTask({
            name: 'release:changelog',
            desc: 'Generate a changelog for a new release',
            fn: releaseChangelog,
        })
        .createTask({
            name: 'release:suggestion',
            desc: 'Suggest what kind of version bump to perform',
            fn: releaseSuggestion,
            help: {
                aliases: ['suggestion'],
            },
        });


    function release(done) {
        let versionTask = 'version:branch';

        if (gutil.env.bump) {
            versionTask = 'version';
        }

        runSequence.use(gulp)(
            'clean:dist',
            'eslint:fail',
            'test:fail',
            [ 'copy:dist', 'stylus:dist' ],
            'commit:dist',
            versionTask,
            'release:changelog',
            'commit:version',
            error => {
                if (error) {
                    gutil.log(error.message);
                } else {
                    const pkg = JSON.parse(fs.readFileSync(process.cwd() + '/package.json', 'utf8'));

                    gutil.log(gutil.colors.inverse(`Release ${pkg.version} finished successfully! :D`));
                    gutil.log(gutil.colors.blue('Operations performed:'));
                    gutil.log(gutil.colors.blue(' • Linted all JS'));
                    gutil.log(gutil.colors.blue(' • Ran all unit tests'));
                    gutil.log(gutil.colors.blue(' • Copied JS files to dist/'));
                    gutil.log(gutil.colors.blue(' • Compiled Stylus files to dist/'));
                    gutil.log(gutil.colors.blue(' • Committed dist files'));
                    gutil.log(gutil.colors.blue(` • Bumped version to ${pkg.version}`));
                    gutil.log(gutil.colors.blue(' • Committed new version'));
                    gutil.log(gutil.colors.blue('============================='));
                    gutil.log(gutil.colors.inverse('What to do next:'));
                    gutil.log(gutil.colors.blue(` • Finish the release by running git flow release finish ${pkg.version}`));
                    gutil.log(gutil.colors.blue('============================='));
                }

                done(error);
                process.exit(error);
            }
        );
    }

    function releaseChangelog() {
        makeSureFileExists('./CHANGELOG.md');

        return gulp.src('./CHANGELOG.md')
            .pipe(conventionalChangelog({
                preset: 'angular',
                releaseCount: 0,
            }, {
                commit: 'commit',
            }, {}, {}, {
                mainTemplate,
                headerPartial,
                commitPartial,
                transform: function transform(commit) {
                    let discard = true;
                    commit.shortHash = commit.hash.substring(0, 7);

                    commit.notes.forEach(note => {
                        note.title = 'BREAKING CHANGES';
                        discard = false;
                    });

                    if (commit.type === 'feat') {
                        commit.type = 'Features';
                    } else if (commit.type === 'fix') {
                        commit.type = 'Bug Fixes';
                    } else if (commit.type === 'perf') {
                        commit.type = 'Performance Improvements';
                    } else if (commit.type === 'revert') {
                        commit.type = 'Reverts';
                    } else if (discard) {
                        return false;
                    } else if (commit.type === 'docs') {
                        commit.type = 'Documentation';
                    } else if (commit.type === 'style') {
                        commit.type = 'Styles';
                    } else if (commit.type === 'refactor') {
                        commit.type = 'Code Refactoring';
                    } else if (commit.type === 'test') {
                        commit.type = 'Tests';
                    } else if (commit.type === 'chore') {
                        commit.type = 'Chores';
                    }

                    return commit;
                }
            }))
            .pipe(gulp.dest('./'));
    }

    function releaseSuggestion(done) {
        conventionalRecommendedBump({preset: 'angular'}, (n, releaseAs) => {
            gutil.log(gutil.colors.inverse('Recommended bump:', releaseAs));
            done();
        });
    }


    function makeSureFileExists(path) {
        try {
            fs.statSync(path);
        } catch (err) {
            if (err.code === 'ENOENT') {
                fs.writeFileSync(path, '');
            } else {
                throw new Error(err);
            }
        }
    }
}
