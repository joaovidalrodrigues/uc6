const Manutencao = require("../src/Manutencao");

const dados = {
  idComputador: 1,
  tipo: "Corretiva",
  problema: "Não liga",
  tecnico: "Carlos",
  dataEntrada: "2026-09-01",
};

describe("Manutencao – criação", () => {
  test("cadastro válido: nasce Aberta, sem custo e sem data de saída", () => {
    const m = new Manutencao(1, dados);
    expect(m.estaAberta()).toBe(true);
    expect(m.custo).toBe(0);
    expect(m.dataSaida).toBeNull();
    expect(m.situacao).toBe("Aberta");
  });

  test("usa a data de hoje quando a entrada não é informada", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-10T12:00:00Z"));
    const m = new Manutencao(1, { ...dados, dataEntrada: undefined });
    expect(m.dataEntrada.toISOString()).toBe("2026-10-10T12:00:00.000Z");
    jest.useRealTimers();
  });

  test("validação: tipo inválido", () => {
    expect(() => new Manutencao(1, { ...dados, tipo: "Qualquer" })).toThrow("Tipo inválido");
  });

  test("validação: problema e técnico obrigatórios", () => {
    expect(() => new Manutencao(1, { ...dados, problema: "" })).toThrow("problema");
    expect(() => new Manutencao(1, { ...dados, tecnico: " " })).toThrow("técnico");
  });

  test("validação: sem dados nenhum", () => {
    expect(() => new Manutencao(1)).toThrow("Tipo inválido");
  });

  test("datas: aceita AAAA-MM-DD, DD/MM/AAAA e objeto Date", () => {
    const iso = new Manutencao(1, { ...dados, dataEntrada: "2026-09-01" });
    const br = new Manutencao(2, { ...dados, dataEntrada: "01/09/2026" });
    const obj = new Manutencao(3, { ...dados, dataEntrada: new Date("2026-09-01") });
    expect(br.dataEntrada.getTime()).toBe(iso.dataEntrada.getTime());
    expect(obj.dataEntrada.getTime()).toBe(iso.dataEntrada.getTime());
  });

  test("tratamento de erro: data inválida", () => {
    expect(() => new Manutencao(1, { ...dados, dataEntrada: "abc" })).toThrow("Data inválida");
  });
});

describe("Manutencao – conclusão", () => {
  test("conclui, guarda solução/custo e calcula a duração em dias", () => {
    const m = new Manutencao(1, dados);
    m.concluir("Troca da fonte", 250, "2026-09-04");
    expect(m.estaAberta()).toBe(false);
    expect(m.situacao).toBe("Concluída");
    expect(m.solucao).toBe("Troca da fonte");
    expect(m.custo).toBe(250);
    expect(m.calcularDuracao()).toBe(3);
  });

  test("conclui usando a data de hoje quando não informada", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-05T00:00:00Z"));
    const m = new Manutencao(1, dados);
    m.concluir("Ok", 0);
    expect(m.calcularDuracao()).toBe(4);
    jest.useRealTimers();
  });

  test("tratamento de erro: não conclui duas vezes", () => {
    const m = new Manutencao(1, dados);
    m.concluir("ok", 10, "2026-09-02");
    expect(() => m.concluir("ok", 10, "2026-09-03")).toThrow("já foi concluída");
  });

  test.each([-5, NaN, "100"])("validação: custo inválido (%p)", (custo) => {
    const m = new Manutencao(1, dados);
    expect(() => m.concluir("ok", custo, "2026-09-02")).toThrow("custo");
    expect(m.estaAberta()).toBe(true);
  });

  test("validação: data de saída anterior à entrada", () => {
    const m = new Manutencao(1, dados);
    expect(() => m.concluir("ok", 5, "2026-08-30")).toThrow("anterior");
    expect(m.estaAberta()).toBe(true);
  });

  test("validação: solução obrigatória", () => {
    const m = new Manutencao(1, dados);
    expect(() => m.concluir("", 5, "2026-09-02")).toThrow("solução");
  });
});

describe("Manutencao – duração e texto", () => {
  test("manutenção aberta: duração conta até hoje", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-09-11T00:00:00Z"));
    expect(new Manutencao(1, dados).calcularDuracao()).toBe(10);
    jest.useRealTimers();
  });

  test("duração nunca é negativa", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-01T00:00:00Z"));
    expect(new Manutencao(1, dados).calcularDuracao()).toBe(0);
    jest.useRealTimers();
  });

  test("toString: aberta e concluída", () => {
    const m = new Manutencao(1, dados);
    expect(m.toString()).toMatch(/em andamento.*Aberta/);
    m.concluir("Troca da fonte", 250, "2026-09-03");
    expect(m.toString()).toMatch(/03\/09\/2026.*250,00.*Concluída/);
  });
});
