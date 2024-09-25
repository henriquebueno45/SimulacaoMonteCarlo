import json

def read_simulation_file(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def write_simulation_file(file_path, data):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)

def find_index(simulation_data, celula):
    # Obtenha a lista correspondente à chave fornecida
    entries = simulation_data.get("celulas-de-entrada", [])
    # Itere sobre a lista e encontre o índice do primeiro item que tenha a propriedade desejada
    for index, entry in enumerate(entries):
        if celula in entry:
            return int(index)
    
    # Retorne -1 se não encontrar nenhum item com a propriedade desejada
    return -1