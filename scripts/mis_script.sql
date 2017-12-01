CREATE TABLE competencia (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL
);

INSERT INTO competencia VALUES (1,'¿Cuál es la mejor película?'),(2,'¿Cuál tiene mejores efectos especiales?'),(3,'¿Cuál tiene mejor actor de reparto?');


CREATE TABLE voto (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    competencia_id INT NOT NULL,
    pelicula_id INT(11) UNSIGNED  NOT NULL,
    FOREIGN KEY (competencia_id) REFERENCES competencia(id),
    FOREIGN KEY (pelicula_id) REFERENCES pelicula(id)
);
