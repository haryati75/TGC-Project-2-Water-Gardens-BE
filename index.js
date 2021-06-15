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
            let db = MongoUtil.getDB();
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
            let db = MongoUtil.getDB();
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
            let db = MongoUtil.getDB();
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

    // ENDPOINT: Adding a smartTag to a plant (smartTags in an arrray of strings)
    // --------------------------------------
    app.patch('/water_gardens/plants/:id/tags/add', async (req, res) => {
        try {
            let newTag = req.body.smartTag;
            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').updateOne({
                "_id" : ObjectId(req.params.id)
            }, {
                '$push' : { 'smartTags' : newTag  }
            })

            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Removing a smartTag from a plant
    // ------------------------------------------
    app.patch('/water_gardens/plants/:id/tags/delete', async (req, res) => {
        try {
            let tagToDelete = req.body.smartTag;
            console.log("delete tag:", tagToDelete)

            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').updateOne({
                '_id' : ObjectId(req.params.id)
            }, {
                '$pull' : { 'smartTags' : tagToDelete  }
            })

            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Increasing a like count by 1 to a plant
    // -------------------------------------------------
    app.patch('/water_gardens/plants/:id/likes/add_one', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').updateOne({
                '_id' : ObjectId(req.params.id)
            }, {
                '$inc' : { 'likes' :  1 }
            })
            res.status(200);
            res.send(result);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    // ENDPOINT: Adding a plant to a garden
    // ------------------------------------
    // And duplicates are checked before API call
    // !!!! HARYATI : FIX THIS !!!!
    app.patch('/water_gardens/:gid/plant/:pid/add', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let wantedPlant = await db.collection('aquatic_plants').findOne({
                '_id' : ObjectId(req.params.pid)
            });

            let result = await db.collection('gardens').updateOne({
                '_id' : ObjectId(req.params.gid)
            }, {
                '$push': {
                    'plants': {
                        'id' : wantedPlant._id,
                        'name': wantedPlant.name,
                        'care': wantedPlant.care
                    }
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

    // ENDPOINT: Removing a plant from a garden
    // ----------------------------------------
    // !!! Haryati this need to test
    app.patch('/water_gardens/:gid/plant/:pid/delete', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('gardens').updateOne({
                '_id' : ObjectId(req.params.gid)
            }, {
                '$pull': {
                    'plants': { 'id': ObjectId(req.params.pid)}
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

    // ENDPOINT: Search for multiple smartTags in plants using $in
    // -----------------------------------------------------------
    // !!! Haryati this need to test
    app.get('/water_gardens/plants/tags', async (req, res) => {
        try {
            let db = MongoUtil.getDB();

            let result = await db.collection('aquatic_plants').find({

            }).toArray();

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
