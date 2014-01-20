var aboutController = function (app) {
    var db = app.get('db'), templates = app.get('templates'), actions = {};


    /**
     * This action renders about page
     * @param req
     * @param res
     */
    actions.about = function (req, res) {
        var html;

        html = templates.about({text: "About", active: "about", user: req.user});
        res.send(html);
    };

    return actions;

};
module.exports = aboutController;