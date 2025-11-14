# 🚀 Deploy da Enciclopédia no Scalingo

Este guia explica como fazer o deploy da Enciclopédia de System Prompts e IA no Scalingo.

## 📋 Pré-requisitos

1. Conta no [Scalingo](https://scalingo.com/)
2. [Scalingo CLI](https://doc.scalingo.com/platform/cli/start) instalado
3. Git configurado

## 🔧 Instalação do Scalingo CLI

### Linux / macOS
```bash
curl -O https://cli-dl.scalingo.com/install && bash install
```

### Windows
Baixe o instalador em: https://cli-dl.scalingo.com/install

## 📦 Arquivos de Configuração

A aplicação já está configurada com todos os arquivos necessários:

- ✅ `server.js` - Servidor Express para servir a enciclopédia
- ✅ `package.json` - Dependências Node.js
- ✅ `Procfile` - Comando para iniciar a aplicação
- ✅ `scalingo.json` - Configurações do Scalingo
- ✅ `.gitignore` - Arquivos a ignorar no Git

## 🚀 Deploy Passo a Passo

### 1. Login no Scalingo

```bash
scalingo login
```

### 2. Criar a Aplicação

```bash
scalingo create enciclopedia-ai-prompts
```

Ou escolha seu próprio nome:
```bash
scalingo create seu-nome-aqui
```

### 3. Adicionar Remote do Scalingo (se necessário)

O comando acima já adiciona automaticamente, mas se precisar adicionar manualmente:

```bash
scalingo git-setup --app enciclopedia-ai-prompts
```

### 4. Deploy!

```bash
git push scalingo main
```

Ou se estiver em uma branch diferente:
```bash
git push scalingo sua-branch:main
```

### 5. Abrir a Aplicação

```bash
scalingo --app enciclopedia-ai-prompts open
```

## ⚙️ Configurações Avançadas

### Definir Variáveis de Ambiente

```bash
scalingo --app enciclopedia-ai-prompts env-set NODE_ENV=production
```

### Verificar Logs

```bash
scalingo --app enciclopedia-ai-prompts logs
```

### Escalar a Aplicação

```bash
scalingo --app enciclopedia-ai-prompts scale web:1:M
```

Tamanhos disponíveis: S, M, L, XL

### Verificar Status

```bash
scalingo --app enciclopedia-ai-prompts ps
```

## 🧪 Testar Localmente

Antes de fazer deploy, você pode testar localmente:

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Ou rodar em modo produção
npm start
```

Acesse: http://localhost:3000

## 🌐 URLs Importantes

Após o deploy, sua aplicação estará disponível em:
- **URL da Aplicação:** `https://enciclopedia-ai-prompts.osc-fr1.scalingo.io`
- **Dashboard:** `https://dashboard.scalingo.com/`

## 📊 Monitoramento

### Health Check
A aplicação possui um endpoint de health check:
```
GET /health
```

Retorna: `{ "status": "ok", "message": "Enciclopédia de IA rodando!" }`

### Métricas no Dashboard
Acesse o dashboard do Scalingo para ver:
- Uso de CPU
- Uso de memória
- Tempo de resposta
- Número de requisições

## 🔄 Atualizar a Aplicação

1. Faça suas alterações localmente
2. Commit:
   ```bash
   git add .
   git commit -m "Descrição das alterações"
   ```
3. Push para o Scalingo:
   ```bash
   git push scalingo main
   ```

O Scalingo fará o rebuild e deploy automaticamente!

## 🐛 Troubleshooting

### Build falhou?
```bash
scalingo --app enciclopedia-ai-prompts logs --lines 100
```

### App não inicia?
Verifique se o `Procfile` está correto e se as dependências no `package.json` estão instaladas.

### Timeout nas requisições?
Verifique os logs e considere escalar para um container maior:
```bash
scalingo --app enciclopedia-ai-prompts scale web:1:M
```

## 💰 Custos

O Scalingo oferece:
- **Free Trial** - Para testar
- **Planos pagos** - A partir de €7/mês

Container S (padrão desta aplicação): ~€7-10/mês

## 📚 Documentação

- [Documentação do Scalingo](https://doc.scalingo.com/)
- [Node.js no Scalingo](https://doc.scalingo.com/languages/nodejs/start)
- [Scalingo CLI Reference](https://doc.scalingo.com/platform/cli/start)

## 🆘 Suporte

- **Discord Scalingo:** https://scalingo.com/discord
- **Support:** support@scalingo.com
- **Status:** https://scalingostatus.com/

## ✅ Checklist de Deploy

- [ ] Scalingo CLI instalado
- [ ] Login no Scalingo feito
- [ ] Aplicação criada no Scalingo
- [ ] Código commitado no Git
- [ ] Deploy executado com sucesso
- [ ] Aplicação acessível via URL
- [ ] Health check respondendo
- [ ] Logs verificados

---

## 🎉 Pronto!

Sua Enciclopédia de IA está no ar! 🚀

Acesse e compartilhe com a comunidade! ⭐
