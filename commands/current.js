import chalk from 'chalk';
import { getProjectMetadata } from '../utils/config.js';
import { loadTasks } from '../utils/tasks.js';
import { formatTask, formatTasksTable } from '../utils/format.js';

/**
 * Comando para mostrar a tarefa atual em desenvolvimento
 */
export async function showCurrentTask() {
  try {
    // Carregar metadados do projeto
    const projectMetadata = await getProjectMetadata();
    if (!projectMetadata) {
      console.error(chalk.red('Projeto não inicializado. Execute taskmanager init primeiro.'));
      return;
    }

    // Carregar tarefas
    const { tasks } = await loadTasks();
    if (!tasks || tasks.length === 0) {
      console.log(chalk.yellow('Nenhuma tarefa encontrada.'));
      return;
    }

    // Encontrar a tarefa em desenvolvimento
    const currentTask = tasks.find(task => task.status === 'in-progress');
    if (!currentTask) {
      console.log(chalk.yellow('Não há tarefas em desenvolvimento no momento.'));
      return;
    }

    // Exibir a tarefa formatada
    console.log(chalk.bold.cyan('\n=== TAREFA EM DESENVOLVIMENTO ===\n'));
    console.log(formatTask(currentTask, tasks));

    // Se houver subtarefas, encontrar a subtarefa em desenvolvimento
    if (currentTask.subtasks && currentTask.subtasks.length > 0) {
      const currentSubtask = currentTask.subtasks.find(st => st.status === 'in-progress');
      if (currentSubtask) {
        console.log(chalk.bold.cyan('\nSubtarefa em Desenvolvimento:'));
        console.log(formatTasksTable([{
          ...currentTask,
          subtasks: [currentSubtask]
        }], true));
      }
    }

    // Exibir comandos úteis
    console.log(chalk.bold.blue('\n=== COMANDOS ÚTEIS ==='));
    console.log(`
${chalk.cyan('Marcar como concluída:')}
taskmanager set status ${currentTask.id}

${chalk.cyan('Ver detalhes completos:')}
taskmanager show ${currentTask.id}

${chalk.cyan('Expandir em subtarefas:')}
taskmanager expand ${currentTask.id}
`);

  } catch (error) {
    console.error(chalk.red(`Erro ao mostrar tarefa em desenvolvimento: ${error.message}`));
  }
}
