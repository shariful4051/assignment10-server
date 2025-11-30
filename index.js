const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const app = express()
const port =process.env.PORT|| 3000
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tn7v7f9.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('study mate server is running')
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db('studyMate')
    const allpartnersCollection = db.collection('allpartners')
    const myConnectionsCollection = db.collection('myconnection')

//---------------all partners api-----------
    app.get('/allpartners',async(req,res)=>{
        const cursor = allpartnersCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })
    
    app.get('/allpartners/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await allpartnersCollection.findOne(query);
      res.send(result)
    })

    app.get('/highRating',async(req,res)=>{
      const cursor= allpartnersCollection.find().sort({rating:-1}).limit(3)
      const result = await cursor.toArray()
        res.send(result)
      
    })
    app.post('/allpartners',async(req,res)=>{
      const profile = req.body;
      const result = await allpartnersCollection.insertOne(profile)
      res.send(result)
    })

   //----------- myconnection api---------

   app.get('/myconnection',async(req,res)=>{
    const email = req.query.email;
    
    const query={}
    if(email){
      query.myEmail=email;
    }
   
    
    const cursor = myConnectionsCollection.find(query)
    const result = await cursor.toArray()
    res.send(result)
   })

   app.post('/myconnection/:id',async(req,res)=>{
      const partner = req.body;
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
       const update = {
      $inc:{
       
        patnerCount:1
      }
    }
    const patnerCount =await allpartnersCollection.updateOne(query,update)
      const result = await myConnectionsCollection.insertOne(partner)
      res.send(result,patnerCount)
    })

    app.delete('/myconnection/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:new ObjectId(id)}
      const result = await myConnectionsCollection.deleteOne(query)
      res.send(result)
    })

    app.patch('/myconnection/:id',async(req,res)=>{
      const id = req.params.id;
      const data = req.body;
      console.log('from pudate',data,id);
      const query = {_id:new ObjectId(id)}
      const update = {
        $set:data
        
      }
      const result = await myConnectionsCollection.updateOne(query,update)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
