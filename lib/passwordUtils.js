const bcrypt = require("bcryptjs");

// function for checking if password provided checks with has of password
function validPassword(password, hash, salt) {
  console.log(password);

  let hashVerify2 = bcrypt.compareSync(password, hash);

  console.log(hashVerify2);
  return hashVerify2;
}

// function for generating password hash before storage
async function genPassword(password) {
  let salt2 = await bcrypt.genSalt(10);

  var hash = bcrypt.hashSync(password, salt2);

  return hash;

  // return {
  //   salt: salt2,
  //   hash: genhash2,
  // };
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
