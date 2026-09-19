import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "active_age",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("📦 Conectado ao MySQL com sucesso!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no MySQL:", err);
  });

export default pool;
