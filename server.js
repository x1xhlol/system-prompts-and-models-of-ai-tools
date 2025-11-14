const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para compressão GZIP
app.use(compression());

// Servir arquivos estáticos
app.use(express.static(__dirname, {
    maxAge: '1d', // Cache de 1 dia para melhor performance
    etag: true
}));

// Rota principal - serve a enciclopédia
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'enciclopedia.html'));
});

// Rota de health check para o Scalingo
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Enciclopédia de IA rodando!' });
});

// Redirecionar qualquer outra rota para a página principal
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'enciclopedia.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Enciclopédia disponível em http://localhost:${PORT}`);
});

// Tratamento de erros
process.on('uncaughtException', (err) => {
    console.error('❌ Erro não capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Promise rejection não tratada:', err);
    process.exit(1);
});
