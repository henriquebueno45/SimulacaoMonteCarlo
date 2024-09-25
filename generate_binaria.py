import numpy as np
import os
import sys
from functions import read_simulation_file
from functions import write_simulation_file
from functions import find_index

def generate_distribution(size):
    # Gerar um vetor de números aleatórios entre 0 e 1
    vetor = np.random.rand(size)
    # Mapear cada número para 0 se for menor que 0,5, e para 1 se for maior ou igual a 0,5
    vetor_binario = [1 if x >= 0.5 else 0 for x in vetor]
    return vetor_binario



def main():
    if len(sys.argv) != 2:
        print("Uso: python generate_binaria.py <celula>")
        return

    #recebe os argumentos passados na chamada do script
    celula = sys.argv[1]

    # Obtém o diretório atual e o caminho completo para simulation.json
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'simulation.json')

    # Lê o arquivo de simulação existente
    simulation_data = read_simulation_file(file_path)

    #recupera a informação de tamanho da distribuição
    size = int(simulation_data["numero-de-iteracoes"])


    # Gera a distribuição uniforme
    distribution = generate_distribution(size)

    #encontra o indice no vetor celulas-de-entrada que contem a celula desejada
    index = find_index(simulation_data,celula)

    #se não existir gera um erro
    if index == -1:
        print("erro - celula indicada não existe")
        return
    
    # Atualiza a distribuição de entrada da celula indicada
    simulation_data['celulas-de-entrada'][index][celula] = distribution

    # Escreve de volta ao arquivo de simulação
    write_simulation_file(file_path, simulation_data)

    print(f"Distribuição binaria gerada e armazenada em {file_path}")

if __name__ == "__main__":
    main()