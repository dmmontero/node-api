const mongoose = require('mongoose'); // Erase if already required
// const uniqueValidator = require('mongoose-unique-validator'); // Mongoose validator
const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
var categoriaSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descrición es requerida']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario"
    },

});


/**
 * Validador de campo único
 */
// categoriaSchema.plugin(uniqueValidator, {
//     message: '{PATH} debe ser único'
// });



//Export the model
module.exports = mongoose.model('Categoria', categoriaSchema, 'categorias');