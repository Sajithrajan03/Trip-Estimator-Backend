const peseto = require('paseto');
const {V4: {sign,verify}} = peseto;
const fs = require('fs')
const secret_key = "sajithrajan"
async function createToken(data){
    data.secret_key= secret_key;
    const private_key = fs.readFileSync('./RSA/private_key.pem')
    var token = "";
    token = await sign(data,private_key,{expiresIn:'15s'})
    console.log(token);
    return token;
}
async function tokenValidator(token) {
    const public_key = fs.readFileSync('./RSA/public_key.pem');
    try {
        const payLoad = await verify(token, public_key);
        console.log(payLoad);
        return payLoad; // Returning payload for further processing if needed
    } catch (err) {
        console.error("ERROR:", err.message);
        throw err; // Rethrowing error for the caller to handle
    }
}


async function runTokenValidator() {
    const token = await createToken({ "name": "sajith" });
    try {
        await tokenValidator(token);
        console.log("Token is valid.");
    } catch (error) {
        console.error("Token validation failed:", error);
    }
}

runTokenValidator();




