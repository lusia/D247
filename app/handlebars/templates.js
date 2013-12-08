var fs = require("fs"), compileTemplates;

/**
 * Build set of compiled hendlebars template
 * @param app
 *
 * @return object
 */
compileTemplates = function (app) {
    var handlebars = app.get('handlebars'), templates = {}, fFindPath;

    fFindPath = function (path) {
        return app.get('app_dir') + path;
    };

    templates.main = handlebars.compile(fs.readFileSync(fFindPath('/app/views/deadlines_list.hbs'), 'utf8'));

    templates.about = handlebars.compile(fs.readFileSync(fFindPath('/app/views/about.hbs'), 'utf8'));

    templates.one_deadline = handlebars.compile(fs.readFileSync(fFindPath('/app/views/one_deadline.hbs'), 'utf8'));

    templates.user = {
        login: handlebars.compile(fs.readFileSync(fFindPath('/app/views/login.hbs'), 'utf8')),
        sign: handlebars.compile(fs.readFileSync(fFindPath('/app/views/sign.hbs'), 'utf8'))
    };

    templates.deadline = {
        'new': handlebars.compile(fs.readFileSync(fFindPath('/app/views/add_form.hbs'), 'utf8')),
        list_belongs_to_user: handlebars.compile(fs.readFileSync(fFindPath('/app/views/deadlines_list.hbs'), 'utf8')),
        vote: handlebars.compile(fs.readFileSync(fFindPath('/app/views/vote.hbs'), 'utf8'))
    };


    return templates;
};

module.exports.compileTemplates = compileTemplates;