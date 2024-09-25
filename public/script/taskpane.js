function desabilitarBotoes() {
    Office.ribbon.requestUpdate({
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

function habilitarBotoes() {
    Office.ribbon.requestUpdate({
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

document.getElementById("habilitar").addEventListener("click", habilitarBotoes);
document.getElementById("desabilitar").addEventListener("click", desabilitarBotoes);