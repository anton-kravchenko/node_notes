module.exports = {
    create: function(status, message, options) {
        var err = new Error(status + ': ' + message);
        err.grainbit = {
            status: status,
            message: message,
            code: options ? options.code : undefined,
            details: options ? options.details : undefined
        };
        return err;
    }
};