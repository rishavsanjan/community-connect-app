const { User } = require("./db");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../backend/config');


function middleWare(req, res, next) {
    const { email } = req.body;

    User.findOne({
        email: email
    }).then((value) => {
        if (value) {
            return res.status(409).json({ message: "User already exists" });
        } else {
            next();
        }
    })
}


function emailCheckMiddlware(req, res, next) {
    const { email } = req.body;
    User.findOne({
        email: email,
    }).then((value) => {

        if (value) {

            next();
        } else {

            return res.status(409).json({ message: "User does not  exists" });
        }
    })
}

function passwordCheckMiddlware(req, res, next) {
    const { email } = req.body;
    const { password } = req.body;


    User.findOne({
        email: email,
        password: password,
    }).then((value) => {
        if (value) {
            next();
            const token = jwt.sign({
                email
            }, JWT_SECRET)
            res.json({ token })
        } else {
            return res.status(409).json({ message: "Wrong Password! Please Try Again" });
        }
    })
}

async function profileMiddleWare(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ msg: "token missing" })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(403).json({ msg: "User not found" });
        }
        req.user = user;
        next();
    } catch (e) {
        return res.status(403).json({ msg: "invalid token" });
    }

}

async function loginCheck(req, res, next){
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Wrong Password! Please Try Again" });
        }

        const token = jwt.sign({ email }, JWT_SECRET);
        return res.json({ token });

    } catch (error) {
        next(error);
    }
}




module.exports = { middleWare, emailCheckMiddlware, passwordCheckMiddlware, profileMiddleWare, loginCheck }
