export default function Cadastro() {

    return (
        <>
            <div>
                <h1>Cadastro</h1>
            </div>
            <form>
                <label htmlFor="nome">Nome:</label>
                <input type="text" id="nome" placeholder="Nome" />
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" placeholder="Email" />
                <label htmlFor="senha">Senha:</label>
                <input type="password" id="senha" placeholder="Senha" />
                <button type="submit">Cadastrar</button>
            </form>
        </>
    )
}