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
    options = await requisicaoGet("https://localhost:3000/api/simulation/get-entradas");
    addOptionsToSelect('celula', options);
    esconderCarregando();
}

//função responsavel por esconder o menu principal
function esconderMenu(){
    const menu = document.getElementById("menu");
    const bntSalvar = document.getElementById("salvar");
    const bntCancelar = document.getElementById("cancelar");
    const msgErro = document.getElementById("msg-binaria");
    menu.style.display="none";
    bntSalvar.style.display="inline-block";
    bntCancelar.innerText="Voltar";
    msgErro.style.display="none";
}

//função responsavel por mostrar o menu principal
function montarMenu(){
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = ''; // Limpa o conteúdo existente
    const menu = document.getElementById("menu");
    const bntSalvar = document.getElementById("salvar");
    const bntCancelar = document.getElementById("cancelar");
    const msgErro = document.getElementById("msg-binaria");
    const pErro = document.getElementById("msg-erro2")
    menu.style.display="flex";
    bntSalvar.style.display="none";
    bntCancelar.innerText="Fechar";
    msgErro.style.display="flex";
    pErro.innerText="";
}

//função que cria titulos dos formularios
function criarH2(texto){
    const title = document.createElement('h2');
    title.textContent = texto;
    return title
}

//função que cria os inputs de formulario
function criarInput(campo,labelText){
    // Criação do primeiro input
    const inputDiv = document.createElement('div');
    inputDiv.className = 'input-div';
    const label = document.createElement('label');
    label.className = 'label-form';
    label.setAttribute('for', campo);
    label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'number';
    input.id = campo;
    inputDiv.appendChild(label);
    inputDiv.appendChild(input);
    const errorMsg = document.createElement('p');
    errorMsg.id = 'msg-erro-'+campo;
    inputDiv.appendChild(errorMsg);
    return inputDiv
}

//função que criar a caixa de erros geral
function criarCaixaErro(){
    // Criação da mensagem de erro geral
    const errorDiv = document.createElement('div');
    errorDiv.style.margin = '20px';
    const errorMsgGeneral = document.createElement('p');
    errorMsgGeneral.id = 'msg-erro';
    errorDiv.appendChild(errorMsgGeneral);
    return errorDiv;
}

//função para montar os campos de formulario
function montarFormulario(tipo,titulo,campos,numeroCampos){
    const bntSalvar = document.getElementById("salvar");
    bntSalvar.setAttribute("distribuicao",tipo);
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = ''; // Limpa o conteúdo existente

    // Criação do título
    const title = criarH2(titulo);

    // Criação do formulário
    const form = document.createElement('form');

    for(i=0;i<numeroCampos;i++){
        // Criação do primeiro input para a média
        const inputDiv = criarInput(campos[i][0],campos[i][1]);
        // Adicionando os inputs ao formulário
        form.appendChild(inputDiv);
        console.log(inputDiv);
        console.log(form);
    }

    // Criação da mensagem de erro geral
    const errorDiv = criarCaixaErro();

    // Adicionando todos os elementos ao contentDiv
    contentDiv.appendChild(title);
    contentDiv.appendChild(form);
    contentDiv.appendChild(errorDiv);
}


//função responsavel por validar um campo de input number verificando se é float e mostrando a msg de erro
function validaFloat(valor,campo){
    if(isNaN(valor)){
        const input = document.getElementById(campo);
        //input.style.borderColor="#a80000;"
        input.style.borderColor="#a80000"
        const local = "msg-erro-"+campo;
        msgbox("Campo Obrigatório !","erro",local);
        return false;
    }
    return true;
}

//função responsavel por captura qual celula esta selecionada
function getCelula(){
    const select = document.getElementById("celula");
    return select.value;
}

//valida as informações da distribuicao triangular
function validaTriangular(min, pico, max){
    //capturando os inputs
    const inputMin = document.getElementById("min");
    const inputPico = document.getElementById("pico");
    const inputMax = document.getElementById("max");

    if(min>pico || min>max){
        msgbox("Deve ser o menor valor!","erro","msg-erro-min");
        msgbox("Deve ser o valor médio","erro","msg-erro-pico");
        msgbox("Deve ser o maior valor","erro","msg-erro-max");
        inputMin.style.borderColor="#a80000";
        inputPico.style.borderColor="#a80000";
        inputMax.style.borderColor="#a80000";
        return false;
    }
    return true;
}

function validaUniforme(min,max){
    //capturando os inputs
    const inputMin = document.getElementById("min");
    const inputMax = document.getElementById("max");

    if(min>max){
        msgbox("Deve ser o menor valor!","erro","msg-erro-min");
        msgbox("Deve ser o maior valor","erro","msg-erro-max");
        inputMin.style.borderColor="#a80000";
        inputMax.style.borderColor="#a80000";
        return false;
    }
    return true;
}

//função responsavel por salvar as informações do formulario da normal
async function salvarNormal(){
    msgbox("","","msg-erro-media");
    msgbox("","","msg-erro-dp");
    const inputMedia = document.getElementById("media");
    const inputDp = document.getElementById("dp");
    inputDp.style.borderColor="black";
    inputMedia.style.borderColor="black";
    const Media = parseFloat(inputMedia.value);
    const dp = parseFloat(inputDp.value);
    const mediaisFloat = validaFloat(Media,"media");
    const dpisFloat = validaFloat(dp,"dp");
    if(mediaisFloat && dpisFloat){
        msgbox("Carregando...","sucesso","msg-erro");
        Celula = getCelula();
        const data = {
            media:Media,
            desvioPadrao:dp,
            celula:Celula
        };
        const url = "https://localhost:3000/api/simulation/definir-normal";
        teste = await enviarRequisicaoPOST(url,data);
        if(teste){
            msgbox("Salvo Com Sucesso !","sucesso","msg-erro");
        }
    }
}

//função responsavel por salvar as informações do formulario da triangular
async function salvarTriangular(){
    //zerando as msg de erro
    msgbox("","","msg-erro-min");
    msgbox("","","msg-erro-pico");
    msgbox("","","msg-erro-max");
    //capturando os inputs
    const inputMin = document.getElementById("min");
    const inputPico = document.getElementById("pico");
    const inputMax = document.getElementById("max");
    //zerando as margens
    inputMin.style.borderColor="black";
    inputPico.style.borderColor="black";
    inputMax.style.borderColor="black";
    //capturando os valores digitados
    const Min = parseFloat(inputMin.value);
    const Pico = parseFloat(inputPico.value);
    const Max = parseFloat(inputMax.value);
    //validando os campos
    const minisFloat = validaFloat(Min,"min");
    const picoisFloat = validaFloat(Pico,"pico");
    const maxisFloat = validaFloat(Max,"max");
    
    //testando se todos são validos
    if(minisFloat && picoisFloat && maxisFloat){
        const valido = validaTriangular(Min,Pico,Max);
        if(valido){
            msgbox("Carregando...","sucesso","msg-erro");
            const Celula = getCelula();
            const data = {
                min:Min,
                moda:Pico,
                max:Max,
                celula:Celula
            };
            const url = "https://localhost:3000/api/simulation/definir-triangular";
            teste = await enviarRequisicaoPOST(url,data);
            if(teste){
                msgbox("Salvo Com Sucesso !","sucesso","msg-erro");
            }
        }
        
    }
}

//função responsavel por salvar as informações do formulario da uniforme
async function salvarUniforme(){
    //zerando as msg de erro
    msgbox("","","msg-erro-min");
    msgbox("","","msg-erro-max");
    //capturando os inputs
    const inputMin = document.getElementById("min");
    const inputMax = document.getElementById("max");
    //zerando as margens
    inputMin.style.borderColor="black";
    inputMax.style.borderColor="black";
    //capturando os valores digitados
    const Min = parseFloat(inputMin.value);
    const Max = parseFloat(inputMax.value);
    //validando os campos
    const minisFloat = validaFloat(Min,"min");
    const maxisFloat = validaFloat(Max,"max");
    
    //testando se todos são validos
    if(minisFloat && maxisFloat){
        const valido = validaUniforme(Min,Max);
        if(valido){
            msgbox("Carregando...","sucesso","msg-erro");
            const Celula = getCelula();
            const data = {
                min:Min,
                max:Max,
                celula:Celula
            };
            const url = "https://localhost:3000/api/simulation/definir-uniforme";
            teste = await enviarRequisicaoPOST(url,data);
            if(teste){
                msgbox("Salvo Com Sucesso !","sucesso","msg-erro");
            }
        }
        
    }
}

//função responsavel por salvar as informações do formulario da uniforme
async function salvarBinaria(){
    msgbox("Carregando...","sucesso","msg-erro2");
    const Celula = getCelula();
    const data = {
        celula:Celula
    };
    const url = "https://localhost:3000/api/simulation/definir-binaria";
    teste = await enviarRequisicaoPOST(url,data);
    if(teste){
        msgbox("Salvo Com Sucesso !","sucesso","msg-erro2");
    }
}

//função para mostrar a msg de erro
function msgbox(msg,tipo,local){
    p = document.getElementById(local);
    if(tipo=="erro"){
        p.className = 'p-erro';
    }
    if(tipo=="sucesso"){
        p.className = 'p-sucesso';
    }
    if(tipo==""){
        p.className = '';
    }
    p.textContent = msg;
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
            msgbox("Erro interno, tente novamente mais tarde","erro","msg-erro");
            throw new Error('Erro na requisição: ' + response.statusText);
        }
   
        return true
    } catch (error) {
        console.error('Erro:', error);
        msgbox("Erro de Conexão, verifique a conexão com a internet","erro","msg-erro");
        throw error;
    }
   }

function fecharModal(){
    Office.context.ui.messageParent(true.toString());
}

// botão que monta o formulario da normal
document.getElementById('btn-normal').addEventListener('click', function() {
    esconderMenu();
    const campos = [["media","Média:"],["dp","Desvio Padrão:"]]
    const titulo = "Distribuição Normal"
    montarFormulario("normal",titulo,campos,2);
});

document.getElementById('btn-uniforme').addEventListener('click', function() {
    esconderMenu();
    const campos = [['min','Valor Mínimo:'],['max','Valor Máximo:']]
    const titulo = "Distribuição Uniforme"
    montarFormulario("uniforme",titulo,campos,2);
});

//botão que monta o formulario da triangular
document.getElementById('btn-triangular').addEventListener('click', function() {
    esconderMenu();
    const campos = [['min','Valor Mínimo:'],['pico','Valor de Pico:'],['max','Valor Máximo:']]
    const titulo = 'Distribuição Triangular'
    montarFormulario("triangular",titulo,campos,3);
});

document.getElementById('btn-binaria').addEventListener('click', function() {
    salvarBinaria();
});

document.getElementById('cancelar').addEventListener('click', function() {
    const btn = document.getElementById('cancelar');
    if(btn.innerText=="Voltar"){
        montarMenu();
    }else{
        fecharModal();
    }
});

document.getElementById('salvar').addEventListener('click', function() {
    const btn = document.getElementById('salvar');
    distribuicao = btn.getAttribute("distribuicao");
    if(distribuicao=="normal"){
        salvarNormal();
    }
    if(distribuicao=="triangular"){
        salvarTriangular();
    }
    if(distribuicao=="uniforme"){
        salvarUniforme();
    }
});

Office.onReady(function() {
    // Add any initialization code for your dialog here.
 });

montarSelect();