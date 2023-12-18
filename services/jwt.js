// ****************************JAVASCRIPT LIBRARIES******************************



// *****************************EXTERNAL LIBRARIES*******************************

const jwt = require("jwt-simple");
const moment = require("moment");
require("dotenv").config();

// ******************************OWN LIBRARIES***********************************



// ******************************************************************************


// Secret Key
const secret = process.env.SECRET_KEY;

// Crear una funcion para generar tokens
const createToken = (user) => {
    // Definir el payload
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    // Devolver el token codificado
    return jwt.encode(payload, secret);
};

// Devolver el token cofificado
module.exports = {
    createToken,
    secret
};