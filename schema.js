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
  date: Sequelize.STRING,
  content: Sequelize.STRING,
  author: Sequelize.STRING
});

const Author = sequelize.define('author', {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  age: Sequelize.INTEGER,
});

Author.sync();
Post.sync();

const AuthorQL = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    _id: {type: new GraphQLNonNull(GraphQLInt)},
    author: {type: new GraphQLNonNull(GraphQLInt)},
    age: {type: new GraphQLNonNull(GraphQLString)}
  })
});


const PostQL = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    _id: {type: new GraphQLNonNull(GraphQLInt)},
    title: {type: new GraphQLNonNull(GraphQLString)},
    date: {type: new GraphQLNonNull(GraphQLString)},
    content: {type: new GraphQLNonNull(GraphQLString)},
    author: {type: new GraphQLNonNull(GraphQLString)},
  })
});

const Query = new GraphQLObjectType({
  name: 'RootQueries',
  fields: () => ({
    getPostById: {
      type: PostQL,
      args: {
        _id: {type: new GraphQLNonNull(GraphQLInt)},
      },
      resolve(rootValue, args, request) {
        const search = Object.assign({}, args);
        return Post.findOne({where : search});
      }
    },
    getPostByTitle: {
      type: PostQL,
      args: {
        title: {type: new GraphQLNonNull(GraphQLString)},
      },
      resolve(rootValue, args, request) {
        const search = Object.assign({}, args);
        return Post.findOne({where : search});
      }
    },
    getPostsByAuthor: {
      type: new GraphQLList(PostQL),
      args: {
        author: {type: new GraphQLNonNull(GraphQLString)},
      },
      resolve(rootValue, args, request) {
        const search = Object.assign({}, args);
        // console.log(search);
        return Post.findAll({where : search});
      }
    },
    getAllPosts: {
      type: new GraphQLList(PostQL),
      args : {
        count : {type: GraphQLInt}
      },
      resolve(rootValue, args, request) {
        return Post.findAll({});
      }
    }
  })
});

const Mutation = new GraphQLObjectType({
  name: 'MutationQL',
  fields: {
    createPost: {
      type: PostQL,
      args: {
        title: {type: new GraphQLNonNull(GraphQLString)},
        content: {type: new GraphQLNonNull(GraphQLString)},
        author: {type: new GraphQLNonNull(GraphQLString)},
        date: {type: new GraphQLNonNull(GraphQLString)}
      },
      resolve: (source, args) => {
        let post = Object.assign({}, args);
        return Post.create(post);
      }
    }
  }
});

const Schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});

module.exports = {Schema};
