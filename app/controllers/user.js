var flash = require('connect-flash'),
    S = require('string'),
    crypto = require("crypto"),
    querystring = require('querystring'),
    passport = require("passport"),
    nodemailer = require("nodemailer"),
    LocalStrategy = require('passport-local').Strategy,
    userController, hashPassword;

hashPassword = require("./../utils/hashPassword");
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
                        res.redirect('/');
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

    actions.remind_password_post = function (req, res) {
        var smtpTransport, mail,
            email = req.body.email,
            conf = app.get("conf"), new_password,
            text, hashed_password, str, new_salt;

        db.collection("users").findOne({email: email}, function (err, doc) {
            if (err) {
                throw err;
            }

            if (doc !== null) {

                //Creating new password and salt for user
                str = (Math.random() * 1000).toString();
                new_password = crypto.createHash("md5").update(str).digest("hex").slice(0, 10);
                new_salt = new Date().getMilliseconds().toString();
                text = templates.email.remind_password({password: new_password});

                //Updating hash password and salt in db
                hashed_password = hashPassword(new_password, new_salt);

                db.collection("users").update({email: email}, {$set: {password: hashed_password, salt: new_salt}}, function (err, upd) {
                    if (err) {
                        throw err;
                    }


                });

                // configuration for sending email
                smtpTransport = nodemailer.createTransport("SMTP", {
                    host: conf.mail.smtp.host,
                    port: conf.mail.smtp.port,
                    secureConnection: conf.mail.smtp.secureConnection,
                    auth: {
                        user: conf.mail.smtp.user,
                        pass: conf.mail.smtp.pass
                    }
                });
                mail = {
                    from: "D247 <no-reply@d247.org>", // sender address
                    to: email, // list of receivers
                    subject: "New password", // Subject line
                    text: text// plaintext body
                };


                smtpTransport.sendMail(mail, function (error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Message sent: " + response.message);
                    }

                    smtpTransport.close(); // shut down the connection pool, no more messages
                    res.end("Email was sent");

                });
            } else {
                res.send("you are not here");
            }
        });
    };
    actions.logout = function (req, res) {
        req.session.destroy(function () {
            res.redirect('/login');
        });
    };


    return actions;
};

module.exports = userController;

