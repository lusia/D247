var _ = require('underscore'),
    moment = require('moment'),
    mainController = function (app) {
        var db = app.get('db'), templates = app.get('templates'), actions = {}, ObjectId = require('mongodb').ObjectID;

        /**
         * This action renders main page with list of all public deadlines
         * @param req
         * @param res
         */
        actions.main = function (req, res) {

            db.collection("deadlines").find({"status": "public", "date": {$gt: new Date().getTime()}})
                .toArray(function (err, collection) {
                    var html;
                    if (err) {
                        throw err;
                    }
                    if (collection.length === 0) {
                        html = templates.main({text: "Home", deadlines: [], active: "main", user: req.user, user_votes: []});
                        res.send(html);
                    }

                    if (req.user) {
                        db.collection("votes").find({"user_id": req.user._id}).toArray(function (err, user_votes) {
                            if (err) {
                                throw err;
                            }
                            html = templates.main({deadlines: collection,
                                active: "main",
                                user: req.user,
                                user_votes: _.pluck(user_votes, 'id_deadline') //create array with ids of deadline voted by user
                            });
                            res.send(html);
                        });
                    } else {
                        html = templates.main({text: "Home", deadlines: collection, active: "main", user: req.user, user_votes: []});
                        res.send(html);
                    }

                });
        };

        return actions;
    };

module.exports = mainController;