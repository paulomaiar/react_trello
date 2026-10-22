import { afterEach, describe, expect, it } from 'vitest'
import { paraNumero } from './paraNumero'
import { api, mensagensDeErro } from '../services/api'

describe('paraNumero', () => {
    it('converts a numeric string to a number', () => {
        expect(paraNumero('42')).toBe(42)
    })

    it('returns null for empty values', () => {
        expect(paraNumero('')).toBeNull()
        expect(paraNumero('   ')).toBeNull()
        expect(paraNumero(null)).toBeNull()
    })
})

describe('mensagensDeErro', () => {
    it('returns validation details as readable messages', () => {
        expect(mensagensDeErro({
            response: {
                data: {
                    erro: {
                        detalhes: [{ campo: 'texto', mensagem: 'é obrigatório' }],
                    },
                },
            },
        })).toEqual(['texto: é obrigatório'])
    })

    it('returns the API message for other responses', () => {
        expect(mensagensDeErro({
            response: { data: { erro: { mensagem: 'Acesso negado' } } },
        })).toEqual(['Acesso negado'])
    })

    it('returns the offline message when there is no response', () => {
        expect(mensagensDeErro({ message: 'Network Error' })).toEqual([
            'Não foi possível conectar à API.',
        ])
    })
})

describe('API unauthorized interceptor', () => {
    const localStorageOriginal = globalThis.localStorage
    const windowOriginal = globalThis.window
    afterEach(() => {
        if (localStorageOriginal === undefined) Reflect.deleteProperty(globalThis, 'localStorage')
        else globalThis.localStorage = localStorageOriginal
        if (windowOriginal === undefined) Reflect.deleteProperty(globalThis, 'window')
        else globalThis.window = windowOriginal
    })

    function configurarBrowserFalso() {
        const removidos = []
        globalThis.localStorage = {
            getItem: () => null,
            removeItem: (key) => removidos.push(key),
        }
        globalThis.window = { location: { href: '/dashboard', pathname: '/dashboard' } }
        return removidos
    }

    it('keeps login credentials errors on the login page', async () => {
        const removidos = configurarBrowserFalso()
        const erro401 = {
            adapter: (config) => Promise.reject({
                config,
                response: { status: 401 },
            }),
        }

        await expect(api.post('/auth/login', {}, erro401)).rejects.toMatchObject({
            response: { status: 401 },
        })
        expect(removidos).toEqual([])
        expect(globalThis.window.location.href).toBe('/dashboard')
    })

    it('clears the session and redirects for other unauthorized requests', async () => {
        const removidos = configurarBrowserFalso()
        const erro401 = {
            adapter: (config) => Promise.reject({
                config,
                response: { status: 401 },
            }),
        }

        await expect(api.get('/tarefas', erro401)).rejects.toMatchObject({
            response: { status: 401 },
        })
        expect(removidos).toEqual(['token', 'taskflow_token', 'taskflow_usuario'])
        expect(globalThis.window.location.href).toBe('/login')
    })
})
