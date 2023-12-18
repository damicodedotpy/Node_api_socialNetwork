// ****************************JAVASCRIPT LIBRARIES******************************
const { json } = require("express");
// *****************************EXTERNAL LIBRARIES*******************************

// ******************************OWN LIBRARIES***********************************
const Follow = require("../models/follow");
// ******************************************************************************

const followUserIds = async (identityUserID) => {
    try {
        // Buscar los usuarios que seguimos
        let following = await Follow.find({"user": identityUserID})
        .select({"followed": 1, "_id": 0});

        // Lanza error si no hay following
        if(following.length === 0) throw new Error("FOLLOWING_ERROR");

        // Buscar los usuarios que nos siguen
        let followers = await Follow.find({"followed": identityUserID})
        .select({"user": 1, "_id": 0});

        // Lanza error si no hay followers
        if(followers.length === 0) throw new Error("FOLLOWERS_ERROR");

        // Crear arrays de ids de usuarios que seguimos
        let followingClean = following.map(follow => follow.followed);

        // Crear arrays de ids de usuarios que nos siguen
        let followersClean = followers.map(follower => follower.user);

        // Devolver un array de ids
        return {
            following: followingClean,
            followers: followersClean
        }
        
    } catch (error) {
        console.log(error);
        // Mensaje de error estandar del endpoint
        errorMessage = "There was an error trying to list the users that the user follows"

        // Mensaje de error personalizado: delete follow error
        if(error.message === "FOLLOWING_ERROR") errorMessage = "There was an error trying to list the users that the user follows";

        // Mensaje de error personalizado: delete follow error
        if(error.message === "FOLLOWERS_ERROR") errorMessage = "There was an error trying to list the users that follow the user";

        return json({
            status: 500,
            message: errorMessage
        });
    }
};

const followThisUser = async (identityUserId, profileUserId) => {
    try {
        // Buscar los usuarios que seguimos
        let following = await Follow.findOne({"user": identityUserId, "followed": profileUserId})

        // Lanza error si no hay following
        if(!following) throw new Error("FOLLOWING_ERROR");

        // Buscar los usuarios que nos siguen
        let follower = await Follow.findOne({"user": profileUserId, "followed": identityUserId})

        // Lanza error si no hay followers
        if(!follower) throw new Error("FOLLOWER_ERROR");

        // Devolver un array de ids
        return {
            following,
            follower
        }
        
    } catch (error) {
        // Mensaje de error estandar del endpoint
        errorMessage = "There was an error trying to list the users that the user follows"

        // Mensaje de error personalizado: delete follow error
        if(error.message === "FOLLOWING_ERROR") errorMessage = "There was an error trying to list the users that the user follows";

        // Mensaje de error personalizado: delete follow error
        if(error.message === "FOLLOWER_ERROR") errorMessage = "There was an error trying to list the users that follow the user";

        // Mensaje de error personalizado: delete follow error
        return json({
            status: 500,
            message: errorMessage
        });
    }
};

module.exports = {
    followUserIds,
    followThisUser
}