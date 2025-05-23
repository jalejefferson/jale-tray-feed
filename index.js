const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const app = express();
const PORT = process.env.PORT || 3000;

const TRAY_FEED_URL = 'https://www.jaledistribuidora.com.br/xml/xml.php?Chave=wav9mYlNWYmxnN3QzMxITM';

app.get('/produtos', async (req, res) => {
  try {
    const { data: xml } = await axios.get(TRAY_FEED_URL);
    
    xml2js.parseString(xml, { explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao converter XML.' });

      const itens = result.rss?.channel?.item || [];
      const lista = Array.isArray(itens) ? itens : [itens];

      const resposta = lista.map(p => ({
        id: p.id,
        nome: p.title,
        preco: p.price,
        sku: p.mpn || p.gtin || p.id,
        link: p.link,
        imagem: p.image_link,
        categoria: p.product_type,
        marca: p.brand,
        disponibilidade: p.availability,
        descricao: p.description
      }));

      res.json(resposta);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao acessar o feed Tray.' });
  }
});

app.get('/produtos/:termo', async (req, res) => {
  try {
    const termo = req.params.termo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const { data: xml } = await axios.get(TRAY_FEED_URL);

    xml2js.parseString(xml, { explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao converter XML.' });

      const itens = result.rss?.channel?.item || [];
      const lista = Array.isArray(itens) ? itens : [itens];

      const filtrados = lista.filter(p => {
        const texto = `${p.title || ''} ${p.description || ''} ${p.product_type || ''}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return texto.includes(termo);
      });

      const resposta = filtrados.map(p => ({
        id: p.id,
        nome: p.title,
        preco: p.price,
        sku: p.mpn || p.gtin || p.id,
        link: p.link,
        imagem: p.image_link,
        categoria: p.product_type,
        marca: p.brand,
        disponibilidade: p.availability,
        descricao: p.description
      }));

      res.json(resposta);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao acessar ou filtrar produtos.' });
  }
});

app.get('/', (req, res) => {
  res.send('API Tray Feed para GPT - Jale Distribuidora 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
