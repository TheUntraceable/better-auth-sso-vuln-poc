import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import morgan from "morgan";

const app = express();
app.use(morgan('dev'))
const port = 3000;

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});