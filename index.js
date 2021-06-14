// Setup Express App 
const express = require('express');
const cors = require("cors");
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require('./MongoUtil');
const mongoURL = process.env.MONGO_URI;

// Setup express
let app = express();

// Enable processing JSON data
app.use(express.json());

// Enable CORS
app.use(cors());

async function main() {

    // 1a. Connect to Mongo
    let db = await MongoUtil.connect(mongoURL, 'water_gardens')

    // add routes here
    app.get('/', function(req, res) {
        res.send("<h1>Hello from Express - Water Gardens</h1>")
    })

    // ENDPOINT: Add a new plant to the database
    app.post('/water_gardens/plants', async (req, res) => {
        // each plant has name, care, lighting
        let name = req.body.name;
        let care = req.body.care;
        let lighting = req.body.lighting;
        // default plant info
        let likes = 0;
        let createdon = new Date(req.body.datetime) || new Date();
        
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").insertOne({
                name,
                care,
                lighting,
                likes,
                createdon
            });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

        // ENDPOINT: Add a new garden to the database
        app.post('/water_gardens', async (req, res) => {
            // each garden has name, description, completion date, weeks to complete, complexity level
            // each garden has one aquascaper 
            let name = req.body.name;
            let desc = req.body.desc;
            let completionDate = req.body.completionDate;
            let weeksToComplete = req.body.weeksToComplete;
            let complexityLevel = req.body.complexityLevel;
            let aquascaper = {
                name: req.body.aquascaper.name,
                email: req.body.aquascaper.email
            }

            // default garden info
            let createdon = new Date(req.body.datetime) || new Date();
    
            try {
                let db = MongoUtil.getDB();
                let result = await db.collection("gardens").insertOne({
                    name,
                    desc,
                    completionDate,
                    weeksToComplete,
                    complexityLevel,
                    aquascaper,
                    createdon
                });
                res.status(200);
                res.send(result);
            } catch (e) {
                res.send("Unexpected internal server error");
                res.status(500);
                console.log(e);
            }
        })
}

main();

// START SERVER
app.listen(3000, ()=> {
    console.log("Server started... haryati")
})
