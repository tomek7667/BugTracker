const bcrypt = require('bcrypt');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const privateKey = process.env.PRIV_KEY || "Development key";
const saltRounds = 12;

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
                    if (err) return reject({success: false, message: "Mysql error:" + err.stack});
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
                    if (err) return reject({success: false, message: "Error:" + err.sqlMessage});
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
            this.con.query("INSERT INTO users (username, hash, email) VALUES (?, ?, ?)", [username, hashedPassword, email], (err, result) => {
                if (err) return reject({success: false, message: "Error:" + err.sqlMessage });
                if (result.length === 0) {
                    return reject({success: false, message: "Somewthing went wrong"});
                } else {
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
                if (err) return reject({ message: "Error:" + err.sqlMessage, success: false });
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