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

                html = templates.deadline["list_belongs_to_user"]({deadlines: collection, active: "my_deadlines", user: req.user, user_votes: []});
                res.send(html);
            });
    };

    /**
     * This action renders the form used to adding new deadline
     * @param req
     * @param res
     */
    actions["add_new"] = function (req, res) {
        var html = templates.deadline['new']({active: "add", user: req.user});
        res.send(html);
    };

    /**
     * This action persists new deadline to db
     * @param req
     * @param res
     */
    actions["add_new_post"] = function (req, res) {
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

            res.redirect("/my_deadlines");
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
    actions["deadline_post"] = function (req, res) {
        var html, date, newDate, dateString;

        db.collection("deadlines").findOne({"_id": new ObjectId(req.params.id)}, function (err, deadline) {
            if (err) {
                throw err;
            }

            date = deadline.date;
            newDate = new Date(date);
            dateString = newDate.toUTCString();


            html = templates.one_deadline({user: req.user, dateString: dateString, deadline: deadline});
            res.send(html);
        });

    };

    return actions;
}

module.exports = deadlineController;