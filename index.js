const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;


const allowedOrigins = [
    'http://localhost:5173', 
    'https://YOUR-FRONTEND-URL.vercel.app' 
];

// middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true 
}));
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.ziilask.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await cachedClient.connect();
    console.log("mongodb connected success");
  }
  cachedDb = cachedClient.db('assignment-10-server');
  return cachedDb;
}

// Optional: Initial ping on startup
async function run() {
  try {
    const db = await connectToDatabase();
    await db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {  
    console.error("MongoDB Connection Error:", error);
  }
}
run().catch(console.dir);

// Root route (global, no DB needed)
app.get('/', (req, res) => {
    res.send('Ai Model Inventory Manager Server is Running')
})

// User POST
app.post('/users', async (req, res) => {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = req.body;
    const query = {email: user.email};
    try{
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
            return res.send({success: false, message: 'User already exists'})
        }
        const result = await usersCollection.insertOne(user);
        res.send({success: true, message: 'User saved successfully', insertedId: result.insertedId})
    }
    catch(error){
        res.status(500).send({success: false, message: 'Failed to save user', error: error.message})
    }
})

// Models POST
app.post('/models', async(req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
    const newModel = req.body;
    newModel.createdAt = new Date();  
    newModel.purchased = 0;
    newModel.price = newModel.price || 0; 
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

// Models GET all
app.get('/models', async(req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
    try{
        const models = await modelsCollection.find().toArray();
        res.send(models)
    }
    catch (error) {
        res.status(500).send({ message: 'Failed to fetch all models', error: error.message })
    }
})

// Models GET by ID
app.get('/models/:id', async (req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
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

// Models PUT update
app.put('/models/:id', async (req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
    const id = req.params.id;
    const updatedModel = req.body;
    const creatorEmail = updatedModel.createdBy; // From client body

    const existingModel = await modelsCollection.findOne({_id: new ObjectId(id)});
    if(!existingModel){
        return res.status(404).send({success: false, message: 'Model not found'});
    }
    if(existingModel.createdBy !== creatorEmail){
        return res.status(403).send({success: false, message: 'Access denied: you can only update your own models'})
    }

    delete updatedModel._id;
    delete updatedModel.createdBy;
    delete updatedModel.createdAt;  
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

// Models DELETE
app.delete('/models/:id', async(req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
    const id = req.params.id;
    const { createdBy } = req.body; // From client body

    const existingModel = await modelsCollection.findOne({_id: new ObjectId(id)});
    if(!existingModel){
        return res.status(404).send({success: false, message: "Model not found"});
    }
    if(existingModel.createdBy !== createdBy){
        return res.status(403).send({success: false, message: 'access denied: you can only delete your own models'})
    }

    const query = {_id: new ObjectId(id)};
    
    try{
        const result = await modelsCollection.deleteOne(query);
        if(result.deletedCount === 0){
            return res.status(404).send({success: false, message: "Model not found"})  
        }
        res.send({success: true, message: 'AI Model deleted successfully'})
    }
    catch(error){
        res.status(500).send({success: false, message: 'Failed to delete model', error: error.message})  
    }
})

// My models GET
app.get('/my-models/:email', async(req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
    const email = req.params.email;
    const query = { createdBy: email };
    try{
        const models = await modelsCollection.find(query).toArray();
        res.send(models);
    }
    catch(error){
        res.status(500).send({message: 'Failed to fetch my models', error: error.message})
    }
})

// My purchases GET
app.get('/my-purchases/:email', async(req, res) => {
    const db = await connectToDatabase();
    const purchasedCollection = db.collection('add-data');
    const email = req.params.email;  
    try {
        const purchases = await purchasedCollection.find({ purchasedBy: email }).toArray();  
        res.send(purchases);
    } catch (error) {
        res.status(500).send({ message: 'Failed to fetch my purchases', error: error.message });  
    }
})

// Featured models GET
app.get('/featured-models', async(req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
    try{
        const models = await modelsCollection
        .find()
        .sort({createdAt: -1})  
        .limit(6)
        .toArray();
        res.send(models);
    }
    catch(error){
        res.status(500).send({message: 'Failed to fetch featured models', error: error.message})
    }
})

// Check purchase status POST
app.post('/check-purchase-status', async (req, res) => {
    const db = await connectToDatabase();
    const purchasedCollection = db.collection('add-data');
    const {userEmail, modelId} = req.body;
    try{
        const purchased = await purchasedCollection.findOne({
            purchasedBy: userEmail,
            originalModelId: new ObjectId(modelId)
        })
        res.send({isPurchased: !! purchased});
    }
    catch(error){
        res.status(500).send({isPurchased: false})
    }
})

// NEW: Purchase model POST (with transaction)
app.post('/purchase-model/:id', async (req, res) => {
    const db = await connectToDatabase();
    const modelsCollection = db.collection('data');
    const purchasedCollection = db.collection('add-data');
    const id = req.params.id;
    const { purchaserEmail, purchasedModelData } = req.body;
    const session = cachedClient.startSession();
    try {
        await session.withTransaction(async () => {
            // Insert purchase record
            const purchase = {
                purchasedBy: purchaserEmail,
                originalModelId: new ObjectId(id),
                purchasedModelData: { ...purchasedModelData, creatorEmail: purchasedModelData.createdBy },
                purchasedAt: new Date()
            };
            await purchasedCollection.insertOne(purchase, { session });

            // Increment purchased count in model
            await modelsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { purchased: 1 } },
                { session }
            );
        });
        res.send({ success: true, message: 'Purchase successful' });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).send({ success: false, message: error.message });
    } finally {
        await session.endSession();
    }
});

app.listen(port, () => {
    console.log(`AI Model Inventory Manager server listening on port ${port}`)
})


module.exports = app;