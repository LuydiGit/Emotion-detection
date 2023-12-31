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
      res.status(500).json({ success: false }); // Internal Server Error
      return;
    }
    console.log("Cadastro realizado com sucesso!");
    res.status(200).json({ success: true }); // OK
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
          res.status(500).json({ success: false }); // Internal Server Error
          return;
      }

      // Verificar se há um usuário correspondente
      if (result.length > 0) {
          const user = result[0];
          console.log(`Usuário logado: ${user.name}`);
          res.status(200).json({ success: true, user: user }); // OK
      } else {
          res.status(401).json({ success: false }); // Unauthorized
      }
  });
});

// Rota para consultar emoções no banco de dados
app.post("/consultarEmotions", (req, res) => {
  const { userid } = req.body;

  // Consultar o banco de dados para verificar as credenciais
  const sql = "SELECT * FROM emotion WHERE user_id=?";
  db.query(sql, [userid], (err, result) => {
    if (err) {
      console.error("Erro na consulta ao banco de dados:", err);
      res.status(500).json({ success: false }); // Internal Server Error
      return;
    }

    // Verificar se há um usuário correspondente
    if (result.length > 0) {
      const emotion = result[0];
      res.status(200).json({ success: true, emotion: result }); // OK
      console.log(result);
    } else {
      res.status(404).json({ success: false }); // Not Found
    }
  });
});

// Rota para salvar emoções no banco de dados
app.post("/saveEmotions", (req, res) => {
  const { timestamp, emotion, user_id } = req.body;

  const sql = "INSERT INTO emotion (timestamp, emocao, user_id) VALUES (?, ?, ?)";
  db.query(sql, [timestamp, emotion, user_id], (err, result) => {
    if (err) {
      console.error("Erro na inserção no banco de dados:", err);
      res.status(500).json({ success: false }); // Internal Server Error
      return;
    }
    console.log("Emoção salva no banco de dados com sucesso!");
    res.status(200).json({ success: true }); // OK
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
