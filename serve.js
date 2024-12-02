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
// const client = new MongoClient(uri);

var client;
var database;
/*
(async () => {
  try {
      client = new MongoClient(uri, { useUnifiedTopology: false });
      await client.connect();
      database = client.db('BancoFinal');
      console.log('Conexão inicial ao MongoDB bem-sucedida');
  } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error);
      process.exit(1);
  }
})();*/

async function getDatabase() {
  if (!client) {
    client = new MongoClient(uri, { useUnifiedTopology: false });
    await client.connect();
    database = client.db('BancoFinal');
  }
  return database;
}

// Rota para processar os dados do formulário
app.post('/processar', async (req, res) => {
  const { nome, senha, email } = req.body;

  try {
    // Conecta ao banco de dados
    // await client.connect();
    const bcrypt = require('bcrypt');

    client = new MongoClient(uri, { useUnifiedTopology: false });
    await client.connect();
    database = client.db('BancoFinal');

    const collection = database.collection('usuario');
    const senhac = await bcrypt.hash(senha, 10);

    // Insere os dados na coleção
    await collection.insertOne({ nome, email, senhac });
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

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senhaLogin } = req.body;

  try {
    client = new MongoClient(uri, { useUnifiedTopology: false });
    await client.connect();
    database = client.db('BancoFinal');


    const collection = database.collection('usuario');

    // Busca o usuário pelo email
    const user = await collection.findOne({ email });

    const bcrypt = require('bcrypt');
    // const senhaLoginc = await bcrypt.hash(senhaLogin, 10);

    console.log("senha:"+senhaLogin);

    if (user) {
      // Verifica se a senha fornecida corresponde à senha armazenada
      const senhaMatch = await bcrypt.compare(senhaLogin, user.senha);

      if (senhaMatch) {
        // Autenticação bem-sucedida
        // req.session.logado = true;
        // req.session.nome = user.nome;
        // req.session.email = user.email;

        // Redireciona para a página protegida
        // return res.redirect('/protect.php');
        res.status(200).send('Usuário e senha válido.');
      } else {
        // Senha incorreta
        // return res.redirect('/login?erro=senha');
        res.status(401).send('Acesso não autorizado.');

      }
    } else {
      // Usuário não encontrado
      res.status(401).send('Acesso não autorizado.');

      // return res.redirect('/login?erro=usuario');
    }
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.status(500).send('Erro no servidor');
  } finally {
    await client.close();
  }
});

app.get('/getInformacoeslogin', async (req, res) => {
  const { email, senhaLogin } = req.body;

  try {
    client = new MongoClient(uri, { useUnifiedTopology: false });
    await client.connect();
    database = client.db('BancoFinal');


    const collection = database.collection('usuario');

    // Busca o usuário pelo email
    const user = await collection.findOne({ email });

    if (user) {
      // Verifica se a senha fornecida corresponde à senha armazenada
      const senhaMatch = user.senha === senhaLogin; //await bcrypt.compare(senhaLogin, user.senha);

      if (senhaMatch) {
        // Autenticação bem-sucedida
        // req.session.logado = true;
        // req.session.nome = user.nome;
        // req.session.email = user.email;

        // Redireciona para a página protegida
        // return res.redirect('/protect.php');
        res.send(user);
      } else {
        // Senha incorreta
        // return res.redirect('/login?erro=senha');
        res.status(401).send('Acesso não autorizado.');

      }
    } else {
      // Usuário não encontrado
      res.status(401).send('Acesso não autorizado.');

      // return res.redirect('/login?erro=usuario');
    }
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.status(500).send('Erro no servidor');
  } finally {
    await client.close();
  }
});


// Página protegida, só acessível se o usuário estiver logado
app.get('/protect', (req, res) => {
  if (req.session.logado) {
    res.send(`Bem-vindo, ${req.session.nome}!`);
  } else {
    res.redirect('/login');
  }
});

// Rota de login (página de login HTML)
app.get('/login', (req, res) => {
  if (req.query.erro === 'senha') {
    res.send('<h1>Erro: Senha incorreta!</h1><a href="/login">Tente novamente</a>');
  } else if (req.query.erro === 'usuario') {
    res.send('<h1>Erro: Usuário não encontrado!</h1><a href="/login">Tente novamente</a>');
  } else {
    res.send('<h1>Página de Login</h1><form method="POST" action="/login"><input type="email" name="email" placeholder="Email" required><input type="password" name="senhaLogin" placeholder="Senha" required><button type="submit">Login</button></form>');
  }
});

// module.exports = { getDatabase };


// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
