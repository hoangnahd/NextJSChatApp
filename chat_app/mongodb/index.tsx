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
            mongoose.connect(process.env.MONGODB_URL, {
                dbName: "Cluster0",
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            isConnected = true;
            console.log("DB is already connected");
        }
    } catch (e) {
        console.log("Error:"+e);
    }  
    
}