// ****************************JAVASCRIPT LIBRARIES******************************



// *****************************EXTERNAL LIBRARIES*******************************
const express = require("express");
const cors = require("cors");
require("dotenv").config();
// ******************************OWN LIBRARIES***********************************
const routerPublication = require("./routes/publications");
const connection = require("./database/connection");
const routerFollow = require("./routes/follows");
const routerUsuario = require("./routes/users");
// ******************************************************************************

// Mensaje de bievendia
console.log("API Red Social inicializada");

// Conexion a la base de datos
connection();

// Crear servidor de Node
const app = express();

// Configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Cargar conf rutas
app.use(`${process.env.ROUTE_PREFIX}${process.env.ROUTE_PREFIX_USER}`, routerUsuario);
app.use(`${process.env.ROUTE_PREFIX}${process.env.ROUTE_PREFIX_PUBLICATION}`, routerPublication);
app.use(`${process.env.ROUTE_PREFIX}${process.env.ROUTE_PREFIX_FOLLOW}`, routerFollow);

// Poner servidor a escuchar peticiones http
app.listen(process.env.PORT, () => {
    console.log(`Node server corriendo en puerto ${process.env.PORT}`)
});