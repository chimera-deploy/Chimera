require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const HOST = "0.0.0.0";
const PORT = process.env.PORT || "9080";
const BACKENDS = JSON.parse(process.env.BACKENDS || JSON.stringify(["localhost:8080"]));

app.use(cors());
app.use(express.json());

const randomIntOfMinMax = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const handler = async (req, res) => {
  const i = randomIntOfMinMax(0, BACKENDS.length - 1);
  const backend = BACKENDS[i];
  let resp;
  try {
    console.log(`sending request to ${backend}`);
    resp = await axios.get(`http://${backend}`);
  } catch (err) {
    console.log(`recevied ${err} from ${backend}`);
    res
      .status(500)
      .json(err);
    return
  }
  console.log(`received ${JSON.stringify(resp.data)} from ${backend}`);
  res
    .status(200)
    .json({ ...resp.data, version: 3 });
};

app.get("/", handler);

app.listen(Number(PORT), HOST, () => console.log(`listening on ${HOST} at ${PORT}`));
