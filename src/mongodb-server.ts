import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create();

const uri = mongod.getUri();

console.log("MongoDB in-memory server is running at:", uri);