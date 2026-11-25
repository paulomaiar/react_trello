import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../context/AuthProvider'
import ModalTarefa from './ModalTarefa'

const usuarios = [
    { id: 10, nome: 'Ana Lima' },
    { id: 11, nome: 'Bruno Melo' },
]

const projetos = [
    { id: 30, nome: 'TaskFlow' },
    { id: 31, nome: 'Site novo' },
]

const prioridades = [
    { id: 1, descricao: 'Baixa' },
    { id: 2, descricao: 'Média' },
    { id: 3, descricao: 'Alta' },
]

function renderModal(props = {}) {
    return render(
        <AuthProvider>
            <ModalTarefa
                aberto
                onFechar={vi.fn()}
                onSalvar={vi.fn()}
                usuarios={usuarios}
                projetos={projetos}
                prioridades={prioridades}
                {...props}
            />
        </AuthProvider>,
    )
}

describe('ModalTarefa', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        localStorage.setItem('taskflow_usuario', JSON.stringify({ id: 10, nome: 'Ana Lima' }))
    })

    test('não renderiza o modal quando aberto é false', () => {
        renderModal({ aberto: false })

        expect(screen.queryByText('Nova tarefa')).not.toBeInTheDocument()
    })

    test('mostra o formulário de criação com os valores iniciais', () => {
        renderModal()

        expect(screen.getByText('Nova tarefa')).toBeInTheDocument()
        expect(screen.getByLabelText('Tarefa')).toHaveValue('')
        expect(screen.getByLabelText('Responsável')).toHaveValue('10')
        expect(screen.getByLabelText('Projeto')).toHaveValue('30')
        expect(screen.getByLabelText('Prioridade')).toHaveValue('2')
    })

    test('mostra o formulário de edição preenchido com os dados da tarefa', () => {
        renderModal({
            tarefa: {
                id: 42,
                texto: 'Revisar o fluxo',
                usuario_id: 11,
                projeto_id: 31,
                idprioridade: 3,
                coluna: 'EM ANDAMENTO',
                criadoPorId: 10,
            },
        })

        expect(screen.getByText('Editar tarefa')).toBeInTheDocument()
        expect(screen.getByLabelText('Tarefa')).toHaveValue('Revisar o fluxo')
        expect(screen.getByLabelText('Responsável')).toHaveValue('11')
        expect(screen.getByLabelText('Projeto')).toHaveValue('31')
        expect(screen.getByLabelText('Prioridade')).toHaveValue('3')
    })

    test('atualiza o texto da tarefa ao digitar', async () => {
        const user = userEvent.setup()
        renderModal()

        const campoTarefa = screen.getByLabelText('Tarefa')
        await user.type(campoTarefa, 'Planejar entrega')

        expect(campoTarefa).toHaveValue('Planejar entrega')
    })

    test('fecha pelo botão Cancelar e pela tecla Escape', async () => {
        const user = userEvent.setup()
        const onFechar = vi.fn()
        renderModal({ onFechar })

        await user.click(screen.getByRole('button', { name: 'Cancelar' }))
        await user.keyboard('{Escape}')

        expect(onFechar).toHaveBeenCalledTimes(2)
    })

    test('salva a tarefa com os identificadores numéricos e fecha o modal', async () => {
        const user = userEvent.setup()
        const onFechar = vi.fn()
        const onSalvar = vi.fn().mockResolvedValue(undefined)
        renderModal({ onFechar, onSalvar })

        await user.type(screen.getByLabelText('Tarefa'), 'Preparar release')
        await user.click(screen.getByRole('button', { name: 'Salvar' }))

        expect(onSalvar).toHaveBeenCalledWith({
            id: undefined,
            texto: 'Preparar release',
            idprioridade: 2,
            usuario_id: 10,
            projeto_id: 30,
            coluna: 'A FAZER',
        })
        expect(onFechar).toHaveBeenCalledTimes(1)
    })

    test('mantém o modal aberto e mostra o erro retornado ao salvar', async () => {
        const user = userEvent.setup()
        const onFechar = vi.fn()
        const onSalvar = vi.fn().mockRejectedValue({
            response: { status: 400, data: { mensagem: 'A tarefa não pode ser salva.' } },
        })
        renderModal({ onFechar, onSalvar })

        await user.type(screen.getByLabelText('Tarefa'), 'Tarefa inválida')
        await user.click(screen.getByRole('button', { name: 'Salvar' }))

        expect(await screen.findByText('A tarefa não pode ser salva.')).toBeInTheDocument()
        expect(onFechar).not.toHaveBeenCalled()
    })

    test('desabilita o botão e mostra o estado de salvamento enquanto aguarda', async () => {
        const user = userEvent.setup()
        const onSalvar = vi.fn(() => new Promise(() => {}))
        renderModal({ onSalvar })

        await user.type(screen.getByLabelText('Tarefa'), 'Aguardar API')
        await user.click(screen.getByRole('button', { name: 'Salvar' }))

        const botaoSalvar = screen.getByRole('button', { name: 'Salvando...' })
        expect(botaoSalvar).toBeDisabled()
    })

    test('envia id e coluna ao salvar uma tarefa editada', async () => {
        const user = userEvent.setup()
        const onSalvar = vi.fn().mockResolvedValue(undefined)
        renderModal({
            onSalvar,
            tarefa: {
                id: 42,
                texto: 'Revisar o fluxo',
                usuario_id: 10,
                projeto_id: 30,
                idprioridade: 2,
                coluna: 'EM ANDAMENTO',
                criadoPorId: 10,
            },
        })

        await user.click(screen.getByRole('button', { name: 'Salvar' }))

        expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({
            id: 42,
            coluna: 'EM ANDAMENTO',
        }))
    })

    test('envia o id numérico do responsável selecionado ao salvar', async () => {
        const user = userEvent.setup()
        const onSalvar = vi.fn().mockResolvedValue(undefined)
        renderModal({ onSalvar })

        await user.selectOptions(screen.getByLabelText('Responsável'), '11')
        await user.type(screen.getByLabelText('Tarefa'), 'Atribuir tarefa')
        await user.click(screen.getByRole('button', { name: 'Salvar' }))

        expect(onSalvar).toHaveBeenCalledWith(expect.objectContaining({ usuario_id: 11 }))
    })
})
