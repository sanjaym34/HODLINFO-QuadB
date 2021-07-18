const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const cookie = require('cookie-parser');
const fetch = require('node-fetch');

const { Pool } = require('pg');

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookie());

const pool = new Pool({
    user: 'APIFetch',
    host: 'localhost',
    database: 'Tickets',
    password: 'sanjay123',
    port: 5432,
})

const data = [];
fetch('https://api.wazirx.com/api/v2/tickers')
    .then(res => res.json())
    .then(async json => {
        let count = 0;
        Object.entries(json).forEach(eachJson => {
            count++;
            if (count <= 10) {
                data.push(eachJson);
            }
        })
        for (let i = 0; i < 10; i++) {
            var name = data[i][1].name;
            var last = data[i][1].last;
            var buy = data[i][1].buy;
            var sell = data[i][1].sell;
            var volume = data[i][1].volume;
            var baseunit = data[i][1].base_unit;
            var ticketname = data[i][0];


            pool.query("INSERT INTO tickets(name,last,buy,sell,volume,base_unit,ticketname)VALUES($1,$2,$3,$4,$5,$6,$7)", [name, last, buy, sell, volume, baseunit, ticketname], (err, res) => {
                if (err) {
                    console.log(err);
                }
            })
        }

    })


app.get('/', async (req, res) => {
    console.log("Home Page");

    const results = await pool.query("SELECT * from tickets");

    res.render('index',{results: results.rows});

});

app.listen(3000, () => {
    console.log("Server on !!!!");
})