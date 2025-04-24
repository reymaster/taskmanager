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
  .description('Uma ferramenta de linha de comando para gerenciamento de tarefas de desenvolvimento')
  .version(getVersion(), '-v, --version', 'Exibe a versão atual');

// Comando init
program
  .command('init')
  .description('Inicializa o TaskManager no projeto atual')
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
  .description('Cria tarefas para o projeto')
  .option('-y, --yes', 'Pula confirmações e usa valores padrão')
  .option('-a, --ai', 'Usa IA para gerar tarefas automaticamente')
  .option('-t, --title <title>', 'Título da tarefa (para criação manual)')
  .option('-d, --description <description>', 'Descrição da tarefa (para criação manual)')
  .option('-p, --priority <priority>', 'Prioridade da tarefa (high, medium, low)')
  .action(async (options) => {
    try {
      await executeCreate(options);
    } catch (error) {
      console.error(chalk.red(`Erro ao criar tarefas: ${error.message}`));
      if (process.env.DEBUG === 'true') {
        console.error(chalk.gray('Stack trace:'), error.stack);
      }
      process.exit(1);
    }
  });

// Comando list (stub para desenvolvimento futuro)
program
  .command('list')
  .description('Lista todas as tarefas')
  .action(() => {
    console.log(chalk.yellow('Funcionalidade de listagem de tarefas será implementada em breve!'));
  });

// Comando next (stub para desenvolvimento futuro)
program
  .command('next')
  .description('Mostra a próxima tarefa a ser trabalhada')
  .action(() => {
    console.log(chalk.yellow('Funcionalidade de próxima tarefa será implementada em breve!'));
  });

// Comando status (stub para desenvolvimento futuro)
program
  .command('status')
  .description('Atualiza o status de uma tarefa')
  .argument('<id>', 'ID da tarefa')
  .option('--done', 'Marca a tarefa como concluída')
  .option('--pending', 'Marca a tarefa como pendente')
  .option('--in-progress', 'Marca a tarefa como em andamento')
  .action((id, options) => {
    console.log(chalk.yellow(`Funcionalidade de atualização de status para tarefa ${id} será implementada em breve!`));
  });

// Comando expand
program
  .command('expand')
  .description('Expande uma tarefa em subtarefas com análise avançada')
  .argument('<id>', 'ID da tarefa')
  .option('--num <number>', 'Número de subtarefas a serem criadas', '3')
  .option('--ai', 'Força o uso de IA para análise avançada')
  .option('--no-ai', 'Desativa o uso de IA para análise')
  .action(async (id, options) => {
    try {
      await executeExpand(id, options);
    } catch (error) {
      console.error(chalk.red(`Erro ao expandir tarefa: ${error.message}`));
      if (process.env.DEBUG === 'true') {
        console.error(chalk.gray('Stack trace:'), error.stack);
      }
      process.exit(1);
    }
  });

// Comando parse
program
  .command('parse')
  .description('Gera arquivos PRD para cada tarefa')
  .action(parseTasks);

// Analisa os argumentos da linha de comando
program.parse(process.argv);

// Se nenhum argumento for fornecido, exibe a ajuda
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
