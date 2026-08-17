import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/useAuthHook';

import './Login.css';

export default function Login() {

    const [usuario, setUsuario] = useState('');

    const [senha, setSenha] = useState('');

    const [erro, setErro] = useState('');

    const [shake, setShake] = useState(false);

    const { login, logado } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (logado) {
            navigate('/dashboard', { replace: true })
        }
    }, [logado, navigate])

    function handleLogin() {

        if (usuario === 'admin' && senha === '1234') {

        login(); // atualiza o AuthContext

        navigate('/dashboard'); // redireciona para o Dashboard

        return;

    }

        setErro('Usuário ou senha incorretos');

        setShake(true);

        // Remove a classe após 500ms para poder disparar de novo

        setTimeout(() => setShake(false), 500);

    }
    return (

        <div className='login-container'>

            {/* shake é adicionado como classe quando há erro */}

            <div className={`login-card ${shake ? 'shake' : ''}`}>

                <h1 className='login-logo'>TaskFlow</h1>

                <p className='login-subtitulo'>Faça login para continuar</p>

                <input className='login-input' type='text'

                placeholder='Usuário' value={usuario}

                onChange={e => setUsuario(e.target.value)} />

                <input className='login-input' type='password'

                placeholder='Senha' value={senha}

                onChange={e => setSenha(e.target.value)}

                onKeyDown={e => e.key === 'Enter' && handleLogin()} />

                {/* Mensagem de erro — renderização condicional */}

                {erro && <p className='login-erro'>{erro}</p>}

                <button className='login-btn' onClick={handleLogin}>

                Entrar

                </button>

                <p className='login-aviso'>

                Este login é apenas para fins didáticos.

                Credenciais reais vêm no módulo back-end.

                </p>

            </div>

        </div>
    )
}

