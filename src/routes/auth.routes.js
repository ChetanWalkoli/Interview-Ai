const { Router } = require('express')
const authController = require("../controllers/auth.controller")

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
module.exports = authRouter