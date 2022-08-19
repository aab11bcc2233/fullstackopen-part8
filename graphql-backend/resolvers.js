const config = require("./utils/config");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const Author = require("./model/author");
const Book = require("./model/book");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const findAuthor = async (name) => {
  const v = await Author.findOne({ name: name });
  // console.log("authorInDb:", v);
  return v;
};



const resolvers = {

  Mutation: {
    async createUser(root, args) {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre,
      });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidateArgs: args,
        });
      });
    },
    async login(root, args) {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, config.JWT_SECRET) };
    },
    async addBook(root, args, context) {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      console.log("addBook args:", args);

      let isCreatedAuthor = false;
      let author = await findAuthor(args.author);
      if (!author) {
        author = new Author({ name: args.author });
        try {
          await author.save();
          isCreatedAuthor = true;
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidateArgs: args,
          });
        }
      }

      const book = new Book({ ...args, author: author._id });
      try {
        await book.save();

        author.books = author.books.concat(book._id)
        await author.save()
      } catch (error) {
        if (isCreatedAuthor) {
          await author.deleteOne();
        }
        throw new UserInputError(error.message, {
          invalidateArgs: args,
        });
      }
      book.author = author;
      console.log("create book:", book);
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
      return book;
    },
    async editAuthor(root, args, context) {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const author = await findAuthor(args.name);
      if (!author) {
        return null;
      }

      author.born = args.setBornTo;

      await author.save();

      return author;
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"])
    }
  },
  Query: {
    me: (root, args, context) => {
      return context.currentUser;
    },
    authorCount: async () => Author.collection.countDocuments(),
    bookCount: async () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const authorInDb = await findAuthor(args.author);
        if (authorInDb == null) {
          return [];
        }

        const books = await Book.find({
          author: authorInDb._id,
          genres: { $in: [args.genre] },
        }).populate("author");
        return books;
      }

      if (args.author) {
        const authorInDb = await findAuthor(args.author);
        if (authorInDb == null) {
          return [];
        }

        const books = await Book.find({
          author: authorInDb._id,
        }).populate("author");
        return books;
      }

      if (args.genre) {
        const books = await Book.find({
          genres: { $in: [args.genre] },
        }).populate("author");
        console.log(`books by genres (${args.genre}):`, books);
        return books;
      }

      const books = await Book.find({}).populate("author");
      return books;
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      return authors;
    },
  },
  Author: {
    bookCount: async (root) => {
      // const author = await findAuthor(root.name);
      // if (!author) {
      //   return -1;
      // }

      // const books = await Book.find({ author: author._id });
      // return books.length;

      return root.books ? root.books.length : 0;
    },
  },
  Book: {
    // author: async (root) => {
    //   return Author.findById(root.author)
    // }
  },
};

module.exports = resolvers;
