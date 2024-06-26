const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

// Conexão DB
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

//Requisição para puxar dados dos pacientes 
app.get("/getPatients", (req, res) => {
  const sql = "SELECT * FROM patient";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro ao consultar pacientes no banco de dados:", err);
      res.status(500).json({ success: false }); // Internal Server Error
      return;
    }
    console.log("Pacientes consultados com sucesso!");
    res.status(200).json({ success: true, patients: results }); // OK
  });
});

//Requisição Cadastro de usuário "Piscicologo"
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

app.get("/getPatient/:id", (req, res) => {
  const sql = "SELECT * FROM patient WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Erro na consulta ao banco de dados:", err);
      res.status(500).json({ success: false });
      return;
    }
    if (result.length > 0) {
      res.status(200).json({ success: true, patient: result[0] });
    } else {
      res.status(404).json({ success: false });
    }
  });
});


// Rota para adicionar pacientes no banco de dados
app.post("/patientRegister", (req, res) => {
  const { name, email, date_of_birth, psychologistId } = req.body;

  const sql = "INSERT INTO patient (name, email, date_of_birth, id_psychologist) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, date_of_birth, psychologistId], (err, result) => {
      if (err) {
          console.error("Erro na inserção no banco de dados:", err);
          res.status(500).json({ success: false });
          return;
      }
      console.log("Cadastro realizado com sucesso!");
      res.status(200).json({ success: true });
  });
});


/*
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
*/

// Rota para consultar emoções no banco de dados de um paciente específico
app.post("/consultarEmotions", (req, res) => {
  const { patientId } = req.body;

  // Consultar emoções do paciente com o ID correspondente
  const sql = "SELECT * FROM emotion WHERE patient_id = ?";
  db.query(sql, [patientId], (err, result) => {
    if (err) {
      console.error("Erro na consulta ao banco de dados:", err);
      res.status(500).json({ success: false }); // Internal Server Error
      return;
    }

    if (result.length > 0) {
      res.status(200).json({ success: true, emotion: result }); // OK
    } else {
      res.status(404).json({ success: false }); // Not Found
    }
  });
});

// Rota para salvar emoções no banco de dados
app.post("/saveEmotions", (req, res) => {
  const { timestamp, emotion, patient_id } = req.body; // Use `patient_id`

  const sql = "INSERT INTO emotion (timestamp, emocao, patient_id) VALUES (?, ?, ?)";
  db.query(sql, [timestamp, emotion, patient_id], (err, result) => {
    if (err) {
      console.error("Erro na inserção no banco de dados:", err);
      res.status(500).json({ success: false });
      return;
    }
    console.log("Emoção salva no banco de dados com sucesso!");
    res.status(200).json({ success: true });
  });
});

app.delete("/deletePatient/:id", (req, res) => {
  const patientId = req.params.id;

  const sql = "DELETE FROM patient WHERE id = ?";
  db.query(sql, [patientId], (err, result) => {
      if (err) {
          console.error("Erro ao excluir paciente do banco de dados:", err);
          res.status(500).json({ success: false }); // Internal Server Error
          return;
      }
      console.log("Paciente excluído com sucesso!");
      res.status(200).json({ success: true }); // OK
  });
});

app.put("/updatePatient/:id", (req, res) => {
  const { name, email, date_of_birth } = req.body;
  const { id } = req.params;

  const sql = "UPDATE patient SET name = ?, email = ?, date_of_birth = ? WHERE id = ?";
  db.query(sql, [name, email, date_of_birth, id], (err, result) => {
      if (err) {
          console.error("Erro na atualização do banco de dados:", err);
          res.status(500).json({ success: false });
          return;
      }
      console.log("Atualização realizada com sucesso!");
      res.status(200).json({ success: true });
  });
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

