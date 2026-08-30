const mongoose = require("mongoose")
const dns = require("dns")

dns.setServers(["8.8.8.8", "8.8.4.4"])

async function connectDb(params) {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to Database")
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = connectDb