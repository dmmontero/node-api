const express = require("express");
const app = express();
const Usuario = require("../models/usuario");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const _ = require("underscore");

app.get("/usuario", (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    Usuario.find({
                estado: true,
            },
            "nombre email img role estado google"
        )
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    err,
                });
            }

            Usuario.count({
                    estado: true,
                },
                (err, count) => {
                    res.json({
                        ok: true,
                        usuarios,
                        cuantos: count,
                    });
                }
            );
        });
});

app.post("/usuario", (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, saltRounds),
        role: body.role,
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                err,
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

app.put("/usuario/:id", (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

    Usuario.findByIdAndUpdate(
        id,
        body, {
            new: true,
            runValidators: true,
        },
        (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    err,
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
            });
        }
    );
});

app.patch("/usuario", (req, res) => {
    res.json("pacth Usuario");
});

app.delete("/usuario", (req, res) => {
    let id = req.body.id;

    Usuario.findByIdAndDelete(id, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err,
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: "Usuario no encontrado",
                },
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB,
        });
    });
});

app.delete("/usuario/:id", (req, res) => {
    let id = req.params.id;

    let estado = {
        estado: false,
    };

    Usuario.findByIdAndUpdate(
        id,
        estado, {
            new: true,
        },
        (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    err,
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: "Usuario no encontrado",
                    },
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
            });
        }
    );
});

module.exports = app;