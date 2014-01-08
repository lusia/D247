var ObjectId = require('mongodb').ObjectID,
    moment = require('moment');


var voteController = function (app) {
    var db = app.get('db'), templates = app.get('templates'), actions = {};

    /**
     * This action renders deadlines page with list of user's deadlines
     * @param req
     * @param res
     */
    actions.vote = function (req, res) {


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


    return actions;
}

module.exports = voteController;