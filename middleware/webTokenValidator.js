const paseto = require('paseto');
const { V4: { verify } } = paseto;
const fs = require('fs');
const secret_key = "sajithrajan"
async function tokenValidator(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (tokenHeader == null || token == null) {
        res.status(401).send({
            "ERROR": "No Token. Warning."
        });
        return;
    }

    const public_key = fs.readFileSync('./RSA/public_key.pem');
    try {
        const payLoad = await verify(token, public_key);
        if (payLoad["secret_key"] == secret_key) {
             
             
            req.body.userEmail = payLoad["userEmail"];
            req.body.userName = payLoad["userName"];
            req.body.userGender = payLoad["userGender"];
            req.body.accountStatus = payLoad["accountStatus"];
            
            next();
            
            return;
        } else {
            res.status(401).send({
                "ERROR": "Unauthorized access. Warning."
            });
            return;
        }
    } catch (err) {
         
        res.status(401).send({
            "ERROR": "Unauthorized access. Warning.",
             
        });
        return;
    }

}

module.exports = tokenValidator;