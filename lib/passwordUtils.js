const crypto = require("crypto");

// function for checking if password provided checks with has of password
function validPassword(password, hash, salt) {
  let hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return hash === hashVerify;
}

// function for generating password hash before storage
function genPassword(password) {
  let salt = crypto.randomBytes(32).toString("hex");
  let genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");

  return {
    salt: salt,
    hash: genHash,
  };
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
