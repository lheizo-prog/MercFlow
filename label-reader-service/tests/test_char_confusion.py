from label_reader.utils.char_confusion import generate_candidate_variations


def test_generate_candidate_variations():
    # Testa substituição de 'O' por '0'
    variations = generate_candidate_variations("SKU-9O512")
    assert "SKU-9O512" in variations
    assert "SKU-90512" in variations

    # Testa string vazia
    assert generate_candidate_variations("") == []
