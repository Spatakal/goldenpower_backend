import '@dotenvx/dotenvx/config'
import express from 'express';
import cors from 'cors';
import apiRoute from './src/routes/indexroute.js';
import requestLogger from './src/middlewares/logger.js';
import errorLogger from './src/middlewares/errorlogger.js';
import supabase from './src/config/supabaseclient.js';
import cron from "node-cron";
import { checkAndSendDueAlerts } from "./src/controllers/notificationController.js"; // Adjust path as needed

const app = express();
const port = process.env.PORT;
const port_1 = process.env.PORT_1;

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use('/api', apiRoute);
//ROUTE
app.get('/', (req, res) => {
    res.send('Welcome to Golden Power Battery API');
});

app.use(errorLogger);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.listen(port_1, () => {
    console.log(`Server is running on port ${port}`);
});
