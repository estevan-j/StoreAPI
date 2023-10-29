const express = require('express');
const morgan = require('morgan');
const productsRouter = require('./routes/products');
const { connect } = require('mongoose');
// async errors
const notFound = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
require('dotenv').config();
require('express-async-errors');


const app = express();
const PORT = process.env.PORT || 3000

// middleware
app.use(express.json())
app.use(morgan('dev'))

//routes
app.get('/', (req, res) =>{
    res.send('<h1>Store API </h1> <a href="/api/v1/products">Products route</a>')
})

app.use('/api/v1/products', productsRouter)

// products route

app.use(notFound)
app.use(errorHandlerMiddleware)

const start = async() => {
    try {
        // connectDB
        connect(process.env.MONGO_URI)
        app.listen(PORT, () => console.log(`Server is listening on Port: ${PORT}`))
    } catch (error) {
        console.log(error);
    }
}

start();

