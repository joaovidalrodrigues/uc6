const ControleManutencao = require("../src/ControleManutencao");

const pc = (patrimonio, extra = {}) => ({
  patrimonio,
  marca: "HP",
  modelo: "ProDesk",
  setor: "TI",
  ...extra,
});

const dadosManutencao = {
  tipo: "Corretiva",
  problema: "Lentidão",
  tecnico: "Ana",
  dataEntrada: "2026-10-01",
};

describe("Cadastro de computadores", () => {
  test("cadastro válido: gera código sequencial", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    const b = c.cadastrarComputador(pc("A2"));
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
    expect(c.listarComputadores()).toHaveLength(2);
  });

  test("cadastro inválido: dados incompletos não cadastram nem gastam código", () => {
    const c = new ControleManutencao();
    expect(() => c.cadastrarComputador(pc("A1", { marca: "" }))).toThrow("marca");
    expect(() => c.cadastrarComputador()).toThrow("obrigatório");
    expect(c.listarComputadores()).toHaveLength(0);
    expect(c.cadastrarComputador(pc("A1")).id).toBe(1);
  });

  test("validação: patrimônio duplicado (ignora maiúsculas)", () => {
    const c = new ControleManutencao();
    c.cadastrarComputador(pc("A1"));
    expect(() => c.cadastrarComputador(pc("a1"))).toThrow("Já existe");
  });
});

describe("Consulta de computadores", () => {
  test("consulta por código e por patrimônio", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("PAT-9"));
    expect(c.consultarComputador(a.id)).toBe(a);
    expect(c.buscarPorPatrimonio(" pat-9 ")).toBe(a);
  });

  test("tratamento de erro: código ou patrimônio inexistente", () => {
    const c = new ControleManutencao();
    expect(() => c.consultarComputador(99)).toThrow("não encontrado");
    expect(() => c.buscarPorPatrimonio("XYZ")).toThrow("não encontrado");
  });

  test("listar devolve uma cópia da lista", () => {
    const c = new ControleManutencao();
    c.cadastrarComputador(pc("A1"));
    c.listarComputadores().pop();
    expect(c.listarComputadores()).toHaveLength(1);
  });
});

describe("Atualização de computadores", () => {
  test("atualiza dados", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    c.atualizarComputador(a.id, { setor: "RH" });
    expect(a.setor).toBe("RH");
  });

  test("permite manter o próprio patrimônio", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    expect(() => c.atualizarComputador(a.id, { patrimonio: "A1", setor: "RH" })).not.toThrow();
  });

  test("validação: patrimônio de outro computador é bloqueado", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    c.cadastrarComputador(pc("A2"));
    expect(() => c.atualizarComputador(a.id, { patrimonio: "A2" })).toThrow("Já existe");
    expect(a.patrimonio).toBe("A1");
  });

  test("tratamento de erro: computador inexistente e dado inválido", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    expect(() => c.atualizarComputador(99, { setor: "RH" })).toThrow("não encontrado");
    expect(() => c.atualizarComputador(a.id, { setor: "" })).toThrow("setor");
    expect(c.atualizarComputador(a.id)).toBe(a);
  });
});

describe("Exclusão de computadores", () => {
  test("exclui o computador e o seu histórico", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    const m = c.registrarManutencao(a.id, dadosManutencao);
    c.concluirManutencao(m.id, "Formatação", 100, "2026-10-02");
    expect(c.excluirComputador(a.id)).toBe(a);
    expect(c.listarComputadores()).toHaveLength(0);
    expect(c.manutencoes).toHaveLength(0);
  });

  test("regra de negócio: não exclui computador em manutenção", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    c.registrarManutencao(a.id, dadosManutencao);
    expect(() => c.excluirComputador(a.id)).toThrow("em manutenção");
    expect(c.listarComputadores()).toHaveLength(1);
  });

  test("tratamento de erro: computador inexistente", () => {
    expect(() => new ControleManutencao().excluirComputador(5)).toThrow("não encontrado");
  });
});

describe("Registro de manutenção", () => {
  test("registra e coloca o computador em manutenção", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    const m = c.registrarManutencao(a.id, dadosManutencao);
    expect(m.id).toBe(1);
    expect(m.idComputador).toBe(a.id);
    expect(a.status).toBe("Em manutenção");
    expect(c.listarManutencoesAbertas()).toEqual([m]);
  });

  test("regra de negócio: só uma manutenção aberta por computador", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    c.registrarManutencao(a.id, dadosManutencao);
    expect(() => c.registrarManutencao(a.id, dadosManutencao)).toThrow("já está em manutenção");
  });

  test("tratamento de erro: computador inexistente", () => {
    expect(() => new ControleManutencao().registrarManutencao(9, dadosManutencao)).toThrow("não encontrado");
  });

  test("validação: dados inválidos não alteram o status nem gastam código", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    expect(() => c.registrarManutencao(a.id, { ...dadosManutencao, tipo: "X" })).toThrow("Tipo inválido");
    expect(a.status).toBe("Disponível");
    expect(c.registrarManutencao(a.id, dadosManutencao).id).toBe(1);
  });
});

describe("Conclusão de manutenção", () => {
  test("conclui e devolve o computador ao status Disponível", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    const m = c.registrarManutencao(a.id, dadosManutencao);
    c.concluirManutencao(m.id, "Formatação", 100, "2026-10-02");
    expect(a.status).toBe("Disponível");
    expect(c.listarManutencoesAbertas()).toHaveLength(0);
  });

  test("tratamento de erro: manutenção inexistente ou já concluída", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    const m = c.registrarManutencao(a.id, dadosManutencao);
    expect(() => c.concluirManutencao(99, "x", 1)).toThrow("não encontrada");
    c.concluirManutencao(m.id, "ok", 0, "2026-10-02");
    expect(() => c.concluirManutencao(m.id, "ok", 0, "2026-10-03")).toThrow("já foi concluída");
  });

  test("validação: custo inválido mantém o computador em manutenção", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    const m = c.registrarManutencao(a.id, dadosManutencao);
    expect(() => c.concluirManutencao(m.id, "ok", -1, "2026-10-02")).toThrow("custo");
    expect(a.status).toBe("Em manutenção");
  });
});

describe("Histórico e relatório", () => {
  test("histórico do computador lista só as suas manutenções", () => {
    const c = new ControleManutencao();
    const a = c.cadastrarComputador(pc("A1"));
    const b = c.cadastrarComputador(pc("A2"));
    const m = c.registrarManutencao(a.id, dadosManutencao);
    c.registrarManutencao(b.id, dadosManutencao);
    expect(c.historicoDoComputador(a.id)).toEqual([m]);
    expect(() => c.historicoDoComputador(99)).toThrow("não encontrado");
  });

  test("resumo por técnico soma quantidade e custo", () => {
    const c = new ControleManutencao().carregarDadosSimulados();
    expect(c.resumoPorTecnico()).toEqual({
      "Carlos Silva": { quantidade: 3, custo: 430 },
      "Marina Souza": { quantidade: 2, custo: 80 },
    });
  });

  test("relatório de um sistema vazio", () => {
    const texto = new ControleManutencao().gerarRelatorio();
    expect(texto).toContain("Computadores cadastrados: 0");
    expect(texto).toContain("Nenhuma manutenção em aberto.");
    expect(texto).toContain("Nenhuma manutenção concluída.");
  });

  test("relatório com dados simulados: totais, abertas, concluídas e técnicos", () => {
    const texto = new ControleManutencao().carregarDadosSimulados().gerarRelatorio();
    expect(texto).toContain("RELATÓRIO DE MANUTENÇÕES");
    expect(texto).toContain("Computadores cadastrados: 6 (disponíveis: 4, em manutenção: 2)");
    expect(texto).toContain("Manutenções: 5 (abertas: 2, concluídas: 3)");
    expect(texto).toMatch(/510,00/);
    expect(texto).toContain("PAT-002 – Corretiva: Lentidão extrema");
    expect(texto).toContain("PAT-001 – Corretiva: Troca da fonte de alimentação");
    expect(texto).toContain("Carlos Silva: 3 manutenção(ões)");
  });

  test("relatório mostra '?' se o computador de uma manutenção não existir mais", () => {
    const c = new ControleManutencao().carregarDadosSimulados();
    c.manutencoes[0].idComputador = 999;
    expect(c.gerarRelatorio()).toContain("? – Corretiva");
  });
});

describe("Dados simulados", () => {
  test("carrega 6 computadores e 5 manutenções (2 em aberto)", () => {
    const c = new ControleManutencao().carregarDadosSimulados();
    expect(c.listarComputadores()).toHaveLength(6);
    expect(c.manutencoes).toHaveLength(5);
    expect(c.listarManutencoesAbertas()).toHaveLength(2);
    expect(c.buscarPorPatrimonio("PAT-002").estaEmManutencao()).toBe(true);
    expect(c.buscarPorPatrimonio("PAT-001").estaEmManutencao()).toBe(false);
  });
});
