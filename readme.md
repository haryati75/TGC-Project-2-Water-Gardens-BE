# Water Gardens API Documentation

This is a backend server for the Water Gardens project. This is a demo project for educational purposes under the Trent Global College (Singapore).

## Objectives: 
To build the backend RESTFUL API services that connects to the Mongo database of the Water Gardens Gallery.

## Business Use Cases
### 1. A platform for hobbyists to feature their aquascaping aquariums
The Water Gardens Gallery features aquascaping aquariums and a repository of aquatic plants that are usually used for aquascaping. Hobbyists can submit their aquariums and the plants they used. 

### 2. Open platform for reviews and ratings
Other hobbyists or public can give ratings and feedback on these aquariums. 

### 3. Suppliers of Aquascaping plants, equipments and materials
A potential platform to sell related aquascaping products and services. Suppliers of aquatic plants can share information of the plants and see potential demands.  

### 4. Marketplace Potential
With payment and authentication as enhancements, the platform can be used by hobbyists and enthusiasts to engage services (e.g. commissioning of an aquarium by a professional aquascaper) and to buy/sell related aquascaping products.


## Main Technologies Used
### 1. Database
### **Mongo DB on Atlas:**
* One-to-One (Garden-Aquascaper)
* One-to-Many (Garden-Ratings, Plant-SmartTags)
* **Many-to-Many** (Gardens-Plants)
    * Not included: validation of deletion of Plant done at Front-End (must not exist in any Garden document)
    * Not included: validation of insert of garden's plant done at Front-end (must exist in Plants collection)
* **CRUD** operations:
    * insertOne(), find(), findOne(), updateOne(), deleteOne()
* Queries with: 
    * $gte, $lt, $in, $nin, $or
* Queries with **Multi-Criteria, Projections, Sort, Limit** 
* **Arrays and Nested** sub-documents with CRUD and queries: 
    * $elemMatch, $regex, $push, $pull, $inc
* Mongo **Aggregate, Distinct, Count** operation used
* Aggregate operators: 
    * $sum, $avg, $min, $max, $unwind, $group

*Reference to MongoDB Manual (ver 4.4):
https://docs.mongodb.com/v4.4/introduction/*

### 2. Back-end
### **NodeJS and Express**
* Use of reusable module (wgUtil.js)
* API: **GET, POST, PUT, PATCH, DELETE** used
* validation of each API using try/catch
* use of **params, query and body** for API passing of parameters
* JSON format of data returns

### 3. Project and Development Sources
**GitHub, Gitpod** - use of GitHub repository for source codes and Gitpod for coding and testing.
Backend Server to be on **HEROKU**

https://github.com/haryati75/TGC-Project-2-Water-Gardens-BE


## Database ERD: water_gardens
The MongoDB database is called *water_gardens* made up of 2 collections:
* *gardens.garden*
    * aquascaper
    * ratings (Array of Objects)
    * plants (Array of Objects)
        * *id* is referenced to *aquatic_plants.plant._id*
* *aquatic_plants.plant*
    * smart tags (Array of Strings)

The database is hosted on Mongo DB Atlas cloud service.

The ERD diagram is as follows:
![Water Garden ERD](./wg-erd.jpg)

## RESTful APIs
The API calls for the backend service of Water Gardens Gallery are as follows: 

### Get all gardens or plants
```
GET /gardens
GET /plants
```

### Get a specific garden or plant
```
GET /garden/:id
GET /plant/:id
```
:id is garden._id / plant._id

### Insert a new garden or plant
```
POST /garden/add
POST /plant/add
```
Parameters are passed using req.body (JSON): 

```
{

}
```

### Delete an existing garden or plant
```
DELETE /garden/:id/delete
DELETE /plant/:id/delete
```
### Update an existing garden or plant
```
PUT /garden/:id/edit
PUT /plant/:id/edit
```

PATCH /garden/:gid/rating/:rid/delete



## Testing
All the API routes are tested using Advanced Rest Client (ARC) by Mulesoft.
![API testing](./ARC-testing.JPG)

### Gitpod API URLs:
https://3000-tan-trout-gu31y5ul.ws-us08.gitpod.io

https://3000-tan-trout-gu31y5ul.ws-us09.gitpod.io 

### Test Cases
#### **Test 1**: Filter on plants using GET via req.query parameter passing:
```
https://3000-tan-trout-gu31y5ul.ws-us08.gitpod.io/plants/top?n=5&care=easy&care=medium&lighting=moderate&likes=-10

or

GET ../plants/top?n=5&care=easy&care=medium&lighting=moderate&likes=-10
```
**Expected Output:** 
The above will return at most 5 plants documents in JSON format with care = easy/medium and has lighting = moderate/moderate-low/moderate-high and less than 10 likes



#### **Test 2**: Update a garden using PUT via req.body parameter passing:
```

```
**Expected Output:** 

#### **Test 2**: Delete a sub-document rating from garden document using PATCH via req.params parameter passing of ids:
```
PATCH /garden/:gid/rating/:rid/delete
```
**Expected Output:** 


## Deployment

Main Source files:
1. index.js (all routes here)
2. wgUtil.js (error handling and array formatting)
3. MongoUtil.js (db connection)

Gitpod starting of server and connecting to DB on npm:
```
npm install -g nodemon
nodemon index.js
```
Environment variables: 
```
MONGO_URI in .env
```
.gitignore contains:
```
.env
node_modules
```

Dependencies: 
```
yarn add express
yarn add cors
yarn add mongodb
yarn add axios
yarn add dotenv
```

The backend server is hosted at [HEROKU?]

