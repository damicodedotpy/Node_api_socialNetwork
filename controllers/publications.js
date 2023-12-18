// ****************************JAVASCRIPT LIBRARIES******************************

// *****************************EXTERNAL LIBRARIES*******************************
const Publication = require("../models/publication");
const path = require("path");
const fs = require("fs");
// ******************************OWN LIBRARIES***********************************
const followService = require("../services/followService");
// ******************************************************************************

// Guardar publicacion
const save = (req, res) => {
    try {
        // Recoger datos del body
        const params = req.body;

        // Si no me llegan dar respuesta negativa
        if(!params.text) throw new Error("MESSAGE_EMPTY");

        // Crear y rellenar objeto del modelo
        let newPublication = new Publication(params);

        // Añadir propiedades al objeto
        newPublication.user = req.user.id;

        // Guardar objeto en bbdd
        const savePublication = newPublication.save();

        // Lanzar error si no se ha guardado la publicacion
        if(!savePublication) throw new Error("ERROR_SAVE_PUBLICATION");

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Guardar publicacion"
        });
            
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to process the publication";  

        // Mensaje de error personalizado: Texto de la publicacion vacio
        if(error.message == "MESSAGE_EMPTY") errorMessage = "The message field is empty";

        // Mensaje de error personalizado: Error al guardar la publicacion
        if(error.message == "ERROR_SAVE_PUBLICATION") errorMessage = "There was an error trying to save the publication";

        // Devolver respuesta
        return res.status(500).send({
            status: "error",
            message: errorMessage
        })
    }
}

// Sacar una publicacion especifica
const detail = async (req, res) => {
    try {
         // Sacar id de publicacion de la url
        const publicationId = req.params.id;

        // Find de la publicacion por id de la url
        const findPublication = await Publication.findById({"_id": publicationId});

        // Lanzar error si no se encuentra la publicacion
        if(!findPublication) throw new Error("ERROR_FIND_PUBLICATION");

        // Devolver la publicacion en json
        return res.status(200).send({
            status: "success",
            message: "Mostrar publicacion",
            publication: findPublication
        });

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to process the publication";

        // Mensaje de error personalizado: Error al buscar la publicacion
        if(error.message == "ERROR_FIND_PUBLICATION") errorMessage = "There was an error trying to find the publication";

        // Devolver respuesta
        return res.status(500).send({
            status: "error",
            message: errorMessage
        })
    }
}

// Eliminar publicaciones
const remove = async (req, res) => {
    try {
        // Sacar id de publicacion de la url 
        const publicationId = req.params.id;

        // Find y delete
        const deletePublication = await Publication.deleteOne({"user": req.user.id, "_id": publicationId});
    
        // Comprobar si se ha eliminado la publicacion
        if(!deletePublication) throw new Error("ERROR_DELETE_PUBLICATION");
    
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicacion eliminada correctamente"
        });
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to delete the publication";

        // Mensaje de error personalizado: Error al eliminar la publicacion
        if(error.message == "ERROR_DELETE_PUBLICATION") errorMessage = "There was an error trying to delete the publication";
        
        // Devolver respuesta
        return res.status(500).send({
            status: "error",
            message: errorMessage
        })
    }
}

// Subir archivos de publicaciones de usuario
const upload = async (req, res) => {
    try {
        // Sacar id de la publicacion de la url
        const publicationId = req.params.id;

        // Comprobar si llega el fichero
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
        const publicationUpdated = await Publication.findOneAndUpdate({"user": req.user.id, "_id": publicationId}, {"file": image});
        
        // Lanzar error si no se ha actualizado la imagen del usuario
        if(!publicationUpdated) throw new Error("USER_NOT_FOUND");

        // Devolver una respuesta
        return res.status(200).json({
            status: "Success",
            message: "Upload",
            file: req.file,
            publication: publicationUpdated
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

// Listar todas las publicaciones
const user = async (req, res) => {
    try {
        // Sacar el id del usuario de la url
        const userId = req.params.id;

        // Si no llega la pagina por la url ponerla a 1
        let page = req.params.page || 1;

        // Indicar items por pagina
        const itemsPerPage = 5;

        // Configuracion de las opciones de paginacion
        const options = {
            page,
            limit: itemsPerPage,
            populate: [
                {path: "user", select: "-password -__v -role -email"}
            ],
            sort: {created_at: "desc"}
        }

        // Find, populate, ordenar y paginar
        const publications = await Publication.paginate({"user": userId}, options);

        // Lanzar error si no hay publicaciones
        if(!publications) throw new Error("ERROR_FIND_PUBLICATIONS");

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Listar publicaciones",
            page: publications.page,
            pages: publications.totalPages,
            total: publications.totalDocs,
            publications: publications.docs
        });        
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error in the request to list the publications";

        // Mensaje de error personalizado: Error al listar las publicaciones
        if(error.message == "ERROR_FIND_PUBLICATIONS") errorMessage = "There was an error trying to list the publications";

        // Mensaje de error personalizado: Error al paginar las publicaciones
        if(error.message == "ERROR_PAGINATE_PUBLICATIONS") errorMessage = "There was an error trying to paginate the publications";
        
        // Devolver error especifico
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Devolver archivos multimedia (imagenes)
const media = async (req, res) => {
    try {
        // Sacar el nombre del archivo de la URL
        const file = req.params.file;

        // Montar el path donde esta el archivo
        const filePath = "./uploads/publications/" + file;

        // Promesa para comprobar si existe el archivo
        await new Promise((resolve, reject) => {
            fs.stat(filePath, (error, exists) => {
                if(error) reject(new Error("FILE_NOT_FOUND"));
                resolve();
            });
        });

        // Devolver el archivo
        res.sendFile(path.join(__dirname, "../uploads/publications/" + file));

    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to get the file";

        // Mensaje de error personalizado: Archivo no encontrado
        if(error.message == "FILE_NOT_FOUND") errorMessage = "The file was not found";

        // Devolver error especifico
        return res.status(500).send({
            status: "error",
            message: errorMessage
        });
    };
};

// Listar las publicaciones de los usuarios que sigo
const feed = async (req, res) => {
    try {
        // Sacar la pagina actual
        let page = req.params.page || 1;

        // Establecer numero de elementos por paginas
        let itemsPerPage = 5;

        // Sacar un array de identificadores de usuarios que yo sigo como usuario logueado
        const myFollows = await followService.followUserIds(req.user.id);

        // Lanzar error si no se encuentran usuarios seguidos
        if(!myFollows) throw new Error("FOLLOWS_NOT_FOUND");

        // Opciones de configuracion de la paginacion
        const options = {
            page,
            limit: itemsPerPage,
            populate: [
                {path: "user", select: "-password -__v -role -email -created_at -updatedAt -_id -surname -nick"},
            ],
            sort: {created_at: "desc"}
        }

        // Find de las publicaciones de los usuarios que sigo
        const publications = await Publication.paginate({"user": {$in: myFollows.following}}, options);

        // Lanzar error si no se encuentran publicaciones
        if(!publications) throw new Error("ERROR_FIND_PUBLICATIONS");

        // Devolver resultado
        return res.status(200).send({
            message: "Feed de publicaciones",
            following: myFollows.following,
            page: publications.page,
            totalPages: publications.totalPages,
            totalDocs: publications.totalDocs,
            publications: publications.docs
    });
    
    } catch (error) {
        // Mensaje de error estandar
        errorMessage = "There was an error trying to create the feeder";

        // Mensaje de error personalizado: Follows not found
        if(error.message == "FOLLOWS_NOT_FOUND") errorMessage = "There was an error trying to get the users you follow.";

        // Mensaje de error personalizado: Error al listar las publicaciones
        if(error.message == "ERROR_FIND_PUBLICATIONS") errorMessage = "There was an error trying to find the publications";

        // Devolver error especifico
        return res.status(500).send({
            status: 500,
            message: errorMessage
        });
    };
};


// Exportar funciones
module.exports = {
    detail,
    remove,
    upload,
    media,
    save,
    user,
    feed
}

