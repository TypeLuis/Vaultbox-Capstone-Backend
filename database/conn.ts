import mongoose from "mongoose";
import { MONGODB_URI } from "../utilities/config.js";

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI)

        console.log('(╯°□°）╯︵ ┻━┻\n', "MongoDB Connected...")
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

export default connectDB