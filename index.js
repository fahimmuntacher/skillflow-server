const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
var cors = require('cors')
const dotenv = require("dotenv")
dotenv.config()
const port = 5000

// MIDDLEWEAR
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8xsgmgv.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const myDB = client.db("skillflow");
    const courseCollection = myDB.collection("courses");

   app.get("/courses", async (req, res) => {
  try {
    const type = req.query.type;
    let query = {};

    if (type) {
      query.type = { $regex: new RegExp(type, "i") };  
    }

    const result = await courseCollection.find(query).toArray();
    res.send(result);

  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})