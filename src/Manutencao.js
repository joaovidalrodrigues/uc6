// ---------- Funções próprias ----------
function validarTextoObrigatorio(valor, campo) {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error(`O campo "${campo}" é obrigatório.`);
  }
  return valor.trim();
}

function validarCusto(custo) {
  if (typeof custo !== "number" || Number.isNaN(custo) || custo < 0) {
    throw new Error("O custo deve ser um número maior ou igual a zero.");
  }
  return custo;
}

// Aceita Date, "AAAA-MM-DD" ou "DD/MM/AAAA" e devolve um objeto Date (UTC).
function criarData(texto) {
  if (texto instanceof Date) {
    return texto;
  }
  let iso = String(texto).trim();
  const br = iso.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    iso = `${br[3]}-${br[2]}-${br[1]}`;
  }
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    throw new Error(`Data inválida: "${texto}". Use DD/MM/AAAA.`);
  }
  return data;
}

function formatarData(data) {
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function diasEntre(inicio, fim) {
  return Math.round((fim - inicio) / 86400000);
}

const TIPOS_VALIDOS = ["Preventiva", "Corretiva"];

class Manutencao {
  constructor(id, { idComputador, tipo, problema, tecnico, dataEntrada = new Date() } = {}) {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new Error(`Tipo inválido: "${tipo}". Use: ${TIPOS_VALIDOS.join(" ou ")}.`);
    }
    this.id = id;
    this.idComputador = idComputador;
    this.tipo = tipo;
    this.problema = validarTextoObrigatorio(problema, "problema");
    this.tecnico = validarTextoObrigatorio(tecnico, "técnico");
    this.dataEntrada = criarData(dataEntrada);
    this.dataSaida = null;
    this.solucao = "";
    this.custo = 0;
    this.situacao = "Aberta";
  }

  estaAberta() {
    return this.situacao === "Aberta";
  }

  concluir(solucao, custo, dataSaida = new Date()) {
    if (!this.estaAberta()) {
      throw new Error("Esta manutenção já foi concluída.");
    }
    const saida = criarData(dataSaida);
    if (saida < this.dataEntrada) {
      throw new Error("A data de saída não pode ser anterior à data de entrada.");
    }
    this.solucao = validarTextoObrigatorio(solucao, "solução");
    this.custo = validarCusto(custo);
    this.dataSaida = saida;
    this.situacao = "Concluída";
  }

  // Duração em dias (se ainda aberta, conta até hoje).
  calcularDuracao() {
    const fim = this.dataSaida ?? new Date();
    return Math.max(0, diasEntre(this.dataEntrada, fim));
  }

  toString() {
    const saida = this.estaAberta() ? "em andamento" : formatarData(this.dataSaida);
    const custo = this.estaAberta() ? "" : ` | ${formatarMoeda(this.custo)}`;
    return (
      `#${this.id} | Computador ${this.idComputador} | ${this.tipo} | ${this.problema} | ` +
      `${this.tecnico} | ${formatarData(this.dataEntrada)} → ${saida}${custo} | ${this.situacao}`
    );
  }
}

module.exports = Manutencao;
