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


app.get('/', (req, res) => {
    res.send('Ai Model Inventory Manager Server is Running')
})

async function run() {
  try {
    await client.connect();




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);





app.listen(port, () => {
    console.log(`AI Model Inventory Manager server listening on port ${port}`)
})