const express = require("express");
const bodyParser = require("body-parser");
const webhookHandler = require("./webhookHandler");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.post("/webhook", webhookHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
