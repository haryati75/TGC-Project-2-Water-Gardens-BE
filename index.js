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

    // ENDPOINT: Add a new plant to the database - (done)
    // -----------------------------------------
    app.post('/plant/add', async (req, res) => {
        // each plant has name, appearance, care, lighting
        let {name, appearance, care, lighting, likes, photoURL} = req.body;

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
                photoURL,
                createdOn
            });
            returnMessage(res, 200, result.ops);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Add a new garden to the database (done)
    // ------------------------------------------
    app.post('/garden/add', async (req, res) => {
        // each garden has name, description, completion date, weeks to complete, complexity level
        // each garden has one aquascaper 
        // let aquascaper = {
        //     name: req.body.aquascaper.name,
        //     email: req.body.aquascaper.email
        // }
        let {name, desc, completionDate, weeksToComplete, complexityLevel, aquascaper, photoURL} = req.body;

        // default garden info
        let plants = [];  
        let ratings = [];
        let createdOn = new Date();

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
                photoURL,
                createdOn
            });
            returnMessage(res, 200, result.ops);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Get a specific plant by ID (done)
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

    // ENDPOINT: Get a specific garden by ID (done)
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

    // ENDPOINT: Get plants in the database all or based on search criteria (not done for criteria)
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

    // ENDPOINT: Get all gardens in the database or based on search criteria (not done for criteria)
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

    // ENDPOINT: Update an existing plant (done)
    // ----------------------------------
    app.put('/plant/:id/edit', async (req, res) => {
        // retrieve the client's data from req.body
        let {name, appearance, care, lighting, likes, smartTags, photoURL} = req.body;

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
                    photoURL,
                    modifiedOn
                }
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Update an existing garden (done)
    // -----------------------------------
    app.put('/garden/:id/edit', async (req, res) => {
        let {name, desc, completionDate, weeksToComplete, complexityLevel, aquascaper, plants, ratings, photoURL} = req.body;
        
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
                    photoURL,
                    modifiedOn
                }
            });
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // ENDPOINT: Delete an existing plant (done)
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

    // ENDPOINT: Delete an existing garden (done)
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

    // ENDPOINT: Adding a smartTag to a plant (smartTags in an arrray of strings) (NOT IN USE)
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

    // ENDPOINT: Removing a smartTag from a plant (NOT IN USE)
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

    // ENDPOINT: Increasing a like count by 1 to a plant (done)
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

    // ENDPOINT: Adding a plant to a garden (NOT IN USE - convert this to ratings)
    // ------------------------------------
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
                                'photoURL' : wantedPlant.photoURL,
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

    // ENDPOINT: Removing a plant from a garden (Not in USE)
    // ----------------------------------------
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

    // ---------------------------------------------------------------------
    // ENDPOINT: Get Top N Plants by Care/Lighting with greater than M likes
    // ---------------------------------------------------------------------
    app.get('/plants/top', async (req, res) => {
        let topN = !req.query.n ? 3 : parseInt(req.query.n) ; // default to top 3 if blank
        let floorLikes = !req.query.likes ? 5 : parseInt(req.query.likes); // default to greater than/equal 5 likes
        
        // Criteria has similar effect with $and
        let criteria = { 'likes' : { '$gte' : floorLikes } };

        if (req.query.care) {
            criteria['care'] = req.query.care
        }

        // use regex: lighting has comibination of low, moderate-low, moderate-high
        if (req.query.lighting) {
            criteria['lighting'] = {$regex: req.query.lighting, $options:"i"}
        }

        console.log("top N Plants criteria by likes: ", criteria)

        try {
            let db = MongoUtil.getDB();
            let result = await 
            db.collection("aquatic_plants").find(criteria).project({
                    '_id' : 1,
                    'name' : 1,
                    'photoURL' : 1,
                    'likes' : 1,
                    'care' : 1,
                    'lighting' : 1
                }).sort({
                    'likes' : -1
                }).limit(topN).toArray();

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

    // --------------------------------------------------------------------------------------
    // ENDPOINT: Get Top N Gardens by Complexity/Aquascaper with greater than M ratings level
    // --------------------------------------------------------------------------------------
    app.get('/gardens/top', async (req, res) => {
        let topN = !req.query.n ? 3 : parseInt(req.query.n) ; // default to top 3 if blank
        let criteria = {}
        
        // rating level is nested in ratings objects array
        let floorRating = !req.query.rating ? 3 : parseInt(req.query.rating); // default to greater than/equal 3 ratings
        criteria = { 
            'ratings' : { 
                '$elemMatch' :  {
                    'level' : {'$gte' : floorRating } } } };

        if (req.query.level) {
            criteria['complexityLevel'] = req.query.level
        }

        // use regex: nested aquascaper name with partial search string allowed
        if (req.query.aquascaper) {
            criteria['aquascaper.name'] = {$regex: req.query.aquascaper, $options:"i"}
        }

        console.log("top N Gardens criteria by ratings: ", criteria)

        try {
            let db = MongoUtil.getDB();
            let result = await 
                db.collection("gardens").find(criteria).project({
                        '_id' : 1,
                        'name' : 1,
                        'photoURL' : 1,
                        'complexityLevel' : 1,
                        'aquascaper.name' : 1,
                        'ratings.$' : 1
                    }).sort({
                        '_id' : -1
                    }).limit(topN).toArray();

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG);
            console.log(e);
        }
    })

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
