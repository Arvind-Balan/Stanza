const session = require("express-session")
const userSchema = require('../models/user-schema')

exports.authentication = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/signIn')
    }
}
exports.adminAuthentication = (req, res, next) => {
    if (req.session.admin) {
        next()
    } else {
        res.redirect('/admin')
    }
}
exports.activeCheck = async (req, res, next) => {
    if (req.session.user) {
        const access = (await userSchema.findOne({ _id: req.session.user._id })).isActive
        if (access) next()
        else {
            res.render('users/denied')
        }
        // console.log("Active or not", access);
    } else {
        next()
    }
}
