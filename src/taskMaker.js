/**
 * Create a gulp task
 * @param  {object} task configuration for the task
 * @return {}
 */
function taskMaker(gulp) {
    if (!gulp) {
        throw new Error('Task maker: No gulp instance provided.');
    }

    const maker = {
        createTask,
    };

    return maker;

    function createTask(task) {
        gulp.task(
            task.name,
            task.desc || false,
            task.fn,
            task.help
        );

        return maker;
    }
}

export { taskMaker };
