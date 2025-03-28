import express, { Express, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "dotenv";
import { handleSockets } from "./sockets";

config();
const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

app.get("/", (req, res) => { res.send("El Chat funca") });

handleSockets(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Servidor configurado en ${ PORT }'));