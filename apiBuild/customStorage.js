"use strict";

var fs = require("fs");
var sharp = require("sharp");

function getDestination(req, file, cb) {
    cb(null, "/dev/null"); // >Implying I use loonix
}

function customStorage(opts) {
    this.getDestination = opts.destination || getDestination;
}

customStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    this.getDestination(req, file, function (err, path) {
        if (err) return cb(err);

        var outStream = fs.createWriteStream(path);
        var transform = sharp();
        if (req.body.type == "post_image") {
            transform = transform.resize(1200, 800);
        }
        transform = transform.background("black").embed().jpeg({ quality: 65 });

        file.stream.pipe(transform).pipe(outStream);
        outStream.on("error", cb);
        outStream.on("finish", function () {
            cb(null, {
                path: path,
                size: outStream.bytesWritten
            });
        });
    });
};

customStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    fs.unlink(file.path, cb);
};

module.exports = function (opts) {
    return new customStorage(opts);
};