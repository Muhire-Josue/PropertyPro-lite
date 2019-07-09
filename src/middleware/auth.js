const jwt = require("jsonwebtoken");


const auth = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== undefined) {

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'apisecretkey', (error, data)=>{
            if(error){
                throw new Error("Authentication failed");
            } else {
                req.user = data;
            }
        });
        next();

    } else {
        res.status(403).send("Auth failed")
    }
}

//generates tokens
const generateToken = (thisUser) => {
    const token = jwt.sign({ thisUser }, "apisecretkey");
    return token
}

module.exports = {auth, generateToken}