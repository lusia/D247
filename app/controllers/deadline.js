var ObjectId = require('mongodb').ObjectID,
    moment = require('moment');


var deadlineController = function (app) {
    var db = app.get('db'), templates = app.get('templates'), actions = {};

    /**
     * This action renders deadlines page with list of user's deadlines
     * @param req
     * @param res
     */
    actions.deadlines = function (req, res) {

        db.collection("deadlines").find({"user_id": req.user._id, "date": {$gt: new Date().getTime()}})
            .toArray(function (err, collection) {
                var html;
                if (err) {
                    throw err;
                }

                html = templates.deadline["list_belongs_to_user"]({text: "Show my goals", deadlines: collection, active: "my_deadlines", user: req.user, user_votes: []});
                res.send(html);
            });
    };

    /**
     * This action renders the form used to adding new deadline
     * @param req
     * @param res
     */
    actions["add_new__get"] = function (req, res) {
        var html = templates.deadline['new']({text: "Add new goal", active: "add", user: req.user});
        res.send(html);
    };

    /**
     * This action persists new deadline to db
     * @param req
     * @param res
     */
    actions["add_new__post"] = function (req, res) {
        var name, description, user, status, deadline, deadlineDate;

        name = req.body.name;
        description = req.body.description;

        deadlineDate = moment(req.body.date + ' ' + req.body.time, 'YYYY-MM-DD H:mm'); //create moment object

        user = req.user;
        status = req.body.status;
        deadline = {
            "name": name,
            "description": description,
            "date": deadlineDate.unix() * 1000, //milliseconds
            "user_id": user._id,
            "user_email": user.email,
            "status": status,
            "vote_result": 0,
            "amount": 0,
            "createDate": moment().valueOf(), //milliseconds
            "result": 0
        };

        db.collection("deadlines").insert(deadline, function (err, ins) {
            if (err) {
                throw err;
            }

            res.redirect("/my_goals");
        });
    };

    /**
     * This action persists information about user's vote to vote collection and increments values in deadlines collection
     * @param req
     * @param res
     */
    actions["vote_post"] = function (req, res) {

        var id_deadline = req.body.id,
            direction = req.body.vote,
            user = req.user,
            vote;


        if (!req.user) {
            res.send(401);

        }
        if (req.user) {

            vote = {
                "id_deadline": id_deadline,
                "user_id": user._id,
                "direction": direction,
                "date": new Date()
            };

            db.collection("votes").insert(vote, function (err, doc) {
                if (err) {
                    throw err;
                }

            });

            if (direction === "up") {
                db.collection("deadlines").update({"_id": new ObjectId(id_deadline)}, {$inc: {result: 1, amount: 1}}, function (err, upd) {
                    if (err) {
                        throw err;
                    }

                    db.collection("deadlines").findOne({"_id": new ObjectId(id_deadline)}, function (err, doc) {

                        res.json(doc);
                    });

                });

            } else {
                db.collection("deadlines").update({"_id": new ObjectId(id_deadline)}, {$inc: {result: -1, amount: 1}}, function (err, upd) {
                    if (err) {
                        throw err;
                    }
                    db.collection("deadlines").findOne({"_id": new ObjectId(id_deadline)}, function (err, doc) {

                        res.json(doc);
                    });

                });
            }
        }
    };

    /**
     * This action renders about page
     * @param req
     * @param res
     */
    actions["display_one"] = function (req, res) {
        var html, date, newDate, dateString;

        db.collection("deadlines").findOne({"_id": new ObjectId(req.params.id)}, function (err, deadline) {
            if (err) {
                throw err;
            }

            date = deadline.date;
            newDate = new Date(date);
            dateString = newDate.toUTCString();

            html = templates.deadline.one({text: "Goal", user: req.user, dateString: dateString, deadline: deadline});
            res.send(html);
        });

    };


    /**
     *
     * @type {{}}
     */
    actions.statistics = {};

    /**
     * These actions finding specific documents in deadlines collection
     * @param req
     * @param res
     * @param next
     */
    actions.statistics.step1 = function (req, res, next) {
        db.collection("deadlines").find({}).toArray(function (err, all) {
            if (err) {
                throw err;
            }
            req.stats = {all: all.length};


            next();
        });

    };
    actions.statistics.step2 = function (req, res, next) {

        db.collection("deadlines").find({"status": "public"}).toArray(function (err, pub) {
            if (err) {
                throw err;
            }

            var pub_status = pub.length;

            req.stats.pub = pub_status;

            next();
        });
    };

    actions.statistics.step3 = function (req, res, next) {
        db.collection("deadlines").find({"status": "private"}).toArray(function (err, priv) {
            if (err) {
                throw err;
            }
            var priv_status = priv.length;
            req.stats.priv = priv_status;
            next();

        });


    };

    actions.statistics.step4 = function (req, res, next) {
        db.collection("deadlines").find({"date": {$lte: new Date().getTime()}}).toArray(function (err, finished) {
            if (err) {
                throw err;
            }
            var finished_deadline = finished.length;
            req.stats.finished = finished_deadline;
            next();
        });

    };

    actions.statistics.step5 = function (req, res) {
        db.collection("deadlines").find({"date": {$gt: new Date().getTime()}}).toArray(function (err, not_finished) {
            if (err) {
                throw err;
            }
            var html, active = not_finished.length;
            req.stats["not_finished"] = active;

            html = templates.deadline.statistics({text: "Statistics", user: req.user, stats: req.stats});
            res.send(html);
        });
    };


    return actions;
}

module.exports = deadlineController;