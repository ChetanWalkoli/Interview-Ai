const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

require("dotenv").config();
const app = require("./src/app");
const connectDb = require("./src/config/database");

connectDb();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
