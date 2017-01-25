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

const Sequelize = require('sequelize');
const sequelize = new Sequelize('graph', 'root', '2323');

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  alt: Sequelize.STRING,
  password: Sequelize.STRING
});

User.sync();

// const GlobalId = new GraphQLObjectType({
//   name: 'GlobalId',
//   fields: () => ({
//     globalId: {type: new GraphQLNonNull(GraphQLString)},
//     query: {type: new GraphQLNonNull(GraphQLString)}
//   });
// });


const UserQL = new GraphQLObjectType({
  name: 'UserQL',
  fields: () => ({
    username: {type: new GraphQLNonNull(GraphQLString)},
    alt: {type: new GraphQLNonNull(GraphQLString)},
    password: {type: new GraphQLNonNull(GraphQLString)}
  })
});

const Query = new GraphQLObjectType({
  name: 'RootQueries',
  fields: () => ({
    greeting: {
      type: UserQL,
      args: {},
      resolve(parentValue, args, request) {
        return User.findOne({});
      },
    },
    allUsers: {
      type: new GraphQLList(UserQL),
      args: {},
      resolve(parentValue, args, request){
        return User.findAll({});
      }
    },
    getUser: {
      type: UserQL,
      args: {
        username: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve(parentValue, args, request){
        let user = Object.assign({}, args);
        return User.findOne({where: user});
      }
    }
  })
});

const Mutation = new GraphQLObjectType({
  name: 'MutationQL',
  fields: {
    create: {
      type: UserQL,
      args: {
        username: {type: new GraphQLNonNull(GraphQLString)},
        alt: {type: new GraphQLNonNull(GraphQLString)},
        password: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve: (source, args) => {
        let user = Object.assign({}, args);
        return User.create(user);
      }
    }
  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

module.exports = {Schema};
