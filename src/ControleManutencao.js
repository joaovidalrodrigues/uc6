const Computador = require("./Computador");
const Manutencao = require("./Manutencao");

// ---------- Funções próprias ----------
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function repetir(caractere, vezes) {
  let texto = "";
  for (let i = 0; i < vezes; i++) {
    texto += caractere;
  }
  return texto;
}

// ---------- Dados simulados ----------
const COMPUTADORES_SIMULADOS = [
  { patrimonio: "PAT-001", marca: "Dell", modelo: "OptiPlex 3080", setor: "Laboratório 1" },
  { patrimonio: "PAT-002", marca: "Lenovo", modelo: "ThinkCentre M70", setor: "Laboratório 1" },
  { patrimonio: "PAT-003", marca: "HP", modelo: "ProDesk 400", setor: "Secretaria" },
  { patrimonio: "PAT-004", marca: "Acer", modelo: "Aspire TC", setor: "Biblioteca" },
  { patrimonio: "PAT-005", marca: "Positivo", modelo: "Master D3400", setor: "Laboratório 2" },
  { patrimonio: "PAT-006", marca: "Dell", modelo: "Inspiron 15", setor: "Diretoria" },
];

// "concluida" = dados da conclusão; sem ele, a manutenção permanece aberta.
const MANUTENCOES_SIMULADAS = [
  { pat: "PAT-001", tipo: "Corretiva", problema: "Computador não liga", tecnico: "Carlos Silva",
    entrada: "2026-09-01", concluida: { solucao: "Troca da fonte de alimentação", custo: 250, saida: "2026-09-03" } },
  { pat: "PAT-003", tipo: "Preventiva", problema: "Limpeza e troca de pasta térmica", tecnico: "Marina Souza",
    entrada: "2026-09-10", concluida: { solucao: "Limpeza interna e pasta térmica nova", custo: 80, saida: "2026-09-10" } },
  { pat: "PAT-004", tipo: "Corretiva", problema: "Tela azul frequente", tecnico: "Carlos Silva",
    entrada: "2026-09-20", concluida: { solucao: "Troca da memória RAM", custo: 180, saida: "2026-09-24" } },
  { pat: "PAT-002", tipo: "Corretiva", problema: "Lentidão extrema", tecnico: "Marina Souza",
    entrada: "2026-10-01" },
  { pat: "PAT-005", tipo: "Preventiva", problema: "Revisão geral e antivírus", tecnico: "Carlos Silva",
    entrada: "2026-10-03" },
];

class ControleManutencao {
  constructor() {
    this.computadores = [];
    this.manutencoes = [];
    this.proximoIdComputador = 1;
    this.proximoIdManutencao = 1;
  }

  // ---------- Computadores (CRUD) ----------
  cadastrarComputador(dados) {
    const patrimonio = dados && typeof dados.patrimonio === "string" ? dados.patrimonio.trim() : "";
    if (patrimonio && this.#existePatrimonio(patrimonio)) {
      throw new Error(`Já existe um computador com o patrimônio "${patrimonio}".`);
    }
    const computador = new Computador(this.proximoIdComputador, dados);
    this.computadores.push(computador);
    this.proximoIdComputador++;
    return computador;
  }

  consultarComputador(id) {
    for (const computador of this.computadores) {
      if (computador.id === id) {
        return computador;
      }
    }
    throw new Error(`Computador com código ${id} não encontrado.`);
  }

  buscarPorPatrimonio(patrimonio) {
    const alvo = String(patrimonio).trim().toUpperCase();
    const achado = this.computadores.find((c) => c.patrimonio.toUpperCase() === alvo);
    if (!achado) {
      throw new Error(`Computador com patrimônio "${patrimonio}" não encontrado.`);
    }
    return achado;
  }

  listarComputadores() {
    return [...this.computadores];
  }

  atualizarComputador(id, dados) {
    const computador = this.consultarComputador(id);
    if (dados && dados.patrimonio !== undefined) {
      const novo = String(dados.patrimonio).trim();
      if (this.#existePatrimonio(novo, id)) {
        throw new Error(`Já existe um computador com o patrimônio "${novo}".`);
      }
    }
    computador.atualizarDados(dados);
    return computador;
  }

  excluirComputador(id) {
    const computador = this.consultarComputador(id);
    if (computador.estaEmManutencao()) {
      throw new Error("Não é possível excluir um computador que está em manutenção.");
    }
    this.computadores = this.computadores.filter((c) => c.id !== id);
    this.manutencoes = this.manutencoes.filter((m) => m.idComputador !== id);
    return computador;
  }

  // ---------- Manutenções ----------
  registrarManutencao(idComputador, dados) {
    const computador = this.consultarComputador(idComputador);
    if (computador.estaEmManutencao()) {
      throw new Error(`O computador ${computador.patrimonio} já está em manutenção.`);
    }
    const manutencao = new Manutencao(this.proximoIdManutencao, { ...dados, idComputador });
    this.manutencoes.push(manutencao);
    this.proximoIdManutencao++;
    computador.alterarStatus("Em manutenção");
    return manutencao;
  }

  consultarManutencao(id) {
    const manutencao = this.manutencoes.find((m) => m.id === id);
    if (!manutencao) {
      throw new Error(`Manutenção com código ${id} não encontrada.`);
    }
    return manutencao;
  }

  concluirManutencao(idManutencao, solucao, custo, dataSaida) {
    const manutencao = this.consultarManutencao(idManutencao);
    manutencao.concluir(solucao, custo, dataSaida);
    this.consultarComputador(manutencao.idComputador).alterarStatus("Disponível");
    return manutencao;
  }

  listarManutencoesAbertas() {
    return this.manutencoes.filter((m) => m.estaAberta());
  }

  historicoDoComputador(idComputador) {
    this.consultarComputador(idComputador);
    return this.manutencoes.filter((m) => m.idComputador === idComputador);
  }

  // ---------- Relatório ----------
  resumoPorTecnico() {
    const resumo = {};
    for (const m of this.manutencoes) {
      if (!resumo[m.tecnico]) {
        resumo[m.tecnico] = { quantidade: 0, custo: 0 };
      }
      resumo[m.tecnico].quantidade++;
      resumo[m.tecnico].custo += m.custo;
    }
    return resumo;
  }

  gerarRelatorio() {
    const abertas = this.listarManutencoesAbertas();
    const concluidas = this.manutencoes.filter((m) => !m.estaAberta());
    const custoTotal = concluidas.reduce((soma, m) => soma + m.custo, 0);
    const emManutencao = this.computadores.filter((c) => c.estaEmManutencao()).length;
    const linha = repetir("=", 60);

    const linhas = [
      linha,
      "RELATÓRIO DE MANUTENÇÕES – TECHFIX",
      linha,
      `Computadores cadastrados: ${this.computadores.length} ` +
        `(disponíveis: ${this.computadores.length - emManutencao}, em manutenção: ${emManutencao})`,
      `Manutenções: ${this.manutencoes.length} ` +
        `(abertas: ${abertas.length}, concluídas: ${concluidas.length})`,
      `Custo total das manutenções concluídas: ${formatarMoeda(custoTotal)}`,
      "",
      "--- Manutenções em aberto ---",
    ];

    if (abertas.length === 0) {
      linhas.push("Nenhuma manutenção em aberto.");
    }
    for (const m of abertas) {
      const pc = this.consultarComputador(m.idComputador);
      linhas.push(`${pc.patrimonio} – ${m.tipo}: ${m.problema} (${m.tecnico}, ${m.calcularDuracao()} dia(s))`);
    }

    linhas.push("", "--- Manutenções concluídas ---");
    if (concluidas.length === 0) {
      linhas.push("Nenhuma manutenção concluída.");
    }
    for (const m of concluidas) {
      const pc = this.computadores.find((c) => c.id === m.idComputador);
      linhas.push(`${pc ? pc.patrimonio : "?"} – ${m.tipo}: ${m.solucao} (${m.tecnico}, ${formatarMoeda(m.custo)})`);
    }

    linhas.push("", "--- Resumo por técnico ---");
    const resumo = this.resumoPorTecnico();
    for (const tecnico of Object.keys(resumo)) {
      linhas.push(`${tecnico}: ${resumo[tecnico].quantidade} manutenção(ões), ${formatarMoeda(resumo[tecnico].custo)}`);
    }
    linhas.push(linha);
    return linhas.join("\n");
  }

  // ---------- Dados simulados ----------
  carregarDadosSimulados() {
    for (const dados of COMPUTADORES_SIMULADOS) {
      this.cadastrarComputador(dados);
    }
    for (const item of MANUTENCOES_SIMULADAS) {
      const computador = this.buscarPorPatrimonio(item.pat);
      const manutencao = this.registrarManutencao(computador.id, {
        tipo: item.tipo,
        problema: item.problema,
        tecnico: item.tecnico,
        dataEntrada: item.entrada,
      });
      if (item.concluida) {
        this.concluirManutencao(manutencao.id, item.concluida.solucao, item.concluida.custo, item.concluida.saida);
      }
    }
    return this;
  }

  #existePatrimonio(patrimonio, ignorarId = null) {
    const alvo = patrimonio.toUpperCase();
    return this.computadores.some((c) => c.id !== ignorarId && c.patrimonio.toUpperCase() === alvo);
  }
}

module.exports = ControleManutencao;
