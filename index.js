const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


// middleware
app.use(cors())
app.use(express.json())


//assignment-10-server
//BepkTv6K12KvaoI7

const uri = "mongodb+srv://assignment-10-server:BepkTv6K12KvaoI7@cluster0.ziilask.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




async function run() {
  try {
    await client.connect();
    console.log("mongodb connected success")

    const database = client.db('assignment-10-server');
    const modelsCollection = database.collection('data');
    const usersCollection = database.collection('users');
    const purchasedCollection = database.collection('add-data');

    // rot
    app.get('/', (req, res) => {
        res.send('Ai Model Inventory Manager Server is Running')
    })


    // user
    app.post('/users', async (req, res) => {
        const user = req.body;
        const query = {email: user.email};
        try{
            const existingUser = await usersCollection.findOne(query);
            if(existingUser){
                return res.send({success: false, message: 'User already exists'})
            }
        }
        catch(error){
            res.status(500).send({success: false, message: 'Failed to save user', error: error.message})
        }
    })


    // models post
    app.post('/models', async(req, res) => {
        const newModel = req.body;
        newModel.createAt = new Date();
        newModel.purchased = 0;
        try{
            const result = await modelsCollection.insertOne(newModel);
            res.status(201).send({
                success: true,
                message: 'AI model added successfully',
                insertedId: result.insertedId
            });
        }
        catch(error){
            res.status(500).send({
                success: false,
                message: 'Failed to add model',
                error: error.message
            })
        }
    });


    // models get
    app.get('/models', async(req, res) => {
        try{
            const models = await modelsCollection.find().toArray();
            res.send(models)
        }
        catch (error) {
            res.status(500).send({ message: 'Failed to fetch all models', error: error.message })
        }
    })


    // models/:id /get
    app.get('/models/:id', async (req, res) => {
        const id = req.params.id;
        try{
            const model = await modelsCollection.findOne({_id: new ObjectId(id) });
            if(model){
                res.send(model);
            }
            else{
                res.status(404).send({message: 'Model not found'})
            }
        }
        catch(error){
            res.status(500).send({ message: 'Failed to fetch model details', error: error.message });
        }
    })



    // models/id put
    app.put('/models/:id', async (req, res) => {
        const id = req.params.id;
        const updatedModel = req.body;
        const creatorEmail = updatedModel.createdBy;

        const existingModel = await modelsCollection.findOne({_id: new ObjectId(id)});
        if(existingModel && existingModel.createdBy !== creatorEmail){
            return res.status(403).send({success: false, message: 'Access denied: you can only update your own models'})
        }

        delete updatedModel._id;
        delete updatedModel.createdBy;
        delete updatedModel.createAt;
        delete updatedModel.purchased;


        const filter = {_id: new ObjectId(id)};
        const updateDoc = {$set: updatedModel};

        try{
            const result = await modelsCollection.updateOne(filter, updateDoc);
            if(result.matchedCount === 0){
                return res.status(404).send({ success: false, message: 'Model not found' });
            }
            res.send({ success: true, message: 'AI Model updated successfully' });
        }
        catch(error){
            res.status(500).send({ success: false, message: 'Failed to update model', error: error.message });
        }
    })





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`AI Model Inventory Manager server listening on port ${port}`)
})