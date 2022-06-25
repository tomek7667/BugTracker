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
    },
    register: (login, password, email) => {
        return new Promise((resolve, reject) => {
            let login = login.trim();
            if (!/^[a-zA-Z0-9_]*$/.test(login)) return reject("Your username have wrong characters");
            if (login.length > 256) return reject("Your username is too long");
            if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.?]*$/.test(password)) reject("Your password can't have other special characters than [ !@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.? ]");
            // Validate an email address
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) reject("Your email address is not valid");
            if (email.length > 64) return reject("Your email address is too long");
            let hashedPassword = bcrypt.hashSync(password, saltRounds);
            this.con.query("INSERT INTO users (login, bcryptHash) VALUES (?, ?)", [login, hashedPassword], (err, result) => {
                if (err) return reject("mysql error:" + err.stack);
                if (result.length === 0) {
                    return reject({success: false, msg: "Somewthing went wrong"});
                } else {
                    let token = jwt.sign({ loggedAs: login }, privateKey, { expiresIn: '7d'});
                    return resolve({
                        success: true, token: token
                    });
                }
            });
        })
    }
}

module.exports = usersManager;