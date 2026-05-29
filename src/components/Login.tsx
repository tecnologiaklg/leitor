import React, { useState } from 'react';
import { showToast } from './Toast';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'KLGESTOQUE' && password === 'Awk3278-') {
      onLogin();
      showToast('Login realizado com sucesso!', 'success', '👋');
    } else {
      showToast('Usuário ou senha incorretos.', 'error', '❌');
    }
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 'var(--space-4)',
      background: 'var(--color-background)',
      color: 'var(--color-text)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: 'var(--space-6)' }}>
        <header className="header" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="header__icon">🔒</div>
          <h1 className="header__title">Leitor Estoque</h1>
          <p className="header__subtitle">Acesso Restrito</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'bold' }}>Usuário</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o usuário"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'bold' }}>Senha</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary" style={{ marginTop: 'var(--space-2)' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
