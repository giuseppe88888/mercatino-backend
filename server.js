const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns'); 
const multer = require('multer'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Product = require('./models/Product');
// La password segreta per gestire i prodotti (cambiala con quella che vuoi)
const PASSWORD_ADMIN = "supersegreta123";

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

// Rotta per aggiungere un prodotto (PROTETTA)
app.post('/api/prodotti', upload.single('immagine'), async (req, res) => {
    // 1. Controlla la password
    if (req.body.password !== PASSWORD_ADMIN) {
        return res.status(401).send("Password errata. Non sei autorizzato.");
    }

    try {
        let imageUrl = null;
        // ... (IL RESTO DEL TUO CODICE PER CARICARE L'IMMAGINE E SALVARE NEL DATABASE RIMANE UGUALE)
        if (req.file) {
            imageUrl = req.file.path;
        }
        
        const nuovoProdotto = new Product({
            titolo: req.body.titolo,
            prezzo: req.body.prezzo,
            condizione: req.body.condizione,
            immagine: imageUrl
        });

        await nuovoProdotto.save();
        res.redirect('/admin.html'); // Ti rimanda al pannello di controllo dopo l'aggiunta
    } catch (errore) {
        res.status(500).send("Errore nel salvataggio del prodotto: " + errore.message);
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
// Rotta per eliminare un prodotto (PROTETTA)
app.delete('/api/prodotti/:id', async (req, res) => {
    // La password in questo caso ci arriva tramite un "header" della richiesta fetch
    const passwordRicevuta = req.headers['authorization'];
    
    if (passwordRicevuta !== PASSWORD_ADMIN) {
        return res.status(401).send("Password errata. Non sei autorizzato.");
    }

    try {
        const idProdotto = req.params.id; 
        await Product.findByIdAndDelete(idProdotto); 
        res.send('Prodotto eliminato con successo!');
    } catch (errore) {
        res.status(500).send('Errore nella cancellazione: ' + errore.message);
    }
});
app.listen(3000, () => console.log('✅ Server acceso e in ascolto sulla porta 3000!'));