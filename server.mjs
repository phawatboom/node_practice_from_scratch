import { createServer } from 'node:http';


const tasks = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build my first API', completed: false },
];

const server = createServer((req, res) => {
    console.log(req.method, req.url);
    res.setHeader('Content-Type', 'application/json')

    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;

    if (req.method === 'GET' && pathname === '/health') {
        res.statusCode = 200;
        res.end(JSON.stringify({status: 'ok'}));
        return;
    }

    if (req.method === 'GET' && pathname === '/tasks'){
        res.statusCode = 200;
        res.end(JSON.stringify(tasks));
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

    // if (req.method == 'POST' && pathname === '/tasks'){

    // }

    res.statusCode = 404;
    res.end(JSON.stringify({error: 'Route not found'}));

});

server.listen(3000, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:3000')
})