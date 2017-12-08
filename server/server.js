//paquetes necesarios para el proyecto
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var competenciasControlador = require('./controladores/competenciaControlador');

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/competencias', competenciasControlador.obtenerCompetencias);
app.get('/generos', competenciasControlador.obtenerGeneros);
app.get('/directores', competenciasControlador.obtenerDirectores);
app.get('/actores', competenciasControlador.obtenerActores);
app.post('/competencias', competenciasControlador.crearCompetencia);
app.get('/competencias/:id', competenciasControlador.obtenerCompetencia);
app.get('/competencias/:id/peliculas', competenciasControlador.obtenerDosPeliculas);
app.post('/competencias/:id/voto', competenciasControlador.votarPelicula);
app.get('/competencias/:id/resultados', competenciasControlador.obtenerResultados);
app.delete('/competencias/:id', competenciasControlador.eliminarCompetencia);
app.delete('/competencias/:id/votos', competenciasControlador.reiniciarCompetencia);
app.put('/competencias/:id', competenciasControlador.actualizarNombreCompetencia);

//seteamos el puerto y el ip en el cual va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});
