// Função própria: valida texto obrigatório.
function validarTextoObrigatorio(valor, campo) {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error(`O campo "${campo}" é obrigatório.`);
  }
  return valor.trim();
}

const STATUS_VALIDOS = ["Disponível", "Em manutenção"];
const CAMPOS_EDITAVEIS = ["patrimonio", "marca", "modelo", "setor"];

class Computador {
  constructor(id, { patrimonio, marca, modelo, setor, status = "Disponível" } = {}) {
    this.id = id;
    this.patrimonio = validarTextoObrigatorio(patrimonio, "patrimônio");
    this.marca = validarTextoObrigatorio(marca, "marca");
    this.modelo = validarTextoObrigatorio(modelo, "modelo");
    this.setor = validarTextoObrigatorio(setor, "setor");
    this.status = "Disponível";
    this.alterarStatus(status);
  }

  // Atualiza apenas os campos informados; valida tudo antes de gravar.
  atualizarDados(dados = {}) {
    const novos = {};
    for (const campo of CAMPOS_EDITAVEIS) {
      if (dados[campo] !== undefined) {
        novos[campo] = validarTextoObrigatorio(dados[campo], campo);
      }
    }
    Object.assign(this, novos);
  }

  alterarStatus(status) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw new Error(`Status inválido: "${status}". Use: ${STATUS_VALIDOS.join(" ou ")}.`);
    }
    this.status = status;
  }

  estaEmManutencao() {
    return this.status === "Em manutenção";
  }

  toString() {
    return `#${this.id} | ${this.patrimonio} | ${this.marca} ${this.modelo} | ${this.setor} | ${this.status}`;
  }
}

module.exports = Computador;
