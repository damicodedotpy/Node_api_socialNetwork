// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const Follow = require('../models/follow');
// ******************************OWN LIBRARIES***********************************
const followService = require("../services/followService");
// ******************************************************************************
// Crear un nuevo follow y guardarlo en la base de datos
const save = async (req, res) => {
    try {
        // Conseguir los datos del body
        const params = req.body;

        // Sacar el id del usuario identificado
        const identity = req.user;

        // Comprobar que si llega el parametro followed
        if(!params.followed) throw new Error("FOLLOWED_IS_REQUIRED");

        // Comprobar que el usuario no se siga a si mismo
        if(identity.id === params.followed) throw new Error("CANNOT_FOLLOW_YOURSELF");

        // Comprobar si ya existe un follow entre el usuario y el followed
        const checkFollow = await Follow.findOne({
            $and: [
            {"user": identity.id},
            {"followed": params.followed}
        ]});

        // Lanzar error si existe el follow
        if(checkFollow) throw new Error("FOLLOW_ALREADY_EXISTS");

        // Crear el objeto con modelo follow
        let userToFollow = new Follow({ user: identity.id, followed: params.followed });

        // Comprobar si el objeto follow se creo bien
        if(!userToFollow.followed) throw new Error("FOLLOWED_IS_REQUIRED");
        
        // Guardar objeto en la base de datos
        userToFollow.save();

        // Devolver respuesta de exito
        return res.status(200).send({
            status: "Success",
            message: "Accion de guardar un follow",
            identity: req.user,
            userToFollow: userToFollow
        });
    } catch (error) {
        // Mensaje de error estandar del endpoint
        errorMessage = "There was an error trying to save the follow"

        // Mensaje de error personalizado: followed is required
        if(error.message === "FOLLOWED_IS_REQUIRED") errorMessage = "The followed field is required";
        
        // Mensaje de error personalizado: follow already exists
        if(error.message === "FOLLOW_ALREADY_EXISTS") errorMessage = "You are already following this user";

        // Mensaje de error personalizado: cannot follow yourself
        if(error.message === "CANNOT_FOLLOW_YOURSELF") errorMessage = "You cannot follow yourself";

        // Devolver respuesta de error
        return res.status(500).json({
            status: 500,
            message: errorMessage
        })
    }
}

// Accion de dejar de seguir a un usuario
const unfollow  = async (req, res) => {
    try {
        // Recoger ID del usuario identificado
        const identity = req.user.id;

        // Recoger ID del usuario a dejar de seguir
        const followed = req.params.id;

        // Find de las coincidencias y hacer remove
        const matches = await Follow.find({"user": identity, "followed": followed})

        // Comprobar si existe el follow
        if(!matches) throw new Error("FOLLOW_NOT_FOUND");

        // Eliminar el follow
        const deleteFollow = await Follow.deleteOne({"user": identity, "followed": followed});

        // Comprobar si se ha eliminado el follow
        if(!deleteFollow) throw new Error("DELETE_FOLLOW_ERROR");

        // Devolver respuesta de exito
        return res.status(200).json({
            message: "Los usuarios se han dejado de seguir correctamente"
    });
        
    } catch (error) {
        // Mensaje de error estandar del endpoint
        errorMessage = "There was an error trying to unfollow the user"

        // Mensaje de error personalizado: follow not found
        if(error.message === "FOLLOW_NOT_FOUND") errorMessage = "The follow you are trying to delete does not exist";

        // Mensaje de error personalizado: delete follow error
        if(error.message === "DELETE_FOLLOW_ERROR") errorMessage = "There was an error trying to delete the follow";

        // Devolver respuesta de error
        return res.status(500).json({
            status: 500,
            message: errorMessage
        })
    };
};

// Accion de listar los usuarios que sigue un usuario
const following = async (req, res) => {
    try {
        // Sacar el id del usuario del token de autenticacion
        let userID = req.user.id;

        // Comprobar si llega la pagina por la url
        let page = parseInt(req.params.page) || 1;

        // Definir cantidad de items por pagina
        const itemsPerPage = 1;

        // Opciones para la configuracion de la paginacion
        const options = {
            page,
            limit: itemsPerPage,
            populate: [
                { path: 'user', select: '-password -role -__v' }, // path: 'user' es el nombre del campo en el modelo follow
                { path: 'followed', select: '-password -role -__v' }, // path: 'followed' es el nombre del campo en el modelo follow
            ],
        }

        // Paginacion de follows usando el modelo follow
        const follows = await Follow.paginate({"user": userID}, options);

        // Lanzar error si no se han encontrado los follows
        if(!follows) throw new Error("FOLLOWS_NOT_FOUND");

        // Devolver los ids de los usuarios que sigue el usuario
        const followUserIds = await followService.followUserIds(userID);

        // Lanzar error si no se han encontrado los ids de los usuarios que sigue el usuario
        if(!followUserIds) throw new Error("FOLLOWS_NOT_FOUND");

        // Devolver respuesta de exito
        return res.status(200).json({
            status: "Success",
            follows: follows.docs,
            page: follows.page,
            totalDocs: follows.totalDocs,
            totalPages: follows.totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
        })
        
    } catch (error) {
        // Mensaje de error estandar del endpoint
        errorMessage = "There was an error trying to list the users that the user follows"

        // Mensaje de error personalizado: follows not found
        if(error.message === "FOLLOWS_NOT_FOUND") errorMessage = "The user does not follow anyone";

        // Devolver respuesta de error
        return res.status(500).json({
            status: 500,
            message: errorMessage
        })   
    }
}

// Accion de listar los usuarios que siguen a un usuario
const followers = async (req, res) => {
    try {
        // Sacar el id del usuario del token de autenticacion
        let userID = req.user.id;

        // Comprobar si llega la pagina por la url
        let page = parseInt(req.params.page) || 1;

        // Definir cantidad de items por pagina
        const itemsPerPage = 1;

        // Opciones para la configuracion de la paginacion
        const options = {
            page,
            limit: itemsPerPage,
            populate: [
                { path: 'user', select: '-password -role -__v' }, // path: 'user' es el nombre del campo en el modelo follow
                { path: 'followed', select: '-password -role -__v' }, // path: 'followed' es el nombre del campo en el modelo follow
            ],
        }

        // Paginacion de follows usando el modelo follow
        const follows = await Follow.paginate({"followed": userID}, options);
        console.log(follows)

        const followUserIds = await followService.followUserIds(userID);

        // Devolver respuesta de exito
        return res.status(200).json({
            status: "Success",
            follows: follows.docs,
            page: follows.page,
            totalDocs: follows.totalDocs,
            totalPages: follows.totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
        })
        
    } catch (error) {
        // Mensaje de error estandar del endpoint
        errorMessage = "There was an error trying to list the users that the user follows"

        // Mensaje de error personalizado: follows not found
        if(error.message === "FOLLOWS_NOT_FOUND") errorMessage = "The user does not follow anyone";

        // Devolver respuesta de error
        return res.status(500).json({
            status: 500,
            message: errorMessage
        })   
    }
}

// Exportar acciones
module.exports = {
    save,
    unfollow,
    following,
    followers
}