import http from "http";
import express from "express";
import ip from "ip";

const app: express.Application = express();
const server: http.Server = http.createServer(app);

app.use(express.static(__dirname + "/src"));

app.use((_, res) => {
    res.redirect("/index.html");
})

server.listen(process.env.PORT || 8080, function () {
    console.log(`Project running at ${ip.address()}:${process.env.PORT || 8080}`);
});