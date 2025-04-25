import chalk from 'chalk';
import inquirer from 'inquirer';
import { getTaskById, updateTask, loadTasks, saveTasks } from '../utils/tasks.js';
import { formatSuccess, formatError, formatWarning } from '../utils/format.js';
import { STATUS_OPTIONS } from '../utils/constants.js';

/**
 * Executa o comando set para alterar propriedades de tarefas/subtarefas
 * @param {String} property - Propriedade a ser alterada (status, priority, etc)
 * @param {String} id - ID da tarefa
 * @param {String} value - Novo valor para a propriedade
 */
export async function executeSet(property, id, value) {
  try {
    // Carregar todas as tarefas
    const tasksData = await loadTasks();
    if (!tasksData.tasks || tasksData.tasks.length === 0) {
      console.log(formatWarning('Nenhuma tarefa encontrada. Execute taskmanager create primeiro.'));
      return;
    }

    // Verificar se é ID de subtarefa (formato: x.y)
    const [mainTaskId, subtaskId] = id.toString().split('.');
    const isSubtask = subtaskId !== undefined;

    const task = await getTaskById(parseInt(mainTaskId));
    if (!task) {
      console.log(formatError(`Tarefa #${mainTaskId} não encontrada.`));
      return;
    }

    // Tratar diferentes propriedades
    switch (property) {
      case 'status':
        return handleStatusUpdate(task, isSubtask, subtaskId, value, tasksData);
      // Adicionar outros casos aqui para futuras propriedades
      default:
        console.log(formatError(`Propriedade inválida: ${property}`));
        return;
    }

  } catch (error) {
    console.error(formatError(`Erro ao alterar ${property}: ${error.message}`));
  }
}

/**
 * Função auxiliar para atualizar o status de uma tarefa ou subtarefa
 */
async function handleStatusUpdate(task, isSubtask, subtaskId, newStatus, tasksData) {
  // Validar o status se fornecido
  if (newStatus && !STATUS_OPTIONS.includes(newStatus)) {
    console.log(formatError(`Status inválido: ${newStatus}`));
    console.log(formatWarning(`Status disponíveis: ${STATUS_OPTIONS.join(', ')}`));
    return;
  }

  // Se o status não foi fornecido, solicitar interativamente
  if (!newStatus) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'status',
        message: 'Selecione o novo status:',
        choices: STATUS_OPTIONS,
        default: isSubtask ?
          task.subtasks?.find(s => s.id === parseInt(subtaskId))?.status :
          task.status
      }
    ]);
    newStatus = answer.status;

    // Se não foi fornecido status e tem subtarefas, perguntar qual deseja alterar
    if (!isSubtask && task.subtasks && task.subtasks.length > 0) {
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
        return executeSet('status', `${task.id}.${selectedSubtask}`, newStatus);
      }
    }
  }

  // Atualizar o status
  if (isSubtask) {
    // Atualizar subtarefa
    const subtaskIndex = task.subtasks?.findIndex(s => s.id === parseInt(subtaskId));
    if (subtaskIndex === -1 || subtaskIndex === undefined) {
      console.log(formatError(`Subtarefa #${task.id}.${subtaskId} não encontrada.`));
      return;
    }

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
  } else {
    // Atualizar tarefa principal
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();

    // Se a tarefa for marcada como concluída e não houver status fornecido, perguntar sobre as subtarefas
    if (newStatus === 'done' && task.subtasks && task.subtasks.length > 0) {
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
          status: 'done',
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
}
