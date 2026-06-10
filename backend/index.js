import express from 'express';
const app = express();
import { configDotenv } from 'dotenv';
configDotenv();
import connectDB from './config/db.js'; 
connectDB();   
import routing from './routing/routing.js';
app.use(express.json());
app.use('/api/v1', routing);
import cors from 'cors';

app.use(cors());


const port = process.env.PORT || 3030;
app.get('/', (req, res) => {
    res.send(' World!');
});

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true, // Replace with your frontend URL
}));
app.listen(port, () => {
    console.log(`Server is started at http://localhost:3030`);
});