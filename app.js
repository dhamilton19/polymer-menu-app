const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('json-db').Db;
db.init({
    directory: 'C:\\Users\\n0224247'
});

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/src', express.static(path.join(__dirname, '/src')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.listen(5000, '0.0.0.0', (err) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Listening at http://0.0.0.0:5000');
});

app.post('/input', (req, res) => {
    var state = {};
    const id = req.body.name.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '').toLowerCase();
    state[id] = req.body;
    state[id].createdAt = (new Date()).toJSON();
    db.addToQueue(state);
    console.log(state[id].name + ' Added at ' + state[id].createdAt);
    res.sendStatus(200);
});

function sortData(data) {
    const starters = {};
    const mains = {};
    const desserts = {};
    data.forEach(item => {
        if(starters[item.starter]) starters[item.starter]++;
        else starters[item.starter] = 1;
        if(mains[item.main]) mains[item.main]++;
        else mains[item.main] = 1;
        if(desserts[item.dessert]) desserts[item.dessert]++;
        else desserts[item.dessert] = 1;
    });
    return [
        mapData(starters),
        mapData(mains),
        mapData(desserts)
    ];
}

function mapData(data) {
    const array = [];
    for(let key in data){
        array.push({
            name: key,
            y: data[key]
        });
    }
    return array;
}

app.get('/data', (req, res) => {
    let newData = [];
    db.getAll(data => {
        for (const item in data.data) {
            let newItem = Object.assign({}, data.data[item]);
            delete newItem.name;
            delete newItem.createdAt;
            newData = [...newData, newItem];
        }
        res.send(sortData(newData));
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});
