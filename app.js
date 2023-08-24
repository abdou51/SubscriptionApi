const express = require('express');
const helmet = require('helmet');
const app = express();
require('dotenv/config');
const mongoose = require('./middlewares/db');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const cors = require('cors');
const morgan = require('morgan');


app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(morgan('tiny'));

//routes

const usersRoutes = require('./routes/users');
const subscriptionsRoutes = require('./routes/subscriptions');
const presenceRoutes = require('./routes/presences');



//api
const api = process.env.API_URL;
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/subscriptionplans`, subscriptionsRoutes);
app.use(`${api}/presences`, presenceRoutes);

app.use(globalErrorHandler);







const port = process.env.PORT || 2000;
app.listen(port, ()=>{

    console.log('server is running http://localhost:3000');
})