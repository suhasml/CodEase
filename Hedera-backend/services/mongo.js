const { MongoClient } = require('mongodb');

let client;
let db;

async function getDb() {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'codEase';
  if (!uri) throw new Error('MONGODB_URI not set');
  client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  db = client.db(dbName);
  return db;
}

async function getCollection(name) {
  const database = await getDb();
  return database.collection(name);
}

async function close() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}

module.exports = { getDb, getCollection, close };


