import numpy as np
import os
import sys
from functions import read_simulation_file
from functions import write_simulation_file
from functions import find_index

def generate_uniform_distribution(Min, Max, size):
    return np.random.uniform(Min,Max,size).tolist()

def main():
    if len(sys.argv) != 4:
        print("Uso: python generate_uniform_distribution.py <min> <max> <celula>")
        return

    min = float(sys.argv[1])
    max = float(sys.argv[2])
    celula = sys.argv[3]

    # Obtém o diretório atual e o caminho completo para simulation.json
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'simulation.json')

    # Lê o arquivo de simulação existente
    simulation_data = read_simulation_file(file_path)

    #recupera a informação de tamanho da distribuição
    size = int(simulation_data["numero-de-iteracoes"])

    # Gera a distribuição uniforme
    uniform_distribution = generate_uniform_distribution(min,max,size)

    #encontra a posição no vetor que a celula esta localizada
    index = find_index(simulation_data,celula)

    #se não existe indica erro
    if index == -1:
        print("erro - celula indicada não existe")
        return
    
    # Atualiza a distribuição de entrada da celula indicada
    simulation_data['celulas-de-entrada'][index][celula] = uniform_distribution

    # Escreve de volta ao arquivo de simulação
    write_simulation_file(file_path, simulation_data)

    print(f"Distribuição uniforme gerada e armazenada em {file_path}")

if __name__ == "__main__":
    main()