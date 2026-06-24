import '@dotenvx/dotenvx/config'
import express from 'express';
import cors from 'cors';
import apiRoute from './routes/indexroute.js';
import requestLogger from './middlewares/logger.js';
import errorLogger from './middlewares/errorlogger.js';

const app = express();
const port = process.env.PORT;


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
