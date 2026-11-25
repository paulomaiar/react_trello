import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('ListaTarefas', () => {
    test('com lista vazia mantém a lista sem mensagem de estado vazio', () => {
        render(<ListaTarefas tarefas={[]} />)

        expect(screen.getByRole('list')).toBeInTheDocument()
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
        expect(screen.queryByText('Nenhuma tarefa aqui ainda.')).not.toBeInTheDocument()
    })

    test('renderiza um item para cada tarefa', () => {
        render(<ListaTarefas tarefas={tarefasExemplo()} />)

        expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    test('não exibe responsável nem fallback para tarefas sem esse dado', () => {
        const tarefas = tarefasExemplo()

        render(<ListaTarefas tarefas={[tarefas[2]]} />)

        expect(screen.getByText('Testar o front')).toBeInTheDocument()
        expect(screen.queryByText('Sem responsável')).not.toBeInTheDocument()
    })

    test('repassa o id da segunda tarefa ao excluir', async () => {
        const user = userEvent.setup()
        const onExcluir = vi.fn()
        const tarefas = tarefasExemplo().map((tarefa) => ({ ...tarefa, criadoPorId: 42 }))
        render(<ListaTarefas tarefas={tarefas} onExcluir={onExcluir} />)

        const botoesExcluir = screen.getAllByRole('button', { name: 'Excluir' })
        await user.click(botoesExcluir[1])

        expect(onExcluir).toHaveBeenCalledOnce()
        expect(onExcluir).toHaveBeenCalledWith(2)
    })
})
