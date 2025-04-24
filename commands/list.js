import { getTasks } from '../utils/tasks.js';
import { formatTasksTable } from '../utils/format.js';
import chalk from 'chalk';

export async function listTasks(options) {
  try {
    // Carrega as tarefas
    const { tasks } = await getTasks();

    if (!tasks || tasks.length === 0) {
      console.log(chalk.yellow('Nenhuma tarefa encontrada.'));
      return;
    }

    // Exibe a tabela de tarefas
    console.log(chalk.cyan('\nLista de Tarefas:'));
    console.log(formatTasksTable(tasks, options.showSubtasks));

    // Exibe estatísticas
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      postponed: tasks.filter(t => t.status === 'postponed').length
    };

    console.log(chalk.cyan('\nEstatísticas:'));
    console.log(`Total: ${chalk.bold(stats.total)} tarefas`);
    console.log(`Pendentes: ${chalk.yellow(stats.pending)}`);
    console.log(`Em andamento: ${chalk.blue(stats.inProgress)}`);
    console.log(`Concluídas: ${chalk.green(stats.completed)}`);
    console.log(`Canceladas: ${chalk.red(stats.cancelled)}`);
    console.log(`Adiadas: ${chalk.gray(stats.postponed)}`);

  } catch (error) {
    console.error(chalk.red('Erro ao listar tarefas:'), error.message);
  }
}
