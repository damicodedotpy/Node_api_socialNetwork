// ****************************JAVASCRIPT LIBRARIES******************************



// *****************************EXTERNAL LIBRARIES*******************************
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
// ******************************OWN LIBRARIES***********************************
const followService = require("../services/followService");
const Publication = require("../models/publication");
const {createToken} = require("../services/jwt");
const validate = require("../helpers/validate");
const Follow = require("../models/follow");
const User = require("../models/user");
// ******************************************************************************

// Registrar usuarios nuevos en la base de datos
const register = async (req, res) => {
    try {
        // Recoger datos de la peticion
        let params = await req.body;

        // Comprobar que lleguen los datos necesarios
        const requiredFields = ["name", "email", "password", "nick"];

        // Comprobar que lleguen los datos necesarios
        const missingFields = requiredFields.filter(field => !params[field]);

        // Lanzar error si faltan campos
        if(missingFields.length > 0) throw new Error("MISSING_FIELDS");

        // Validacion de datos
        validate(params);

        // Busca usuarios con el email o nick proporcionados en la db
        const user = await User.find({
            $or: [
                {email: params.email.toLowerCase()},
                {nick: params.nick.toLowerCase()}
            ]});

        // Lanzar error si existen coincidencias
        if(user && user.length >= 1) throw new Error("USER_ALREADY_EXISTS");

        // Cifrar contraseña
        params.password  = await bcrypt.hash(params.password, 10);
        
        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar objeto en la base de datos
        const saveUser = await user_to_save.save();

        // Lanzar error si no se ha guardado el usuario
        if(!saveUser) throw new Error("USER_NOT_SAVED");
        
        // Devolver resultado
        return res.status(200).json({
            status: 200,
            message: "Usuario registrado correctamente",
            user: user_to_save
        });

        } catch (error) {
            // Mensaje de error estandar
            errorMessage = "There was an error trying to register the user";

            // Mensaje de error personalizado: Faltan campos
            if(error.message == "MISSING_FIELDS") errorMessage = "There are missing fields in the request";
            
            // Mensaje de error personalizado: Usuario existente
            if(error.message == "USER_ALREADY_EXISTS") errorMessage = "The email or nick is already in use";
            
            // Mensaje de error personalizado: Validacion de datos
            if(error.message == "NAME_ERROR") errorMessage = "The name is not valid";

            // Mensaje de error personalizado: Validacion de datos
            if(error.message == "SURNAME_ERROR") errorMessage = "The surname is not valid";

            // Mensaje de error personalizado: Validacion de datos
            if(error.message == "NICK_ERROR") errorMessage = "The nick is not valid";

            // Mensaje de error personalizado: Validacion de datos
            if(error.message == "EMAIL_ERROR") errorMessage = "The email is not valid";

            // Mensaje de error personalizado: Validacion de datos
            if(error.message == "PASSWORD_ERROR") errorMessage = "The password is not valid";

            // Mensaje de error personalizado: Validacion de datos
            if(error.message == "BIO_ERROR") errorMessage = "The bio is not valid";

            // Mensaje de error personalizado: Usuario no guardado
            if(error.message == "USER_NOT_SAVED") errorMessage = "The user could not be saved";

            // Devolver error especifico
            return res.status(500).json({
                status: 500,
                message: errorMessage
            })
        }
}

// Login de usuarios
const login = async (req, res) => {
    try {
        // Recoger parametros body
        let params = req.body;

        // Comprobar que lleguen los datos necesarios
        const requiredFields = ["email", "password"].filter(field => !params[field]);

        // Lanzar error si faltan campos
        if(requiredFields.length > 0) throw new Error("MISSING_FIELDS");

        // Buscar en la base de datos la existencia del usuario y devolverlo sin la contraseña
        const user = await User.findOne({email: params.email});

        // Lanzar error si no existe el usuario
        if(!user) throw new Error("USER_NOT_FOUND");

        // Comprobar que la contraseña sea correcta
        let pwd = await bcrypt.compareSync(params.password, user.password);

        // Lanzar error si la contraseña no es correcta
        if(!pwd) throw new Error("PASSWORD_ERROR");

        // Generar token de jwt
        const token = createToken(user);

        // Devolver los datos del usuario logueado
        return res.status(200).json({
            status: "Success",
            message: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick,
            },
            token
        })} catch (error) {
            // Mensaje de error estandar
            errorMessage = "There was an error trying to login the user";

            // Mensaje de error personalizado: Faltan campos
            if(error.message == "MISSING_FIELDS") errorMessage = "There are missing fields in the request";

            // Mensaje de error personalizado: Usuario no encontrado
            if(error.message == "USER_NOT_FOUND") errorMessage = "The user does not exist";

            // Mensaje de error personalizado: Contraseña incorrecta
            if(error.message == "PASSWORD_ERROR") errorMessage = "The password is not valid";

            // Devolver error especifico
            return res.status(500).json({
                status: 500,
                message: errorMessage
            })
        }
};

// Perfil de usuario
const profile = async (req, res) => {
    // Consultar la base de datos para obtener los datos del usuario
    try {
        // Recibir el parametro de ID de usuario por la URL
        const id = req.params.id;

        // Lanzar error si no llega el ID
        if(!id) throw new Error("USER_ID_ERROR");

        // Buscar usuario por ID
        const user = await User.findById(id).select({password: 0, role: 0});

        // Lanzar error si no existe el usuario
        if(!user) throw new Error("USER_NOT_FOUND");

        // Informacion de followers y following
        const followInfo = await followService.followThisUser(req.user.id, id);

        // Lanzar error si no existe la informacion de followers y following
        if(!followInfo) throw new Error("NO_FOLLOWERS_FOUND");

        // Devolver informacion de followings y followers
        return res.status(200).json({
            status: "Success",
            message: "Datos del usuario",
            user: user,
            following: followInfo.following,
            follower: followInfo.follower
        })
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to get the user data";
        
        // Mensaje de error personalizado: Problemas al obtener el ID de usuario
        if(error.message == "USER_ID_ERROR") errorMessage = "The user ID is not valid";

        // Mensaje de error personalizado: Usuario no encontrado
        if(error.message == "USER_NOT_FOUND") errorMessage = "The user does not exist";

        // Mensaje de error personalizado: No hay followers
        if(error.message == "NO_FOLLOWERS_FOUND") errorMessage = "There are no followers";

        // Devolver error especifico
        return res.status(500).json({
            status: 500,
            message: errorMessage
        })
    }
};

// Listado de usuarios
const list = async (req, res) => {
    try {
         // Controlar en que pagina estamos
        let page = parseInt(req.params.page || 1);

        // Consulta con mongoose paginate
        let itemsPerPage = 5;

        // Opciones de configuracin de la consulta paginada
        const options = {
            page,
            limit: itemsPerPage,
            sort: "_id",
            select: "-password -email -role -__v"
        };

        // Ejecutar consulta paginada con mongoose paginate
        const users = await User.paginate({}, options);
        
        // Lanzar error si no hay usuarios
        if(!users) throw new Error("NO_USERS_FOUND");

        // Informacion de followers y following
        const followUserIds = await followService.followUserIds(req.user.id);

        // Lanzar error si no existe la informacion de followers y following
        if(!followUserIds) throw new Error("NO_FOLLOWERS_FOUND");

        // Devolver el resultado (posteriormente devolver informacion de followers y posts)
        return res.status(200).json({
            status: "Success",
            message: "Lista de usuarios",
            itemsPerPage,
            user: users.docs,
            total: users.totalDocs,
            pages: users.total,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
            });
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to get the users list";

        // Mensaje de error personalizado: No hay usuarios
        if(error.message == "NO_USERS_FOUND") errorMessage = "There are no users";

        // Mensaje de error personalizado: No hay followers
        if(error.message == "NO_FOLLOWERS_FOUND") errorMessage = "There are no followers";

        // Devolver error especifico
        return res.status(500).json({
            status: 500,
            message: errorMessage
        });
    };
};

// Actualizar datos de usuario
const update = async (req, res) => {
    try {
        // Recoger datos del usuario logueado
        const userJWT = req.user;

        // Recoger datos de la peticion
        const data = req.body;

        // Lanzar error si no llega el usuario
        if(!userJWT) throw new Error("USER_NOT_FOUND");

        // Lanzar error si no llegan los datos de actualizacion
        if(!data) throw new Error("MISSING_FIELDS");
    
        // Eliminar campos innecesarios
        delete data.iat;
        delete data.exp;
        delete data.role;
        delete data.image;
        // Comprobar si el usuario ya existe
        const userExist = await User.find({$or: [
            {"email": data.email.toLowerCase()},
            {"nick": data.nick.toLowerCase()}
        ]});
        
        // Lanzar error si existen coincidencias y no es el mismo usuario
        userExist.forEach(user => {
            if(user && user._id != userJWT.id) throw new Error("USER_ALREADY_EXISTS");
        });

        // Cifrar contraseña si llega en la peticion
        if(data.password) data.password = await bcrypt.hash(data.password, 10);

        // Actualizar usuario
        const userUpdated = await User.findByIdAndUpdate({"_id": userJWT.id}, data)

        // Lanzar error si no se ha actualizado el usuario
        if(!userUpdated) throw new Error("USER_NOT_FOUND");

        // Devolver resultado
        return res.status(200).json({
            status: "Success",
            message: "Usuario actualizado correctamente",
            user: userUpdated
        })

    } catch (error) {
        // Mensaje de error estandar
        let errorMessage = "There was an error trying to update the user";

        // Mensaje de error personalizado: Faltan campos
        if(error.message == "MISSING_FIELDS") errorMessage = "There are missing fields in the request";

        // Mensaje de error personalizado: Usuario existente
        if(error.message == "USER_ALREADY_EXISTS") errorMessage = "The email or nick is already in use";
        
        // Mensaje de error personalizado: Usuario no encontrado
        if(error.message == "USER_NOT_FOUND") errorMessage = "The user does not exist";

        // Devolver error especifico
        return res.status(500).json({
            status: 500,
            message: errorMessage
        })
    }
}

// Subir avatar de usuario
const upload = async (req, res) => {
    try {
        // Lanzar error si no llega el fichero
        if(!req.file) throw new Error("FILE_NOT_FOUND");

        // Recoger el fichero de imagen y comprobar que existe
        let image = req.file.originalname;

        // Conseguir el nombre del archivo
        let [part1, extension] = image.split(".")

        // Sacar la extension del archivo
        let validExtensions = ["png", "jpg", "jpeg", "gif"];
        
        // Comprobar extension (solo imagenes), si no es valida borrar fichero
        if(!validExtensions.includes(extension)) {
            fs.unlinkSync(req.file.path);
            throw new Error("INVALID_EXTENSION");
        }
        
        // Actualizar imagen del usuario en la base de datos
        const updateImage = await User.findOneAndUpdate({"_id": req.user.id}, {"image": req.file.filename});
        
        // Lanzar error si no se ha actualizado la imagen del usuario
        if(!updateImage) throw new Error("USER_NOT_FOUND");

        // Devolver una respuesta
        return res.status(200).json({
            status: "Success",
            message: "Upload",
            file: req.file,
            imageName: image
        })
        
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to upload the file";

        // Mensaje de error personalizado: Archivo no encontrado
        if (error.message == "FILE_NOT_FOUND") errorMessage = "The file was not found";

        // Mensaje de error personalizado: Extension no valida
        if(error.message == "INVALID_EXTENSION") errorMessage = "The file extension is not valid";

        // Mensaje de error personalizado: Usuario no encontrado
        if(error.message == "USER_NOT_FOUND") errorMessage = "The user does not exist";

        // Devolver error especifico
        return res.status(500).json({
            status: 500,
            message: errorMessage
        })
    }
}

// Obtener avatar de usuario
const avatar = (req, res) => {
    try {
        // Sacar el nombre del archivo de la URL
        const file = req.params.file;

        // Lanzar error si no llega el fichero
        if(!file) throw new Error("FILE_NOT_FOUND");
    
        // Montar el path donde esta el archivo
        const filePath = "./uploads/avatars/" + file;

        // Comprobar que existe el fichero y lanzar error si no existe el fichero
        if(!fs.existsSync(filePath)) throw new Error("FILE_NOT_FOUND");

        // Devolver el fichero
        return res.sendFile(path.join(__dirname, "../uploads/avatars/" + file));

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to get the file";

        // Mensaje de error personalizado: Archivo no encontrado
        if (error.message == "FILE_NOT_FOUND") errorMessage = "The file was not found";

        // Devolver error especifico
        return res.status(500).json({
            status: 500,
            message: errorMessage
        });
    };
};

const counters = async (req, res) => {
    try {
        let userId = req.params.id || req.user.id;
        
        if(!userId) throw new Error("NO_USER_FOUND");
        
        const following = await Follow.count({"user": userId});
        const followed = await Follow.count({"followed": userId});
        const publications = await Publication.count({"user": userId});


        return res.status(200).json({
            status: "Success",
            message: "Counters",
            following: following,
            followed: followed,
            publications: publications
        });
    } catch (error) {
        let errorMessage = "There was an error trying to get the user counters";

        if(error.message == "NO_USER_FOUND") errorMessage = "The user does not exist";

        return res.status(500).json({
            status: 500,
            message: errorMessage
        })
    };
};


// Exportar funciones
module.exports = {
    register, 
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}