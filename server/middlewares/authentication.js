/**
 * Verificar toke usuario
 */
const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                error: {
                    mensaje: 'Token no válido',
                    err
                }
            })
        }

        //decode contiene el token decodificado
        req.usuario = decoded.usuario;
        next();

    });
}


let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;
    if (usuario && usuario.role === 'ADMIN_ROLE') {
        next();
        return
    }

    return res.status(401).json({
        ok: false,
        err: {
            message: 'Operación no válida'
        }
    });

}

module.exports = {
    verificaToken,
    verificaAdminRole
};