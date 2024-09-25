//FUNÇÕES USADAS NA COMUNICAÇÃO

const MaxIteration=1000;

Office.onReady(function() {
    // Add any initialization code for your dialog here.
 });

async function salvarIteracoes() {
    const input = document.getElementById("number");
    let Valor = parseInt(input.value)
    if(valida(Valor)){
        const data = {
            valor:Valor
        };
        const url = "https://localhost:3000/api/simulation/numero-de-iteracoes";
        msgbox("Carregando...","sucesso");
        teste = await enviarRequisicaoPOST(url,data);
        if(teste){
            Office.context.ui.messageParent(true.toString());
        }
    }
}

//Função que valida o valor do input antes de enviar para o servidor
function valida(valor){
    if(isNaN(valor)){
        msgbox("Campo Obrigatório !","erro");
        return false;
    }
    if(valor < 0){
        msgbox("Digite apenas valores positivos","erro");
        return false;
    }
    if(valor>1000){
        msgbox("Número máximo de iterações permitidos é "+MaxIteration,"erro");
        return false;
    }
    return true;
}

//função para mostrar a msg de erro
function msgbox(msg,tipo){
    p = document.getElementById("msg-erro");
    if(tipo=="erro"){
        p.className = 'p-erro';
    }else{
        p.className = 'p-sucesso';
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
            msgbox("Erro interno, tente novamente mais tarde","erro");
            throw new Error('Erro na requisição: ' + response.statusText);
        }
   
        return true
    } catch (error) {
        console.error('Erro:', error);
        msgbox("Erro de Conexão, verifique a conexão com a internet","erro");
        throw error;
    }
   }

document.getElementById("salvar").addEventListener("click", salvarIteracoes);