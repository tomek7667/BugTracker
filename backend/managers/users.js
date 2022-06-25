const bcrypt = require('bcrypt');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const privateKey = process.env.PRIV_KEY || "Development key";
let nodemailer = require('nodemailer');
const saltRounds = 12;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ALERTER_MAIL || 'example@gmail.com',
        pass: process.env.ALERTER_PASSWORD || "p@ssw0rd"
    }
});

let sendActivationLink = (username, receiver, activationToken) => {
    let emailTitle = "Activate your account | Track Your Bugs";
    // The link should be changed to product url
    let emailText = `<h1>Activation link for ${receiver}</h1><h2>To activate your account click <a href="http://localhost:3000/verifyAccount?activationToken=${activationToken}">here</a>.</h2>`;
    let mailOptions = {
        from: 'Track Your Bugs',
        to: receiver,
        subject: emailTitle,
        html: emailText
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.error(error);
        } else {
            console.log(info);
        }
    });
}

let usersManager = {
    con: null,
    setCon: function (con) {
        this.con = con;
    },
    login: function (username, password) {
        return new Promise((resolve, reject) => {
            username = username.trim();
            if (username.includes('@')) {
                this.con.query("SELECT hash FROM users WHERE email = ?", [username], (err, result) => {
                    if (err) return reject({success: false, message: "Error: " + err.stack});
                    if (result.length === 0) {
                        return reject({success: false, message: "No such user found"});
                    } else {
                        let hashedPassword = result[0].hash;
                        if (!bcrypt.compareSync(password, hashedPassword)) {
                            return reject({success: false, message: "Wrong password"});
                        } else {
                            let token = jwt.sign({
                                username: username},
                                privateKey,
                                {expiresIn: '7d'}
                            );
                            return resolve({success: true, message: "Login successful", token: token});
                        }
                    }
                });
            } else {
                this.con.query("SELECT hash FROM users WHERE username = ?", [username], (err, result) => {
                    if (err) return reject({success: false, message: "Error: " + err.sqlMessage});
                    if (result.length === 0) {
                        return reject({success: false, message: "No such user found"});
                    } else {
                        let hashedPassword = result[0].hash;
                        if (!bcrypt.compareSync(password, hashedPassword)) {
                            return reject({success: false, message: "Wrong password"});
                        } else {
                            let token = jwt.sign(
                                { loggedAs: username },
                                privateKey,
                                { expiresIn: '7d'}
                            );
                            return resolve({success: true, token: token});
                        }
                    }
                });
            }
        })
    },
    register: function (username, password, email) {
        return new Promise((resolve, reject) => {
            username = username.trim();
            // Check if valid characters
            if (!/^[a-zA-Z0-9_]*$/.test(username)) return reject({success: false, message: "Your username have wrong characters"});
            // Check if length is valid
            if (username.length > 256) return reject({success: false, message: "Your username is too long"});
            if (username.length < 3) return reject({success: false, message: "Your username is too short"});
            // Check if the password contains valid characters
            if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.?]*$/.test(password)) return reject({success: false, message: "Your password can't have other special characters than [ !@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.? ]"});
            // Validate an email address
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reject({success: false, message: "Your email address is not valid"});
            if (email.length > 64) return reject({success: false, message: "Your email address is too long"});
            let hashedPassword = bcrypt.hashSync(password, saltRounds);
            // Create random hex string with length 256
            let activationToken = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
            this.con.query("INSERT INTO users (username, hash, email, activationToken) VALUES (?, ?, ?, ?)", [username, hashedPassword, email, activationToken], (err, result) => {
                if (err) return reject({success: false, message: "Error: " + err.sqlMessage });
                if (result.length === 0) {
                    return reject({success: false, message: "Somewthing went wrong"});
                } else {
                    sendActivationLink(username, email, activationToken);
                    let token = jwt.sign(
                        { loggedAs: username },
                        privateKey,
                        { expiresIn: '7d'}
                    );
                    return resolve({ success: true, token: token });
                }
            });
        })
    },
    verify: (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, privateKey, (err, decoded) => {
                if (err !== null) return reject({ success: false });
                else return resolve({ success: true, username: decoded.loggedAs });
            })
        })
    },
    updateLastLogged: function (username) {
        return new Promise((resolve, reject) => {
            this.con.query("UPDATE users SET lastLogged = NOW() WHERE username = ?", [username], (err, result) => {
                if (err) return reject({ message: "Error: " + err.sqlMessage, success: false });
                if (result.affectedRows === 0) {
                    return reject({ success: false, message: "Something went wrong" });
                } else {
                    return resolve({ success: true });
                }
            });
        })
    },
    verifyAccount: function (activationToken) {
        return new Promise((resolve, reject) => {
            this.con.query("UPDATE users SET isActivated = 1 WHERE activationToken = ? AND isActivated = 0", [activationToken], (err, result) => {
                if (err) return reject({ success: false, message: "Error: " + err.sqlMessage });
                if (result.affectedRows === 0) {
                    return reject({ success: false, message: "Something went wrong" });
                } else {
                    return resolve({ success: true });
                }
            });
        })
    }
}

module.exports = usersManager;