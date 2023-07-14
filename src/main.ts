import fs from 'fs';
import * as os from 'os';
import * as open from 'open';
import { createServer } from './createServer.js';
import { certKeyPath, certPath, port } from './env.js';

const option = {
    'key': fs.readFileSync(certKeyPath),
    'cert': fs.readFileSync(certPath)
};
createServer(option)
    .listen(port, () => {
        console.log(`server start https://${os.hostname()}:${port}/`);
        open.default(`https://${os.hostname()}:${port}/pc`);
    });
