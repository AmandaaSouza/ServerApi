


// Importa os módulos necessários
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// Cria uma aplicação Express
const app = express();

app.use(cors());
app.use(express.json()); // Middleware para interpretar JSON
app.use(bodyParser.urlencoded({ extended: true })); // Middleware para interpretar formulários

// Configura a conexão com o MongoDB via Mongoose
const uri = 'mongodb+srv://021ab354:021ab354@cluster0.xppt7.mongodb.net/BancoFinal?retryWrites=true&w=majority';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexão com MongoDB bem-sucedida'))
  .catch(error => console.error('Erro ao conectar ao MongoDB:', error));

// Define o Schema para a coleção `usuario`
const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }
});

// Cria o modelo baseado no schema
const Usuario = mongoose.model('Usuario', userSchema);

// Rota para processar os dados do formulário
app.post('/processar', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cria um novo usuário usando o modelo
    const novoUsuario = new Usuario({ nome, email, senha: senhaHash });

    // Salva no MongoDB
    await novoUsuario.save();

    res.status(200).send('Usuário cadastrado com sucesso.');
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).send('Erro ao processar os dados.');
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senhaLogin } = req.body;

  try {
    // Busca o usuário pelo email
    const user = await Usuario.findOne({ email });

    if (user) {
      // Verifica se a senha fornecida corresponde à senha armazenada
      const senhaMatch = await bcrypt.compare(senhaLogin, user.senha);

      if (senhaMatch) {
        res.status(200).send('Usuário e senha válidos.');
      } else {
        res.status(401).send('Acesso não autorizado.');
      }
    } else {
      res.status(401).send('Usuário não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.status(500).send('Erro no servidor.');
  }
});

// Rota para obter informações do login
app.get('/getInformacoeslogin', async (req, res) => {
  const { email } = req.body;

  try {
    // Busca o usuário pelo email
    const user = await Usuario.findOne({ email });

    if (user) {
      res.send(user);
    } else {
      res.status(401).send('Usuário não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao buscar informações:', error);
    res.status(500).send('Erro no servidor.');
  }
});

// Página protegida (apenas um exemplo)
app.get('/protect', (req, res) => {
  res.send('Área protegida!');
});

// Rota para exibir a página de login
app.get('/login', (req, res) => {
  res.send('<h1>Página de Login</h1><form method="POST" action="/login"><input type="email" name="email" placeholder="Email" required><input type="password" name="senhaLogin" placeholder="Senha" required><button type="submit">Login</button></form>');
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
