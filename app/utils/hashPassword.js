var crypto = require("crypto"), hashPassword;

hashPassword = function (password, salt) {
    var password = password + salt,
        hashed_password = crypto.createHash("md5").update(password).digest("hex");

    return hashed_password;
};

module.exports = hashPassword;