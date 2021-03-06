// Setup Express App 
const express = require('express');
const cors = require("cors");
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require('./MongoUtil');
const returnMessage = require('./wgUtil').returnMessage;
const SERVER_ERR_MSG = require('./wgUtil').SERVER_ERR_MSG;
const makeArray = require('./wgUtil').makeArray;
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Get plants in the database all or based on search criteria (done)
    // --------------------------------------------------------------------
    app.get('/plants', async (req, res) => {
        let criteria = {};

        // possible search criteria field by field (effect is same as $and)
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
        if (req.query.smarttag) {
            criteria['smartTags'] = {$regex: req.query.smarttag, $options: "i"}
        }

        // search all fields 
        if (req.query.search) {
            criteria['$or'] = [
                { 'name': {$regex: req.query.search, $options: "i"} },
                { 'appearance': {$regex: req.query.search, $options: "i"} }, 
                { 'care': {$regex: req.query.search, $options: "i"} },
                { 'lighting': {$regex: req.query.search, $options: "i"} },
                { 'smartTags': {$regex: req.query.search, $options: "i"} }
            ]
        }

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").find(criteria).sort({
                _id : -1
            }).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Get all gardens in the database or based on search criteria (done)
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
        if (req.query.complexity) {
            criteria['complexityLevel'] = {$regex: req.query.complexity, $options: "i"}
        }

        // Search for nested element of a Document (not an array)
        if (req.query.aquascaper) {
            criteria['aquascaper.name'] = { $regex: req.query.aquascaper, $options: "i" }
        }

        // search all fields
        if (req.query.search) {
            criteria['$or'] = [
                { 'name': {$regex: req.query.search, $options: "i"} },
                { 'desc': {$regex: req.query.search, $options: "i"} }, 
                { 'complexityLevel': {$regex: req.query.search, $options: "i"} },
                { 'aquascaper.name': {$regex: req.query.search, $options: "i"} },
                { 'aquascaper.email': {$regex: req.query.search, $options: "i"} },
                { 'plants.name' : {$regex: req.query.search, $options: "i"} },
                { 'ratings.comment' : {$regex: req.query.search, $options: "i"} }  
            ]
        }

        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").find(criteria).sort({
                _id : -1
            }).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Update an existing plant (done)
    // ----------------------------------
    app.put('/plant/:id/edit', async (req, res) => {
        // retrieve the client's data from req.body
        let {name, appearance, care, lighting, likes, smartTags, photoURL} = req.body;

        smartTags = makeArray(smartTags);
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Update an existing garden (done)
    // -----------------------------------
    app.put('/garden/:id/edit', async (req, res) => {
        let {name, desc, completionDate, weeksToComplete, complexityLevel, aquascaper, plants, ratings, photoURL} = req.body;
        
        let modifiedOn = new Date();
        plants = makeArray(plants);
        ratings = makeArray(ratings);

        // create ids for each rating sub-documents
        for (let i=0; i < ratings.length; i++) {
            ratings[i]['id'] = new ObjectId();
        }

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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Delete an existing plant (done)
    // ----------------------------------
    app.delete('/plant/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').deleteOne({
                "_id" : ObjectId(req.params.id)
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Delete an existing garden (done)
    // -----------------------------------
    app.delete('/garden/:id', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('gardens').deleteOne({
                "_id" : ObjectId(req.params.id)
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ---------------------------------------------------------------------
    // ENDPOINT: Get Top N Plants by Care/Lighting with greater than M likes (done)
    // Criteria has similar effect with $and
    // ---------------------------------------------------------------------
    app.get('/plants/top', async (req, res) => {
        let topN = !req.query.n ? 3 : parseInt(req.query.n) ; // default to top 3 if blank
        let criteria = {}
    
        let floorLikes = !req.query.likes ? 0 : parseInt(req.query.likes); 
        // negative likes means take ratings below the value
        if (req.query.likes) {
            criteria = { 'likes' : floorLikes >= 0 ? { '$gte' : floorLikes } : { '$lt' : (-floorLikes) }};
        }

        let care = makeArray(req.query.care);
        if (req.query.care) {
            criteria['care'] = { '$in' : care }
        }

        // use regex: lighting has comibination of low, moderate-low, moderate-high
        if (req.query.lighting) {
            criteria['lighting'] = {$regex: req.query.lighting, $options:"i"}
        }

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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // --------------------------------------------------------------------------------------
    // ENDPOINT: Get Top N Gardens by Complexity/Aquascaper with greater than M ratings level
    // --------------------------------------------------------------------------------------
    app.get('/gardens/top', async (req, res) => {
        let topN = !req.query.n ? 3 : parseInt(req.query.n) ; 
        let criteria = {}
        
        // rating level is nested in ratings objects array
        let floorRating = !req.query.rating ? 0 : parseInt(req.query.rating); 
        
        if (req.query.rating) {
            criteria['ratings.level'] =  floorRating >= 0 ? { '$gte' : floorRating } : { '$nin' : [3,4,5] } ;
        }

        if (req.query.complexity) {
            criteria['complexityLevel'] = req.query.complexity
        }

        // use regex: nested aquascaper name with partial search string allowed
        if (req.query.aquascaper) {
            criteria['aquascaper.name'] = {$regex: req.query.aquascaper, $options:"i"}
        }

        try {
            let db = MongoUtil.getDB();
            let result = await 
                db.collection("gardens").find(criteria).project({
                    '_id' : 1,
                    'name' : 1,
                    'photoURL' : 1,
                    'complexityLevel' : 1,
                    'aquascaper.name' : 1,
                    'ratings' : 1
                }).sort({
                    '_id' : -1
                }).limit(topN).toArray();

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // --------------------------------------------------------------------------------------
    // ENDPOINT: Find Top Aquascapers (semi-profession and above garden complexity)  
    //  and show gardens with at least a rating that is above 3
    //  and easy plants in the gardens are NOT found
    //  and returns the first matched rating with comments
    // --------------------------------------------------------------------------------------
    app.get('/aquascapers/top', async (req, res) => {
        let topN = !req.query.n ? 3 : parseInt(req.query.n) ; 
        try {
            let db = MongoUtil.getDB();
            let result = await 
                db.collection("gardens").find({
                    'complexityLevel' : {
                        '$in': ["intermediate", "semi-professional", "professional"]
                    },
                    'ratings.level' : { '$in' : [4, 5] },
                    'plants.care' : { '$nin' : ["easy"] }
                }).project({
                    '_id' : 1,
                    'name' : 1,
                    'photoURL' : 1,
                    'complexityLevel' : 1,
                    'aquascaper.name' : 1,
                    'plants' : 1,
                    'ratings.$' : 1
                }).sort({
                    '_id' : -1
                }).limit(topN).toArray();

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Add a rating to a garden
    // --------------------------------------
    app.patch('/garden/:id/rating/add', async (req, res) => {
        try {
            let newRatingLevel = req.body.newRatingLevel;
            let newRatingComment = req.body.newRatingComment;

            let db = MongoUtil.getDB();
            await db.collection('gardens').updateOne({
                '_id' : ObjectId(req.params.id)
            }, {
                '$push' : { 
                    'ratings' : {
                        'id':  ObjectId(),
                        'level': newRatingLevel,
                        'comment': newRatingComment
                    }
                }
            })

            // return the updated garden
            let result = await db.collection('gardens').findOne({
                "_id" : ObjectId(req.params.id)
            })

            returnMessage(res, 200, result);

        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Delete a rating to a garden
    // -------------------------------------
    app.patch('/garden/:gid/rating/:rid/delete', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            await db.collection('gardens').updateOne({
                '_id' : ObjectId(req.params.gid)
            }, {
                '$pull' : { 'ratings' : { 'id' : ObjectId(req.params.rid) }  }
            })

            // return the updated garden
            let result = await db.collection('gardens').findOne({
                "_id" : ObjectId(req.params.gid)
            })

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Update a Garden Rating Level and Comment
    // -------------------------------------------------
    app.put('/garden/:gid/rating/:rid/edit', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection('gardens').updateOne({
                'ratings' : {
                    '$elemMatch' : {
                        'id' : ObjectId(req.params.rid)
                    }
                }
            }, {
                '$set' : {
                    'ratings.$.level' : req.body.level,
                    'ratings.$.comment' : req.body.comment
                }
            })

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    
    // ENDPOINT: Get all unique aquascapers names in the gardens
    // ---------------------------------------------------------
    app.get('/aquascapers/names', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").distinct("aquascaper.name");

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Get average, minimum, maximum ratings per garden
    // ---------------------------------------------------------
    app.get('/gardens/ratings', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").aggregate(
                [
                    { $unwind : "$ratings" },
                    { $group: {
                        _id:"$_id", 
                        count: { $sum: 1 }, 
                        ave: { $avg: "$ratings.level" },
                        min: { $min: "$ratings.level" },
                        max: { $max: "$ratings.level" }
                    }}
                ]
            ).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Get number of gardens by aquascapers
    // ----------------------------------------------
    app.get('/aquascapers/count', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").aggregate(
                [
                    {
                        $group:{_id:"$aquascaper.name", gardenTotal: {$sum:1} }
                    }
                ]
            ).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Get number of gardens by complexity level
    // ---------------------------------------------------
    app.get('/gardens/count', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("gardens").aggregate(
                [
                    {
                        $group:{_id:"$complexityLevel", Total:{$sum:1}}
                    }
                ]
            ).toArray();
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: All unique smart tags in Plants
    // ------------------------------------------
    app.get('/plants/smarttags', async (req, res) => {
        try {
            let db = MongoUtil.getDB();
            let result = await db.collection("aquatic_plants").distinct("smartTags");

            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ******************************************************************************************
    // TESTED OK BUT NOT IN USE BY FRONT-END for Project 2
    // ******************************************************************************************
    // ENDPOINT: Adding a plant to a garden
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Removing a plant from a garden
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ENDPOINT: Removing a smartTag from a plant 
    // ------------------------------------------
    app.patch('/plant/:id/tags/delete', async (req, res) => {
        try {
            let tagToDelete = req.body.smartTag;

            let db = MongoUtil.getDB();
            let result = await db.collection('aquatic_plants').updateOne({
                '_id' : ObjectId(req.params.id)
            }, {
                '$pull' : { 'smartTags' : tagToDelete  }
            })
            returnMessage(res, 200, result);
        } catch (e) {
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
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
            returnMessage(res, 500, SERVER_ERR_MSG + ">>" + e);
        }
    })

    // ******************************************************************************************

}

main();

// START SERVER process.env.PORT
app.listen(process.env.PORT, ()=> {
    console.log("Server started...")
})
