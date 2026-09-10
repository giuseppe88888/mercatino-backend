const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    titolo: { type: String, required: true },
    descrizione: { type: String, required: true },
    prezzo: { type: Number, required: true },
    condizione: { type: String },
    immagine: { type: String } // Il campo per il nome del file
});

module.exports = mongoose.model('Product', productSchema);