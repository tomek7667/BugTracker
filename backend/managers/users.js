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
            // console.error(error);
        } else {
            // console.log(info);
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
            this.con.query("INSERT INTO users (username, hash, email, activationToken) VALUES (?, ?, ?, ?)", [username, hashedPassword, email, activationToken], async (err, result) => {
                if (err) return reject({success: false, message: "Error: " + err.sqlMessage });
                if (result.length === 0) {
                    return reject({success: false, message: "Somewthing went wrong"});
                } else {
                    sendActivationLink(username, email, activationToken);
                    let userID = result.insertId;
                    await this.con.query("INSERT INTO profiles (userID) VALUES (?)", [userID]);
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
    },
    getUserInformation: function (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, privateKey, (err, decoded) => {
                if (err !== null) return reject({ success: false, message: "Something went wrong" });
                else {
                    this.con.query("SELECT username, email, lastLogged, stars, created, isActivated FROM users WHERE username = ?", [decoded.loggedAs], (err, result) => {
                        if (err) return reject({ success: false, message: "Error: " + err.sqlMessage });
                        if (result.length !== 1) {
                            return reject({ success: false, message: "Something went wrong" });
                        } else {
                            return resolve({ success: true, username: result[0].username, email: result[0].email, lastLogged: result[0].lastLogged, stars: result[0].stars, created: result[0].created, isActivated: result[0].isActivated });
                        }
                    });
                }
            })
        })
    },
    getProfileInformation: function (token, username) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, privateKey, (err, decoded) => {
                if (err !== null) return reject({ success: false, message: "Something went wrong" });
                else {
                    let tokenUsername = decoded.loggedAs;
                    this.con.query("SELECT description, lastChanged, country, workplace FROM profiles INNER JOIN users ON users.ID = profiles.userID WHERE users.username = ? AND (users.username = ? OR profiles.isPublic = 1)", [username, tokenUsername], (err, result) => {
                        if (err) return reject({ success: false, message: "Error: " + err.sqlMessage });
                        if (result.length !== 1) {
                            return reject({ success: false, message: "Something went wrong" });
                        } else {
                            return resolve({ success: true, description: result[0].description, lastChanged: result[0].lastChanged, country: result[0].country, workplace: result[0].workplace });
                        }
                    });
                }
            })
        })
    },
    updateProfileInformation: function (token, email, workplace, description, country) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, privateKey, (err, decoded) => {
                if (err !== null) return reject({ success: false, message: "Something went wrong" });
                else {
                    let tokenUsername = decoded.loggedAs;
                    // Check if the email has changed
                    this.con.query("SELECT email FROM users WHERE username = ?", [tokenUsername], async (err, result) => {
                        if (err) return reject({ success: false, message: "Error: " + err.sqlMessage });
                        if (result.length !== 1) {
                            return reject({ success: false, message: "Something went wrong" });
                        } else {
                            let oldEmail = result[0].email;
                            // Check if the description is too long
                            if (description.length > 1023) return reject({ success: false, message: "Your description is too long" });
                            // Check if the country is too long
                            if (country.length > 31) return reject({ success: false, message: "Your country is too long" });
                            // Check if the workplace is too long
                            if (workplace.length > 127) return reject({ success: false, message: "Your workplace is too long" });
                            // Check if the country is valid
                            if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.?]*$/.test(country)) return reject({ success: false, message: "Your country can't have other special characters than [ !@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.? ]" });
                            // Check if the workplace is valid
                            if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.?]*$/.test(workplace)) return reject({ success: false, message: "Your workplace can't have other special characters than [ !@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.? ]" });
                            // Check if the description is valid
                            if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.?]*$/.test(description)) return reject({ success: false, message: "Your description can't have other special characters than [ !@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.? ]" });
                            // Check if the email is valid
                            if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.?]*$/.test(email)) return reject({ success: false, message: "Your email can't have other special characters than [ !@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.? ]" });
                            // Check if the email is already in use
                            if (oldEmail !== email) {
                                let activationToken = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
                                let isThereMail = await (new Promise(resolve => {
                                    this.con.query("SELECT ID FROM users WHERE email = ?", [email], (err, result) => {
                                        if (err) return reject({ success: false, message: "Error: " + err.sqlMessage });
                                        if (result.length === 1) return resolve(true);
                                        else return resolve(false);
                                    });
                                }));
                                if (isThereMail) return reject({ success: false, message: "This email is already in use" });
                                await this.con.query("UPDATE users SET email = ?, activationToken = ?, isActivated = 0 WHERE username = ?", [email, activationToken, tokenUsername]);
                                sendActivationLink(tokenUsername, email, activationToken);
                            }
                            this.con.query("UPDATE profiles INNER JOIN users ON users.ID = profiles.userID SET description = ?, lastChanged = NOW(), country = ?, workplace = ? WHERE users.username = ?", [description, country, workplace, tokenUsername], (err, result) => {
                                if (err) return reject({ success: false, message: "Error: " + err.sqlMessage });
                                if (result.affectedRows === 0) {
                                    return reject({ success: false, message: "Something went wrong" });
                                } else {
                                    return resolve({ success: true });
                                }
                            });

                        }
                    })
                }
            })
        })
    }
}

module.exports = usersManager;