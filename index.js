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

const SERVER_ERR_MSG = "Unexpected internal server error";

function returnMessage(res, status, message) {
    res.status(status);
    res.send(message);
}

async function main() {

    // 1a. Connect to Mongo
    let db = await MongoUtil.connect(mongoURL, 'water_gardens')

    // add routes here
    app.get('/', function(req, res) {
        res.send("<h1>Hello from Express - Water Gardens APIs</h1>")
    })

    // ENDPOINT: Add a new plant to the database
    // -----------------------------------------
    app.post('/plant/add', async (req, res) => {
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
            returnMessage(res, 200, result.ops);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Add a new garden to the database
    // ------------------------------------------
    app.post('/garden/add', async (req, res) => {
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
            returnMessage(res, 200, result.ops);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Get a specific plant by ID
    // ------------------------------------
    app.get('/plant/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").findOne({
                '_id' : ObjectId(req.params.id)
            });
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }

    })

    // ENDPOINT: Get a specific garden by ID
    // -------------------------------------
    app.get('/garden/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").findOne({
                '_id' : ObjectId(req.params.id)
            });
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Get plants in the database all or based on search criteria
    // --------------------------------------------------------------------
    app.get('/plants', async (req, res) => {
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

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").find(criteria).sort({
                _id : -1
            }).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Get all gardens in the database or based on search criteria
    // ---------------------------------------------------------------------
    app.get('/gardens', async (req, res) => {
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

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").find(criteria).sort({
                _id : -1
            }).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Update an existing plant
    // ----------------------------------
    app.put('/plant/:id/edit', async (req, res) => {
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
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Update an existing garden
    // -----------------------------------
    app.put('/garden/:id/edit', async (req, res) => {
        let {name, desc, completionDate, weeksToComplete, complexityLevel, aquascaper, plants, ratings} = req.body;
        
        plants = plants || [];
        plants = Array.isArray(plants) ? plants : [plants];
        ratings = ratings || [];
        ratings = Array.isArray(ratings) ? ratings : [ratings];

        // create ids for each rating sub-documents
        for (let i=0; i < ratings.length; i++) {
            ratings[i]['id'] = new ObjectId();
        }
        
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
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Delete an existing plant
    // ----------------------------------
    app.delete('/plant/:id', async (req, res) => {
        console.log("Deleting plant", req.params.id)
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').deleteOne({
                "_id" : ObjectId(req.params.id)
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Delete an existing garden
    // -----------------------------------
    app.delete('/garden/:id', async (req, res) => {
        console.log("Deleting plant", req.params.id)
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('gardens').deleteOne({
                "_id" : ObjectId(req.params.id)
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Adding a smartTag to a plant (smartTags in an arrray of strings)
    // --------------------------------------
    app.patch('/plant/:id/tags/add', async (req, res) => {
        try {
            let newTag = req.body.smartTag;
            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').updateOne({
                "_id" : ObjectId(req.params.id)
            }, {
                '$push' : { 'smartTags' : newTag  }
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Removing a smartTag from a plant
    // ------------------------------------------
    app.patch('/plant/:id/tags/delete', async (req, res) => {
        try {
            let tagToDelete = req.body.smartTag;
            console.log("delete tag:", tagToDelete)

            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').updateOne({
                '_id' : ObjectId(req.params.id)
            }, {
                '$pull' : { 'smartTags' : tagToDelete  }
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Increasing a like count by 1 to a plant
    // -------------------------------------------------
    app.patch('/plant/:id/likes/add_one', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').updateOne({
                '_id' : ObjectId(req.params.id)
            }, {
                '$inc' : { 'likes' :  1 }
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Adding a plant to a garden
    // ------------------------------------
    // !!! Haryati this need to test
    app.patch('/garden/:gid/plant/:pid/add', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let wantedPlant = await db.collection('aquatic_plants').findOne({
                '_id' : ObjectId(req.params.pid)
            });

            if (wantedPlant == null){
                res.send("Plant does not exist in the database.");
                res.status(404);
            } else {
                let duplicatePlant = await db.collection('gardens').findOne({
                    '_id' : ObjectId(req.params.gid),
                    'plants.id': ObjectId(req.params.pid)
                });

                if (duplicatePlant == null) {
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
                    returnMessage(res, 200, result);
                } else {
                    res.send("Plant already exist in the garden.");
                    res.status(400);
                }
            }
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Removing a plant from a garden
    // ----------------------------------------
    // !!! Haryati this need to test
    app.patch('/garden/:gid/plant/:pid/delete', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('gardens').updateOne({
                '_id' : ObjectId(req.params.gid)
            }, {
                '$pull': {
                    'plants': { 'id': ObjectId(req.params.pid)}
                }
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Search for multiple smartTags in plants using $in
    // -----------------------------------------------------------
    // !!! Haryati this need to check on use of $in
    app.get('/gardens/plants/tags', async (req, res) => {
        try {
            let db = MongoUtil.getDB();

            let result = await db.collection('aquatic_plants').find({

            }).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // Design the below using React?
    
    // ENDPOINT: Add a rating to a garden
    // -------------------------------------

    // ENDPOINT: Delete a rating to a garden
    // -------------------------------------

    // ENDPOINT: Edit a rating to a garden
    // -------------------------------------
}

main();

// START SERVER
app.listen(3000, ()=> {
    console.log("Server started... haryati")
})
