import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ItemTarefa from './ItemTarefas'

vi.mock('../context/useAuthHook', () => ({
    useAuth: vi.fn(() => ({ usuario: { id: 42 } })),
}))

function tarefasExemplo() {
    return [
        { id: 1, texto: 'Modelar o banco', prioridade: 'Alto', prioridade_cor: '#EF4444', usuario: 'Ana Lima', projeto: 'TaskFlow' },
        { id: 2, texto: 'Criar a API', prioridade: 'Médio', prioridade_cor: '#F59E0B', usuario: 'Bruno Melo', projeto: 'TaskFlow' },
        { id: 3, texto: 'Testar o front', prioridade: 'Baixo', prioridade_cor: '#22C55E', usuario: null, projeto: null },
    ]
}

describe('ItemTarefa', () => {
    test('mostra o texto e o rótulo de prioridade da tarefa', () => {
        const tarefa = tarefasExemplo()[0]

        render(<ItemTarefa tarefas={[tarefa]} rotuloPrioridade="Alta" />)

        expect(screen.getByText('Modelar o banco')).toBeInTheDocument()
        expect(screen.getByText('Alta')).toBeInTheDocument()
    })

    test('não inventa um rótulo quando a prioridade está ausente', () => {
        const tarefa = { ...tarefasExemplo()[0], prioridade: null }

        render(<ItemTarefa tarefas={[tarefa]} />)

        expect(screen.queryByText('Sem prioridade')).not.toBeInTheDocument()
    })

    test('não apresenta setas de movimentação e mantém as ações existentes', () => {
        const tarefa = { ...tarefasExemplo()[0], criadoPorId: 42 }

        render(<ItemTarefa tarefas={[tarefa]} />)

        expect(screen.queryByRole('button', { name: '←' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: '→' })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /concluir/i })).toBeInTheDocument()
    })

    test('mostra o status atual e as opções de coluna no controle acessível', () => {
        const tarefa = { ...tarefasExemplo()[0], coluna: 'A FAZER' }

        render(<ItemTarefa tarefas={[tarefa]} />)

        const status = screen.getByRole('combobox', { name: 'Status' })
        expect(status).toHaveValue('A FAZER')
        expect(screen.getByRole('option', { name: 'Em andamento' })).toBeInTheDocument()
    })

    test('atualiza a coluna ao selecionar outro status', async () => {
        const user = userEvent.setup()
        const onAtualizarColuna = vi.fn()
        const tarefa = tarefasExemplo()[0]
        render(<ItemTarefa tarefas={[tarefa]} onAtualizarColuna={onAtualizarColuna} />)

        await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'EM ANDAMENTO')

        expect(onAtualizarColuna).toHaveBeenCalledOnce()
        expect(onAtualizarColuna).toHaveBeenCalledWith(1, 'EM ANDAMENTO')
    })

    test('chama onExcluir com o id ao clicar em Excluir', async () => {
        const user = userEvent.setup()
        const onExcluir = vi.fn()
        const tarefa = { ...tarefasExemplo()[0], criadoPorId: 42 }
        render(<ItemTarefa tarefas={[tarefa]} onExcluir={onExcluir} />)

        await user.click(screen.getByRole('button', { name: 'Excluir' }))

        expect(onExcluir).toHaveBeenCalledOnce()
        expect(onExcluir).toHaveBeenCalledWith(1)
    })

    test('chama onEditar com a tarefa ao dar duplo clique no texto', async () => {
        const user = userEvent.setup()
        const onEditar = vi.fn()
        const tarefa = tarefasExemplo()[0]
        render(<ItemTarefa tarefas={[tarefa]} onEditar={onEditar} />)

        await user.dblClick(screen.getByText('Modelar o banco'))

        expect(onEditar).toHaveBeenCalledOnce()
        expect(onEditar).toHaveBeenCalledWith(tarefa)
    })
})
