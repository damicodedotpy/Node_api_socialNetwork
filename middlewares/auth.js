// ****************************JAVASCRIPT LIBRARIES******************************


// *****************************EXTERNAL LIBRARIES*******************************
const jwt = require("jwt-simple");
const moment = require("moment");
// ******************************OWN LIBRARIES***********************************
const libjwt = require("../services/jwt");
const secret = libjwt.secret;
// ******************************************************************************

// Funcion de autenticacion Middleware
const auth = (req, res, next) => {
    try {
        // Comprobar si llega el token en el header de la peticion
        if(!req.headers.authorization) throw new Error("AUTHORIZATION_HEADER_NOT_FOUND");

        // Limpiar token y quitar comillas
        let token = req.headers.authorization.replace(/['"]+/g, "");

        // Decodificar token
        let playload = jwt.decode(token, secret);

        // Comprobar si el token ha expirado
        if(playload.exp <= moment().unix()) throw new Error("TOKEN_EXPIRED");    

        // Agregar datos de usuario en el request
        req.user = playload;

        // Pasar a ejecucion de la ruta
        next();

    } catch (error) {
        // Mensaje de error estandar del endpoint
        errorMessage = "There was an error trying to authenticate the user";

        // Mensaje de error personalizado: authorization header not found
        if(error.message === "AUTHORIZATION_HEADER_NOT_FOUND") errorMessage = "The authorization header is required";

        // Mensaje de error personalizado: token expired
        if(error.message === "TOKEN_EXPIRED") errorMessage = "The token has expired";

        // Devolver respuesta de error
        return res.status(403).json({
            status: "Error",
            message: errorMessage
        });
    };
};

module.exports = auth;

