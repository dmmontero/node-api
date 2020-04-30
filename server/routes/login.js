const express = require("express");
const Usuario = require("../models/usuario");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const saltRounds = 10;
//google authentication
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                err,
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contaseña invalidos!'
                }
            });
        }

        //Compara clave encrypatada (de un solo sentido) con clave enviada
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contaseña) inválidos!'
                }
            });

        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN,
            algorithm: 'HS256'
        })

        res.json({
            ok: true,
            Usuario: usuarioDB,
            token
        });
    })
})

/**
 * nfiguracion Google Sign In
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

let createToken = (usuario) => {
    let token = jwt.sign({
        usuario: usuario
    }, process.env.SEED, {
        expiresIn: process.env.CADUCIDAD_TOKEN,
        algorithm: 'HS256'
    });

    return token;
}

app.post('/google', (req, res) => {

    let token = req.body.idtoken;
    console.log(token);

    verify(token)
        .then((data) => {

            Usuario.findOne({
                email: data.email
            }, (err, usuarioDB) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err,
                    });
                }

                if (usuarioDB) {

                    if (!usuarioDB.google) {
                        return res.status(400).json({
                            ok: false,
                            error: {
                                message: "Debe usar autenticación normal",
                            },
                        });
                    } else {

                        let token = createToken(usuarioDB);

                        return res.json({
                            ok: true,
                            usuario: usuarioDB,
                            token
                        });

                    }
                } else {
                    //crear usuario (es su primer login con Google Sign In)
                    let usuario = new Usuario({
                        nombre: data.nombre,
                        email: data.email,
                        img: data.img,
                        password: bcrypt.hashSync(':)', saltRounds),
                        google: true
                    });


                    usuario.save((err, googleUsrDB) => {

                        if (err) {
                            return res.status(400).json({
                                err,
                            });
                        }

                        let token = createToken(googleUsrDB);

                        return res.json({
                            ok: true,
                            usuario: googleUsrDB,
                            token
                        });

                    });
                }
            });
        })
        .catch(e => {
            return res.status(403).json({
                ok: false,
                error: e
            });
        });
})

module.exports = app;