import { MongoClient } from "mongodb";

const uri=process.env.MONGODB_URI;
const client=new MongoClient(uri);

export async function connectDB() {
    try{
        await client.connect;
        return "Database Connected Successfully"; 
    }
    catch(error){
        return "Database connection failed: "+error.message;
    }
    finally{
        await client.close();
    }
}