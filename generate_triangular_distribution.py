import numpy as np
import os
import sys
from functions import read_simulation_file
from functions import write_simulation_file
from functions import find_index

def generate_triangular_distribution(min, moda, max, size):
    return  np.random.triangular(min, moda, max, size).tolist()


def main():
    if len(sys.argv) != 5:
        print("Uso: python generate_triangular_distribution.py <min> <moda> <max> <celula>")
        return

    min_arg = float(sys.argv[1])
    moda = float(sys.argv[2])
    max_arg = float(sys.argv[3])
    celula = sys.argv[4]

    # Obtém o diretório atual e o caminho completo para simulation.json
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'simulation.json')

    # Lê o arquivo de simulação existente
    simulation_data = read_simulation_file(file_path)

    #recupera a informação de tamanho da distribuição
    size = int(simulation_data["numero-de-iteracoes"])

    # Gera a distribuição triangular
    triangular_distribution = generate_triangular_distribution(min_arg, moda, max_arg, size)


    index = find_index(simulation_data,celula)

    if index == -1:
        print("erro - celula indicada não existe")
        return
    
    # Atualiza a distribuição de entrada da celula indicada
    simulation_data['celulas-de-entrada'][index][celula] = triangular_distribution

    # Escreve de volta ao arquivo de simulação
    write_simulation_file(file_path, simulation_data)

    print(f"Distribuição triangular gerada e armazenada em {file_path}")

if __name__ == "__main__":
    main()
