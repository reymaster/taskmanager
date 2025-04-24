/**
 * Utilitário de gerenciamento de tarefas para o TaskManager
 *
 * Este módulo gerencia operações relacionadas às tarefas, como
 * criar, listar, atualizar e remover tarefas do projeto.
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { getTasksFilePath, loadConfig } from './config.js';

/**
 * Carrega as tarefas do arquivo tasks.json
 * @returns {Object} Objeto contendo as tarefas e metadados
 */
export async function loadTasks() {
  const tasksPath = getTasksFilePath();

  if (!existsSync(tasksPath)) {
    return {
      tasks: [],
      metadata: {
        projectType: 'unknown',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        taskCount: 0,
        completedCount: 0,
        pendingCount: 0,
        inProgressCount: 0,
        deferredCount: 0,
        cancelledCount: 0,
        highPriorityCount: 0,
        mediumPriorityCount: 0,
        lowPriorityCount: 0
      }
    };
  }

  try {
    const tasksData = await fs.readFile(tasksPath, 'utf-8');
    return JSON.parse(tasksData);
  } catch (error) {
    console.error(`Erro ao ler arquivo de tarefas: ${error.message}`);
    throw error;
  }
}

/**
 * Salva as tarefas no arquivo tasks.json
 * @param {Object} tasksData - Objeto contendo as tarefas e metadados
 * @returns {Boolean} True se a operação foi bem-sucedida
 */
export async function saveTasks(tasksData) {
  const tasksPath = getTasksFilePath();

  try {
    // Atualiza o timestamp de última atualização
    tasksData.metadata.lastUpdated = new Date().toISOString();

    // Atualiza as contagens de metadados
    updateTaskMetadata(tasksData);

    await fs.writeFile(
      tasksPath,
      JSON.stringify(tasksData, null, 2)
    );

    return true;
  } catch (error) {
    console.error(`Erro ao salvar arquivo de tarefas: ${error.message}`);
    throw error;
  }
}

/**
 * Atualiza os metadados das tarefas
 * @param {Object} tasksData - Objeto contendo as tarefas e metadados
 */
function updateTaskMetadata(tasksData) {
  // Inicializa contadores
  let taskCount = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;
  let deferredCount = 0;
  let cancelledCount = 0;
  let highPriorityCount = 0;
  let mediumPriorityCount = 0;
  let lowPriorityCount = 0;

  // Conta as tarefas por status e prioridade
  for (const task of tasksData.tasks) {
    taskCount++;

    // Contagem por status
    if (task.status === 'done') completedCount++;
    else if (task.status === 'pending') pendingCount++;
    else if (task.status === 'in-progress') inProgressCount++;
    else if (task.status === 'deferred') deferredCount++;
    else if (task.status === 'cancelled') cancelledCount++;

    // Contagem por prioridade
    if (task.priority === 'high') highPriorityCount++;
    else if (task.priority === 'medium') mediumPriorityCount++;
    else if (task.priority === 'low') lowPriorityCount++;

    // Conta subtarefas (opcional)
    if (task.subtasks && Array.isArray(task.subtasks)) {
      for (const subtask of task.subtasks) {
        if (subtask.status === 'done') completedCount++;
        else if (subtask.status === 'pending') pendingCount++;
        else if (subtask.status === 'in-progress') inProgressCount++;
        else if (subtask.status === 'deferred') deferredCount++;
        else if (subtask.status === 'cancelled') cancelledCount++;
      }
    }
  }

  // Atualiza os metadados
  tasksData.metadata.taskCount = taskCount;
  tasksData.metadata.completedCount = completedCount;
  tasksData.metadata.pendingCount = pendingCount;
  tasksData.metadata.inProgressCount = inProgressCount;
  tasksData.metadata.deferredCount = deferredCount;
  tasksData.metadata.cancelledCount = cancelledCount;
  tasksData.metadata.highPriorityCount = highPriorityCount;
  tasksData.metadata.mediumPriorityCount = mediumPriorityCount;
  tasksData.metadata.lowPriorityCount = lowPriorityCount;
}

/**
 * Adiciona uma nova tarefa
 * @param {Object} taskData - Dados da tarefa a ser adicionada
 * @returns {Object} Tarefa adicionada com ID
 */
export async function addTask(taskData) {
  const tasksData = await loadTasks();
  const config = await loadConfig();

  // Gera um novo ID para a tarefa
  const newId = tasksData.tasks.length > 0
    ? Math.max(...tasksData.tasks.map(t => t.id)) + 1
    : 1;

  // Define valores padrão se não fornecidos
  const defaultPriority = config?.taskSettings?.defaultPriority || 'medium';

  // Cria a nova tarefa
  const newTask = {
    id: newId,
    title: taskData.title || 'Nova Tarefa',
    description: taskData.description || '',
    status: taskData.status || 'pending',
    priority: taskData.priority || defaultPriority,
    dependencies: taskData.dependencies || [],
    details: taskData.details || '',
    testStrategy: taskData.testStrategy || '',
    category: taskData.category || 'feature',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: []
  };

  // Adiciona a tarefa ao array
  tasksData.tasks.push(newTask);

  // Salva o arquivo atualizado
  await saveTasks(tasksData);

  return newTask;
}

/**
 * Atualiza uma tarefa existente
 * @param {Number} taskId - ID da tarefa a ser atualizada
 * @param {Object} taskData - Dados atualizados da tarefa
 * @returns {Object} Tarefa atualizada ou null se não encontrada
 */
export async function updateTask(taskId, taskData) {
  const tasksData = await loadTasks();

  // Encontra o índice da tarefa
  const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  // Atualiza os campos da tarefa
  const updatedTask = {
    ...tasksData.tasks[taskIndex],
    ...taskData,
    updatedAt: new Date().toISOString()
  };

  // Mantém o ID original
  updatedTask.id = taskId;

  // Atualiza a tarefa no array
  tasksData.tasks[taskIndex] = updatedTask;

  // Salva o arquivo atualizado
  await saveTasks(tasksData);

  return updatedTask;
}

/**
 * Remove uma tarefa
 * @param {Number} taskId - ID da tarefa a ser removida
 * @returns {Boolean} True se a tarefa foi removida com sucesso
 */
export async function removeTask(taskId) {
  const tasksData = await loadTasks();

  // Encontra o índice da tarefa
  const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return false;
  }

  // Remove a tarefa do array
  tasksData.tasks.splice(taskIndex, 1);

  // Salva o arquivo atualizado
  await saveTasks(tasksData);

  return true;
}

/**
 * Obtém uma tarefa por ID
 * @param {Number} taskId - ID da tarefa
 * @returns {Object} Tarefa encontrada ou null se não existir
 */
export async function getTaskById(taskId) {
  const tasksData = await loadTasks();

  // Encontra a tarefa pelo ID
  const task = tasksData.tasks.find(t => t.id === taskId);

  return task || null;
}

/**
 * Encontra a próxima tarefa a ser trabalhada
 * @returns {Object} Próxima tarefa ou null se não houver
 */
export async function getNextTask() {
  const tasksData = await loadTasks();

  // Filtra tarefas pendentes ou em progresso
  const availableTasks = tasksData.tasks.filter(t =>
    (t.status === 'pending' || t.status === 'in-progress') &&
    !hasPendingDependencies(t, tasksData.tasks)
  );

  if (availableTasks.length === 0) {
    return null;
  }

  // Ordena por prioridade (high > medium > low)
  const priorityOrder = { high: 1, medium: 2, low: 3 };

  const sortedTasks = [...availableTasks].sort((a, b) => {
    // Primeiro, ordena por prioridade
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Se a prioridade for igual, tarefas em andamento têm precedência
    if (a.status !== b.status) {
      return a.status === 'in-progress' ? -1 : 1;
    }

    // Se o status for igual, ordena por ID (mais antigo primeiro)
    return a.id - b.id;
  });

  return sortedTasks[0];
}

/**
 * Verifica se uma tarefa tem dependências pendentes
 * @param {Object} task - Tarefa a ser verificada
 * @param {Array} allTasks - Lista de todas as tarefas
 * @returns {Boolean} True se a tarefa tiver dependências pendentes
 */
function hasPendingDependencies(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return false;
  }

  // Verifica cada dependência
  for (const depId of task.dependencies) {
    const depTask = allTasks.find(t => t.id === depId);

    // Se a dependência não existir ou não estiver concluída
    if (!depTask || depTask.status !== 'done') {
      return true;
    }
  }

  return false;
}

/**
 * Adiciona uma subtarefa a uma tarefa existente
 * @param {Number} taskId - ID da tarefa pai
 * @param {Object} subtaskData - Dados da subtarefa
 * @returns {Object} Subtarefa adicionada ou null se a tarefa pai não existir
 */
export async function addSubtask(taskId, subtaskData) {
  const tasksData = await loadTasks();

  // Encontra o índice da tarefa pai
  const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  // Inicializa o array de subtarefas se não existir
  if (!tasksData.tasks[taskIndex].subtasks) {
    tasksData.tasks[taskIndex].subtasks = [];
  }

  // Gera um novo ID para a subtarefa
  const subtasks = tasksData.tasks[taskIndex].subtasks;
  const newSubtaskId = subtasks.length > 0
    ? Math.max(...subtasks.map(st => st.id)) + 1
    : 1;

  // Cria a nova subtarefa
  const newSubtask = {
    id: newSubtaskId,
    title: subtaskData.title || 'Nova Subtarefa',
    description: subtaskData.description || '',
    status: subtaskData.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Adiciona a subtarefa ao array
  tasksData.tasks[taskIndex].subtasks.push(newSubtask);

  // Atualiza a data de modificação da tarefa pai
  tasksData.tasks[taskIndex].updatedAt = new Date().toISOString();

  // Salva o arquivo atualizado
  await saveTasks(tasksData);

  return newSubtask;
}

/**
 * Atualiza o status de uma tarefa
 * @param {Number} taskId - ID da tarefa
 * @param {String} status - Novo status
 * @param {Number} subtaskId - ID da subtarefa (opcional)
 * @returns {Boolean} True se a atualização foi bem-sucedida
 */
export async function updateTaskStatus(taskId, status, subtaskId = null) {
  const tasksData = await loadTasks();

  // Encontra o índice da tarefa
  const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return false;
  }

  if (subtaskId !== null) {
    // Atualiza o status da subtarefa
    const subtasks = tasksData.tasks[taskIndex].subtasks || [];
    const subtaskIndex = subtasks.findIndex(st => st.id === subtaskId);

    if (subtaskIndex === -1) {
      return false;
    }

    tasksData.tasks[taskIndex].subtasks[subtaskIndex].status = status;
    tasksData.tasks[taskIndex].subtasks[subtaskIndex].updatedAt = new Date().toISOString();
  } else {
    // Atualiza o status da tarefa
    tasksData.tasks[taskIndex].status = status;
    tasksData.tasks[taskIndex].updatedAt = new Date().toISOString();

    // Se a tarefa for marcada como concluída, marca todas as subtarefas como concluídas
    if (status === 'done' && tasksData.tasks[taskIndex].subtasks) {
      for (let i = 0; i < tasksData.tasks[taskIndex].subtasks.length; i++) {
        tasksData.tasks[taskIndex].subtasks[i].status = 'done';
        tasksData.tasks[taskIndex].subtasks[i].updatedAt = new Date().toISOString();
      }
    }
  }

  // Salva o arquivo atualizado
  await saveTasks(tasksData);

  return true;
}

/**
 * Lista todas as tarefas ou filtra por status
 * @param {String} status - Status para filtrar (opcional)
 * @returns {Array} Lista de tarefas
 */
export async function listTasks(status = null) {
  const tasksData = await loadTasks();

  if (status) {
    return tasksData.tasks.filter(t => t.status === status);
  }

  return tasksData.tasks;
}

/**
 * Adiciona uma dependência entre tarefas
 * @param {Number} taskId - ID da tarefa
 * @param {Number} dependsOnId - ID da tarefa dependência
 * @returns {Boolean} True se a operação foi bem-sucedida
 */
export async function addDependency(taskId, dependsOnId) {
  const tasksData = await loadTasks();

  // Encontra os índices das tarefas
  const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);
  const depIndex = tasksData.tasks.findIndex(t => t.id === dependsOnId);

  // Verifica se ambas as tarefas existem
  if (taskIndex === -1 || depIndex === -1 || taskId === dependsOnId) {
    return false;
  }

  // Inicializa o array de dependências se não existir
  if (!tasksData.tasks[taskIndex].dependencies) {
    tasksData.tasks[taskIndex].dependencies = [];
  }

  // Adiciona a dependência se ainda não existir
  if (!tasksData.tasks[taskIndex].dependencies.includes(dependsOnId)) {
    tasksData.tasks[taskIndex].dependencies.push(dependsOnId);
    tasksData.tasks[taskIndex].updatedAt = new Date().toISOString();

    // Salva o arquivo atualizado
    await saveTasks(tasksData);
  }

  return true;
}

/**
 * Remove uma dependência entre tarefas
 * @param {Number} taskId - ID da tarefa
 * @param {Number} dependsOnId - ID da tarefa dependência
 * @returns {Boolean} True se a operação foi bem-sucedida
 */
export async function removeDependency(taskId, dependsOnId) {
  const tasksData = await loadTasks();

  // Encontra o índice da tarefa
  const taskIndex = tasksData.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1 || !tasksData.tasks[taskIndex].dependencies) {
    return false;
  }

  // Encontra o índice da dependência no array
  const depIndex = tasksData.tasks[taskIndex].dependencies.indexOf(dependsOnId);

  if (depIndex === -1) {
    return false;
  }

  // Remove a dependência
  tasksData.tasks[taskIndex].dependencies.splice(depIndex, 1);
  tasksData.tasks[taskIndex].updatedAt = new Date().toISOString();

  // Salva o arquivo atualizado
  await saveTasks(tasksData);

  return true;
}

/**
 * Obtém todas as tarefas do projeto
 * @returns {Array} Array de tarefas
 */
export async function getTasks() {
  return await loadTasks();
}
