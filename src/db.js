const { MongoClient } = require("mongodb");

let connection = null;

function connect() {
  const mongoUri = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}?retryWrites=true&writeConcern=majority`;
  return new Promise((resolve, reject) => {
    MongoClient.connect(mongoUri, function (err, db) {
      if (err) { reject(err); return; };
      resolve(db);
      connection = db;
    });
  });
}

function get() {
  if (!connection) {
    throw new Error('Call connect first!');
  }

  return connection.db(process.env.MONGO_DB_NAME);
}

module.exports = { connect, get }
