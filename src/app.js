const express = require("express");
const app = express();
const user = require("./model/user")
let property = require("./model/property")
const jwt = require("jsonwebtoken")
//const auth = require("./middleware/auth")

app.use(express.json());


//generates tokens
const generateToken = (thisUser) => {
    const token = jwt.sign({ thisUser }, "apisecretkey")
    return token
}


//User signup
app.post("/signup/api/v1/", (req, res) => {
    const newUser = req.body;
    let token = generateToken(newUser);
    newUser.token = token
    newUser.id = user.length + 1;
    user.push(newUser);
    res.send({ status: "success", data: user, token: token });
});



//User signin
app.post("/signin/api/v1/", (req, res) => {
    const currentUser = user.find(u => u.email === req.body.email);
    if (currentUser.password === req.body.password) {
        let token = generateToken(currentUser);
        res.send({ status: "success", data: currentUser, token: token });
    }
    res.status(404).send({ status: "error", error: "Could not find user" });
})



//auth test
app.get("/test/", verifyToken, (req, res) => {
    jwt.verify(req.token, "apisecretkey", (error, authData) => {
        if (error) {
            res.status(400).send("Unauthorized access");
        } else {
            res.send({
                status: "success",
                authData
            })
        }
    });
});




//post property
app.post("/property/api/v1/", verifyToken, (req, res) => {

    jwt.verify(req.token, "apisecretkey", (error, authData) => {
        if (error) {
            res.status(400).send("Unauthorized access");
        } else {
            let newProperty = req.body
            newProperty.id = property.length + 1;
            newProperty.owner = authData.id;
            property.push(newProperty);
            res.send({ status: "success", data: newProperty })
        }
    });
});



//get all property
app.get("/property/api/v1", (req, res) => {
    
    if(req.query.type){
        property = property.filter(u => u.type === req.query.type);
        res.send(property);
    } else {
        res.send(property);
    }
    
});



//update property
app.patch('/property/:propertyid/api/v1', function (req, res) {
    //const newProperty = property.find(u=>u.id === parseInt(req.params.propertyid));
    const propertIndex = property.findIndex(u => u.id === parseInt(req.params.propertyid));
    property[propertIndex].id = parseInt(req.params.propertyid);
    property[propertIndex] = req.body;
    res.send(property[propertIndex]);

});


//delete property
app.delete("/property/:propertyid/api/v1", (req, res) => {
    property = property.filter(function (obj) {
        return obj.id !== parseInt(req.params.propertyid);
    });
    res.send(property)
});


//mark a property as sold
app.patch("/property/:propertyid/sold/api/v1", (req, res) => {
    const propertIndex = property.findIndex(u => u.id === parseInt(req.params.propertyid));
    property[propertIndex].status = "sold";
    res.send(property[propertIndex])
});


//get property by id
app.get("/property/:propertyid/api/v1", (req, res)=>{
    const propertIndex = property.findIndex(u => u.id === parseInt(req.params.propertyid));
    res.send(property[propertIndex]);
});






//verify token
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== undefined) {

        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1];
        req.token = bearerToken
        next()

    } else {
        res.status(403).send("Auth failed")
    }
}


app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("server listning on port 3000");

});
