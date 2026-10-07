// Ponto de entrada: menu interativo do TechFix.
const readline = require("node:readline");
const { stdin, stdout } = require("node:process");
const ControleManutencao = require("./ControleManutencao");

// Função própria: repete um caractere (usada nas linhas do menu).
function repetir(caractere, vezes) {
  let texto = "";
  for (let i = 0; i < vezes; i++) {
    texto += caractere;
  }
  return texto;
}

const controle = new ControleManutencao().carregarDadosSimulados();

// Leitura de linhas com fila: funciona no terminal e também com entrada redirecionada.
const rl = readline.createInterface({ input: stdin });
const linhasRecebidas = [];
const esperas = [];
let entradaEncerrada = false;

rl.on("line", (linha) => {
  if (esperas.length > 0) {
    esperas.shift().resolve(linha.trim());
  } else {
    linhasRecebidas.push(linha.trim());
  }
});
rl.on("close", () => {
  entradaEncerrada = true;
  while (esperas.length > 0) {
    esperas.shift().reject(new Error("ENTRADA_ENCERRADA"));
  }
});

function perguntar(texto) {
  stdout.write(texto);
  if (linhasRecebidas.length > 0) {
    return Promise.resolve(linhasRecebidas.shift());
  }
  if (entradaEncerrada) {
    return Promise.reject(new Error("ENTRADA_ENCERRADA"));
  }
  return new Promise((resolve, reject) => esperas.push({ resolve, reject }));
}

function mostrarMenu() {
  console.log("\n" + repetir("=", 46));
  console.log("   TECHFIX – Controle de Manutenção de PCs");
  console.log(repetir("=", 46));
  console.log("1 - Cadastrar computador");
  console.log("2 - Listar computadores");
  console.log("3 - Consultar computador (e histórico)");
  console.log("4 - Atualizar computador");
  console.log("5 - Excluir computador");
  console.log("6 - Registrar manutenção");
  console.log("7 - Concluir manutenção");
  console.log("8 - Listar manutenções em aberto");
  console.log("9 - Gerar relatório");
  console.log("0 - Sair");
}

async function cadastrar() {
  const computador = controle.cadastrarComputador({
    patrimonio: await perguntar("Patrimônio: "),
    marca: await perguntar("Marca: "),
    modelo: await perguntar("Modelo: "),
    setor: await perguntar("Setor: "),
  });
  console.log(`Cadastrado: ${computador}`);
}

function listar() {
  const lista = controle.listarComputadores();
  if (lista.length === 0) {
    console.log("Nenhum computador cadastrado.");
  }
  for (const computador of lista) {
    console.log(computador.toString());
  }
}

async function consultar() {
  const computador = controle.buscarPorPatrimonio(await perguntar("Patrimônio: "));
  console.log(computador.toString());
  const historico = controle.historicoDoComputador(computador.id);
  console.log(historico.length === 0 ? "Sem manutenções registradas." : "Histórico:");
  for (const manutencao of historico) {
    console.log("  " + manutencao);
  }
}

async function atualizar() {
  const computador = controle.buscarPorPatrimonio(await perguntar("Patrimônio do computador: "));
  console.log("Deixe em branco para manter o valor atual.");
  const dados = {};
  for (const campo of ["patrimonio", "marca", "modelo", "setor"]) {
    const valor = await perguntar(`${campo} [${computador[campo]}]: `);
    if (valor !== "") {
      dados[campo] = valor;
    }
  }
  controle.atualizarComputador(computador.id, dados);
  console.log(`Atualizado: ${computador}`);
}

async function excluir() {
  const computador = controle.buscarPorPatrimonio(await perguntar("Patrimônio: "));
  const resposta = await perguntar(`Excluir ${computador.patrimonio} e seu histórico? (s/n): `);
  if (resposta.toLowerCase() === "s") {
    controle.excluirComputador(computador.id);
    console.log("Computador excluído.");
  } else {
    console.log("Operação cancelada.");
  }
}

async function registrarManutencao() {
  const computador = controle.buscarPorPatrimonio(await perguntar("Patrimônio: "));
  const tipoDigitado = await perguntar("Tipo (1 = Preventiva, 2 = Corretiva): ");
  const tipo = tipoDigitado === "1" ? "Preventiva" : tipoDigitado === "2" ? "Corretiva" : tipoDigitado;
  const manutencao = controle.registrarManutencao(computador.id, {
    tipo,
    problema: await perguntar("Descrição do problema: "),
    tecnico: await perguntar("Técnico responsável: "),
  });
  console.log(`Manutenção registrada: ${manutencao}`);
}

async function concluirManutencao() {
  const abertas = controle.listarManutencoesAbertas();
  if (abertas.length === 0) {
    console.log("Nenhuma manutenção em aberto.");
    return;
  }
  for (const manutencao of abertas) {
    console.log("  " + manutencao);
  }
  const id = Number(await perguntar("Código da manutenção: "));
  if (!Number.isInteger(id)) {
    throw new Error("Código inválido. Digite apenas o número da manutenção.");
  }
  const solucao = await perguntar("Solução aplicada: ");
  const custo = Number((await perguntar("Custo (R$): ")).replace(",", "."));
  const dataTexto = await perguntar("Data de saída (DD/MM/AAAA, vazio = hoje): ");
  const dataSaida = dataTexto === "" ? undefined : dataTexto; // vazio = hoje
  const manutencao = controle.concluirManutencao(id, solucao, custo, dataSaida);
  console.log(`Manutenção concluída: ${manutencao}`);
}

function listarAbertas() {
  const abertas = controle.listarManutencoesAbertas();
  if (abertas.length === 0) {
    console.log("Nenhuma manutenção em aberto.");
  }
  for (const manutencao of abertas) {
    console.log(manutencao.toString());
  }
}

const acoes = {
  1: cadastrar,
  2: listar,
  3: consultar,
  4: atualizar,
  5: excluir,
  6: registrarManutencao,
  7: concluirManutencao,
  8: listarAbertas,
  9: () => console.log(controle.gerarRelatorio()),
};

async function principal() {
  let opcao = "";
  while (opcao !== "0") {
    mostrarMenu();
    opcao = await perguntar("Escolha uma opção: ");
    if (opcao === "0") {
      break;
    }
    const acao = acoes[opcao];
    if (!acao) {
      console.log("Opção inválida. Tente novamente.");
      continue;
    }
    try {
      await acao();
    } catch (erro) {
      if (erro.message === "ENTRADA_ENCERRADA") {
        throw erro;
      }
      console.log(`Erro: ${erro.message}`);
    }
  }
  console.log("Encerrando o TechFix. Até logo!");
}

principal()
  .catch((erro) => {
    if (erro.message !== "ENTRADA_ENCERRADA") {
      console.error("Erro inesperado:", erro.message);
    }
  })
  .finally(() => rl.close());
