import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await axios.post(`${API_URL}/usuarios`, {
        nome,
        email,
        senha
      });

      // Sucesso no cadastro -> redireciona para o login
      navigate('/login');
    } catch (err) {
      setErro(
        err.response?.data?.erro || 'Erro ao realizar cadastro. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-logo">TaskFlow</h1>
        <p className="login-subtitulo">Crie sua conta para começar</p>

        {erro && <p className="login-erro">{erro}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="text"
          id="nome"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          className="login-input"
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="login-input"
          type="password"
          id="senha"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button className="login-btn" type="submit" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        </form>

        <p>
          Já possui uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
}