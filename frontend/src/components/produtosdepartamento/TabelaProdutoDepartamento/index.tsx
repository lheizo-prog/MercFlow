import { useMemo } from 'react';
import type { ProdutoDepartamento } from '../../../types/ProdutoDepartamento';

interface TabelaProdutosDepartamentoProps {
  produtos: ProdutoDepartamento[];
  onEditar: (produto: ProdutoDepartamento) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutosDepartamento({ produtos, onEditar, onExcluir }: TabelaProdutosDepartamentoProps) {
  const produtosOrdenados = useMemo(() => [...produtos], [produtos]);

  if (produtosOrdenados.length === 0) {
    return (
      <div className='table-responsive bg-white rounded shadow-sm'>
        <div className='text-center text-body-secondary py-4'>
          Nenhum produto de departamento encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className='table-responsive bg-white rounded shadow-sm'>
      <div className='row g-3'>
        {produtosOrdenados.map((produto) => (
          <div key={produto.id} className='col-12 col-sm-6 col-md-4 col-lg-3'>
            <div className='card border-0 shadow-sm h-100'>
              <div className='card-body d-flex flex-column'>
                <h6 className='card-subtitle mb-2 text-body-secondary'>
                  ID: {produto.id}
                </h6>
                <h5 className='card-title mb-1'>{produto.nome}</h5>
                <p className='card-text small mb-1'>
                  Base: {produto.produto_generico_nome}
                </p>
                <p className='card-text small mb-1'>
                  Departamento: {produto.departamento_nome}
                </p>
                <p className='card-text small mb-1'>
                  Código: {produto.codigo}
                </p>
                <p className='card-text small mb-3 text-muted'>
                  Unidade: {produto.unidade_medida}
                </p>
                <div className='mt-auto'>
                  <div className='d-flex gap-2'>
                    <button
                      onClick={() => onEditar(produto)}
                      className='btn btn-sm btn-outline-primary flex-grow-1'
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onExcluir(produto.id!)}
                      className='btn btn-sm btn-outline-danger flex-grow-1'
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TabelaProdutosDepartamento;
