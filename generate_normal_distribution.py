import numpy as np
import os
import sys
from functions import read_simulation_file
from functions import write_simulation_file
from functions import find_index

def generate_normal_distribution(mean, std_dev, size):
    return np.random.normal(mean, std_dev, size).tolist()


def main():
    if len(sys.argv) != 4:
        print("Uso: python generate_normal_distribution.py <mean> <std_dev> <celula>")
        return

    mean = float(sys.argv[1])
    std_dev = float(sys.argv[2])
    celula = sys.argv[3]

    # Obtém o diretório atual e o caminho completo para simulation.json
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'simulation.json')
    
    # Lê o arquivo de simulação existente
    simulation_data = read_simulation_file(file_path)

    #recupera a informação de tamanho da distribuição
    size = int(simulation_data["numero-de-iteracoes"])

    # Gera a distribuição normal
    normal_distribution = generate_normal_distribution(mean, std_dev, size)

    #acha o index no vetor de celulas de entrada para a celula passada
    index = find_index(simulation_data,celula)

    #verifica se a celula é valida
    if index == -1:
        print("erro - celula indicada não existe")
        return
    
    # Atualiza a distribuição de entrada da celula indicada
    simulation_data['celulas-de-entrada'][index][celula] = normal_distribution

    # Escreve de volta ao arquivo de simulação
    write_simulation_file(file_path, simulation_data)

    print(f"Distribuição normal gerada e armazenada em {file_path}")

if __name__ == "__main__":
    main()
