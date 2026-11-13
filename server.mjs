import { createServer } from 'node:http';


const tasks = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build my first API', completed: false },
];

let nextId = 3;

const server = createServer(async (req, res) => {
    console.log(req.method, req.url);
    res.setHeader('Content-Type', 'application/json')

    const url = new URL(req.url, 'http://127.0.0.1'); // '/tasks/
    const pathname = url.pathname // 'true', 'false', or null

    if (req.method === 'GET' && pathname === '/health') {
        res.statusCode = 200;
        res.end(JSON.stringify({status: 'ok'}));
        return;
    }

    if (req.method === 'GET' && pathname === '/tasks'){
        const completed = url.searchParams.get('completed');

        if (
            completed !== null &&
            completed !== 'true' && completed !== 'false'
        ) {
            res.statusCode = 400
            res.end(JSON.stringify({
                error: 'Completed must be true or false'
            }));
            return;
        }
        let result = tasks;

        if (completed != null) {
            const completedValue = completed === 'true';

            result = tasks.filter((task) => {
                return task.completed === completedValue;
            });
        
        }   
        res.statusCode = 200;
        res.end(JSON.stringify(result));
        return;
    }

    const match = pathname.match(/^\/tasks\/([1-9]\d*)$/)

    if (req.method === 'GET' && match){
        const id = Number(match[1]);
        const task = tasks.find((task) => task.id === id);

        if (!task) {
            res.statusCode = 404;
            res.end(JSON.stringify({error: 'Task not found'}));
            return ;       
        }

        res.statusCode = 200
        res.end(JSON.stringify(task));
        return ; 
    }

    // if (req.method === 'POST' && pathname === '/tasks'){

    if (req.method === 'DELETE' && match){
        const id = Number(match[1]);
        const index = tasks.findIndex((task) => task.id === id);

        if (index === -1){
            res.statusCode = 404;
            res.end(JSON.stringify({error: 'Task not found'}));
            return;
        }

        tasks.splice(index, 1);
        res.statusCode = 204;
        res.removeHeader('Content-Type');
        res.end();
        return;
    }
    const isCreateTask = req.method === 'POST' && pathname === '/tasks';
    const isUpdateTask = req.method === 'PATCH' && match !== null;

    if (isCreateTask || isUpdateTask){
        const contentType = req.headers['content-type']
            ?.split(';')[0].trim().toLowerCase();

        if (contentType !== 'application/json'){
            res.statusCode = 415;
            res.end(JSON.stringify({error: 'Send application/json'}));
            return ;
        }

        const chunks = [];
        let size = 0

        try {
            for await (const chunk of req.iterator({destroyOnReturn: false})){
                size += chunk.length
                
                if (size > 16 * 1024) {
                    req.resume();
                    res.statusCode = 413;
                    res.end(JSON.stringify({error: 'Request body is too large'}));
                    return;
                }
                chunks.push(chunk);
            }
        } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({error: 'Could not read request body'}));
            return;
        }

        let body ;

        try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Request body must be valid JSON' }));
            return;
        }

        if (isUpdateTask) {
            const id = Number(match[1]);
            const task = tasks.find((task) => task.id === id);

            if (!task){
                res.statusCode = 404;
                res.end(JSON.stringify({error: 'Task not found'}));
                return;
            }
            if (typeof body?.completed !== 'boolean'){
                res.statusCode = 400;
                res.end(JSON.stringify({
                    error: 'Completed must be a boolean',
                }));
                return;
            }
            task.completed = body.completed;

            res.statusCode = 200;
            res.end(JSON.stringify(task));
            return;
        }

        if (
            typeof body?.title !== 'string' || body.title.trim().length === 0 
            || body.title.trim().length > 200
        ) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: 'Title must be a string containing 1–200 characters.'
            }));
            return ;
        }

        const task = {
            id: nextId++,
            title:body.title.trim(),
            completed:false,
        };
        tasks.push(task);
        res.statusCode = 201;
        res.setHeader('Location', `/tasks/${task.id}`);
        res.end(JSON.stringify(task));
        return;

    }

    res.statusCode = 404;
    res.end(JSON.stringify({error: 'Route not found'}));

});

server.listen(3000, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:3000')
})
