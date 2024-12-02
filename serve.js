const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configura a conexão com o MongoDB
const uri = 'mongodb+srv://021ab354:021ab354@cluster0.xppt7.mongodb.net/BancoFinal?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useUnifiedTopology: true });
let database;

// Função para inicializar a conexão com o banco
async function connectToDatabase() {
    if (!database) {
        try {
            await client.connect();
            database = client.db('BancoFinal');
            console.log('Conexão com o MongoDB estabelecida.');
        } catch (error) {
            console.error('Erro ao conectar ao MongoDB:', error);
            process.exit(1); // Finaliza a aplicação em caso de erro crítico
        }
    }
    return database;
}

// Middleware para garantir que o banco está conectado
app.use(async (req, res, next) => {
    await connectToDatabase();
    next();
});

// Rota para processar os dados do formulário
app.post('/processar', async (req, res) => {
    const { nome, senha, email } = req.body;

    try {
        const collection = database.collection('usuario');
        await collection.insertOne({ nome, email, senha });
        res.status(200).send('Processado com sucesso.');
    } catch (error) {
        console.error('Erro ao inserir dados no MongoDB:', error);
        res.status(500).send('Erro ao processar os dados.');
    }
});

// Rota de login
app.post('/login', async (req, res) => {
    const { email, senhaLogin } = req.body;

    try {
        const collection = database.collection('usuario');
        const user = await collection.findOne({ email });

        if (user) {
            if (user.senha === senhaLogin) {
                res.status(200).send('Login bem-sucedido.');
            } else {
                res.status(401).send('Senha incorreta.');
            }
        } else {
            res.status(404).send('Usuário não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao processar login:', error);
        res.status(500).send('Erro no servidor.');
    }
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
