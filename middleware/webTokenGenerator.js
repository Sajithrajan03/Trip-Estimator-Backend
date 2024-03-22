const paseto = require('paseto');
const {V4: {sign}} = paseto;
const fs = require('fs');
const secret_key = "sajithrajan"

async function createToken(data) {
    data.secret_key = secret_key;
    const private_key = fs.readFileSync('./RSA/private_key.pem');
    var token = "";
    token = await sign(data, private_key, { expiresIn: '240m' });

    return token;
}

module.exports = createToken;