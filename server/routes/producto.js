const express = require("express");
const Producto = require('../models/producto');
const _ = require("underscore");

const {
    verificaToken,
    verificaAdminRole
} = require("../middlewares/authentication");

const app = express();

/**
 * Obtener todos los productos (paginados)
 */
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 0;
    limite = Number(limite);

    Producto.find({
            disponible: true
        })
        .skip(desde)
        .limit(limite)
        // .sort('descripcion')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    err,
                });
            }

            Producto.countDocuments(
                (err, count) => {
                    res.json({
                        ok: true,
                        productos,
                        cuantos: count,
                    });
                }
            );
        });
});


/**
 * Obtener Producto por Id
 */
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    err,
                });
            }

            /**
             * Producto no encontrado
             */
            if (!productoDB) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        message: "Producto no encontrado",
                    },
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
            });
        })
});

/**
 * Buscar productos
 */
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({
            nombre: regex
        })
        .populate('categoria', 'descripcion')
        // .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    err,
                });
            }

            res.json({
                ok: true,
                productos
            })

        });
})

/**
 * Crear un  nuevo producto
 */
app.post('/producto', [verificaToken], (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                err,
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
        });
    });
});

/**
 * Actualizar producto
 */
app.put('/producto/:id', [verificaToken], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ["nombre", "precioUni", "descripcion", "disponible", "categoria"]);

    Producto.findByIdAndUpdate(
        id,
        body, {
            new: true,
            runValidators: true,
        },
        (err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    err,
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: productoDB,
            });
        }
    );

});

/**
 * Borrado lógico (disponible)
 */


app.delete('/producto/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    let disponible = {
        disponible: false,
    };

    Producto.findByIdAndUpdate(id, disponible, {
        new: true
    }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                err,
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    mensaje: "Producto no encontrado",
                },
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            mensaje: 'Porducto borrado'
        });

    })
});

module.exports = app;