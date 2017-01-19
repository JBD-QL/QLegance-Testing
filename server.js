const express = require('express');
const graphqlHTTP = require('express-graphql');
const mysql = require('promise-mysql');
const path = require('path');
//const schema = require('./schema.js');
const bodyParser = require('body-parser');
import {User, Schema} from './schema.js';
import {graphql} from 'graphql';

const app = express();

app.use(bodyParser());
app.use(express.static(path.join(__dirname + '/src')));

// app.use('/graphql', (req, res) => {
//     console.log('doing server stuff', req.body);
//     res.end()
// });

app.use('/graphql', graphqlHTTP ((req) => ({
  schema: Schema,
  rootValue: 'rootValue',
  graphiql: true
})));

app.listen(8080, () => {
  console.log('... graphql listening on 8080');
});
