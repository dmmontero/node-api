require('./config/config')
const express = require("express");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT;
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());


//Rutas de la API
app.use(require('./routes/index'));


mongoose.connect(process.env.urlDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log(`we are connected to ${process.env.urlDB}`);
});

app.listen(port, () =>
    console.log(`Example app listening on port ${port}`)
);