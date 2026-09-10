const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns'); 
const multer = require('multer'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Product = require('./models/Product');

// Forziamo i DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const LINK_STANDARD = "mongodb+srv://pepoforesta05_db_user:jUWRTwEZfskalkwf@cluster0.zrlphhz.mongodb.net/magazzino?appName=Cluster0";

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURAZIONE CLOUDINARY ---
cloudinary.config({
    cloud_name: 'tyhbsvkg',
    api_key: '375996217519162',
    api_secret: 'N0w_XnrVwCYCY6QHOHvsPvmjQ5I'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mercatino_online', // Cloudinary creerà questa cartella per le tue foto
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

const upload = multer({ storage: storage });
// ---------------------------------

mongoose.connect(LINK_STANDARD)
    .then(() => console.log('📦 Database collegato con successo!'))
    .catch((err) => console.log('❌ L\'errore vero di MongoDB è:', err.message));

// Rotta per salvare il prodotto
app.post('/api/prodotti', upload.single('immagine'), async (req, res) => {
    try {
        const datiDalForm = req.body; 
        
        // req.file.path ora contiene il LINK PUBBLICO fornito da Cloudinary, non più un percorso locale!
        const linkImmagineCloud = req.file ? req.file.path : '';

        const nuovoProdotto = new Product({
            titolo: datiDalForm.titolo,
            descrizione: datiDalForm.descrizione,
            prezzo: datiDalForm.prezzo,
            condizione: datiDalForm.condizione,
            immagine: linkImmagineCloud 
        });

        await nuovoProdotto.save(); 
        res.send('<h2>✅ Prodotto e foto salvati nel CLOUD!</h2><a href="/index.html">Vai alla Vetrina</a>');
    } catch (errore) {
        res.send('❌ Errore nel salvataggio: ' + errore.message);
    }
});

// Rotta per inviare i prodotti alla vetrina
app.get('/api/prodotti', async (req, res) => {
    try {
        const tuttiIProdotti = await Product.find();
        res.json(tuttiIProdotti);
    } catch (errore) {
        res.status(500).send('Errore nel recupero prodotti: ' + errore.message);
    }
});
// Rotta per eliminare un prodotto
app.delete('/api/prodotti/:id', async (req, res) => {
    try {
        // Prende l'ID del prodotto dall'indirizzo web
        const idProdotto = req.params.id; 
        
        // Cerca nel database quel prodotto e lo disintegra
        await Product.findByIdAndDelete(idProdotto); 
        
        res.send('Prodotto eliminato con successo!');
    } catch (errore) {
        res.status(500).send('Errore nella cancellazione: ' + errore.message);
    }
});
app.listen(3000, () => console.log('✅ Server acceso e in ascolto sulla porta 3000!'));