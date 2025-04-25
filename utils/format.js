/**
 * Utilitário de formatação para o TaskManager
 *
 * Este módulo oferece funções para formatar a saída de tarefas
 * e outras informações no terminal de forma visualmente atraente.
 */

import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import gradient from 'gradient-string';

/**
 * Formata o status de uma tarefa com cores
 * @param {String} status - Status da tarefa
 * @returns {String} Status formatado com cores
 */
export function formatStatus(status) {
  switch (status) {
    case 'pending':
      return chalk.yellow('⏳ Pendente');
    case 'in-progress':
      return chalk.blue('🔄 Em Andamento');
    case 'done':
      return chalk.green('✅ Concluída');
    case 'deferred':
      return chalk.gray('⏱️ Adiada');
    case 'cancelled':
      return chalk.red('❌ Cancelada');
    default:
      return chalk.white(`📋 ${status}`);
  }
}

/**
 * Formata a prioridade de uma tarefa com cores
 * @param {String} priority - Prioridade da tarefa
 * @returns {String} Prioridade formatada com cores
 */
export function formatPriority(priority) {
  switch (priority) {
    case 'high':
      return chalk.red('🔴 Alta');
    case 'medium':
      return chalk.yellow('🟡 Média');
    case 'low':
      return chalk.green('🟢 Baixa');
    default:
      return chalk.white(`⚪ ${priority}`);
  }
}

/**
 * Formata uma data ISO em formato legível
 * @param {String} isoDate - Data em formato ISO
 * @returns {String} Data formatada
 */
export function formatDate(isoDate) {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata uma dependência com indicação de status
 * @param {Number} depId - ID da dependência
 * @param {Array} allTasks - Lista de todas as tarefas
 * @returns {String} Dependência formatada
 */
export function formatDependency(depId, allTasks) {
  const depTask = allTasks.find(t => t.id === depId);

  if (!depTask) {
    return chalk.red(`#${depId} (não encontrada)`);
  }

  const icon = depTask.status === 'done'
    ? chalk.green('✅')
    : chalk.yellow('⏳');

  return `${icon} #${depId} - ${depTask.title}`;
}

/**
 * Formata uma tarefa completa como texto
 * @param {Object} task - Tarefa a ser formatada
 * @param {Array} allTasks - Lista de todas as tarefas (para dependências)
 * @returns {String} Tarefa formatada
 */
export function formatTask(task, allTasks = []) {
  const title = gradient.pastel.multiline(`#${task.id} - ${task.title}`);

  // Formata a descrição principal
  let output = boxen(title, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  });

  // Informações básicas
  output += '\n';
  output += `${chalk.bold('Status:')} ${formatStatus(task.status)}\n`;
  output += `${chalk.bold('Prioridade:')} ${formatPriority(task.priority)}\n`;
  output += `${chalk.bold('Criado em:')} ${formatDate(task.createdAt)}\n`;
  output += `${chalk.bold('Atualizado em:')} ${formatDate(task.updatedAt)}\n`;

  // Descrição
  if (task.description) {
    output += `\n${chalk.bold('Descrição:')}\n`;
    output += `${task.description}\n`;
  }

  // Detalhes
  if (task.details) {
    output += `\n${chalk.bold('Detalhes:')}\n`;
    output += `${task.details}\n`;
  }

  // Estratégia de teste
  if (task.testStrategy) {
    output += `\n${chalk.bold('Estratégia de Teste:')}\n`;
    output += `${task.testStrategy}\n`;
  }

  // Dependências
  if (task.dependencies && task.dependencies.length > 0) {
    output += `\n${chalk.bold('Dependências:')}\n`;
    for (const depId of task.dependencies) {
      output += `${formatDependency(depId, allTasks)}\n`;
    }
  }

  // Subtarefas
  if (task.subtasks && task.subtasks.length > 0) {
    output += `\n${chalk.bold('Subtarefas:')}\n`;
    for (const subtask of task.subtasks) {
      const statusIcon = subtask.status === 'done'
        ? chalk.green('✅')
        : subtask.status === 'in-progress'
          ? chalk.blue('🔄')
          : chalk.yellow('⏳');

      output += `${statusIcon} ${subtask.id}. ${subtask.title}\n`;

      if (subtask.description) {
        output += `   ${chalk.gray(subtask.description)}\n`;
      }
    }
  }

  return output;
}

/**
 * Cria uma tabela de tarefas
 * @param {Array} tasks - Lista de tarefas
 * @param {Boolean} withSubtasks - Incluir subtarefas na tabela
 * @returns {String} Tabela formatada
 */
export function formatTasksTable(tasks, withSubtasks = false) {
  // Cria uma tabela
  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('Título'),
      chalk.cyan('Status'),
      chalk.cyan('Prioridade'),
      chalk.cyan('Descrição'),
      chalk.cyan('Dependências')
    ],
    colWidths: [8, 25, 15, 15, 50, 15],
    wordWrap: true,
    wrapOnWordBoundary: true,
    style: {
      head: [], // Remove o destaque padrão
      border: [], // Remove o destaque da borda
      'padding-left': 1,
      'padding-right': 1
    }
  });

  // Adiciona as tarefas à tabela
  for (const task of tasks) {
    table.push([
      chalk.bold(`#${task.id}`),
      chalk.bold(task.title),
      formatStatus(task.status),
      formatPriority(task.priority),
      task.description || '',
      task.dependencies && task.dependencies.length > 0 ? `[${task.dependencies.join(', ')}]` : ''
    ]);

    // Se withSubtasks for true e a tarefa tiver subtarefas
    if (withSubtasks && task.subtasks && task.subtasks.length > 0) {
      for (const subtask of task.subtasks) {
        table.push([
          chalk.gray(`${task.id}.${subtask.id}`),
          chalk.gray(subtask.title),
          formatStatus(subtask.status),
          '',
          chalk.gray(subtask.description || ''),
          ''
        ]);
      }
    }
  }

  return table.toString();
}

/**
 * Formata estatísticas de tarefas
 * @param {Object} metadata - Metadados das tarefas
 * @returns {String} Estatísticas formatadas
 */
export function formatTaskStats(metadata) {
  const total = metadata.taskCount || 0;
  const completed = metadata.completedCount || 0;
  const pending = metadata.pendingCount || 0;
  const inProgress = metadata.inProgressCount || 0;
  const deferred = metadata.deferredCount || 0;
  const cancelled = metadata.cancelledCount || 0;

  // Calcula a porcentagem de conclusão
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Cria uma barra de progresso
  const progressBarWidth = 30;
  const completedChars = Math.floor((completionPercent / 100) * progressBarWidth);
  const remainingChars = progressBarWidth - completedChars;

  const progressBar =
    chalk.green('█'.repeat(completedChars)) +
    chalk.gray('░'.repeat(remainingChars)) +
    ` ${completionPercent}%`;

  // Formata as estatísticas
  let output = boxen(chalk.bold('Estatísticas do Projeto'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'yellow'
  });

  output += '\n';
  output += `${chalk.bold('Progresso Total:')}\n${progressBar}\n\n`;
  output += `${chalk.bold('Total de Tarefas:')} ${total}\n`;
  output += `${chalk.green('✅ Concluídas:')} ${completed}\n`;
  output += `${chalk.blue('🔄 Em Andamento:')} ${inProgress}\n`;
  output += `${chalk.yellow('⏳ Pendentes:')} ${pending}\n`;
  output += `${chalk.gray('⏱️ Adiadas:')} ${deferred}\n`;
  output += `${chalk.red('❌ Canceladas:')} ${cancelled}\n`;

  output += '\n';
  output += `${chalk.bold('Por Prioridade:')}\n`;
  output += `${chalk.red('🔴 Alta:')} ${metadata.highPriorityCount || 0}\n`;
  output += `${chalk.yellow('🟡 Média:')} ${metadata.mediumPriorityCount || 0}\n`;
  output += `${chalk.green('🟢 Baixa:')} ${metadata.lowPriorityCount || 0}\n`;

  return output;
}

/**
 * Formata um título com destaque visual
 * @param {String} title - Título a ser formatado
 * @returns {String} Título formatado
 */
export function formatTitle(title) {
  return gradient.passion.multiline(`\n${title}\n${'='.repeat(title.length)}\n`);
}

/**
 * Formata uma mensagem de sucesso
 * @param {String} message - Mensagem a ser formatada
 * @returns {String} Mensagem formatada
 */
export function formatSuccess(message) {
  return boxen(chalk.green(`✓ ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green'
  });
}

/**
 * Formata uma mensagem de erro
 * @param {String} message - Mensagem a ser formatada
 * @returns {String} Mensagem formatada
 */
export function formatError(message) {
  return boxen(chalk.red(`✗ ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'red'
  });
}

/**
 * Formata uma mensagem de aviso
 * @param {String} message - Mensagem a ser formatada
 * @returns {String} Mensagem formatada
 */
export function formatWarning(message) {
  return boxen(chalk.yellow(`⚠ ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'yellow'
  });
}

/**
 * Formata uma dica ou informação
 * @param {String} message - Mensagem a ser formatada
 * @returns {String} Mensagem formatada
 */
export function formatInfo(message) {
  return boxen(chalk.blue(`ℹ ${message}`), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue'
  });
}
