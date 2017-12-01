var con = require('../lib/conexionbd');

//Obtiene todas las competencias
function obtenerCompetencias(req, res){
  var sql = "SELECT  * FROM competencia;"
  con.query(sql, function(error, resultado, fields){
    if (error) {
        return res.status(404).send("Hubo un error en la consulta");
    }
    var response = {
      'competencias': resultado
    }
    res.send(JSON.stringify(response));
  });
}

// Obtiene dos peliculas aleatorias para poder enfrentarlas en una competencias
function obtenerDosPeliculas(req, res){
  var id = req.params.id;

  // Verifica que haya una competencia válida con el id dado como parámetro
  var sql = "SELECT  * FROM competencia WHERE ID = " + id + ";";
  con.query(sql, function(error, resultado, fields){
    if (error) {
        return res.status(404).send("Hubo un error en la consulta");
    }

    var sql2 = "SELECT * FROM pelicula ORDER BY RAND() LIMIT 2;";
    con.query(sql2, function(error, respuesta, fields){
      if (error) {
          return res.status(404).send("Hubo un error en la consulta");
      }

      var response = {
        'competencia': resultado[0]
      }

      response.peliculas = respuesta;
      res.send(JSON.stringify(response));
    });
  });
}

function votarPelicula(req, res){
  var nuevo_voto = req.body;
  var idPelicula = nuevo_voto.idPelicula;
  var idCompetencia = req.params.id;

  var sql = "INSERT INTO voto(competencia_id, pelicula_id) VALUES (" + idCompetencia + "," + idPelicula + ");";
  con.query(sql, function(error, respuesta, fields){
    if (error) {
      return res.status(404).send("Hubo un error en la consulta");
    }

    res.json(respuesta.insertId);

  })
}

// Obtiene las 3 competencias más votadas
function obtenerResultados(req, res){
  var idCompetencia = req.params.id;

  var sql = "SELECT nombre FROM competencia WHERE id = " + idCompetencia + ";";
  con.query(sql, function(error, resultado, fields){
    if (error) {
      return res.status(400).send("Hubo un error en la consulta");
    }

    var sql2 = "SELECT  pelicula.id, pelicula.titulo, pelicula.poster, COUNT(*) AS cantidad_votos FROM voto JOIN" +
            " competencia ON competencia.id = competencia_id JOIN pelicula ON pelicula.id = pelicula_id " +
            " WHERE competencia_id = " + idCompetencia + " GROUP BY competencia_id, pelicula_id ORDER BY cantidad_votos DESC LIMIT 3";
    con.query(sql2, function(error, respuesta, fields){
      if (error) {
        return res.status(404).send("Hubo un error en la consulta");
      }

      var response = {
        'lasTresMasVotadas': resultado[0]
      }
      response.lasTresMasVotadas.peliculas = respuesta;

      res.send(JSON.stringify(response));
    });
  });
}


module.exports = {
  obtenerCompetencias: obtenerCompetencias,
  obtenerDosPeliculas: obtenerDosPeliculas,
  votarPelicula: votarPelicula,
  obtenerResultados: obtenerResultados
};
