/*
Padrão HTTP usado
POST ---> Enviando informações
GET ---> Obtendo informações
No-cache habilitado ---> desabilitar em produção
*/
const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const https = require('https');

const app = express();
const port = 3000;
const options = {
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
};

// Middleware para definir os cabeçalhos Cache-Control (TIRAR NA PRODUÇÃO)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Pagina de teste
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ver o JSON
app.get('/api/simulation', (req, res) => {
    res.sendFile(path.join(__dirname, 'simulation.json'));
});

//================================================================================================================
//FUNÇÕES COMUNS

async function extrairDados(res){
    try{
        // Lê o arquivo de simulação
        const data = await fsp.readFile('simulation.json', 'utf8');
            
        // Converte para objeto JS
        return JSON.parse(data);
    }
    catch(err){
        console.error(err);
        return res.status(500).send('Erro ao ler o arquivo.');
    }
}

// função que busca o indice da celula, se não existir retorna -1
function buscarCelula(celula,simulationData,key) {
    try {
        const index = simulationData[key].findIndex(entry => entry.hasOwnProperty(celula));
        return index;
    } catch (err) {
        console.error(err);
        return -1;
    }
}

function escreverArquivo(simulationData,res){
    //escreve no arquivo o objeto modificado
    fs.writeFile("simulation.JSON", JSON.stringify(simulationData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao escrever no arquivo.');
        }
    });
}
//===============================================================================================================
//CONFIGURAÇÃO DE ENTRADA E SAIDA
//funçao que acresenta a um campo o valor passado como parametro
const updateSimulationFilePush = async (path, newEntry, key, res) => {
    
    simulationData = await extrairDados(res);

    index = buscarCelula(newEntry['celula'],simulationData,key);

    if(index===-1){
        // Adiciona a nova entrada
        let newObject = {};
        newObject[newEntry['celula']] = [];
        simulationData[key].push(newObject);
        escreverArquivo(simulationData,res);
    }
     //retorna a resposta adequada
     return res.status(200).send('Entrada adicionada com sucesso.');
};

//função que remove do arquivo json a entrada passada
const updateSimulationFileRemove = async (path, newEntry, key, res) => {
    simulationData = await extrairDados(res);

    index = buscarCelula(newEntry['celula'],simulationData,key);

    if(index!==-1){
        simulationData[key].splice(index, 1);
        escreverArquivo(simulationData,res);
        return res.status(200).send('Entrada removida com sucesso.');
    }
    // Retorna uma resposta se a entrada não for encontrada
    return res.status(200).send('Entrada não encontrada.');
};

// Função auxiliar para processar as células e gerar a resposta
function processarCelulas(celulas) {
    return celulas.map(item => {
        const key = Object.keys(item)[0];
        const result = key.replace(/!/g, '-');
        return { value: key, text: result };
    });
}

// Função auxiliar para extrair os endereços das células
function extrairEnderecos(celulas) {
    return celulas.map(item => Object.keys(item)[0]);
}

app.post('/api/simulation/celulas-de-entrada', (req, res) => {
    updateSimulationFilePush('simulation.json', req.body, 'celulas-de-entrada', res);
});

app.post('/api/simulation/celulas-de-saida', (req, res) => {
    updateSimulationFilePush('simulation.json', req.body, 'celulas-de-saida', res);
});

app.post('/api/simulation/remove-celulas-de-entrada', (req, res) => {
    updateSimulationFileRemove('simulation.json', req.body, 'celulas-de-entrada', res);
});

app.post('/api/simulation/remove-celulas-de-saida', (req, res) => {
    updateSimulationFileRemove('simulation.json', req.body, 'celulas-de-saida', res);
});

// Rota para obter as entradas
app.get('/api/simulation/get-entradas', async (req, res) => {
    try {
        const simulationData = await extrairDados(res);
        const celulasDeEntrada = simulationData['celulas-de-entrada'];
        const retorno = processarCelulas(celulasDeEntrada);
        return res.status(200).json(retorno);
    } catch (error) {
        return res.status(500).send("Erro ao processar as entradas.");
    }
});

// Rota para obter as saídas
app.get('/api/simulation/get-saidas', async (req, res) => {
    try {
        const simulationData = await extrairDados(res);
        const celulasDeSaida = simulationData['celulas-de-saida'];
        const retorno = processarCelulas(celulasDeSaida);
        return res.status(200).json(retorno);
    } catch (error) {
        return res.status(500).send("Erro ao processar as saídas.");
    }
});


app.get('/api/simulation/simulation-data', async (req, res) => {
    try {
        // Extrai as informações do arquivo JSON
        const simulationData = await extrairDados(res);

        // Prepara o objeto de retorno
        const retorno = {
            entradas: extrairEnderecos(simulationData['celulas-de-entrada']),
            saidas: extrairEnderecos(simulationData['celulas-de-saida']),
            "valores-de-entrada": simulationData['celulas-de-entrada'],
            "numero-de-iteracoes": simulationData['numero-de-iteracoes']
        };

        // Envia os dados para quem chamou
        res.status(200).json(retorno);
    } catch (error) {
        res.status(500).send("Erro ao processar os dados da simulação.");
    }
});

app.post('/api/simulation/set-resultado',async (req, res) => {
    const resultado = req.body;
    const chaves = Object.keys(resultado);
    const simulationData = await extrairDados(res);
    for (const item of chaves) {    
        const index = buscarCelula(item,simulationData,'celulas-de-saida');
        simulationData['celulas-de-saida'][index][item] = resultado[item];
    }
    escreverArquivo(simulationData,res);
    const comando = "python calcular_resultado.py"
    executarScriptPython(comando,res)

});
//=======================================================================================================================

// api para configurar numero de iterações
app.post('/api/simulation/numero-de-iteracoes', async(req, res) => {
    const newEntry = req.body;

    let simulationData = await extrairDados(res);

    simulationData['numero-de-iteracoes'] = parseInt(newEntry['valor']);

    escreverArquivo(simulationData,res);

    res.status(200).send('Entrada adicionada com sucesso.');

});
//===================================================================================================================
//APIS PARA DEFINIR A DISTRIBUIÇÃO DE ENTRADA
function executarScriptPython(comando,res){
    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${error.message}`);
            return res.status(500).send('Erro ao executar o script Python.');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('Erro no script Python.');
        }
        console.log(`stdout: ${stdout}`);
        return res.status(200).send('Script Python executado com sucesso.');
    });
}

//api para definir uma distribuição normal
app.post('/api/simulation/definir-normal', async (req, res) => {
    const media = req.body.media;
    const desvioPadrao = req.body.desvioPadrao;
    const celula = req.body.celula;

    simulationData = await extrairDados(res);
    
    const teste = buscarCelula(celula,simulationData,"celulas-de-entrada");

    if(teste===-1){
        return res.status(400).send('Celula não existe');
    }
    const comando = `python generate_normal_distribution.py ${media} ${desvioPadrao} ${celula}`

    executarScriptPython(comando,res);
});

//api para definir uma distribuição triangular
app.post('/api/simulation/definir-triangular', async (req, res) => {
    const min= req.body.min;
    const moda = req.body.moda;
    const max = req.body.max;
    const celula = req.body.celula;

    simulationData = await extrairDados(res);
    
    const teste = buscarCelula(celula,simulationData,"celulas-de-entrada");

    if(teste===-1){
        return res.status(400).send('Celula não existe');
    }
    comando = `python generate_triangular_distribution.py ${min} ${moda} ${max} ${celula}`

    executarScriptPython(comando,res);
});

//api para definir uma distribuição uniforme
app.post('/api/simulation/definir-uniforme',async (req, res) => {
    const min= req.body.min;
    const max = req.body.max
    const celula = req.body.celula;

    simulationData = await extrairDados(res);
    
    const teste = buscarCelula(celula,simulationData,"celulas-de-entrada");

    if(teste===-1){
        return res.status(400).send('Celula não existe');
    }

    comando = `python generate_uniform_distribution.py ${min} ${max} ${celula}`

    executarScriptPython(comando,res);
});

//api para definir uma distribuição binaria (0 e 1)
app.post('/api/simulation/definir-binaria',async (req, res) => {
    const celula = req.body.celula;

    simulationData = await extrairDados(res);
    
    const teste = buscarCelula(celula,simulationData,"celulas-de-entrada");

    if(teste===-1){
        return res.status(400).send('Celula não existe');
    }
    comando = `python generate_binaria.py ${celula}`;
    executarScriptPython(comando,res);
});

app.get('/api/simulation/get-dados-estatisticos', async (req, res) => {
    const simulationData = await extrairDados(res);
    const dadosEstatisticos = simulationData['dados-estatisticos'];
    return res.status(200).send(JSON.stringify(dadosEstatisticos));

});

//=============================================================================================================

// Iniciar o servidor HTTPS
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor HTTPS rodando na porta ${port}`);
});