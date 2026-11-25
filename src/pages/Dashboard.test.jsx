import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../context/AuthProvider'

const apiMocks = vi.hoisted(() => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

vi.mock('../services/api', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        default: apiMocks.api,
        api: apiMocks.api,
    }
})

import api from '../services/api'
import Dashboard from './Dashboard'

const dadosPorUrl = {
    '/prioridades': [
        { id: 1, descricao: 'Baixa' },
        { id: 2, descricao: 'Média' },
        { id: 3, descricao: 'Alta' },
    ],
    '/tarefas': [
        {
            id: 1,
            texto: 'Tarefa inicial',
            coluna: 'A FAZER',
            idprioridade: 2,
            prioridade: 'Média',
            usuario_id: 10,
            projeto_id: 30,
            criadoPorId: 10,
        },
    ],
    '/usuarios': [
        { id: 10, nome: 'Ana Lima' },
        { id: 11, nome: 'Bruno Melo' },
    ],
    '/projetos': [{ id: 30, nome: 'TaskFlow' }],
}

function renderDashboard() {
    localStorage.setItem('taskflow_usuario', JSON.stringify({ id: 10, nome: 'Ana Lima' }))
    return render(
        <AuthProvider>
            <Dashboard />
        </AuthProvider>,
    )
}

describe('Dashboard Kanban e API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        api.get.mockImplementation((url) => Promise.resolve({ data: dadosPorUrl[url] ?? [] }))
        api.post.mockImplementation(async (_url, payload) => ({
            data: { id: 2, ...payload },
        }))
        api.put.mockImplementation(async (_url, payload) => ({
            data: { ...dadosPorUrl['/tarefas'][0], ...payload },
        }))
        api.delete.mockResolvedValue({ data: {} })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('mostra o indicador de carregamento enquanto as tarefas não respondem', async () => {
        let resolverTarefas
        const respostaPendente = new Promise((resolve) => {
            resolverTarefas = resolve
        })
        api.get.mockImplementation((url) => (
            url === '/tarefas'
                ? respostaPendente
                : Promise.resolve({ data: dadosPorUrl[url] ?? [] })
        ))

        renderDashboard()

        expect(screen.getByText('Carregando tarefas...')).toBeInTheDocument()

        resolverTarefas({ data: dadosPorUrl['/tarefas'] })
        expect(await screen.findByText('Tarefa inicial')).toBeInTheDocument()
    })

    test('carrega e mostra tarefas, remove o indicador e busca /tarefas', async () => {
        renderDashboard()

        expect(await screen.findByText('Tarefa inicial')).toBeInTheDocument()
        expect(screen.getByText('Tarefas cadastradas')).toBeInTheDocument()
        expect(screen.queryByText('Carregando tarefas...')).not.toBeInTheDocument()
        expect(api.get).toHaveBeenCalledWith('/tarefas')
    })

    test('mostra uma mensagem de erro quando a API falha ao carregar', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        api.get.mockRejectedValue(new Error('Network Error'))

        renderDashboard()

        expect(await screen.findByText('Não foi possível conectar à API.')).toBeInTheDocument()
        expect(screen.getByText('Erro ao carregar tarefas')).toBeInTheDocument()
    })

    test('cria uma tarefa pelo modal e mostra o novo item no quadro', async () => {
        const user = userEvent.setup()
        const tarefaCriada = {
            id: 2,
            texto: 'Tarefa criada pelo teste',
            coluna: 'afazer',
            idprioridade: 2,
            usuario_id: 10,
            projeto_id: 30,
            criadoPorId: 10,
        }
        api.post.mockResolvedValueOnce({ data: tarefaCriada })
        renderDashboard()

        await screen.findByText('Tarefa inicial')
        await user.click(screen.getByRole('button', { name: /Adicionar Tarefa/ }))
        await user.type(screen.getByLabelText('Tarefa'), 'Tarefa criada pelo teste')
        await user.click(screen.getByRole('button', { name: 'Salvar' }))

        expect(api.post).toHaveBeenCalledWith('/tarefas', expect.objectContaining({
            texto: 'Tarefa criada pelo teste',
            idprioridade: 2,
            usuario_id: 10,
            projeto_id: 30,
            coluna: 'afazer',
        }))
        expect(await screen.findByText('Tarefa criada pelo teste')).toBeInTheDocument()
    })

    test('exclui a primeira tarefa pelo endpoint real e remove o item', async () => {
        const user = userEvent.setup()
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderDashboard()

        await screen.findByText('Tarefa inicial')
        await user.click(screen.getByRole('button', { name: 'Excluir' }))

        await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/tarefas/1'))
        await waitFor(() => expect(screen.queryByText('Tarefa inicial')).not.toBeInTheDocument())
    })

    test('move uma tarefa para outra coluna com uma atualização PUT', async () => {
        const user = userEvent.setup()
        renderDashboard()

        await screen.findByText('Tarefa inicial')
        await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'EM ANDAMENTO')

        await waitFor(() => expect(api.put).toHaveBeenCalledWith(
            '/tarefas/1',
            expect.objectContaining({ coluna: 'andamento' }),
        ))
    })
})
