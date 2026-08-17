import { useState, useEffect } from 'react';

import styles from './ModalTarefa.module.css';

import axios from 'axios';

// tarefa: objeto para EDITAR | null para CRIAR

// coluna: coluna onde o + foi clicado (criação)

function ModalTarefa({ aberto, onFechar, onSalvar, tarefa=null, coluna='A FAZER' }) {

    const [texto, setTexto] = useState('');

    const [cep, setCep] = useState('');

    const [cidade, setCidade] = useState('');

    const [prioridade, setPrioridade] = useState('media');

    // Preenche os campos ao abrir para edição

    useEffect(() => {

    if (tarefa) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
        setTexto(tarefa.texto);

        setCep(tarefa.cep || '');

        setCidade(tarefa.cidade || '');

        setPrioridade(tarefa.prioridade);

    } else {

        // Limpa os campos ao abrir para criação

        setTexto(''); setCep(''); setCidade(''); setPrioridade('media');

    }

    }, [tarefa, aberto]); // roda quando o modal abre ou a tarefa muda



    // Adicionar dentro do componente ModalTarefa:

    useEffect(() => {

    // Só registra o listener quando o modal estiver aberto

        if (!aberto) return;

        function handleEsc(e) {

            if (e.key === 'Escape') onFechar();

        }

        document.addEventListener('keydown', handleEsc);

        return () => {

            document.removeEventListener('keydown', handleEsc)
        };
    }, [aberto, onFechar]);


    async function consultarCidade(cepDigitado) {
    if (cepDigitado.trim().length < 8) return;

    try {

        const { data } = await axios.get(

        `https://viacep.com.br/ws/${cepDigitado}/json/`

    );

    if (!data.erro) setCidade(data.localidade + '/' + data.uf);
    } catch { /* ignora erro de CEP silenciosamente */ }

    }

    function handleSalvar() {

        if (texto.trim() === '') return;

        // Monta o objeto com os dados do formulário

        // id: undefined na criação — Dashboard gera o id

        onSalvar({

            id: tarefa?.id, // undefined = criar | número = editar

            texto,

            cep,

            cidade,

            prioridade,

            coluna: tarefa?.coluna || coluna,

        });

        onFechar();

    }
    return (

        // Overlay: clique fora fecha o modal

        <div className={styles.overlay} onClick={onFechar}>

            {/* stopPropagation: evita fechar ao clicar dentro do card */}

            <div className={styles.card} onClick={e => e.stopPropagation()}>

                <h2>{tarefa ? 'Editar tarefa' : 'Nova tarefa'}</h2>

                <input placeholder='Texto da tarefa' value={texto}

                onChange={e => setTexto(e.target.value)} />

                <input placeholder='CEP (opcional)' value={cep}

                onChange={e => { setCep(e.target.value); consultarCidade(e.target.value); }} />

                {cidade && <p className={styles.cidade}>{cidade}</p>}

                <select value={prioridade} onChange={e => setPrioridade(e.target.value)}>

                    <option value='alta'>Alta</option>

                    <option value='media'>Média</option>

                    <option value='baixa'>Baixa</option>

                </select>

                <div className={styles.botoes}>

                    <button onClick={onFechar}>Cancelar</button>

                    <button onClick={handleSalvar}>Salvar</button>

                </div>

            </div>

        </div>

    )

}

export default ModalTarefa