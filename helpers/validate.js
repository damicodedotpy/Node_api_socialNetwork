// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const validator = require("validator");
// ******************************OWN LIBRARIES***********************************

// ******************************************************************************
const validate = (params) => {
    // Validar nombre
    let name = !validator.isEmpty(params.name) && validator.isLength(params.name, {min: 3, max: 50}) && validator.isAlpha(params.name, "es-ES") ? params.name : false;

    // Validar apellidos
    let surname = !validator.isEmpty(params.surname) && validator.isLength(params.surname, {min: 3, max: 50}) && validator.isAlpha(params.surname, "es-ES") ? params.surname : false;   

    // Validar nick
    let nick = !validator.isEmpty(params.nick) && validator.isLength(params.nick, {min: 2, max: 50}) ? params.nick : false;

    // Validar email
    let email = !validator.isEmpty(params.email) && validator.isEmail(params.email) ? params.email : false;

    // Validar password
    let password = !validator.isEmpty(params.password) && validator.isLength(params.password, {min: 4, max: 50}) ? params.password : false;

    // Validar bio
    let bio = !validator.isEmpty(params.bio) && validator.isLength(params.bio, {min: undefined, max: 255}) ? params.bio : false;
    
    // Lanzar error si el nombre no es valido
    if(!name) throw new Error("NAME_ERROR");

    // Lanzar error si el apellido no es valido
    if(!surname) throw new Error("SURNAME_ERROR");

    // Lanzar error si el nick no es valido
    if(!nick) throw new Error("NICK_ERROR");

    // Lanzar error si el email no es valido
    if(!email) throw new Error("EMAIL_ERROR");

    // Lanzar error si el password no es valido
    if(!password) throw new Error("PASSWORD_ERROR");

    // Lanzar error si la bio no es valida
    if(!bio) throw new Error("BIO_ERROR");

    console.log("Validacion correcta");
}


module.exports = validate;