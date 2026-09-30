CREATE DATABASE IF NOT EXISTS assetflow_ti;
USE assetflow_ti;

CREATE TABLE IF NOT EXISTS equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  empleado VARCHAR(100),
  fecha_prestamo DATE,
  fecha_limite DATE,
  estado ENUM('disponible', 'prestado') DEFAULT 'disponible'
);

INSERT INTO equipos (nombre) VALUES ('Dell Latitude 5420'), ('HP ProBook 440');