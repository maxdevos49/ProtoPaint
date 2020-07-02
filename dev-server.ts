import http from "http";
import express from "express";
import ip from "ip";
import path from "path";

const app: express.Application = express();
const server: http.Server = http.createServer(app);

process.title = "ProtoPaint Development Server";//does nothing.... i think

app.use(express.static(path.resolve() + "/src"));

app.use((_, res) => {
    res.redirect("/index.html");
})

server.listen(process.env.PORT || 8080, function () {
    console.log(`Project running at ${ip.address()}:${process.env.PORT || 8080}`);
});