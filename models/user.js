// ****************************JAVASCRIPT LIBRARIES******************************



// *****************************EXTERNAL LIBRARIES*******************************
const {Schema, model} = require("mongoose");
// ******************************OWN LIBRARIES***********************************



// ******************************************************************************

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    surname: {
        type: String
    },
    nick: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
})

// Agregar plugin de paginacion
UserSchema.plugin(require("mongoose-paginate-v2"));


module.exports = model("User", UserSchema, "users");

