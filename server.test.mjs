import test from 'node:test';
import assert from 'node:assert/strict';
import {server} from './server.mjs';

test('rejects an invalid completed filter', async () => {
    try {
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        })

        const port = server.address().port;
        const response = await fetch(
            `http://127.0.0.1:${port}/tasks?completed=yes`
        );
        assert.equal(response.status, 400);

        const body = await response.json();

        assert.deepEqual(body, {
            error: 'Completed must be true or false',
        })
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve()
            })
        })
    }
})