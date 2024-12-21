import mongoose from 'mongoose'
const MAX_RETRIES =3
const RETRY_INTERVAL=5000 //5 Seconds
class DatabaseConnection{
    constructor(){
        this.retryCount=0
        this.isConnected=false
        mongoose.set('strictQuery',true)
        mongoose.connection.on("connected", () => {
            console.log("connected")
            this.isConnected=true
        });
        mongoose.connection.on("disconnected", () =>{
            console.log("disconnected")
            this.isConnected=false
            this.handleDisconnection()
        }
        );
        mongoose.connection.on("disconnecting", () =>
          console.log("disconnecting")
        );
        // mongoose.connection.on("close", () => console.log("close"));
        mongoose.connection.on("error", () =>{
            console.log("MONGODB connection error")
            this.isConnected=false
        });
        process.on('SIGTERM', this.handleAppTermination.bind(this))
    }
    async connect(){
        try {
            if(!process.env.MONGO_URI)
                throw new Error("MongoDB URI is not defined in env variables")
            const connectionOptions={
                useNewUrlParse:true,
                useUnifiedTopology:true,
                maxPoolSize:10,
                serverSelectionTimeoutMS:5000,
                socketTimeoutMS:45000,
                family:4
            }
            if(process.env.NODE_ENV==='development'){
                mongoose.set('debug',true)
            }
            await mongoose.connect(MONGO_URI,connectionOptions);
            this.retryCount=0
        } catch (error) {
            console.log(error.message)
            await this.handleConnectionError()
        }
    }
    async handleConnectionError(){
        if(this.retryCount<MAX_RETRIES){
            this.retryCount++
            console.log(
              `Retrying connection attempt ${this.retryCount} times of ${MAX_RETRIES}`
            );
            await new Promise((resolve, reject) =>setTimeout(()=>{
                resolve
            },MAX_RETRIES))
            return this.connect()
        }else{
            console.error(`Failed to connect to MONGODB after ${MAX_RETRIES} attempt`)
            process.exit(1)
        }
    }
    async handleDisconnection(){
        if(!this.isConnected){
            console.log(`Attempting to reconnect to mongoDB..`);
            this.connect()
        }
    }

    async handleAppTermination(){
        try{
            await mongoose.connection.close()
            console.log(`MongoDB app closed through app termination`);
            process.exit(0)
        }catch(err){
            console.error(`Error during database disconnection`);
            process.exit(1)
        }
    }
    getConnectionStatus(){
        return {
            isConnected:this.isConnected,
            readyState:mongoose.connection.readyState,
            host:mongoose.connection.host,
            name:mongoose.connection.name
        }
    }
}
const dbConnection=new DatabaseConnection()
export default dbConnection.connect.bind(dbConnection)
export const DBStatus=dbConnection.getConnectionStatus.bind(dbConnection)