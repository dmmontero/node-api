const express = require("express");
var Categoria = require('../models/categoria');

const {
    verificaToken,
    verificaAdminRole
} = require("../middlewares/authentication");
const app = express();

const _ = require("underscore");

/**
 * Obtener todas la ategorias pagindas
 */
app.get("/categoria", verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    Categoria.find({})
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate('usuario','nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    err,
                });
            }

            Categoria.count(
                (err, count) => {
                    res.json({
                        ok: true,
                        categorias,
                        cuantos: count,
                    });
                }
            );
        });
});

/**
 * Obterner categoria por Id de categoria
 */
app.get("/categoria/:id", (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                err,
            });
        }

        /**
         * categoria no encontrada
         */
        if (!categoriaDB) {
            return res.status(404).json({
                ok: false,
                error: {
                    message: "Categoria no encontrada",
                },
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });

    })
});

/**
 * Crear uan nueva categoria
 */
app.post("/categoria", [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
        });
    });
});

/**
 * Modificar una categoria
 */
app.put("/categoria/:id", [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(
        id,
        descCategoria, {
            new: true,
            runValidators: true
        },
        (err, categoriaDB) => {

            if (err) {
                return res.status(500).json({
                    err
                });
            }

            /**
             * Categoria no ecnontrada
             */
            if (!categoriaDB) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        message: "Categoria no encontrada",
                    },
                });
            }

            res.json({
                ok: true,
                categoria: categoriaDB,
            });
        }
    );
});

/**
 * Eliminar categoria de la base de datos
 */
app.delete("/categoria/:id", [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                err,
            });
        }

        if (!categoriaDB) {
            return res.status(404).json({
                ok: false,
                error: {
                    message: "Categoria no encontrada",
                },
            });
        }

        res.json({
            ok:true,
            categoria: categoriaDB
        });
    });

});
// app.delete("/usuario", [verificaToken, verificaAdminRole], (req, res) => {
//     let id = req.body.id;

//     Usuario.findByIdAndDelete(id, (err, usuarioDB) => {
//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err,
//             });
//         }

//         if (!usuarioDB) {
//             return res.status(400).json({
//                 ok: false,
//                 error: {
//                     message: "Usuario no encontrado",
//                 },
//             });
//         }

//         res.json({
//             ok: true,
//             usuario: usuarioDB,
//         });
//     });
// });

module.exports = app;