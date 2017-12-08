var con = require('../conexionbd');

//Obtiene todas las competencias
function obtenerCompetencias(req, res){
  var sql = "SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor" +
            " FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN" +
            " director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id;"
  con.query(sql, function(error, resultado, fields){
    if (error) {
      console.log(error)
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
  var filtro = "";
  var filtroJoin = "";

  // Verifica que haya una competencia válida con el id dado como parámetro
  var sql = "SELECT  * FROM competencia WHERE ID = " + id + ";";
  con.query(sql, function(error, resultado, fields){
    if (error) {
        return res.status(404).send("Hubo un error en la consulta");
    }

    // Se agrega filtro por género si la competencia lo requiere (como todas las películas tienen un género definido no es necesario incorporar un filtroJoin)
    if (resultado[0].genero_id) {
      filtro += " AND genero_id = " + resultado[0].genero_id;
    }

    // Se agrega filtro por director si la competencia lo requiere
    if (resultado[0].director_id) {
      filtroJoin += " JOIN director_pelicula d ON d.pelicula_id= pelicula.id ";
      filtro += " AND director_id = " + resultado[0].director_id;
    }

    //Se agrega filtro por actor si la competencia lo requiere
    if (resultado[0].actor_id) {
      filtroJoin += " JOIN actor_pelicula a ON a.pelicula_id= pelicula.id ";
      filtro += " AND actor_id = " + resultado[0].actor_id;
    }

    var sql2 = "SELECT pelicula.titulo,pelicula.poster,pelicula.id, g.id as genero FROM pelicula " +
                filtroJoin + " JOIN genero g ON g.id = pelicula.genero_id WHERE 1=1 " +
                filtro + " ORDER BY RAND() LIMIT 2;";
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

// Almacena el voto de una película en una competencia
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
      return res.status(404).send("Hubo un error en la consulta");
    }

    var sql2 = "SELECT  pelicula.id, pelicula.titulo, pelicula.poster, COUNT(*) AS cantidad_votos FROM voto JOIN" +
               " competencia ON competencia.id = competencia_id JOIN pelicula ON pelicula.id = pelicula_id " +
               " WHERE competencia_id = " + idCompetencia + " GROUP BY competencia_id, pelicula_id ORDER BY cantidad_votos DESC LIMIT 3";
    con.query(sql2, function(error, respuesta, fields){
      if (error) {
        return res.status(500).send("Hubo un error en la programación");
      }

      var response = {
        'lasTresMasVotadas': resultado[0]
      }
      response.lasTresMasVotadas.peliculas = respuesta;

      res.send(JSON.stringify(response));
    });
  });
}

//Crea una competencia
function crearCompetencia(req, res){
  var nueva_competencia = req.body;
  var nombreCompetencia = nueva_competencia.nombre;
  var filtroValue = "";
  var filtroColumn = "";
  var filtroCriterio = "";

  // Agrego filtros si se envía el parámetro genero
  if (nueva_competencia.genero > 0) {
    filtroValue += ", " + nueva_competencia.genero;
    filtroCriterio += " AND g.id = " + nueva_competencia.genero;
    filtroColumn += ", genero_id ";
  }

  // Agrego filtros si se envía el parámetro director
  if (nueva_competencia.director > 0) {
    filtroValue +=  ",  " + nueva_competencia.director;
    filtroCriterio += " AND d.director_id = " + nueva_competencia.director;
    filtroColumn += ", director_id "
  }

  // Agrego filtros si se envía el parámetro actor
  if (nueva_competencia.actor > 0) {
    filtroValue +=  ",  " + nueva_competencia.actor;
    filtroCriterio += " AND a.actor_id = " + nueva_competencia.actor;
    filtroColumn += ", actor_id "
  }

  //Verifico que no haya una competencia creada con el mismo nombre
  var sql = "SELECT nombre FROM competencia WHERE nombre = '" + nombreCompetencia + "';";
  con.query(sql, function (error, resultado, fields){
    if (error) {
      return res.status(404).send("Hubo un error en la consulta1");
    }
    // En caso de que haya una competencia con el mismo nombre se envía el mensaje de error
    if (resultado.length > 0) {
      return res.status(422).send("Ya hay una competencia creada con ese nombre");
    }

    //Verifico que haya al menos dos peliculas que cumplan con el criterio elegido
    var sql2 = "SELECT pelicula.titulo, d.director_id, a.actor_id, g.id FROM pelicula" +
               " JOIN director_pelicula d ON d.pelicula_id= pelicula.id" +
               " JOIN actor_pelicula a ON a.pelicula_id= pelicula.id " +
               "JOIN genero g ON g.id = pelicula.genero_id WHERE 1=1 " + filtroCriterio + " LIMIT 2;";
    con.query(sql2, function (error, respuesta, fields){
      if (error) {
        return res.status(404).send("Hubo un error en la consulta2");
      }
      // En caso de que no haya al menos dos películas que cumplan con el criterio se envía el mensaje de error
      if (respuesta.length < 2) {
        return res.status(422).send("No hay dos peliculas que cumplan con el criterio para poder crear la competencia");
      }

      // Inserto los datos de la competencia la base de datos
      var sql3 = "INSERT INTO competencia(nombre" + filtroColumn + ") VALUES ('" + nombreCompetencia + "'" + filtroValue + ");";
      con.query(sql3, function(error, respuestaCompetencia, fields){
        if (error) {
          return res.status(404).send("Hubo un error en la query3");
        }

        //Devuelvo como respuesta el id de la competencia creada
        var response = {
            'competenciaInsertId': respuestaCompetencia.insertId
        }
        res.send(JSON.stringify(response));
      });
    });
  });
}

//Obtiene una competencia dado su id
function obtenerCompetencia(req, res){
  var id = req.params.id;

  var sql = "SELECT competencia.id, competencia.nombre, genero.nombre genero_nombre, actor.nombre actor_nombre," +
            " director.nombre director_nombre FROM COMPETENCIA LEFT JOIN director ON director_id = director.id" +
            " LEFT JOIN actor ON actor_id=actor.id LEFT JOIN genero ON genero.id=genero_id WHERE competencia.id = " + id + ";";
  con.query(sql, function(error, respuesta, fields){
    if(error){
      return res.status(404).send("Hubo un error en la consulta");
    }

    var response = {
      'competencia': respuesta[0]
    }

    res.send(JSON.stringify(response));
  });
}

// Reinicia los votos de una competencias
function reiniciarCompetencia(req, res){
  var id = req.params.id

  var sql = "SELECT * FROM competencia WHERE id = " + id +";";
  con.query(sql, function(error, resultado, fields){
    if (error) {
      return res.status(404).send("Hubo un error en la consulta");
    }

    if (resultado.length == 0) {
      return res.status(422).send("No existe una competencia con ese número de id");
    }

    var sql2 = "DELETE FROM voto WHERE competencia_id = " + id + ";";
    con.query(sql2, function(error, respuesta, fields){
      if (error) {
        return res.status(500).send("Hubo un error en la programación");
      }

      res.json("Se ha reiniciado correctamente la competencia");
    });
  });
}

// Se obtienen todos los géneros de las peliculas en la base de datos
function obtenerGeneros(req, res){
  var sql = "SELECT * FROM genero";
  con.query(sql, function(error, resultado, fields){
    if (error) {
      return res.status(500).send("Hubo un error en la programación");
    }
    var response = {
      'generos': resultado
    }

    res.send(JSON.stringify(response));
  });
}

// Se obtienen todos los directores de las peliculas en la base de datos
function obtenerDirectores(req, res){
  var sql = "SELECT * FROM director";
  con.query(sql, function(error, resultado, fields){
    if (error) {
      return res.status(500).send("Hubo un error en la programación");
    }
    var response = {
      'directores': resultado
    }

    res.send(JSON.stringify(response));
  });
}

// Se obtienen todos los actores de las peliculas en la base de datos
function obtenerActores(req, res){
  var sql = "SELECT * FROM actor";
  con.query(sql, function(error, resultado, fields){
    if (error) {
      return res.status(500).send("Hubo un error en la programación");
    }
    var response = {
      'actores': resultado
    }

    res.send(JSON.stringify(response));
  });
}

// Elimina una competencia mediante la baja física
function eliminarCompetencia(req, res){
  var idCompetencia = req.params.id;

  //Elimina todos los datos en la tabla voto
  var sql = "DELETE FROM voto WHERE competencia_id = " + idCompetencia + ";";
  con.query(sql, function(error, respuesta, fields){
    if (error) {
      return res.status(404).send("Hubo un error en la consulta");
    }

    // Elimina todos los datos en la tabla competencia
    var sql2 = "DELETE FROM competencia WHERE id = " + idCompetencia + ";";
    con.query(sql2, function(error, resultado, fields){
      if (error) {
        return res.status(404).send("Hubo un error en la consulta2");
      }
      return res.json("Competencia eliminada con éxito");
    });
  });
}

function actualizarNombreCompetencia(req, res){
  var idCompetencia = req.params.id;
  var actualizarCompetencia = req.body;
  var nombreCompetencia  = actualizarCompetencia.nombre;

  sql = "UPDATE competencia SET nombre = '" + nombreCompetencia + "' WHERE id = " + idCompetencia +";";
  con.query(sql, function(error, respuesta, fields){
    if (error) {
      return res.status(404).send("Hubo un  error en la consulta");
    }
    return res.json("Competencia actualizada con éxito");
  })
}



module.exports = {
  obtenerCompetencias: obtenerCompetencias,
  obtenerDosPeliculas: obtenerDosPeliculas,
  votarPelicula: votarPelicula,
  obtenerResultados: obtenerResultados,
  crearCompetencia: crearCompetencia,
  obtenerCompetencia: obtenerCompetencia,
  reiniciarCompetencia: reiniciarCompetencia,
  obtenerGeneros: obtenerGeneros,
  obtenerDirectores: obtenerDirectores,
  obtenerActores: obtenerActores,
  eliminarCompetencia: eliminarCompetencia,
  actualizarNombreCompetencia: actualizarNombreCompetencia
};
