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




    


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`AI Model Inventory Manager server listening on port ${port}`)
})