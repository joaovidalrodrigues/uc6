# TechFix – Sistema de Controle de Manutenção de Computadores

## Descrição do Projeto

O **TechFix** é um sistema de terminal (menu interativo) para controlar a manutenção de
computadores de uma empresa, escola ou laboratório. Ele substitui anotações em papel e
planilhas soltas por um registro organizado, com o histórico de cada equipamento.

**O que o sistema faz:**

- **Cadastra** computadores (patrimônio, marca, modelo, setor e status).
- **Consulta** um computador e mostra todo o seu histórico de manutenções.
- **Atualiza** os dados de um computador cadastrado.
- **Exclui** computadores (junto com o histórico), desde que não estejam em manutenção.
- **Registra manutenções** preventivas e corretivas, informando problema, técnico e data.
- **Conclui manutenções**, registrando solução, custo e data de saída; o computador volta a
  ficar "Disponível".
- **Gera relatório** com totais, manutenções em aberto e concluídas, custo total e resumo por técnico.

**Regras de negócio:**

- O patrimônio de cada computador é único.
- Um computador só pode ter uma manutenção aberta por vez.
- Não é possível excluir um computador que está em manutenção.
- O custo não pode ser negativo e a data de saída não pode ser anterior à de entrada.

O sistema já inicia com **dados simulados** (6 computadores e 5 manutenções), para facilitar o teste.

## Integrantes

- João Morato
- [Nome do integrante 2]
- [Nome do integrante 3]

## Tecnologias Utilizadas

- **JavaScript** (classes, módulos CommonJS, arrays, tratamento de erros)
- **Node.js** (versão 18 ou superior)
- **Jest** (testes automatizados e relatório de cobertura)
- **Git** (controle de versão)

## Estrutura do Projeto

```
uc6/
├── src/
│   ├── Computador.js           classe Computador (dados e status de um equipamento)
│   ├── Manutencao.js           classe Manutencao (serviço feito em um computador)
│   ├── ControleManutencao.js   cadastros, manutenções, relatório e dados simulados
│   └── app.js                  menu interativo (ponto de entrada do sistema)
│
├── tests/
│   ├── Computador.test.js
│   ├── Manutencao.test.js
│   └── ControleManutencao.test.js
│
├── docs/
│   ├── casos_de_uso.png        diagramas do projeto
│   ├── classes.png
│   ├── fluxograma.png
│   ├── coverage/               relatório de cobertura (abrir lcov-report/index.html)
│   └── relatorio-cobertura.txt relatório de cobertura em texto
├── README.md                   esta documentação
└── package.json                scripts e dependências do projeto
```

| Arquivo / pasta | Função |
|---|---|
| `src/Computador.js` | Guarda patrimônio, marca, modelo, setor e status; valida os dados e altera o status. |
| `src/Manutencao.js` | Guarda tipo, problema, técnico, datas, solução e custo; conclui a manutenção e calcula a duração. |
| `src/ControleManutencao.js` | Controla as listas de computadores e manutenções, aplica as regras de negócio e gera o relatório. |
| `src/app.js` | Mostra o menu no terminal e chama os métodos do sistema. |
| `tests/` | Testes automatizados de cada classe, escritos com Jest. |
| `docs/` | Diagramas do projeto e relatório de cobertura de testes (`docs/coverage`, gerado pelo Jest). |
| `package.json` | Define os scripts `start`, `test` e `coverage` e a dependência do Jest. |

## Como Executar

1. Instale o [Node.js](https://nodejs.org) (versão LTS).
2. Abra o terminal **dentro da pasta `uc6`** (a que contém o `package.json`).
3. Rode:

```bash
npm install
npm start
```

O menu do sistema será exibido. Digite o número da opção e aperte Enter:

```
1 - Cadastrar computador
2 - Listar computadores
3 - Consultar computador (e histórico)
4 - Atualizar computador
5 - Excluir computador
6 - Registrar manutenção
7 - Concluir manutenção
8 - Listar manutenções em aberto
9 - Gerar relatório
0 - Sair
```

Para testar rápido, use o patrimônio `PAT-001` na opção 3 (consulta) ou `PAT-003` na opção 6 (registrar manutenção).

> No PowerShell, se aparecer o erro de "execução de scripts desabilitada", rode uma vez:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Como Executar os Testes

```bash
npm test
```

Para rodar os testes e gerar o relatório de cobertura:

```bash
npm run coverage
```

Para rodar apenas um arquivo de teste:

```bash
npm run test -t tests/Manutencao.test.js
```

**Resultado esperado:** 61 testes passando e 100% de cobertura nas três classes de `src/`
(o `app.js` fica fora da cobertura por ser apenas a interface de terminal).
O relatório em HTML fica em `docs/coverage/lcov-report/index.html`.

Os testes cobrem cadastro válido e inválido, consulta, atualização, exclusão, validação de
entradas, tratamento de erros, regras de negócio e relatório.

## Requisitos Técnicos Atendidos

| Requisito | Onde |
|---|---|
| Classes | `Computador`, `Manutencao`, `ControleManutencao` |
| Objetos | instâncias criadas em `ControleManutencao` |
| Métodos | `atualizarDados`, `concluir`, `registrarManutencao`, `gerarRelatorio`... |
| Estruturas condicionais | `if` e ternário nas validações e no menu |
| Estruturas de repetição | `for`, `for...of`, `while` (menu), `filter`, `reduce` |
| Arrays | listas `computadores` e `manutencoes` |
| Funções próprias | `validarTextoObrigatorio`, `criarData`, `formatarMoeda`, `repetir`... |
| Tratamento de erros | `throw new Error` nas regras e `try/catch` no menu |
| Modularização | `module.exports` e `require` entre os arquivos |
| Dados simulados | `ControleManutencao.carregarDadosSimulados()` |
| Testes automatizados | Jest, em `tests/` |
