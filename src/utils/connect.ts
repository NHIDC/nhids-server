import mongoose from 'mongoose';
import config from 'config';
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

async function connect() {
    const dbUri = config.get<string>("dbUri");
    try {
        await mongoose.connect(dbUri)
        logger.info("Connected to db")
    }
    catch (error) {
        logger.error("Could not connect to db");
        process.exit(1);
    };
}

export default connect;