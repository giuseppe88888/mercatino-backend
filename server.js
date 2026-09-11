const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns'); 
const multer = require('multer'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Product = require('./models/Product');
const jwt = require('jsonwebtoken'); // NUOVO: Gestore Token
const cookieParser = require('cookie-parser'); // NUOVO: Gestore Cookie

const PASSWORD_ADMIN = "supersegreta123";
const CHIAVE_SEGRETA_JWT = "chiave_molto_complessa_e_segreta_12345"; // Serve per criptare il pass

dns.setServers(['8.8.8.8', '8.8.4.4']);
const LINK_STANDARD = "mongodb+srv://pepoforesta05_db_user:jUWRTwEZfskalkwf@cluster0.zrlphhz.mongodb.net/magazzino?appName=Cluster0";

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Per leggere i dati JSON dal login
app.use(cookieParser()); // Attiva la lettura dei cookie

// --- CONFIGURAZIONE CLOUDINARY ---
cloudinary.config({
    cloud_name: 'tyhbsvkg',
    api_key: '375996217519162',
    api_secret: 'N0w_XnrVwCYCY6QHOHvsPvmjQ5I'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mercatino_online',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});
const upload = multer({ storage: storage });

mongoose.connect(LINK_STANDARD)
    .then(() => console.log('📦 Database collegato con successo!'))
    .catch((err) => console.log('❌ Errore DB:', err.message));


// --- MIDDLEWARE DI SICUREZZA (Il "Buttafuori") ---
// Questa funzione intercetta le richieste e controlla se l'utente ha il token valido
function controllaAutenticazione(req, res, next) {
    const token = req.cookies.admin_token; // Cerca il pass nel browser
    
    if (!token) {
        return res.status(401).send("Accesso negato. Devi fare il login.");
    }

    try {
        // Verifica che il pass sia autentico e non falsificato
        jwt.verify(token, CHIAVE_SEGRETA_JWT);
        next(); // Pass valido! Lascialo passare.
    } catch (err) {
        res.status(401).send("Token non valido o scaduto.");
    }
}


// --- ROTTE PUBBLICHE (Aperte a tutti) ---

// 1. Invia i prodotti alla vetrina
app.get('/api/prodotti', async (req, res) => {
    try {
        const tuttiIProdotti = await Product.find();
        res.json(tuttiIProdotti);
    } catch (errore) {
        res.status(500).send('Errore nel recupero prodotti: ' + errore.message);
    }
});
// Rotta per recuperare i dettagli di un singolo prodotto
app.get('/api/prodotti/:id', async (req, res) => {
    try {
        const prodotto = await Product.findById(req.params.id);
        if (!prodotto) return res.status(404).send('Prodotto non trovato');
        res.json(prodotto);
    } catch (errore) {
        res.status(500).send('Errore nel recupero prodotto: ' + errore.message);
    }
});
// 2. Rotta per il Login (Rilascia il pass)
app.post('/api/login', (req, res) => {
    const passwordInserita = req.body.password;

    if (passwordInserita === PASSWORD_ADMIN) {
        // Crea il pass (scade dopo 12 ore)
        const token = jwt.sign({ ruolo: 'admin' }, CHIAVE_SEGRETA_JWT, { expiresIn: '12h' });
        
        // Lo salva nel browser in modo sicuro (impossibile da rubare via Javascript)
        res.cookie('admin_token', token, { httpOnly: true, maxAge: 12 * 60 * 60 * 1000 });
        res.status(200).send({ messaggio: 'Login effettuato!' });
    } else {
        res.status(401).send({ errore: 'Password errata' });
    }
});

// 3. Rotta per il Logout (Strappa il pass)
app.post('/api/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.status(200).send({ messaggio: 'Logout effettuato' });
});


// --- ROTTE PROTETTE (Serve il pass per passare) ---
// Notare che ho inserito "controllaAutenticazione" in mezzo!

// Rotta per aggiungere un prodotto (Accetta fino a 6 immagini)
app.post('/api/prodotti', controllaAutenticazione, upload.array('immagini', 6), async (req, res) => {
    try {
        const urlsImmagini = req.files ? req.files.map(file => file.path) : [];
        
        // Genera un codice casuale tipo MER-18492
        const codiceGenerato = "MER-" + Math.floor(10000 + Math.random() * 90000);
        
        const nuovoProdotto = new Product({
            titolo: req.body.titolo,
            prezzo: req.body.prezzo,
            condizione: req.body.condizione,
            categoria: req.body.categoria,
            descrizione: req.body.descrizione,
            immagini: urlsImmagini,
            codice_articolo: codiceGenerato, // Salviamo il codice
            stato_vendita: req.body.stato_vendita // Salviamo lo stato
        });

        await nuovoProdotto.save();
        res.redirect('/admin.html');
    } catch (errore) {
        res.status(500).send("Errore salvataggio: " + errore.message);
    }
});

// Rotta per eliminare un prodotto
app.delete('/api/prodotti/:id', controllaAutenticazione, async (req, res) => {
    try {
        const idProdotto = req.params.id; 
        await Product.findByIdAndDelete(idProdotto); 
        res.send('Prodotto eliminato!');
    } catch (errore) {
        res.status(500).send('Errore cancellazione: ' + errore.message);
    }
});

app.listen(3000, () => console.log('✅ Server acceso sulla porta 3000!'));