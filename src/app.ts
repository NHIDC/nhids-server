import express from 'express';
import config from 'config'
import logger from './utils/logger';
import connect from './utils/connect';
import routes from './routes';
import dotenv from 'dotenv';

dotenv.config();


const port = config.get<number>("port");
const app = express();

app.use(express.json());


app.listen(port, async () => {
    logger.info(`App is running at https://nhidc-server-aaa9633d509e.herokuapp.com:${port}`)
    await connect();
})

routes(app);

