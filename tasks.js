
export const tasks = (db) => async (req, res) => {

    let id = Number.parseInt(req.params.id);
    if (req.user.id !== id) {
        res.status(400).json("Data not found");
        return;
    }

    const tasks = await db.select('*').from('tasks').where('userid', '=', id).catch((err) => {
        res.status(404).json(`something went wrong ${err}`);
    });
    if (!tasks) { return; }
    res.json(tasks);
    return;
}

export const addTask = (db) => async (req, res) => {
    const activeTasksLimit = 20;
    const userid = Number.parseInt(req.body.userid);
    let title = req.body.title;
    let description = req.body.description;
    let priority = req.body.priority;
    let timestamp = new Date(Date.parse(req.body.timeStamp ));
    if (req.user.id !== userid) {
        res.status(403).json("Cannot add");
        return;
    }
    await db.transaction(async (trx) => {
        try {
            const activeTasks = (await trx.select('active').from('users').where('id', '=', userid))[0].active;
            if (activeTasks >= activeTasksLimit) {
                res.status(403).json('you have reached the limit');
                return;
            }

            const id = (await trx.insert({ title, description, priority, userid, timestamp }).into('tasks').returning('id'))[0].id;
            await trx.increment('active', 1).where('id', '=', userid).into('users');
            res.json(id);
            await trx.commit();
        } catch (err) {
            await trx.rollback();
            console.log(err)
            res.status(500).json(`something went wrong`);
        }
    }).catch((err) => {
        res.status(500).json('somthing went wrong');
    })


    res.end();
}

export const submitTask = (db) => async (req, res) => {
    const taskId = Number.parseInt(req.params.id);
    const userId = req.user.id;

    await db.transaction(async (trx) => {
        try {
            const deleted = (await trx.delete("*").from('tasks').where('id', '=', taskId).andWhere('userid', '=', userId).returning('*'))[0]
            if (deleted) {
                await trx.decrement('active', 1).from('users').where('id', '=', userId);
                await trx.commit();
                res.json('task has been submitted');
                return;
            }
            res.status(403).json('Cannot submit');
            return;
        } catch (err) {
            await trx.rollback();
            res.status(500).json('could not submit');
        }

    });
    res.end()

}























// // Get all tasks
// router.get('/tasks', async (req, res) => {
//     try {
//         const { rows } = await pool.query('SELECT * FROM tasks');
//         res.status(200).json(rows);
//     } catch (error) {
//         console.error('Error fetching tasks: ' + error.stack);
//         res.status(500).json({ error: 'Database error' });
//     }
// });

// // Add a new task
// router.post('/tasks', async (req, res) => {
//     const { title, description, priority } = req.body;

//     try {
//         const { rows } = await pool.query(
//             'INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3) RETURNING *',
//             [title, description, priority]
//         );
//         res.status(201).json(rows[0]);
//     } catch (error) {
//         console.error('Error adding task: ' + error.stack);
//         res.status(500).json({ error: 'Failed to add task' });
//     }
// });

// // Update a task
// router.put('/tasks/:id', async (req, res) => {
//     const taskId = req.params.id;
//     const { title, description, priority } = req.body;

//     try {
//         const { rows } = await pool.query(
//             'UPDATE tasks SET title = $1, description = $2, priority = $3 WHERE id = $4 RETURNING *',
//             [title, description, priority, taskId]
//         );
//         res.status(200).json(rows[0]);
//     } catch (error) {
//         console.error('Error updating task: ' + error.stack);
//         res.status(500).json({ error: 'Failed to update task' });
//     }
// });

// // Delete a task
// router.delete('/tasks/:id', async (req, res) => {
//     const taskId = req.params.id;

//     try {
//         await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
//         res.status(200).json({ message: 'Task deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting task: ' + error.stack);
//         res.status(500).json({ error: 'Failed to delete task' });
//     }
// });

// export default router;
