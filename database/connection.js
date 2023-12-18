// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const mongoose = require("mongoose");
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************

// Conexión a la base de datos
const connection = async() => {
    try {
        await mongoose.connect("mongodb://localhost:27017/practice_node_redSocial");
        console.log("Conectado correctamente a la base de datos");
    } catch (error) {
        console.log(error)
        throw new Error("No se ha podido conectar a la base de datos");
    };
};


module.exports = connection;