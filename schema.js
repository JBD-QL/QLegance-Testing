import {
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLSchema,
  graphql
} from 'graphql';

const Query = new GraphQLObjectType({
  name: 'RootQueries',
  fields: () => ({
    echo: {
      type: GraphQLString,
      // args: {
      //   message: {type: GraphQLString}
      // },
      resolve(rootValue) {
        return `received  message`;
      }
    }
  })
});

const Schema = new GraphQLSchema({
  query: Query
});

module.exports = Schema;

// let query = `
//   query getEcho($inputMessage: String!) {
//     receivedMessage: echo(message: $inputMessage)
//   }
// `;
//
// graphql(Schema, query, null, null,{inputMessage: "Hello"}).then(function(result) {
//   console.log(result);
// });
