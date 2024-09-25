import numpy as np
import os
from functions import read_simulation_file
from functions import write_simulation_file

def extrair_saidas(celulas_de_saida):
    saidas = []
    for item in celulas_de_saida:
        chave = list(item.keys())
        saidas.append(chave[0])
    return saidas

def find_index(simulation_data, celula):
    # Obtenha a lista correspondente à chave fornecida
    entries = simulation_data.get("celulas-de-saida", [])
    # Itere sobre a lista e encontre o índice do primeiro item que tenha a propriedade desejada
    for index, entry in enumerate(entries):
        if celula in entry:
            return int(index)
    
    # Retorne -1 se não encontrar nenhum item com a propriedade desejada
    return -1


def calcular_estatisticas(vetor, simulation_data,item):
    simulation_data['dados-estatisticos'][item] = {}
    Minimo = np.min(vetor)
    Maximo = np.max(vetor)
    Media = np.mean(vetor)
    Mediana = np.median(vetor)
    PercentilMin = np.percentile(vetor, 10)
    PercentilMax = np.percentile(vetor, 90)
    Dp = np.std(vetor)
    simulation_data['dados-estatisticos'][item]['media']=Media
    simulation_data['dados-estatisticos'][item]['desvio-padrao']=Dp
    simulation_data['dados-estatisticos'][item]['mediana']=Mediana
    simulation_data['dados-estatisticos'][item]['percentil_10']=PercentilMin
    simulation_data['dados-estatisticos'][item]['percentil_90']=PercentilMax
    simulation_data['dados-estatisticos'][item]['max']=Maximo
    simulation_data['dados-estatisticos'][item]['min']=Minimo
    return simulation_data


def main():
    # Obtém o diretório atual e o caminho completo para simulation.json
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'simulation.json')

    # Lê o arquivo de simulação existente
    simulation_data = read_simulation_file(file_path)

    saidas = extrair_saidas(simulation_data['celulas-de-saida'])
    simulation_data['dados-estatisticos'] = {}
    
    for item in saidas:
        index = find_index(simulation_data,item)
        valores = simulation_data['celulas-de-saida'][index][item]
        vetor = np.array(valores)
        simulation_data = calcular_estatisticas(vetor,simulation_data,item)
    
    write_simulation_file(file_path,simulation_data)
    print("Sucesso")

if __name__ == "__main__":
    main()