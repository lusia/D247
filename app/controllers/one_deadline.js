var ObjectId = require('mongodb').ObjectID,
    oneDeadlineController = function (app) {
        var db = app.get('db'), templates = app.get('templates'), actions = {};


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


                html = templates.one_deadline({user: req.user, dateString : dateString, deadline : deadline});
                res.send(html);
            });

        };

        return actions;

    };
module.exports = oneDeadlineController;