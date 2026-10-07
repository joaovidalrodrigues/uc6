const Computador = require("../src/Computador");

const dados = { patrimonio: "PAT-100", marca: "Dell", modelo: "OptiPlex", setor: "TI" };

describe("Computador – cadastro", () => {
  test("cadastro válido: guarda os dados e começa Disponível", () => {
    const pc = new Computador(1, dados);
    expect(pc.id).toBe(1);
    expect(pc.patrimonio).toBe("PAT-100");
    expect(pc.status).toBe("Disponível");
    expect(pc.estaEmManutencao()).toBe(false);
  });

  test("remove espaços extras dos textos", () => {
    const pc = new Computador(1, { ...dados, marca: "  Dell  " });
    expect(pc.marca).toBe("Dell");
  });

  test("aceita um status inicial válido", () => {
    const pc = new Computador(1, { ...dados, status: "Em manutenção" });
    expect(pc.estaEmManutencao()).toBe(true);
  });

  test.each(["patrimonio", "marca", "modelo", "setor"])(
    "cadastro inválido: campo obrigatório vazio (%s)",
    (campo) => {
      expect(() => new Computador(1, { ...dados, [campo]: "   " })).toThrow("obrigatório");
    }
  );

  test("cadastro inválido: campo que não é texto", () => {
    expect(() => new Computador(1, { ...dados, modelo: 123 })).toThrow("obrigatório");
  });

  test("cadastro inválido: sem nenhum dado", () => {
    expect(() => new Computador(1)).toThrow("obrigatório");
  });

  test("cadastro inválido: status desconhecido", () => {
    expect(() => new Computador(1, { ...dados, status: "Quebrado" })).toThrow("Status inválido");
  });
});

describe("Computador – atualização de dados", () => {
  test("atualiza apenas os campos informados", () => {
    const pc = new Computador(1, dados);
    pc.atualizarDados({ setor: "Financeiro" });
    expect(pc.setor).toBe("Financeiro");
    expect(pc.marca).toBe("Dell");
  });

  test("atualiza todos os campos editáveis", () => {
    const pc = new Computador(1, dados);
    pc.atualizarDados({ patrimonio: "PAT-200", marca: "HP", modelo: "ProDesk", setor: "RH" });
    expect(pc.toString()).toBe("#1 | PAT-200 | HP ProDesk | RH | Disponível");
  });

  test("chamar sem dados não altera nada", () => {
    const pc = new Computador(1, dados);
    pc.atualizarDados();
    expect(pc.patrimonio).toBe("PAT-100");
  });

  test("validação: não grava nada se algum campo for inválido", () => {
    const pc = new Computador(1, dados);
    expect(() => pc.atualizarDados({ setor: "RH", modelo: "" })).toThrow("modelo");
    expect(pc.setor).toBe("TI");
  });
});

describe("Computador – status", () => {
  test("altera o status e informa se está em manutenção", () => {
    const pc = new Computador(1, dados);
    pc.alterarStatus("Em manutenção");
    expect(pc.estaEmManutencao()).toBe(true);
    pc.alterarStatus("Disponível");
    expect(pc.estaEmManutencao()).toBe(false);
  });

  test("tratamento de erro: status inválido", () => {
    const pc = new Computador(1, dados);
    expect(() => pc.alterarStatus("Quebrado")).toThrow("Status inválido");
    expect(pc.status).toBe("Disponível");
  });

  test("toString mostra os dados do computador", () => {
    expect(new Computador(3, dados).toString()).toBe("#3 | PAT-100 | Dell OptiPlex | TI | Disponível");
  });
});
