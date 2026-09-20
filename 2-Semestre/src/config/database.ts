import mysql from "mysql2/promise";

/**
 * Configuração e inicialização do Pool de conexões do MySQL.
 * O pool é responsável por gerenciar a performance e o limite máximo de queries simultâneas.
 */
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
