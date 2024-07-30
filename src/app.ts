import express from "express";
import sequelize from "./config/database";
import "reflect-metadata";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("データベースの接続に成功したよ！！");
    app.listen(port, () => {
      console.log(`サーバーはhttp://localhost:${port}で起動中！`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
