import express from "express"
import * as rowdy from "rowdy-logger"
import globalerror from "./middleware/globalError.js";
import notFound from "./middleware/notFound.js";
import logReq from "./middleware/logReq.js";
import connectDB from "./database/conn.js";
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { PORT } from "./utilities/config.js";
import cors from "cors";
import helmet from "helmet";
import si from "systeminformation";
import deviceRouter from "./routes/deviceRoutes.js";
import appRouter from "./routes/appRoutes.js";
import fileRouter from "./routes/fileRoutes.js";

// Setup
const app = express()
connectDB()
const routesReport = rowdy.begin(app)


// Middleware
app.use(helmet()); // Adds security-related HTTP headers to help protect the app from common web vulnerabilities
app.use(cors()) // Allows controlled cross-origin requests so frontend apps on other domains can access this API
app.use(express.json()) // allows to use json like getting req.body
app.use(logReq);

const cpu    = await si.cpu();        // manufacturer, brand, speed, cores
const mem    = await si.mem();        // total, used, free RAM
const osInfo = await si.osInfo();     // platform, distro, arch, hostname
const fsSize = await si.fsSize();     // per-drive size, used, available

// Routes
app.get('/', (_req, res, _next) => {
    res.send('Hello!')
})

app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/device', deviceRouter)
app.use('/api/app', appRouter)
app.use('/api/file', fileRouter)

// Error Middleware
app.use(notFound)
app.use(globalerror)

// Listener
app.listen(PORT, ()=> {
    console.log(`server is running on PORT: ${PORT}`)
    console.log(cpu)
    console.log(mem)
    console.log(osInfo)
    console.log(fsSize)
    routesReport.print()
})