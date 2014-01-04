var flash = require('connect-flash'),
    S = require('string'),
    crypto = require("crypto"),
    querystring = require('querystring'),
    passport = require("passport"),
    mailer = require('express-mailer'),
    LocalStrategy = require('passport-local').Strategy,
    userController;

userController = function (app) {
    var db = app.get('db'), templates = app.get('templates'), actions = {};


    /**
     * This action renders sign up form
     * @param req
     * @param res
     */
    actions.sign = function (req, res) {

        var html, data = req.flash('data').pop() || {};
        data.active = "sign";
        data.req = req;
        html = templates.user.sign(data);
        res.send(html);
    };

    /**
     * This action persists user in db
     * @param req
     * @param res
     */
    actions.sign_post = function (req, res) {

        var email = S(req.body.email).trim().s,
            email = email.toLowerCase(),
            name = S(req.body.name).trim().s,
            password = req.body.password,
            confirm_password = req.body.confirm_password,
            errors;

        var hashEmail = crypto.createHash('md5').update(email).digest("hex");

        name = S(name).capitalize().s;

        /**
         * Validation users name, email and password
         */
        req.assert('name', 'Name is required').notEmpty();
        req.assert('email', 'A valid email is required').isEmail();
        req.assert('password', 'Password and repeated password do not match').equals(confirm_password);

        errors = req.validationErrors();
        if (!errors) {
            var salt = new Date().getMilliseconds().toString(),
                password = password + salt,
                hashedPassword = crypto.createHash("md5").update(password).digest("hex"),
                users = [
                    {
                        "name": name,
                        "email": email,
                        "password": hashedPassword,
                        "salt": salt
                    }
                ];
            db.collection("users").insert(users, function (err, ins) {
                if (err) {
                    throw err;
                }
                else {

                    req.body.username = email;
                    passport.authenticate('local')(req, res, function () {
                        res.redirect('/my_deadlines');
                    });
                }

            });
        } else {
            req.flash('error', errors);
            req.flash('data', req.body);
            res.redirect('/sign');
        }

    };

    /**
     * This action renders login form
     * @param req
     * @param res
     */
    actions.login = function (req, res) {
        var html = templates.user.login({req: req, active: "login"});
        res.send(html);
    };

    /**
     * checking users authentication
     *
     */
    actions.login_post = passport.authenticate("local", {successRedirect: '/my_deadlines', failureRedirect: '/login',
        failureFlash: 'Could not authenticate, please try again'});

    /**
     * This action renders remind password form
     * @param req
     * @param res
     */
    actions.remind_password = function (req, res) {
        var html = templates.user.remind_password({});
        res.send(html);
    };

    actions.logout = function (req, res) {
        req.session.destroy(function () {
            res.redirect('/login');
        });
    };

    return actions;
};

module.exports = userController;

