var _ = require("underscore"),
    gravatar = require('gravatar'),
    moment = require('moment');

/**
 * Here all view helpers are stored
 * @param app
 */
module.exports = function (app) {
    var handlebars = app.get('handlebars');

    handlebars.registerHelper('displayFlashErrorsIfExist', function (req) {
        var out = '',
            errs = req.flash('error');
        if (errs.length > 0) {
            out = errs.map(function (err) {
                var msg = '';
                if (_.isObject(err)) {
                    msg = err.msg;
                } else {
                    msg = err;
                }
                return '<li class="alert alert-danger">' + msg + '</li>';
            }).join('');

            out = '<ul>' + out + '</ul>';
        }

        return out;
    });

    /**
     * used in layout to compare to values
     */
    handlebars.registerHelper('ifeq', function (a, b, options) {
        if (a === b) {
            return options.fn(this);
        }
    });

    /**
     * @param email deadline creator's email
     */
    handlebars.registerHelper("gravatar", function (email) {
        var link = '<img src="' + gravatar.url(email, {s: '100', r: 'g', d: "mm"}) + '" />';
        return link;
    });


    /**
     * @param deadline object from db
     * @param votes array of ids of deadline voted by user
     * @param user logged user
     */
    handlebars.registerHelper("voteButtons", function (deadline, votes, user, block) {
        var out = '', loggedUserId = null;

        if (user) {
            loggedUserId = user._id.toString();
        }

        if ((votes.indexOf(deadline._id.toString()) === -1) && (deadline.user_id.toString() !== loggedUserId)) {
            out = block.fn();
        }

        return out;
    });

    /**
     * @param date everything what can be used to create moment object
     * @param string format http://momentjs.com/docs/#/displaying/
     */
    handlebars.registerHelper("date", function (date, format) {
        return moment(date).format(format);
    });

    /**
     * Calculate percentage for specific elements in the collection
     * @param all - all elements from the collection
     * @param part - some parts from the collection
     */
    handlebars.registerHelper("calculatePercentage", function (all, part) {
        var out = Math.round((part * 100) / all) + "%";

        return out;
    });

};
