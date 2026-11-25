import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ItemTarefa from './ItemTarefas'
import ListaTarefas from './ListaTarefas'

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

describe('exercícios integrados dos componentes', () => {
    test('na coluna concluída mostra o status e não oferece setas de movimentação', () => {
        const tarefa = { ...tarefasExemplo()[0], coluna: 'CONCLUÍDA' }

        render(<ItemTarefa tarefas={[tarefa]} />)

        expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('CONCLUÍDA')
        expect(screen.queryByRole('button', { name: '←' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: '→' })).not.toBeInTheDocument()
    })

    test('permite atualizar o status de uma tarefa concluída', async () => {
        const user = userEvent.setup()
        const onAtualizarColuna = vi.fn()
        const tarefa = { ...tarefasExemplo()[0], coluna: 'CONCLUÍDA' }
        render(<ItemTarefa tarefas={[tarefa]} onAtualizarColuna={onAtualizarColuna} />)

        await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'EM ANDAMENTO')

        expect(onAtualizarColuna).toHaveBeenCalledWith(1, 'EM ANDAMENTO')
    })

    test('exibe a prioridade das tarefas na lista quando o mesmo rótulo se repete', () => {
        const tarefas = tarefasExemplo()
        tarefas[1] = { ...tarefas[1], prioridade: 'Alto' }

        render(<ListaTarefas tarefas={tarefas} />)

        expect(screen.getAllByText('Alto')).toHaveLength(2)
    })

    test('mantém visível a tarefa sem projeto sem exibir um fallback inexistente', () => {
        const tarefa = tarefasExemplo()[2]

        render(<ListaTarefas tarefas={[tarefa]} />)

        expect(screen.getByText('Testar o front')).toBeInTheDocument()
        expect(screen.queryByText('Sem projeto')).not.toBeInTheDocument()
    })

    test('atualiza a coluna da primeira tarefa na lista Kanban', async () => {
        const user = userEvent.setup()
        const onAtualizarColuna = vi.fn()
        render(<ListaTarefas tarefas={tarefasExemplo()} onAtualizarColuna={onAtualizarColuna} />)

        const statusDaPrimeiraTarefa = screen.getAllByRole('combobox', { name: 'Status' })[0]
        await user.selectOptions(statusDaPrimeiraTarefa, 'EM ANDAMENTO')

        expect(onAtualizarColuna).toHaveBeenCalledOnce()
        expect(onAtualizarColuna).toHaveBeenCalledWith(1, 'EM ANDAMENTO')
    })
})
