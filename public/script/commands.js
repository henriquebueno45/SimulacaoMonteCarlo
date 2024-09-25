// Initialize the Office Add-in.
Office.onReady(() => {
    // If needed, Office.js is ready to be called
  });
  
let dialog;
let simulationData;
let MaxIteracoes;
let iteracoes;
let simulando=true;

async function btnEntrada(event){
    funcaoBotaoDefinirEntradaSaida("https://localhost:3000/api/simulation/celulas-de-entrada","white","#4472C4");
    event.completed();
}

async function btnSaida(event){
 funcaoBotaoDefinirEntradaSaida("https://localhost:3000/api/simulation/celulas-de-saida","white","#C90808");
 event.completed(); 
}

async function btnRemoveEntrada(event){
 funcaoBotaoDefinirEntradaSaida("https://localhost:3000/api/simulation/remove-celulas-de-entrada","black","white");
 event.completed(); 
}

async function btnRemoveSaida(event){
 funcaoBotaoDefinirEntradaSaida("https://localhost:3000/api/simulation/remove-celulas-de-saida","black","white"); 
 event.completed(); 
}

async function funcaoBotaoDefinirEntradaSaida(url,cor,fundo){
 await Office.onReady(async function (info) {
     if (info.host === Office.HostType.Excel) {
         desabilitarBotoes();
         // Execute o seu código do Excel aqui
         await Excel.run(async function (context) {
             //selecionar a celula atual
             const selectedRange = context.workbook.getSelectedRange();
             //vou carregar a informação do endereço
             selectedRange.load('address');
             await context.sync();
             //ler a informação do endereço
             endereco = selectedRange.address;
             //fazer a requisição para a API
             const data = {
                 celula:endereco
             };
             resposta = await enviarRequisicaoPOST(url,data);
             //se a resposta foi OK, indica visualmente na tabela que deu certo
             if(resposta){
                 selectedRange.format.fill.color = fundo;
                 selectedRange.format.font.color = cor;
                 await context.sync();
             }else{
                 console.log(resposta);
             }

         }).catch(function (error) {
             console.log('error: ' + error);
             if (error instanceof OfficeExtension.Error) {
                 console.log('Debug info: ' + JSON.stringify(error.debugInfo));
             }
         });
         habilitarBotoes()
     }
   });
}

// Função para fazer uma requisição POST com um objeto JSON e uma URL
async function enviarRequisicaoPOST(url, dados) {
 try {
     const response = await fetch(url, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify(dados)
     });

     // Verifica se a resposta é bem-sucedida
     if (!response.ok) {
         throw new Error('Erro na requisição: ' + response.statusText);
     }

     return true
 } catch (error) {
     console.error('Erro:', error);
     throw error;
 }
}

//realiza uma requisição get para a URL passada 
async function requisicaoGet(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Se a resposta não estiver ok (código de status HTTP não está entre 200-299)
        return false;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // Captura qualquer erro de rede ou outros erros
      return false;
    }
  }

//função que abre a tela de configuração do numero de iterações
async function abrirTelaIteracoes(event){
    await Office.onReady(async function (info) {
        if (info.host === Office.HostType.Excel) {
            // Execute o seu código do Excel aqui
            Office.context.ui.displayDialogAsync('https://localhost:3000/html/iteracoes.html', {height: 40, width: 30, displayInIframe: true},
                function (asyncResult) {
                    dialog = asyncResult.value;
                    dialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
                }
            );
        }
      });
      event.completed(); 
}

//função que abre a modal para configurar a distribuição de entradas
async function abrirTelaEntradas(event){
    await Office.onReady(async function (info) {
        if (info.host === Office.HostType.Excel) {
            // Execute o seu código do Excel aqui
            Office.context.ui.displayDialogAsync('https://localhost:3000/html/distribuicao_entrada.html', {height: 90, width: 45, displayInIframe: true},
                function (asyncResult) {
                    dialog = asyncResult.value;
                    dialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
                }
            );
        }
      });
      event.completed(); 
}

// função abrir modal dos resultados
async function abrirTelaResultados(event) {
    
    await Office.onReady(async function (info) {
        if (info.host === Office.HostType.Excel) {
            // Execute o seu código do Excel aqui
            console.log(dialog);
            Office.context.ui.displayDialogAsync('https://localhost:3000/html/result.html', { height: 90, width: 45, displayInIframe: true },
                function (asyncResult) {
                    dialog = asyncResult.value;
                    dialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
                }
            );
        }
    });
    event.completed(); 
}

// Função que abre a tela de simulação e inicia o seu processo
async function abrirTelaSimulacao(event) {
    await Office.onReady(async function (info) {
        if (info.host === Office.HostType.Excel) {
            // Execute o seu código do Excel aqui
            Office.context.ui.displayDialogAsync('https://localhost:3000/html/simulation.html', { height: 30, width: 35, displayInIframe: true },
                function (asyncResult) {
                    dialog = asyncResult.value;
                    dialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
                    dialog.addEventHandler(Office.EventType.DialogEventReceived, function (event) {
                        simulando=false
                    });
                }
            );
        }
    });
    configuraSimulacao();
    event.completed(); 
}

function processMessage(arg) {
    //se mensagem for do tipo iniciar, inicie a simulação
    if (arg.message === "iniciar") {
        simulacao();
    }
    if (arg.message === "parar") {
        simulando = false;
        //dialog.close();
    }
    if (arg.message !== "iniciar" && arg.message !== "parar") {
        dialog.close();
    }
}

// função que configura a simulação
async function configuraSimulacao() {
    //buscar no servidor o objeto de informações de simulação
    const url = "https://localhost:3000/api/simulation/simulation-data"
    simulationData = await requisicaoGet(url);
    //verificar o numero de iterações
    MaxIteracoes = simulationData['numero-de-iteracoes'];
    //enviar o numero de maximo iterações para a modal
    localStorage.setItem("max-iteracoes", MaxIteracoes);
    //setar iterações como 0
    iteracoes = 0;
    localStorage.setItem("iteracoes", iteracoes);
    simulando = true;
}

// função responsavel pela simulação de Monte Carlo
async function simulacao() {
    await Excel.run(async function (context) {
        let hashMap = new Map();
        //for para percorrer o vetor de entradas
        const entradas = simulationData['entradas'];
        for (const item of entradas) {
            const partes = item.split("!");
            // Nome da planilha e da célula
            const nomePlanilha = partes[0];
            const nomeCelula = partes[1];
            //pega o range
            const range = context.workbook.worksheets.getItem(nomePlanilha).getRange(nomeCelula);
            await context.sync();
            hashMap.set(item, range);
        }
        //percore as saidas e pega a referencia de cada uma
        let Resultado = {}
        const saidas = simulationData['saidas'];
        for (const item of saidas) {
            Resultado[item] = [];
            const partes = item.split("!");
            // Nome da planilha e da célula
            const nomePlanilha = partes[0];
            const nomeCelula = partes[1];
            //pega o range
            const range = context.workbook.worksheets.getItem(nomePlanilha).getRange(nomeCelula);
            await context.sync();
            hashMap.set(item, range);
        }
        for (let i = 0; i < MaxIteracoes && simulando; i++) {
            let j = 0;
            for (const item of entradas) {
                const range = hashMap.get(item);
                const valor = simulationData['valores-de-entrada'][j][item][i]
                range.values = [[valor]];
                j++;
            }
            await context.sync();
            j = 0;
            for (const item of saidas) {
                const range = hashMap.get(item);
                range.load("values");
                await context.sync();
                const valor = range.values;
                Resultado[item][i] = valor[0][0];
                j++;
            }
            localStorage.setItem("iteracoes", i + 1);
        }
        console.log("chamando api...")
        const url = "https://localhost:3000/api/simulation/set-resultado"
        await enviarRequisicaoPOST(url, Resultado);
        dialog.close();

    }).catch(function (error) {
        console.log('error: ' + error);
        if (error instanceof OfficeExtension.Error) {
            console.log('Debug info: ' + JSON.stringify(error.debugInfo));
        }
    });
    console.log(dialog);
    console.log("caixa fechada");
    await pause(5);
    abrirTelaResultados();
}

//função que realiza uma pausa de x milesegundos passados como parametros
function pause(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

//função que desabilita os botões de configurar entrada e configurar saida
async function desabilitarBotoes() {
    await Office.ribbon.requestUpdate({
        tabs: [
            {
                id: "Contoso Tab", 
                groups: [
                    {
                      id: "Group1Id12",
                      controls: [
                        {
                            id: "Button1Id1", 
                            enabled: false
                        },
                        {
                            id: "Button3Id1", 
                            enabled: false
                        },
                      ]
                    }
                ]
            }
        ]
    });
}

//função que habilita os botões de configurar entrada e configurar saida
async function habilitarBotoes() {
    await Office.ribbon.requestUpdate({
        tabs: [
            {
                id: "Contoso Tab", 
                groups: [
                    {
                      id: "Group1Id12",
                      controls: [
                        {
                            id: "Button1Id1", 
                            enabled: true
                        },
                        {
                            id: "Button3Id1", 
                            enabled: true
                        },
                      ]
                    }
                ]
            }
        ]
    });
}


Office.actions.associate("AdicionarEntrada", btnEntrada);
Office.actions.associate("AdicionarSaida", btnSaida);
Office.actions.associate("RemoverEntrada", btnRemoveEntrada);
Office.actions.associate("RemoverSaida", btnRemoveSaida);
Office.actions.associate("DefinirIteracoes", abrirTelaIteracoes);
Office.actions.associate("DefinirEntradas", abrirTelaEntradas);
Office.actions.associate("Simular", abrirTelaSimulacao);
Office.actions.associate("Resultados", abrirTelaResultados);