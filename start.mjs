import {server} from './server.mjs';

server.listen(3000, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:3000');
} );