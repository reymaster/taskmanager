/**
 * Implementação do comando 'expand' para o TaskManager
 *
 * Este módulo permite expandir uma tarefa em subtarefas mais detalhadas,
 * usando IA para análise avançada e subdivisão mais inteligente e precisa.
 */

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { isInitialized, getTaskManagerDir } from '../utils/config.js';
import { getTaskById, updateTask, addSubtask, loadTasks } from '../utils/tasks.js';
import { formatSuccess, formatError, formatWarning, formatTask } from '../utils/format.js';
import { callPerplexityAPI } from '../utils/ai/perplexity.js';

/**
 * Executa o comando expand
 * @param {Number} taskId - ID da tarefa a ser expandida
 * @param {Object} options - Opções de linha de comando
 */
export async function executeExpand(taskId, options = {}) {
  console.log(chalk.cyan.bold(`\n🔍 Expandindo Tarefa #${taskId}\n`));

  // Verifica se o TaskManager está inicializado
  if (!isInitialized()) {
    console.log(formatWarning('TaskManager não está inicializado neste diretório.'));
    console.log(chalk.blue('Execute primeiro: ') + chalk.bold('taskmanager init'));
    return;
  }

  // Carrega a tarefa pelo ID
  const task = await getTaskById(parseInt(taskId));

  if (!task) {
    console.log(formatError(`Tarefa #${taskId} não encontrada.`));
    return;
  }

  // Carrega todas as tarefas para referência de dependências
  const allTasks = await loadTasks();

  // Mostra a tarefa atual
  console.log(chalk.cyan('Tarefa Original:'));
  console.log(formatTask(task, allTasks.tasks));

  // Determina o número de subtarefas a serem criadas
  const numSubtasks = options.num ? parseInt(options.num) : 3;

  // Pergunta ao usuário se deve usar IA para a expansão
  const { useAI } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useAI',
      message: 'Deseja usar IA para gerar análises e subtarefas mais detalhadas?',
      default: true
    }
  ]);

  if (useAI) {
    await expandTaskWithAI(task, numSubtasks);
  } else {
    await expandTaskManually(task, numSubtasks);
  }
}

/**
 * Expande uma tarefa usando IA (Perplexity API) para análise avançada
 * @param {Object} task - Tarefa a ser expandida
 * @param {Number} numSubtasks - Número de subtarefas a serem criadas
 */
async function expandTaskWithAI(task, numSubtasks) {
  const spinner = ora('Analisando tarefa com IA para expansão detalhada...').start();

  try {
    // Prepara o contexto para a análise da tarefa
    const taskContext = {
      title: task.title,
      description: task.description || '',
      details: task.details || '',
      category: task.category || '',
      testStrategy: task.testStrategy || '',
      existingSubtasks: task.subtasks || []
    };

    // Chama a API da Perplexity para análise avançada da tarefa
    const analysisResult = await callPerplexityAPI(taskContext, numSubtasks);

    spinner.succeed('Análise concluída com sucesso!');

    // Mostra a análise ao usuário
    console.log(chalk.green.bold('\n📊 Análise Aprofundada da Tarefa:'));
    console.log(chalk.white(analysisResult.analysis));

    // Pergunta se deseja criar as subtarefas recomendadas
    const { createSubtasks, customizeSubtasks } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'createSubtasks',
        message: 'Deseja criar as subtarefas recomendadas pela IA?',
        default: true
      },
      {
        type: 'confirm',
        name: 'customizeSubtasks',
        message: 'Deseja revisar e personalizar as subtarefas antes de adicionar?',
        default: true,
        when: (answers) => answers.createSubtasks
      }
    ]);

    if (createSubtasks) {
      // Prepara as subtarefas geradas pela IA
      let subtasksToAdd = analysisResult.subtasks;

      // Permite que o usuário personalize as subtarefas se desejar
      if (customizeSubtasks) {
        subtasksToAdd = await customizeGeneratedSubtasks(subtasksToAdd);
      }

      // Adiciona as subtarefas
      const createdSubtasks = await addSubtasksToTask(task.id, subtasksToAdd);

      console.log(formatSuccess(`${createdSubtasks.length} subtarefas adicionadas com sucesso!`));

      // Atualiza a tarefa principal com insights da análise
      if (analysisResult.taskImprovements && Object.keys(analysisResult.taskImprovements).length > 0) {
        const { updateMainTask } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'updateMainTask',
            message: 'A IA sugeriu melhorias para a tarefa principal. Deseja atualizar a tarefa com estas melhorias?',
            default: true
          }
        ]);

        if (updateMainTask) {
          // Atualiza a tarefa principal com as melhorias sugeridas
          await updateTask(task.id, {
            description: analysisResult.taskImprovements.description || task.description,
            details: analysisResult.taskImprovements.details || task.details,
            testStrategy: analysisResult.taskImprovements.testStrategy || task.testStrategy
          });
          console.log(formatSuccess('Tarefa principal atualizada com as melhorias sugeridas!'));
        }
      }
    }

  } catch (error) {
    spinner.fail(`Erro na análise com IA: ${error.message}`);
    console.log(formatWarning('Não foi possível realizar a análise com IA. Voltando ao modo manual...'));
    await expandTaskManually(task, numSubtasks);
  }
}

/**
 * Permite ao usuário personalizar as subtarefas geradas pela IA
 * @param {Array} subtasks - Subtarefas geradas pela IA
 * @returns {Array} Subtarefas personalizadas
 */
async function customizeGeneratedSubtasks(subtasks) {
  console.log(chalk.cyan.bold('\n✏️ Personalização de Subtarefas\n'));
  console.log(chalk.blue('Revise cada subtarefa gerada pela IA:'));

  const customizedSubtasks = [];

  for (let i = 0; i < subtasks.length; i++) {
    const subtask = subtasks[i];
    console.log(chalk.yellow(`\nSubtarefa ${i + 1}:`));
    console.log(`Título: ${subtask.title}`);
    console.log(`Descrição: ${subtask.description}`);

    const { keep, customTitle, customDescription } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'keep',
        message: 'Manter esta subtarefa?',
        default: true
      },
      {
        type: 'input',
        name: 'customTitle',
        message: 'Título personalizado (deixe em branco para manter o sugerido):',
        default: subtask.title,
        when: (answers) => answers.keep
      },
      {
        type: 'input',
        name: 'customDescription',
        message: 'Descrição personalizada (deixe em branco para manter a sugerida):',
        default: subtask.description,
        when: (answers) => answers.keep
      }
    ]);

    if (keep) {
      customizedSubtasks.push({
        title: customTitle,
        description: customDescription
      });
    }
  }

  // Pergunta se deseja adicionar mais subtarefas manualmente
  const { addMore } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addMore',
      message: 'Deseja adicionar mais subtarefas manualmente?',
      default: false
    }
  ]);

  if (addMore) {
    const additionalSubtasks = await createManualSubtasks();
    return [...customizedSubtasks, ...additionalSubtasks];
  }

  return customizedSubtasks;
}

/**
 * Expande uma tarefa manualmente
 * @param {Object} task - Tarefa a ser expandida
 * @param {Number} numSubtasks - Número de subtarefas a serem criadas
 */
async function expandTaskManually(task, numSubtasks) {
  console.log(chalk.cyan.bold('\n✏️ Criação Manual de Subtarefas\n'));
  console.log(chalk.blue(`Criando ${numSubtasks} subtarefas manualmente:`));

  const subtasks = await createManualSubtasks(numSubtasks);
  const createdSubtasks = await addSubtasksToTask(task.id, subtasks);

  console.log(formatSuccess(`${createdSubtasks.length} subtarefas adicionadas com sucesso!`));
}

/**
 * Cria subtarefas manualmente
 * @param {Number} count - Número de subtarefas a serem criadas
 * @returns {Array} Array de subtarefas criadas
 */
async function createManualSubtasks(count = 1) {
  const subtasks = [];
  let continueAdding = true;
  let i = 0;

  while (continueAdding && (count === undefined || i < count)) {
    console.log(chalk.yellow(`\nSubtarefa ${i + 1}:`));

    const { title, description, addAnother } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Título da subtarefa:',
        validate: (input) => input.length > 0 ? true : 'O título é obrigatório'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Descrição da subtarefa:',
        default: ''
      },
      {
        type: 'confirm',
        name: 'addAnother',
        message: 'Adicionar outra subtarefa?',
        default: (i + 1) < count,
        when: () => count === undefined || (i + 1) < count
      }
    ]);

    subtasks.push({
      title,
      description
    });

    i++;
    continueAdding = count === undefined ? addAnother : (i < count);
  }

  return subtasks;
}

/**
 * Adiciona subtarefas a uma tarefa
 * @param {Number} taskId - ID da tarefa
 * @param {Array} subtasks - Array de subtarefas a serem adicionadas
 * @returns {Array} Array de subtarefas adicionadas
 */
async function addSubtasksToTask(taskId, subtasks) {
  const createdSubtasks = [];

  for (const subtask of subtasks) {
    try {
      const newSubtask = await addSubtask(taskId, {
        title: subtask.title,
        description: subtask.description,
        status: 'pending'
      });

      if (newSubtask) {
        createdSubtasks.push(newSubtask);
      }
    } catch (error) {
      console.error(chalk.red(`Erro ao adicionar subtarefa "${subtask.title}": ${error.message}`));
    }
  }

  return createdSubtasks;
}
