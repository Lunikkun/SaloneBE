import koa from "koa";
const app = new koa();
app.listen(process.env.SERVER_PORT, () => {
    console.log("Server avviato");
    let u = { id: "12124", nome: "aaa", cognome: "ccc", mail: "aa", password: "aa" };
});
