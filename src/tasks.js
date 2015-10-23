import { cleanTasks } from './tasks/clean';
import { copyTasks } from './tasks/copy';
import { defaultTask } from './tasks/default';
import { eslintTasks } from './tasks/eslint';
import { gitTasks } from './tasks/git';
import { npmTasks } from './tasks/npm';
import { protractorTasks } from './tasks/protractor';
import { releaseTasks } from './tasks/release';
import { serveTasks } from './tasks/serve';
import { stylusTasks } from './tasks/stylus';
import { testTasks } from './tasks/test';
import { versionTasks } from './tasks/version';
import { watchTasks } from './tasks/watch';

const tasks = [
    cleanTasks,
    copyTasks,
    defaultTask,
    eslintTasks,
    gitTasks,
    npmTasks,
    protractorTasks,
    releaseTasks,
    serveTasks,
    stylusTasks,
    testTasks,
    versionTasks,
    watchTasks,
];

export { tasks };
