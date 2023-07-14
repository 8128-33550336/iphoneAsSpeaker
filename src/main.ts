import fs from 'fs';
import * as os from 'os';
import open, { apps } from 'open';
import { createServer } from './createServer.js';
import { certKeyPath, certPath, port } from './env.js';

const option = {
    'key': fs.readFileSync(certKeyPath),
    'cert': fs.readFileSync(certPath)
};
createServer(option)
    .listen(port, () => {
        console.log(`server start https://${os.hostname()}:${port}/`);
        open(`https://${os.hostname()}:${port}/pc`, { app: { name: apps.chrome } });
    });
