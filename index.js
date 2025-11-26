const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
var cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const port = 5000;

// MIDDLEWEAR
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8xsgmgv.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const myDB = client.db("skillflow");
    const courseCollection = myDB.collection("courses");
    const userCollection = myDB.collection("users");

    // course related APIS
    app.get("/courses", async (req, res) => {
      try {
        const type = req.query.type;
        let query = {};
        const { email } = req.query;
        if (email) {
          query.email = email;
        }
        if (type) {
          query.type = { $regex: new RegExp(type, "i") };
        }

        const result = await courseCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    app.get("/courses/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log("Requested ID:", id);

        const query = { _id: new ObjectId(id) };
        const result = await courseCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Course not found" });
        }

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
      }
    });

    app.post("/courses", async (req, res) => {
      const courseInfo = req.body;
      const result = await courseCollection.insertOne(courseInfo);
      res.send(result);
    });

    // user releated APIS
    app.post("/users", async (req, res) => {
      const userInfo = req.body;
      const existingUser = await userCollection.findOne({
        email: userInfo.email,
      });
      if (existingUser) {
        return res
          .status(400)
          .send({ message: "User with this email already exists" });
      }
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
