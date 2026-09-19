USE active_age;

INSERT INTO
  usuarios (nome, email, senha, tipo_usuario)
VALUES
  (
    'Sr. Antônio (Paciente)',
    'antonio@email.com',
    '123456',
    'PACIENTE'
  );

SET
  @antonio_id = LAST_INSERT_ID();

INSERT INTO
  pacientes (usuario_id, data_nascimento)
VALUES
  (@antonio_id, '1955-05-12');

INSERT INTO
  usuarios (nome, email, senha, tipo_usuario)
VALUES
  (
    'Dra. Ada Lovelace',
    'ada@activeage.com',
    '123456',
    'MEDICO'
  );

SET
  @ada_id = LAST_INSERT_ID();

INSERT INTO
  medicos (usuario_id, crm, especialidade)
VALUES
  (@ada_id, 'CRM-1815', 'Neurologia');

INSERT INTO
  usuarios (nome, email, senha, tipo_usuario)
VALUES
  (
    'Dr. Alan Turing',
    'alan@activeage.com',
    '123456',
    'MEDICO'
  );

SET
  @alan_id = LAST_INSERT_ID();

INSERT INTO
  medicos (usuario_id, crm, especialidade)
VALUES
  (@alan_id, 'CRM-1912', 'Cardiologia');

INSERT INTO
  usuarios (nome, email, senha, tipo_usuario)
VALUES
  (
    'Dr. Linus Torvalds',
    'linus@activeage.com',
    '123456',
    'MEDICO'
  );

SET
  @linus_id = LAST_INSERT_ID();

INSERT INTO
  medicos (usuario_id, crm, especialidade)
VALUES
  (@linus_id, 'CRM-1991', 'Geriatria Geral');