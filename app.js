// // APIs 
// /login POST////
// /signup GET////
// /tasks GET//
// /add  POST //
// /Submit DELETE//


import express from 'express';
import bodyParser from 'body-parser';
import expressSessions from 'express-session';
import knex from 'knex';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { login, logOut, signUp } from './login.js';
import { addTask, submitTask, tasks } from './tasks.js';

const app = express();
dotenv.config();

//Database
const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
});
//  hide the database info

const authenticateToken = (req, res, next) => {
    // const token = req.cookies.token;
    const user =    {"id": req.session.userId}
    // const token = req.headers['authorization']?.split(' ')[1];
    if (!req.session.userId) return res.sendStatus(403);
    //   hide the JWT_secret
    // jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        // if (err) return res.sendStatus(403);
        req.user = user;
        // next();
    // });
    next();
};


//Middleware
app.use(bodyParser.json());
app.use(expressSessions({
    secret: process.env.SESSIONS_KEY,
    resave: false,
    saveUninitialized: true,
}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.post('/login', login(bcrypt, db, null));
app.post('/signup', signUp(bcrypt, db, null));
app.delete('/logout', logOut());

app.get('/tasks:id', authenticateToken, tasks(db))
app.post('/add', authenticateToken, addTask(db))
app.delete('/task:id', authenticateToken, submitTask(db))
// app.get('/asdj',(req,res)=>{
// })


app.listen(3005, () => {
    console.log("it's working perfectly");
})