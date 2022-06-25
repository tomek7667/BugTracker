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
    getUsers: function (callback) {
        return new Promise((resolve, reject) => {
            this.con.query('SELECT * FROM users', function (err, result) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(result);
                }
            });
        })
    },
    login: (user, password) => {
        return new Promise((resolve, reject) => {
            let login = user.trim();
            this.con.query("SELECT hash FROM users WHERE login = ?", [login, password], (err, result) => {
                if (err) return reject({success: false, msg: "Mysql error:" + err.stack});
                if (result.length === 0) {
                    return reject({success: false, msg: "No such user found"});
                } else {
                    let hashedPassword = result[0].hash;
                    if (!bcrypt.compareSync(password, hashedPassword)) {
                        return reject({success: false, msg: "Wrong password"});
                    } else {
                        return resolve({
                            success: true, token: jwt.sign(
                                { loggedAs: login },
                                privateKey,
                                { expiresIn: '7d'} )
                        });
                    }
                }
            });
        })
    },
    verify: (cookie) => {
        return new Promise((resolve, reject) => {
            jwt.verify(cookie, privateKey, (err, decoded) => {
                    if (err !== null) return reject(false);
                    else return resolve(decoded.loggedAs);
                })
        })
    }
}

module.exports = usersManager;