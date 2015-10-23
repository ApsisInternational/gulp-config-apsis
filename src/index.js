import { setupConfig } from './helpers';
import { tasks } from './tasks';

import gulpHelp from 'gulp-help';

function apsisGulpConfig(_gulp, _config) {
    const gulpWithHelp = gulpHelp(_gulp);
    const config = setupConfig(_config);

    tasks.forEach(task => {
        task(gulpWithHelp, config);
    });
}

export { apsisGulpConfig };
