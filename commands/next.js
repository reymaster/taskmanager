import chalk from 'chalk';
import { getProjectMetadata } from '../utils/config.js';
import { getNextTask } from '../utils/tasks.js';
import { formatTask, formatTasksTable } from '../utils/format.js';

/**
 * Comando para mostrar a próxima tarefa a ser implementada
 */
export async function showNextTask() {
  try {
    // Carregar metadados do projeto
    const projectMetadata = await getProjectMetadata();
    if (!projectMetadata) {
      console.error(chalk.red('Projeto não inicializado. Execute taskmanager init primeiro.'));
      return;
    }

    // Obter a próxima tarefa
    const nextTask = await getNextTask();
    if (!nextTask) {
      console.log(chalk.yellow('Não há tarefas pendentes para implementação.'));
      return;
    }

    // Exibir a tarefa formatada
    console.log(chalk.bold.cyan('\n=== PRÓXIMA TAREFA ===\n'));
    console.log(formatTask(nextTask));

    // Se houver subtarefas, encontrar a próxima subtarefa pendente
    if (nextTask.subtasks && nextTask.subtasks.length > 0) {
      const nextSubtask = nextTask.subtasks.find(st => st.status === 'pending');
      if (nextSubtask) {
        console.log(chalk.bold.cyan('\nPróxima Subtarefa:'));
        console.log(formatTasksTable([{
          ...nextTask,
          subtasks: [nextSubtask]
        }], true));
      }
    }

    // Exibir comandos úteis
    console.log(chalk.bold.blue('\n=== COMANDOS ÚTEIS ==='));
    console.log(`
${chalk.cyan('Marcar como em progresso:')}
taskmanager status --id=${nextTask.id} --status=in-progress

${chalk.cyan('Marcar como concluída:')}
taskmanager status --id=${nextTask.id} --status=done

${chalk.cyan('Ver detalhes completos:')}
taskmanager show --id=${nextTask.id}
`);

  } catch (error) {
    console.error(chalk.red(`Erro ao mostrar próxima tarefa: ${error.message}`));
  }
}
