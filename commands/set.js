import chalk from 'chalk';
import inquirer from 'inquirer';
import { getTaskById, updateTask, loadTasks, saveTasks } from '../utils/tasks.js';
import { formatSuccess, formatError, formatWarning } from '../utils/format.js';

/**
 * Executa o comando set para alterar status de tarefas/subtarefas
 * @param {String} id - ID da tarefa
 * @param {Object} options - Opções do comando
 */
export async function executeSet(id, options = {}) {
  try {
    // Carregar todas as tarefas
    const tasksData = await loadTasks();
    if (!tasksData.tasks || tasksData.tasks.length === 0) {
      console.log(formatWarning('Nenhuma tarefa encontrada. Execute taskmanager create primeiro.'));
      return;
    }

    const task = await getTaskById(parseInt(id));
    if (!task) {
      console.log(formatError(`Tarefa #${id} não encontrada.`));
      return;
    }

    // Verificar se é tarefa principal ou subtarefa
    let isSubtask = false;
    let subtaskId;

    if (task.subtasks && task.subtasks.length > 0) {
      const { target } = await inquirer.prompt([
        {
          type: 'list',
          name: 'target',
          message: 'O que você deseja alterar?',
          choices: [
            { name: 'Tarefa principal', value: 'main' },
            { name: 'Subtarefa', value: 'sub' }
          ]
        }
      ]);

      if (target === 'sub') {
        isSubtask = true;
        const { selectedSubtask } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedSubtask',
            message: 'Selecione a subtarefa:',
            choices: task.subtasks.map(sub => ({
              name: `#${task.id}.${sub.id} - ${sub.title} (${sub.status})`,
              value: sub.id
            }))
          }
        ]);
        subtaskId = selectedSubtask;
      }
    }

    // Opções de status disponíveis
    const statusChoices = [
      { name: '🟡 Pendente', value: 'pending' },
      { name: '🔵 Em Andamento', value: 'in-progress' },
      { name: '🟢 Concluída', value: 'completed' },
      { name: '🔴 Cancelada', value: 'cancelled' },
      { name: '⚪ Adiada', value: 'postponed' }
    ];

    // Perguntar qual status deseja definir
    const { newStatus } = await inquirer.prompt([
      {
        type: 'list',
        name: 'newStatus',
        message: 'Selecione o novo status:',
        choices: statusChoices
      }
    ]);

    // Atualizar o status
    if (isSubtask) {
      // Atualizar subtarefa
      const subtaskIndex = task.subtasks.findIndex(s => s.id === subtaskId);
      if (subtaskIndex !== -1) {
        task.subtasks[subtaskIndex].status = newStatus;
        task.subtasks[subtaskIndex].updatedAt = new Date().toISOString();

        // Atualizar a tarefa principal
        const taskIndex = tasksData.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          tasksData.tasks[taskIndex] = task;
          tasksData.metadata = {
            ...tasksData.metadata,
            lastUpdated: new Date().toISOString()
          };
          await saveTasks(tasksData);
          console.log(formatSuccess(`Status da subtarefa #${task.id}.${subtaskId} atualizado para ${newStatus}!`));
        }
      }
    } else {
      // Atualizar tarefa principal
      task.status = newStatus;
      task.updatedAt = new Date().toISOString();

      // Se a tarefa for marcada como concluída, atualizar todas as subtarefas
      if (newStatus === 'completed' && task.subtasks && task.subtasks.length > 0) {
        const { updateSubtasks } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'updateSubtasks',
            message: 'Deseja marcar todas as subtarefas como concluídas também?',
            default: true
          }
        ]);

        if (updateSubtasks) {
          task.subtasks = task.subtasks.map(sub => ({
            ...sub,
            status: 'completed',
            updatedAt: new Date().toISOString()
          }));
        }
      }

      // Se a tarefa for cancelada, perguntar sobre as subtarefas
      if (newStatus === 'cancelled' && task.subtasks && task.subtasks.length > 0) {
        const { updateSubtasks } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'updateSubtasks',
            message: 'Deseja cancelar todas as subtarefas também?',
            default: true
          }
        ]);

        if (updateSubtasks) {
          task.subtasks = task.subtasks.map(sub => ({
            ...sub,
            status: 'cancelled',
            updatedAt: new Date().toISOString()
          }));
        }
      }

      const taskIndex = tasksData.tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        tasksData.tasks[taskIndex] = task;
        tasksData.metadata = {
          ...tasksData.metadata,
          lastUpdated: new Date().toISOString()
        };
        await saveTasks(tasksData);
        console.log(formatSuccess(`Status da tarefa #${task.id} atualizado para ${newStatus}!`));
      }
    }

  } catch (error) {
    console.error(formatError(`Erro ao alterar status: ${error.message}`));
  }
}
