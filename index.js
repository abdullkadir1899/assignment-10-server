const express = require('express');
const cors = require('cors');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;


// middleware
app.use(cors())
app.use(express.json())

//  URI 

// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

app.get('/', (req, res) => {
    res.send('Ai Model Inventory Manager Server is Running')
})


app.listen(port, () => {
    console.log(`AI Model Inventory Manager server listening on port ${port}`)
})