const express = require('express');
const graphqlHTTP = require('express-graphql');
const Sequelize = require('sequelize');
const mysql = require('promise-mysql');
const path = require('path');
const schema = require('./schema.js');
const bodyParser = require('body-parser');

const sequelize = new Sequelize('graph', 'root', '2323');

const app = express();

app.use(bodyParser());
app.use(express.static(path.join(__dirname + '/src')));
app.use('/graphql', graphqlHTTP ((req) => ({
  schema: schema,
  graphiql: true
})));


app.get('/test', (req, res) => {
  console.log('yess!!!');
});

app.listen(8080, () => {
  console.log('... graphql listening on 8080');
})
