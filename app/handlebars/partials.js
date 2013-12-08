var fs = require("fs");

/**
 * Here I gonna keep all partials used in application
 * @param app
 */
module.exports = function (app) {
    var handlebars = app.get('handlebars');

    handlebars.registerPartial('layout', fs.readFileSync(app.get('app_dir') + '/app/views/layout.hbs', 'utf8'));
};