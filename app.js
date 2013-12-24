var express = require("express"),
    app = express(),
    flash = require('connect-flash'),
    handlebars = require("handlebars"),
    hbs = require("hbs"),
    _ = require("underscore"),
    passport = require("passport"),
    LocalStrategy = require('passport-local').Strategy,
    crypto = require("crypto"),
    MongoClient = require("mongodb").MongoClient,
    ObjectId = require('mongodb').ObjectID,
    Server = require("mongodb").Server,
    S = require('string'),
    fs = require("fs"),
    moment = require('moment'),
    mainController,
    userController,
    deadlineController,
    aboutController,
    expressValidator = require('express-validator'),
    RedisStore = require('connect-redis')(express),
    NODE_ENV = process.env.PASSENGER_ENV || 'dev',
    conf;


require('handlebars-layouts')(handlebars);
require('js-yaml'); //automatically register support for yaml files
conf = require('./app/config/' + NODE_ENV + '.yaml');

app.set('app_dir', __dirname);
app.set('handlebars', handlebars);
require('./app/handlebars/partials.js')(app);
require('./app/handlebars/helpers.js')(app);

app.use(express.responseTime());
app.engine("hbs", hbs.__express);
app.set("view engine", "html");
app.use('/static', express.static(__dirname + '/static'));

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(expressValidator());
app.use(express.session({
    store: new RedisStore({
        host: conf.session.redis.host,
        port: conf.session.redis.port,
        db: conf.session.redis.db,
        pass: conf.session.redis.pass
    }),
    secret: conf.session.redis.secret }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

var mongoclient = new MongoClient(new Server(conf.db.host, conf.db.port, {"native_parser": true}));
var db = mongoclient.db(conf.db.name);

app.set('templates', require('./app/handlebars/templates.js').compileTemplates(app));
app.set('db', db);

/**
 * Authenticate user
 */
passport.use(new LocalStrategy(
    function (email, password, done) {
        db.collection("users").findOne({ email: email }, function (err, user) {
            var salt, hashedPassword;
            if (err) {
                return done(err);
            } else if (!user) {
                return done(null, false);
            } else {
                salt = user.salt;
                password = password + salt;
                hashedPassword = crypto.createHash("md5").update(password).digest("hex")
                if (hashedPassword === user.password) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            }
        });
    }
));

app.use(function (err, req, res, next) {
    fs.writeFile(__dirname + "/log/" + moment().format("YYYY-MM-DD") + ".log", moment().format("HH:mm") + " " +
        err.stack + "\n", {"flag": "a"}, function (err) {
        if (err) {
            console.log("err");
        } else {
            console.log("The file was saved");
        }
        res.send(500, 'Something is broken!');
    });
});
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    db.collection("users").findOne({"_id": new ObjectId(id)}, function (err, user) {
        done(null, user);
    });
});

mainController = require('./app/controllers/main.js')(app);
app.get("/", mainController.main);

userController = require("./app/controllers/user.js")(app);
app.get("/sign", userController.sign);
app.post("/sign", userController.sign_post);
app.get("/login", userController.login);
app.post("/login", userController.login_post);
app.get("/logout", userController.logout);

deadlineController = require("./app/controllers/deadline.js")(app);
app.get("/my_deadlines", deadlineController.deadlines);
app.get("/add_new_deadline", deadlineController["add_new"]);
app.post("/add_new_deadline", deadlineController["add_new_post"]);
app.post("/deadlines/vote", deadlineController["vote_post"]);

aboutController = require('./app/controllers/about.js')(app);
app.get("/about", aboutController.about);

oneDeadlineController = require('./app/controllers/one_deadline.js')(app);
app.get("/deadline/:id", oneDeadlineController["deadline_post"]);

mongoclient.open(function (err, mongoclient) {
    app.listen(8080);
    console.log("Express server started on port 8080 at " + (new Date()));
});

