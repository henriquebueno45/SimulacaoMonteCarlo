iniciado=false;
let dados;

//função que realiza uma pausa de x milesegundos passados como parametros
function pause(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

//esconde a tela de carregamento com uma animação
async function esconderCarregando() {
    await pause(100);
    var content = document.getElementById('carregando');
    content.classList.toggle('hidden');
    await pause(500);
    content.style.display="none";
}

//adiciona dinamicamente objetos options ao select
function addOptionsToSelect(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach(optionData => {
      const option = document.createElement('option');
      option.value = optionData.value;
      option.text = optionData.text;
      select.appendChild(option);
    });
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

//função responsavel por montar o select com as celulas selecionadas como entrada
async function montarSelect(){
    const options = await requisicaoGet("https://localhost:3000/api/simulation/get-saidas");
    addOptionsToSelect('celula', options);
}

//função responsavel por captura qual celula esta selecionada
function getCelula(){
    const select = document.getElementById("celula");
    return select.value;
}

async function MontarTabela(){
    if(!iniciado){
        dados = await requisicaoGet("https://localhost:3000/api/simulation/get-dados-estatisticos")
        iniciado=true;
    }
    const Media = document.getElementById("media");
    const Dp = document.getElementById("dp");
    const Mediana = document.getElementById("mediana");
    const Percentil10 = document.getElementById("percentil10");
    const Percentil90 = document.getElementById("percentil90");
    const max = document.getElementById("max");
    const min = document.getElementById("min");
    const celula = getCelula();
    Media.innerText = dados[celula]["media"].toFixed(3);
    Dp.innerText = dados[celula]["desvio-padrao"].toFixed(3);
    Mediana.innerText = dados[celula]["mediana"].toFixed(3);
    Percentil10.innerText = dados[celula]["percentil_10"].toFixed(3);
    Percentil90.innerText = dados[celula]["percentil_90"].toFixed(3);
    max.innerText = dados[celula]["max"].toFixed(3);
    min.innerText = dados[celula]["min"].toFixed(3);
}

async function montar(){
    montarSelect();
    MontarTabela();
    esconderCarregando();
}

function fecharModal(){
    Office.context.ui.messageParent(true.toString());
}

Office.onReady(function() {
    // Add any initialization code for your dialog here.
 });

montar();

document.addEventListener('DOMContentLoaded', (event) => {
    const selectElement = document.getElementById('celula');

    selectElement.addEventListener('change', (event) => {
        MontarTabela();
    });
});

document.getElementById('cancelar').addEventListener('click', function() {
    fecharModal();
});