import mongoose from "mongoose"

let isConnected = false;

export const connectToDb = async () => {
    try {
        mongoose.set("strictQuery", true)
        if(isConnected) {
            console.log("DB is already connected");
            return
        }
        else {
            const dbUrl = process.env.MONGODB_URL;
            if (!dbUrl) {
                throw new Error("MONGODB_URL is not defined");
            }
    
            await mongoose.connect(dbUrl, {
                dbName: "Cluster0",
            });
            isConnected = true;
            console.log("DB is already connected");
        }
    } catch (e) {
        console.log("Error:"+e);
    }  
    
}