import mongoose, { mongo } from 'mongoose';

import User from './user';
import Message from './message';

const connectDb = () => {
    if(process.env.TEST_DATABASE_URL) {
        return mongoose.connect(
            process.env.TEST_DATABASE_URL,
            { useNewUrlParser: true }
        )
    }

    if(process.env.DATABASE_URl) {
        return mongoose.connect(
            process.env.DATABASE_URl,
            { useNewUrlParser: true }
        );
    }
};

const models = { User, Message };

export { connectDb };

export default models;