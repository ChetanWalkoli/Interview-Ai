const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

require("dotenv").config();
const app = require("./src/app");
const connectDb = require("./src/config/database");

connectDb();

app.listen(3000, () => {
    console.log("server is running on port 3000");
});
