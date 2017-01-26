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

const Post = sequelize.define('post', {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  createdAt: Sequelize.DATE,
  content: Sequelize.STRING,
  author: Sequelize.STRING
});

Post.sync();

// const GlobalId = new GraphQLObjectType({
//   name: 'GlobalId',
//   fields: () => ({
//     globalId: {type: new GraphQLNonNull(GraphQLString)},
//     query: {type: new GraphQLNonNull(GraphQLString)}
//   });
// });


const PostQL = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    _id: {type: new GraphQLNonNull(GraphQLInt)},
    title: {type: new GraphQLNonNull(GraphQLString)},
    createdAt: {type: new GraphQLNonNull(GraphQLString)},
    content: {type: new GraphQLNonNull(GraphQLString)},
    author: {type: new GraphQLNonNull(GraphQLString)},
  })
});

const Query = new GraphQLObjectType({
  name: 'RootQueries',
  fields: () => ({
    getPosts: {
      type: Post,
      args: {
        _id: {type: GraphQLInt},
        title: {type: GraphQLString},
        author: {type: GraphQLString},
        count : {type: GraphQLInt}
      }
      resolve(rootValue, args, request) {
        const search = Object.assign({}, args);
        return PostQL.findAll({ where : search}).slice(0, count);
      }
    },
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
