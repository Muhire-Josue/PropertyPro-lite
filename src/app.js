const express = require("express");
const app = express();
const user = require("./model/user");
let property = require("./model/property");
const { auth, generateToken } = require("./middleware/auth");

app.use(express.json());




//User signup
app.post("/signup/api/v1/", (req, res) => {
    const newUser = req.body;
    let token = generateToken(newUser);
    newUser.token = token
    user.push(newUser);
    res.send({ status: "success", data: user, token: token });
});



//User signin
app.post("/signin/api/v1/", (req, res) => {
    const currentUser = user.find(u => u.email === req.body.email);
    if (currentUser.password === req.body.password) {
        let token = generateToken(currentUser);
        currentUser.token = token;
        res.send({ status: "success", data: currentUser, token: token });
    }
    res.status(404).send({ status: "error", error: "Could not find user" });
});



//auth test
// app.get("/test/", auth, (req, res) => {
//     jwt.verify(req.token, "apisecretkey", (error, authData) => {
//         if (error) {
//             res.status(400).send("Unauthorized access");
//         } else {
//             res.send({
//                 status: "success",
//                 authData
//             })
//         }
//     });
// });




//post property
app.post("/property/api/v1/", auth, (req, res) => {

    try {
        let newProperty = req.body;
        newProperty.owner = req.user.thisUser.id;
        newProperty.id = property.length + 1;
        property.push(newProperty);
        res.status(201).send({ status: 'success', data: newProperty });

    } catch (error) {
        res.status(401).send({ status: 'error', error: error });
    }
});



//get all property
app.get("/property/api/v1", (req, res) => {

    if (req.query.type) {
        property = property.filter(u => u.type === req.query.type);
        res.send(property);
    } else {
        res.send(property);
    }

});



//update property
app.patch('/property/:propertyid/api/v1', auth, function (req, res) {
    //const newProperty = property.find(u=>u.id === parseInt(req.params.propertyid));
    const propertIndex = property.findIndex(u => u.id === parseInt(req.params.propertyid));

    if (property[propertIndex].owner === req.user.thisUser.id) {

        property[propertIndex].id = parseInt(req.params.propertyid);
        property[propertIndex].owner = req.user.thisUser.id;
        property[propertIndex] = req.body;
        res.send(property[propertIndex]);

    } else {
        res.status(404).send({ status: 'error', error: 'Unauthorized to alter object' })
    }


});


//delete property
app.delete("/property/:propertyid/api/v1", auth, (req, res) => {
    property = property.filter((obj) => {

        return obj.id !== parseInt(req.params.propertyid);

    });
    res.send(property)
});


//mark a property as sold
app.patch("/property/:propertyid/sold/api/v1", auth, (req, res) => {
    const propertIndex = property.findIndex(u => u.id === parseInt(req.params.propertyid));
    if (property[propertIndex].owner === req.user.thisUser.id) {
        property[propertIndex].status = "sold";
        res.send(property[propertIndex])
    } else {
        res.status(401).send({status: 'error', error: 'Unauthorized to alter object'});
    }

});


//get property by id
app.get("/property/:propertyid/api/v1", (req, res) => {
    const propertIndex = property.findIndex(u => u.id === parseInt(req.params.propertyid));
    res.send(property[propertIndex]);
});

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("server listning on port 3000");

});
