#!/usr/bin/env node

/**
 * TaskManager - Uma ferramenta de linha de comando para gerenciamento de tarefas de desenvolvimento
 *
 * Este arquivo é o ponto de entrada principal da CLI TaskManager.
 * Ele define os comandos disponíveis e gerencia o fluxo de execução.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeTaskManager } from './commands/init.js';
import { executeCreate } from './commands/create.js';
import { executeExpand } from './commands/expand.js';
import { getVersion } from './utils/config.js';
import { parseTasks } from './commands/parse.js';
import { showTask } from './commands/show.js';
import { listTasks } from './commands/list.js';
import { showNextTask } from './commands/next.js';
import { executeSet } from './commands/set.js';
import { showCurrentTask } from './commands/current.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializa o programa CLI
const program = new Command();

// Exibe o banner do TaskManager
console.log(
  chalk.cyan(
    figlet.textSync('TaskManager', { horizontalLayout: 'full' })
  )
);

// Configura informações básicas do programa
program
  .name('taskmanager')
  .description(chalk.cyan(`
  TaskManager - Gerenciador de Tarefas de Desenvolvimento

  Uma ferramenta poderosa para organizar e gerenciar tarefas de desenvolvimento,
  com suporte a IA para geração e análise de tarefas.

  Para começar, execute ${chalk.bold('taskmanager init')} em seu projeto.
  `))
  .version(getVersion(), '-v, --version', 'Exibe a versão atual');

// Comando init
program
  .command('init')
  .description(chalk.cyan(`
    Inicializa o TaskManager no projeto atual

    Este comando cria a estrutura necessária para gerenciar tarefas,
    incluindo diretórios e arquivos de configuração.

    Exemplo: taskmanager init
  `))
  .option('-y, --yes', 'Pula confirmações e usa valores padrão')
  .action(async (options) => {
    try {
      await initializeTaskManager(options);
    } catch (error) {
      console.error(chalk.red(`Erro ao inicializar TaskManager: ${error.message}`));
      if (process.env.DEBUG === 'true') {
        console.error(chalk.gray('Stack trace:'), error.stack);
      }
      process.exit(1);
    }
  });

// Comando create
program
  .command('create')
  .description(chalk.cyan(`
    Cria novas tarefas para o projeto

    Permite criar tarefas manualmente ou usar IA para gerar automaticamente.
    Para projetos novos, sugere tarefas iniciais de setup e configuração.

    Exemplos:
      taskmanager create              # Inicia o assistente interativo
      taskmanager create -a           # Gera tarefas usando IA
      taskmanager create -t "Título"  # Cria tarefa com título específico
  `))
  .option('-y, --yes', 'Pula confirmações e usa valores padrão')
  .option('-a, --ai', 'Usa IA para gerar tarefas automaticamente')
  .option('-t, --title <title>', 'Título da tarefa (para criação manual)')
  .option('-d, --description <description>', 'Descrição da tarefa (para criação manual)')
  .option('-p, --priority <priority>', 'Prioridade da tarefa (high, medium, low)')
  .option('--reset', 'Recria as tarefas básicas do projeto, fazendo backup das tarefas atuais')
  .option('--restore', 'Lista e permite restaurar backups anteriores das tarefas')
  .action(executeCreate);

// Comando list
program
  .command('list')
  .description(chalk.cyan(`
    Lista todas as tarefas do projeto

    Exibe uma tabela organizada com todas as tarefas,
    incluindo ID, título, status, prioridade e descrição.

    Exemplos:
      taskmanager list                # Lista tarefas principais
      taskmanager list --show-subtasks # Lista tarefas e subtarefas
  `))
  .option('--show-subtasks', 'Mostra as subtarefas de cada tarefa')
  .option('--status <status>', 'Filtra por status (pending, in-progress, done, cancelled)')
  .option('--priority <priority>', 'Filtra por prioridade (high, medium, low)')
  .action(listTasks);

// Comando next
program
  .command('next')
  .description('Mostra a próxima tarefa a ser implementada')
  .action(showNextTask);

// Comando current
program
  .command('current')
  .description(chalk.cyan(`
    Mostra a tarefa atualmente em desenvolvimento

    Exibe detalhes da tarefa que está em progresso,
    incluindo subtarefas em desenvolvimento, se houver.

    Exemplo: taskmanager current
  `))
  .action(showCurrentTask);

// Comando set status
program
  .command('set')
  .description(chalk.cyan(`
    Atualiza o status de uma tarefa ou subtarefa

    Permite alterar o status de uma tarefa ou subtarefa de forma interativa,
    com opções visuais para seleção do novo status.

    Exemplos:
      taskmanager set status 1     # Altera status da tarefa #1
  `))
  .command('status')
  .argument('<id>', 'ID da tarefa')
  .description('Altera o status de uma tarefa ou subtarefa')
  .action(executeSet);

// Comando expand
program
  .command('expand')
  .description(chalk.cyan(`
    Expande uma tarefa em subtarefas mais detalhadas

    Analisa uma tarefa e a divide em subtarefas menores e mais gerenciáveis.
    Pode usar IA para sugerir a melhor forma de dividir a tarefa.

    Exemplos:
      taskmanager expand 1            # Expande a tarefa #1
      taskmanager expand 1 --num=5    # Cria 5 subtarefas
      taskmanager expand 1 --no-ai    # Expansão manual
  `))
  .argument('<id>', 'ID da tarefa a ser expandida')
  .option('--num <number>', 'Número de subtarefas a serem criadas', '3')
  .option('--ai', 'Força o uso de IA para análise avançada')
  .option('--no-ai', 'Desativa o uso de IA para análise')
  .action(executeExpand);

// Comando parse
program
  .command('parse')
  .description(chalk.cyan(`
    Gera arquivos PRD para cada tarefa

    Cria documentos detalhados com especificações técnicas,
    requisitos e estratégias de teste para cada tarefa.

    Exemplo: taskmanager parse
  `))
  .action(parseTasks);

// Comando show
program
  .command('show')
  .description(chalk.cyan(`
    Mostra detalhes completos de uma tarefa específica

    Exibe todas as informações da tarefa, incluindo:
    - Descrição detalhada
    - Status e prioridade
    - Dependências
    - Subtarefas
    - Estratégia de teste
    - Ações recomendadas para o agente

    Exemplo: taskmanager show 1
  `))
  .argument('<id>', 'ID da tarefa para visualizar')
  .action(showTask);

// Analisa os argumentos da linha de comando
program.parse(process.argv);

// Se nenhum argumento for fornecido, exibe a ajuda
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
