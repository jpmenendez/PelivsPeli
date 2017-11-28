var con = require('../lib/conexionbd');

//Recomienda películas
function obtenerCompetencias(req, res){

  var sql = "SELECT  * FROM competencias;"
  con.query(sql, function(error, resultado, fields){
    if (error) {
        return res.status(404).send("Hubo un error en la consulta");
    }
    console.log(resultado);
    var response = {
      'competencias': resultado
    }
    res.send(JSON.stringify(response));
  });
}


module.exports = {
  obtenerCompetencias: obtenerCompetencias,
};
