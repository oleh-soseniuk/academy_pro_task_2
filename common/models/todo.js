'use strict';

module.exports = function(Todo) {
    const app = require('../../server/server');
    Todo.observe('before save', function updateTimestamp(ctx, next) {
        console.log('ctx ',ctx.instance);
        if (ctx.instance.text.indexOf('зрада') !== -1) {
            var err = new Error("You can not use that word!");
                err.statusCode = 400;
                console.log(err.toString());
                next(err);
        } else {
            next();
        }
    });

    Todo.observe('after save', function(ctx, next) {
        if (ctx.isNewInstance) {
             app.io.emit('todo:created', ctx.instance);
        } else {
              app.io.emit('todo:updated', ctx.instance);
        }
        /*if (ctx.instance) {
            console.log('Saved %s#%s', ctx.Model.modelName, ctx.instance.id);
            app.io.emit('todo:created', ctx.instance);
        } else {
            console.log('Updated %s matching %j',
            ctx.Model.pluralModelName,
            ctx.where);
            app.io.emit('todo:updated', ctx.where);
        }*/
        next();
    });

    Todo.observe('after delete', function(ctx, next) {
        console.log('Deleted %s matching %j',
            ctx.Model.pluralModelName,
            ctx.where);

             app.io.emit('todo:deleted', ctx.where);
        next();
    });

};

