CREATE TABLE IF NOT EXISTS horarios_disponiveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medico_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  status ENUM('LIVRE', 'OCUPADO') DEFAULT 'LIVRE',
  FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE,
  UNIQUE KEY (medico_id, data_hora)
);