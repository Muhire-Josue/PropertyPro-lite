const express = require("express");
const app = express();
const user = require("./model/user")
const jwt = require("jsonwebtoken")
//const auth = require("./middleware/auth")

app.use(express.json());


//generates tokens
const generateToken = (thisUser)=>{
    const token = jwt.sign({ thisUser }, "apisecretkey")
    return token
}



app.post("/signup/api/v1/", (req, res)=>{
    const newUser = req.body;
    let token = generateToken(newUser);
    newUser.token = token
    newUser.id = user.length +1;
    user.push(newUser);
    res.send({status: "success", data: user, token: token})
});

//User signin
app.post("/signin/api/v1/", (req, res)=>{
    const currentUser = user.find(u=>u.email === req.body.email)
    if(currentUser.password === req.body.password){
        let token = generateToken(currentUser)
        res.send({status: "success", data: currentUser, token: token})
    }
    res.status(404).send({status: "error", error: "Could not find user"})
})

app.get("/test/", verifyToken, (req, res)=>{
    jwt.verify(req.token, "apisecretkey", (error, authData)=>{
        if(error){
            res.status(400).send("Unauthorized access");
        } else {
            res.send({
                status: "success",
                authData
            })
        }
    });
});

function verifyToken(req, res, next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== undefined){

        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1];
        req.token = bearerToken
        next()

    } else {
        res.status(403).send("Auth failed")
    }
}


app.listen(3001, ()=>{
    // eslint-disable-next-line no-console
    console.log("server listning on port 3001");
    
});
