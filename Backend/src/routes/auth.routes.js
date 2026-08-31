const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const authmiddleware = require("../middlewares/auth.middleware")

const authRouter = Router()
/**
    *@route post /api/auth/register
    *@description register new user
    *@access public
    */

authRouter.post("/register",authController.registerUserController)

/**
 * @route post /api/auth/login
 * @description login user with email and password
 * @access public api
 */

authRouter.post("/login",authController.loginUserController)

/**
 * @route get /api/auth/logout
 * @description clear token from user cookie and add token form the blacklist
 * @access public
 */

authRouter.get("/logout",authController.logoutUserController)


/**
 * @route get / api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */


authRouter.get("/get-me",authmiddleware.authUser,authController.getMeController)

module.exports = authRouter