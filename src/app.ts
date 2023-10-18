import 'dotenv/config';

process.env['NODE_CONFIG_DIR'] = __dirname + '/config';

import config from 'config';
import express from 'express';
import routes from './routes';
import connect from './utils/connect';
import logger from './utils/logger';

const port = config.get<number>('port');
const app = express();

app.use(express.json());

app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);
  await connect();
  routes(app);
});
