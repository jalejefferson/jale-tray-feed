// Script Node.js para consumir o feed XML da Tray, transformar em JSON e expor via API

const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const app = express();
const PORT = process.env.PORT || 3000;

// 🔁 Substitua pela URL real do seu feed XML da Tray
const TRAY_FEED_URL = 'https://seudominio.com.br/feed/produtos.xml';

app.get('/produtos', async (req, res) => {
  try {
    const { data: xml } = await axios.get(TRAY_FEED_URL);

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao converter XML.' });

      const produtos = result.produtos?.produto || [];
      const lista = Array.isArray(produtos) ? produtos : [produtos];

      const resposta = lista.map(p => ({
        nome: p.nome,
        preco: p.preco_por,
        sku: p.id_externo,
        link: p.url,
        categoria: p.categoria,
        estoque: p.estoque_disponivel
      }));

      res.json(resposta);
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao acessar o feed Tray.' });
  }
});

app.get('/', (req, res) => {
  res.send('API Tray Feed para GPT - Jale Distribuidora 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
