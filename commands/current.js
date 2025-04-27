import { getProjectMetadata } from '../utils/config.js';
import { loadTasks } from '../utils/tasks.js';
import { formatTask, formatTasksTable, formatWarning } from '../utils/format.js';
import chalk from 'chalk';

/**
 * Mostra a tarefa atualmente em desenvolvimento
 */
export async function showCurrentTask() {
  try {
    const metadata = await getProjectMetadata();
    if (!metadata) {
      console.log(formatWarning('Projeto não inicializado. Execute "taskmanager init" primeiro.'));
      return;
    }

    const tasksData = await loadTasks();
    if (!tasksData || !tasksData.tasks || tasksData.tasks.length === 0) {
      console.log(formatWarning('Nenhuma tarefa encontrada.'));
      return;
    }

    const currentTask = tasksData.tasks.find(task => task.status === 'in-progress');

    if (!currentTask) {
      console.log(formatWarning('Nenhuma tarefa em desenvolvimento no momento.'));
      return;
    }

    // Cabeçalho da tabela
    console.log(chalk.bold.blue('\n=== TAREFA ATUAL ===\n'));

    // Formata e exibe a tarefa atual
    console.log(formatTask(currentTask, tasksData.tasks));

    // Exibe a tarefa e suas subtarefas em formato de tabela
    if (currentTask.subtasks && currentTask.subtasks.length > 0) {
      console.log(chalk.bold('\nSubtarefas:'));
      console.log(formatTasksTable([currentTask], true, true));
    }

    // Exibe comandos úteis
    console.log(chalk.bold.blue('\n=== COMANDOS ÚTEIS ==='));
    console.log(`
${chalk.cyan('Atualizar status da tarefa:')}
taskmanager set status ${currentTask.id}

${chalk.cyan('Ver detalhes completos:')}
taskmanager show ${currentTask.id}

${chalk.cyan('Expandir em subtarefas:')}
taskmanager expand ${currentTask.id}
`);

  } catch (error) {
    console.error('Erro ao mostrar tarefa atual:', error);
  }
}
