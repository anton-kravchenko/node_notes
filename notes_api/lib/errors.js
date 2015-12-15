module.exports = {
    create: function(status, message, options) {
        var err = new Error(status + ': ' + message);
        err.notes = {
            status: status,
            message: message,
            code: options ? options.code : undefined,
            details: options ? options.details : undefined
        };
        return err;
    }
};