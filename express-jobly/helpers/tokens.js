const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data
 * 
 * @param { String } user { username: "u1", isAdmin: false}
 * @returns { Object} payload: { username: "u1", isAdmin: false}
 */

function createToken(user) {
  // If the assertion is false, it will write an error 
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  // Data sent with any GET method from the user
  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  // Return a json token as String
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
