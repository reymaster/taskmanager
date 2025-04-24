import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { getProjectMetadata } from '../utils/config.js';
import { getTasks } from '../utils/tasks.js';

/**
 * Comando para gerar arquivos PRD para cada tarefa
 * @param {Object} options - Opções do comando
 */
export async function parseTasks(options) {
  try {
    // Carregar metadados do projeto
    const projectMetadata = await getProjectMetadata();
    if (!projectMetadata) {
      console.error(chalk.red('Projeto não inicializado. Execute taskmanager init primeiro.'));
      return;
    }

    // Carregar tarefas
    const tasks = await getTasks();
    if (!tasks || tasks.length === 0) {
      console.error(chalk.red('Nenhuma tarefa encontrada. Execute taskmanager create primeiro.'));
      return;
    }

    // Criar diretório para os PRDs se não existir
    const tasksDir = path.join(process.cwd(), '.taskmanager', 'tasks');
    await fs.mkdir(tasksDir, { recursive: true });

    // Gerar PRD para cada tarefa
    for (const task of tasks) {
      const prdContent = generatePRDContent(task, projectMetadata);
      const prdPath = path.join(tasksDir, `task-${task.id}.txt`);

      await fs.writeFile(prdPath, prdContent, 'utf8');
      console.log(chalk.green(`PRD gerado para tarefa ${task.id}: ${prdPath}`));
    }

    console.log(chalk.green('\nTodos os PRDs foram gerados com sucesso!'));
  } catch (error) {
    console.error(chalk.red(`Erro ao gerar PRDs: ${error.message}`));
  }
}

/**
 * Gera o conteúdo do PRD para uma tarefa
 * @param {Object} task - Tarefa
 * @param {Object} projectMetadata - Metadados do projeto
 * @returns {String} Conteúdo do PRD
 */
function generatePRDContent(task, projectMetadata) {
  // Formata as subtarefas
  const subtasksContent = task.subtasks && task.subtasks.length > 0
    ? task.subtasks.map(subtask => `
    - Subtarefa ${subtask.id}: ${subtask.title}
      Descrição: ${subtask.description}
      Status: ${subtask.status}
      Criada em: ${subtask.createdAt}
      Atualizada em: ${subtask.updatedAt}`).join('\n')
    : 'Nenhuma subtarefa definida';

  // Formata as dependências
  const dependenciesContent = task.dependencies && task.dependencies.length > 0
    ? task.dependencies.map(depId => {
        const depTask = projectMetadata.tasks?.find(t => t.id === depId);
        return depTask
          ? `- Tarefa ${depId}: ${depTask.title} (Status: ${depTask.status})`
          : `- Tarefa ${depId}: Não encontrada`;
      }).join('\n')
    : 'Nenhuma dependência definida';

  return `<context>
# Overview
[${task.title}]
${task.description}

# Core Features
[${task.details}]

# User Experience
[${task.testStrategy}]
</context>
<PRD>
# Technical Architecture
[Detalhes técnicos da implementação:
- Tecnologias: ${projectMetadata.technologies?.join(', ') || 'Não especificadas'}
- Dependências: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'Nenhuma'}
- Categoria: ${task.category}
- Prioridade: ${task.priority}]

# Development Roadmap
[Fases de desenvolvimento:
1. Implementação da funcionalidade principal
2. Testes e validações
3. Integração com o sistema existente]

# Logical Dependency Chain
[Ordem lógica de desenvolvimento:
${dependenciesContent}]

# Subtasks
[Subtarefas definidas:
${subtasksContent}]

# Risks and Mitigations
[Riscos identificados:
- Complexidade técnica
- Dependências externas
- Tempo de implementação]

# Appendix
[Informações adicionais:
- ID da tarefa: ${task.id}
- Status atual: ${task.status}
- Data de criação: ${task.createdAt}
- Última atualização: ${task.updatedAt}]
</PRD>`;
}
