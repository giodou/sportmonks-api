const db = require("../db")

function insertObj(obj, collection) {
    try {
        const database = db.get();
        const dbCollection = database.collection(collection);
        dbCollection.insertOne(obj);
    } catch (err) {
        throw err;
    }
}

function replaceObj(query, obj, collection) {
    try {
        const database = db.get();
        const dbCollection = database.collection(collection);

        const options = { upsert: true };
        dbCollection.updateOne(query, obj, options);
    } catch (err) {
        throw err;
    }
}


module.exports = { insertObj, replaceObj }
