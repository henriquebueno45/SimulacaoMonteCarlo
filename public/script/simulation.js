let simulando = false;
const progreso = document.getElementById("progresso");
let MaxIteracoes;

Office.onReady(function () {
    // Verifique se a função messageParent existe antes de usá-la
    setInterval(ler_info, 500);
});


function ler_info(){
    if(!simulando){
        MaxIteracoes = parseInt(localStorage.getItem("max-iteracoes"));
        console.log(MaxIteracoes)
        if(MaxIteracoes){
            progreso.max = MaxIteracoes
            const mensagem = "iniciar";
            Office.context.ui.messageParent(mensagem);
            simulando = true;
    
        }
    }else{
        const iteracoes = parseInt(localStorage.getItem("iteracoes"));
        document.getElementById("msg").textContent=iteracoes+"/"+MaxIteracoes+" Iterações";
        progreso.value=iteracoes;
    }
}

function PararSimulacao(){
    Office.context.ui.messageParent("parar");
}

document.getElementById("cancelar").addEventListener("click", PararSimulacao);