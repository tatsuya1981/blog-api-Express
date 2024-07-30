import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "ok" });
});

app.listen(port, () => {
  console.log(`サーバーはhttp://localhost:${port}で起動中！`);
});
