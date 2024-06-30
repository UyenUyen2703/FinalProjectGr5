//user express and mongodb
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
var cors = require('cors')
//create express app
const app = express();
//use express.json
app.use(express.json());
app.use(cors())

MongoClient.connect('mongodb+srv://admin:admin@cluster0.qmnhw5a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('emerging');
    const collection = db.collection('users');

    app.post('/test', (req, res) => {
      collection.insertOne(req.body)
        .then(result => {
          res.send(result);
        })
        .catch(error => console.error(error));
    });

    app.get('/all', (req, res) => {
      collection.find().toArray()
        .then(result => {
          res.send(result);
        })
        .catch(error => console.error(error));
    })
    // get by id
    app.get('/predict/:id', (req, res) => {
      collection.findOne({ idAuth: req.params.id })
        .then(result => {
          res.send(result);
        })
        .catch(error => console.error(error));
    });

    app.listen(3000, () => {
      console.log('Server is running');
    });
  })
  .catch(error => console.error(error));
