const mongoose = require('mongoose');

const schemaProdotto = new mongoose.Schema({
    titolo: { type: String, required: true },
    prezzo: { type: Number, required: true },
    condizione: { type: String },
    // Ora è un Array (racchiuso tra parentesi quadre) per salvare più link
    immagini: [{ type: String }] 
});

module.exports = mongoose.model('Product', schemaProdotto);