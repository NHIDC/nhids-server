import pino from 'pino';
import createWriteStream from 'pino-pretty';

const prettyPrint = createWriteStream()

// Create a Pino logger instance
const log = pino({
    level: 'info',
}, prettyPrint);

export default log;