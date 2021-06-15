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
    // -----------------------------------------
    app.post('/water_gardens/plants', async (req, res) => {
        // each plant has name, appearance, care, lighting
        let {name, appearance, care, lighting, likes} = req.body;

        // default plant info
        likes = likes || 0;
        let smartTags = [];
        let createdOn = new Date();
        
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").insertOne({
                name,
                appearance,
                care,
                lighting,
                likes, 
                smartTags,
                createdOn
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
    // ------------------------------------------
    app.post('/water_gardens', async (req, res) => {
        // each garden has name, description, completion date, weeks to complete, complexity level
        // each garden has one aquascaper 
        // let aquascaper = {
        //     name: req.body.aquascaper.name,
        //     email: req.body.aquascaper.email
        // }
        let {name, desc, completionDate, weeksToComplete, complexityLevel, aquascaper} = req.body;

        // default garden info
        let plants = [];  
        let ratings = [];
        let createdOn = new Date();
        console.log("add garden", aquascaper)

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").insertOne({
                name,
                desc,
                completionDate,
                weeksToComplete,
                complexityLevel,
                aquascaper,
                plants,
                ratings,
                createdOn
            });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Get a specific plant by ID
    // ------------------------------------
    app.get('/water_gardens/plants/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").findOne({
                '_id' : ObjectId(req.params.id)
            });

            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }

    })

    // ENDPOINT: Get a specific garden by ID
    // -------------------------------------
    app.get('/water_gardens/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").findOne({
                '_id' : ObjectId(req.params.id)
            });
        
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Get plants in the database all or based on search criteria
    // --------------------------------------------------------------------
    app.get('/water_gardens/plants', async (req, res) => {
        let criteria = {};

        // possible search criteria
        if (req.query.name) {
            criteria['name'] = {$regex: req.query.name, $options: "i"}
        }
        if (req.query.appearance) {
            criteria['appearance'] = {$regex: req.query.appearance, $options: "i"}
        }
        if (req.query.care) {
            criteria['care'] = {$regex: req.query.care, $options: "i"}
        }
        if (req.query.lighting) {
            criteria['lighting'] = {$regex: req.query.lighting, $options: "i"}
        }

        // !!!!!!!!!!!!! NOT WORKING
        // HARYATI: to add search on smart tags (array of strings) 
        // !!!!!!!!!!!!!
        if (req.query.smarttags) {
            criteria['smartTags'] = {$regex: req.query.smarttags, $options: "i"}
        }

        console.log("search", criteria);

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").find(criteria).toArray();

            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Get all gardens in the database or based on search criteria
    // ---------------------------------------------------------------------
    app.get('/water_gardens', async (req, res) => {
        let criteria = {};

        // possible search criteria
        if (req.query.name) {
            criteria['name'] = {$regex: req.query.name, $options: "i"}
        }
        if (req.query.desc) {
            criteria['desc'] = {$regex: req.query.desc, $options: "i"}
        }
        if (req.query.complexityLevel) {
            criteria['complexityLevel'] = {$regex: req.query.complexity, $options: "i"}
        }

        // Search for nested element of a Document (not an array)
        if (req.query.aquascaper) {
            criteria['aquascaper.name'] = { $regex: req.query.aquascaper, $options: "i" }
        }

        console.log("search", criteria);

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").find(criteria).toArray();

            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Update an existing plant
    // ----------------------------------
    app.put('/water_gardens/plants/:id', async (req, res) => {
        // retrieve the client's data from req.body
        let {name, appearance, care, lighting, likes, smartTags} = req.body;

        smartTags = smartTags || []; // if null, set as empty list
        smartTags = Array.isArray(smartTags) ? smartTags : [smartTags]; // if 1 element, make it into array
        let modifiedOn = new Date();

        try {
            let db = MongoUtil.getDB()
            let result = await db.collection('aquatic_plants').updateOne({
                "_id" : ObjectId(req.params.id)
            }, {
                "$set": {
                    name,
                    appearance,
                    care,
                    lighting,
                    likes,
                    smartTags,
                    modifiedOn
                }
            })
            
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Update an existing garden
    // -----------------------------------
    app.put('/water_gardens/:id', async (req, res) => {
        let {name, desc, completionDate, weeksToComplete, complexityLevel, aquascaper, plants, ratings} = req.body;
        
        plants = plants || [];
        plants = Array.isArray(plants) ? plants : [plants];
        ratings = ratings || [];
        ratings = Array.isArray(ratings) ? ratings : [ratings];

        // create ids for each rating sub-documents
        for (let i=0; i < ratings.length; i++) {
            ratings[i]['id'] = new ObjectId();
        }
        console.log("Updating garden", req.body)

        let modifiedOn = new Date();

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").updateOne({
                "_id" : ObjectId(req.params.id)
            }, {
                "$set": {
                    name,
                    desc,
                    completionDate,
                    weeksToComplete,
                    complexityLevel,
                    aquascaper,
                    plants,
                    ratings,
                    modifiedOn
                }
            });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Delete an existing plant
    // ----------------------------------
    app.delete('/water_gardens/plants/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB()
            let result = await db.collection('aquatic_plants').deleteOne({
                "_id" : ObjectId(req.params.id)
            })
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Delete an existing garden
    // -----------------------------------
    app.delete('/water_gardens/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB()
            let result = await db.collection('gardens').deleteOne({
                "_id" : ObjectId(req.params.id)
            })
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
