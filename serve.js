// Importa os módulos necessários
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

// Cria uma aplicação Express
const app = express();

app.use(cors());

app.use(express.json()); // Usando express.json() para entender o conteúdo JSON enviado pelo formulário

// Configura o middleware para interpretar o corpo das requisições (formulário)
app.use(bodyParser.urlencoded({ extended: true }));

// Configura a conexão com o MongoDB
const uri = 'mongodb+srv://021ab354:021ab354@cluster0.xppt7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Rota para processar os dados do formulário
app.post('/processar', async (req, res) => {
  const { nome, senha, email } = req.body;

  try {
    // Conecta ao banco de dados
    await client.connect();
    const database = client.db('BancoFinal');
    const collection = database.collection('usuario');

    // Insere os dados na coleção
    await collection.insertOne({ nome, email, senha });
    res.status(200).send('Processado com sucesso.');

    // Redireciona para a página inicial
    // res.redirect('/index.html');
  } catch (error) {
    console.error('Erro ao inserir dados no MongoDB:', error);
    res.status(500).send('Erro ao processar os dados.');
  } finally {
    // Encerra a conexão com o MongoDB
    await client.close();
  }
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
