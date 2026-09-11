const mongoose = require('mongoose');

const schemaProdotto = new mongoose.Schema({
    titolo: { type: String, required: true },
    prezzo: { type: Number, required: true },
    condizione: { type: String },
    categoria: { type: String },
    descrizione: { type: String },
    immagini: [{ type: String }],
    // I DUE NUOVI CAMPI:
    codice_articolo: { type: String, unique: true },
    stato_vendita: { type: String, default: 'Disponibile' } 
});

module.exports = mongoose.model('Product', schemaProdotto);