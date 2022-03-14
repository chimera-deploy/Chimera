require("dotenv").config();
const app = require("express")();
const cors = require("cors");
const HOST = "0.0.0.0";
const PORT = process.env.PORT || "8080";
const RESPONSES = JSON.parse(process.env.RESPONSES || JSON.stringify(["Mirror (Tarkovsky)"]));

app.use(cors());

const randomIntOfMinMax = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const handler = (req, res) => {
  const i = randomIntOfMinMax(0, RESPONSES.length - 1);
  res
    .status(200)
    .json({movie: RESPONSES[i]});
};

app.get("/", handler);

app.listen(Number(PORT), HOST, () => console.log(`listening on ${HOST} at ${PORT}`));
