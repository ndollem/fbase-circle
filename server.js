const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const hbs = require('hbs');
const ip = require('ip');

app.set('view engine', 'hbs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    const data = {};
    res.render(__dirname+'/src/index.hbs', { data });
});
app.get('/demo-page1.html', (req, res) => {
    const data = {
        title: "Program hilirisasi pemerintah",
        content: "Hilirisasi yang ingin kita lakukan adalah hilirisasi yang melakukan transfer teknologi yang memanfaatkan sumber energi baru dan terbarukan, serta meminimalisir dampak lingkungan",
        ip: ip.address,
        url: 'demo-page1'
    };

    res.render(__dirname+'/src/page.hbs', { data });
});
app.get('/demo-page2.html', (req, res) => {
    const data = {
        title: "Bumbu sate ala restoran",
        content: "Bumbu sate menjadi salah satu bahan masakan yang banyak dicari. Sate sendiri adalah sajian khas nusantara yang telah dikenal hingga ke mancanegara. Sate merupakan potongan daging ayam hingga kambing yang ditata di atas tusuk lidi ditambah dengan serangkaian bumbu.",
        ip: ip.address,
        url: 'demo-page2'
    };

    res.render(__dirname+'/src/page.hbs', { data });
});
app.get('/demo-page3.html', (req, res) => {
    const data = {
        title: "Sejarah Jembatan Siti Nurbaya",
        content: "Jembatan Siti Nurbaya merupakan jembatan cantik yang membentang sepanjang 156 meter di atas sunggai Batang Arau, Kecamatan Padang Selatan, Kota Padang, Sumatera Barat. Jembatan yang didominasi warna merah kuning itu juga menjadi ikonnya Kota Padang.",
        ip: ip.address,
        url: 'demo-page3'
    };

    res.render(__dirname+'/src/page.hbs', { data });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
