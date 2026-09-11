const mongoose = require('mongoose');

const schemaProdotto = new mongoose.Schema({
    titolo: { type: String, required: true },
    prezzo: { type: Number, required: true },
    condizione: { type: String },
    categoria: { type: String }, // <-- AGGIUNTA LA CATEGORIA
    descrizione: { type: String },
    immagini: [{ type: String }] 
});

module.exports = mongoose.model('Product', schemaProdotto);