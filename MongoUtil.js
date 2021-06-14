const MongoClient = require('mongodb').MongoClient;

// global variable is to store the database
let _db;

async function connect(url, dbname) {
    let client = await MongoClient.connect(url, {
        useUnifiedTopology : true
    })
    _db = client.db(dbname);
    console.log("Database connected...haryati");
}

function getDB() {
    return _db;
}

module.exports = {
    connect, getDB
}