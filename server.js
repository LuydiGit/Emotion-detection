const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "emotiondetection",
});

db.connect((err) => {
  if (err) {
    console.error("Erro na conexão com o banco de dados:", err);
    return;
  }
  console.log("Conectado ao banco de dados MySQL");
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error("Erro na inserção no banco de dados:", err);
      res.json({ success: false });
      return;
    }
    console.log("Cadastro realizado com sucesso!");
    res.json({ success: true });
  });
});

// Rota de login
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  // Consultar o banco de dados para verificar as credenciais
  const sql = "SELECT * FROM user WHERE name = ? AND password = ?";
  db.query(sql, [name, password], (err, result) => {
      if (err) {
          console.error("Erro na consulta ao banco de dados:", err);
          res.json({ success: false });
          return;
      }

      // Verificar se há um usuário correspondente
      if (result.length > 0) {
          const user = result[0];
          console.log(`Usuário logado: ${user.name}`);
          res.json({ success: true, user: user });
      } else {
          res.json({ success: false });
      }
  });



// Rota para salvar emoções no banco de dados
app.post("/saveEmotions", (req, res) => {
    const { timestamp, emotion } = req.body;
  
    const sql = "INSERT INTO emotion (timestamp, emocao) VALUES (?, ?)";
    db.query(sql, [timestamp, emotion], (err, result) => {
      if (err) {
        console.error("Erro na inserção no banco de dados:", err);
        res.json({ success: false });
        return;
      }
      console.log("Emoção salva no banco de dados com sucesso!");
      res.json({ success: true });
    });
});
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
