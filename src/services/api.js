import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')

function normalizarColuna(coluna) {
  if (coluna === undefined || coluna === null || coluna === '') return coluna

  const valor = String(coluna)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const mapeamento = {
    'a fazer': 'afazer',
    'afazer': 'afazer',
    'em andamento': 'andamento',
    'andamento': 'andamento',
    'concluida': 'concluido',
    'concluido': 'concluido',
  }

  return mapeamento[valor] || valor
}

function normalizarPayloadTarefa(payload = {}) {
  return {
    ...payload,
    coluna: payload.coluna !== undefined ? normalizarColuna(payload.coluna) : payload.coluna,
  }
}

function normalizarColunaVisual(coluna, concluida = false) {
  if (concluida || coluna === 'concluido' || coluna === 'CONCLUÍDA') return 'CONCLUÍDA'

  const colunaNormalizada = normalizarColuna(coluna)

  if (colunaNormalizada === 'andamento') return 'EM ANDAMENTO'
  if (colunaNormalizada === 'afazer') return 'A FAZER'

  return coluna || 'A FAZER'
}

function normalizarTarefaVisual(tarefa = {}) {
  return {
    ...tarefa,
    coluna: normalizarColunaVisual(tarefa.coluna, tarefa.concluida),
  }
}
export { normalizarPayloadTarefa, normalizarTarefaVisual }

export function mensagensDeErro(erro) {
  const dados = erro?.response?.data

  if (!dados) return ['Não foi possível conectar à API.']

  const detalhes = dados.erro?.detalhes
  if (Array.isArray(detalhes)) {
    return detalhes.map((detalhe) => {
      if (typeof detalhe === 'string') return detalhe
      if (detalhe && typeof detalhe === 'object') {
        return [detalhe.campo, detalhe.mensagem].filter(Boolean).join(': ')
      }
      return String(detalhe)
    })
  }

  return [dados.mensagem || dados.erro?.mensagem || erro.message || 'Ocorreu um erro.']
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token')
  const metodo = (config.method || 'get').toLowerCase()

  if (['post', 'put', 'patch', 'delete'].includes(metodo)) {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    }
  }

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  return config
})

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      const ehLogin = erro.config?.url?.includes('/auth/login') || erro.config?.url?.includes('/login')
      if (!ehLogin) {
        localStorage.removeItem('token')
        localStorage.removeItem('taskflow_token')
        localStorage.removeItem('taskflow_usuario')
        window.location.href = '/login'
      }
    }
    return Promise.reject(erro);
  }
);

export async function loginNoBackend({ usuario, senha }) {
  const { data } = await api.post('/auth/login', { usuario, senha })
  return data
}

export const tarefasApi = {
  listar: () => api.get('/tarefas'),
  criar: (payload) => api.post('/tarefas', normalizarPayloadTarefa(payload)),
  atualizar: (id, payload) => api.put(`/tarefas/${id}`, normalizarPayloadTarefa(payload)),
  remover: (id) => api.delete(`/tarefas/${id}`),
}

export default api
