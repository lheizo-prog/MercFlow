import itertools
from typing import List, Set

# Mapeamento de confusão visual comum em fontes de etiquetas térmicas e industriais
VISUAL_CONFUSION_MAP = {
    '0': ['O', 'D', 'Q'],
    'O': ['0', 'Q', 'D'],
    '1': ['I', 'L', '|'],
    'I': ['1', 'L', '|'],
    'L': ['1', 'I'],
    '2': ['Z'],
    'Z': ['2'],
    '5': ['S'],
    'S': ['5'],
    '8': ['B'],
    'B': ['8'],
}

def generate_candidate_variations(text: str, max_variations: int = 5) -> List[str]:
    """
    Gera variações candidatas plausíveis para um código com base em caracteres visualmente ambíguos.
    Ex: 'SKU-9O512' -> ['SKU-90512', 'SKU-9O512', 'SKU-9O51Z', ...]
    """
    if not text:
        return []

    # Identifica posições que possuem ambiguidade
    ambiguous_indices = [
        i for i, char in enumerate(text)
        if char.upper() in VISUAL_CONFUSION_MAP
    ]

    # Limita combinações para evitar explosão combinatória
    indices_to_permute = ambiguous_indices[:3]

    variations: Set[str] = {text}

    # Gera combinações para os índices selecionados
    char_options = []
    for i in indices_to_permute:
        original = text[i]
        options = [original] + VISUAL_CONFUSION_MAP.get(original.upper(), [])
        char_options.append([(i, opt) for opt in options])

    if char_options:
        for combo in itertools.product(*char_options):
            candidate = list(text)
            for idx, repl in combo:
                candidate[idx] = repl
            variations.add("".join(candidate))
            if len(variations) >= max_variations:
                break

    return list(variations)[:max_variations]
