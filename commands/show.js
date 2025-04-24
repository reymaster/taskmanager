import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { getProjectMetadata } from '../utils/config.js';
import { getTasks } from '../utils/tasks.js';
import { formatTask, formatTasksTable } from '../utils/format.js';

/**
 * Comando para mostrar detalhes de uma tarefa específica
 * @param {String} id - ID da tarefa
 * @param {Object} options - Opções do comando
 */
export async function showTask(id, options = {}) {
  try {
    if (!id) {
      console.error(chalk.red('ID da tarefa não especificado.'));
      return;
    }

    // Carregar metadados do projeto
    const projectMetadata = await getProjectMetadata();
    if (!projectMetadata) {
      console.error(chalk.red('Projeto não inicializado. Execute taskmanager init primeiro.'));
      return;
    }

    // Carregar tarefas
    const { tasks } = await getTasks();
    if (!tasks || tasks.length === 0) {
      console.error(chalk.red('Nenhuma tarefa encontrada. Execute taskmanager create primeiro.'));
      return;
    }

    // Encontrar a tarefa específica
    const task = tasks.find(t => t.id === parseInt(id));
    if (!task) {
      console.error(chalk.red(`Tarefa com ID ${id} não encontrada.`));
      return;
    }

    // Exibir a tarefa formatada
    console.log(formatTask(task, tasks));

    // Se houver subtarefas, exibir em uma tabela
    if (task.subtasks && task.subtasks.length > 0) {
      console.log(chalk.bold.cyan('\nSubtarefas:'));
      console.log(formatTasksTable([task], true));
    }

    // Exibir as ações do agente de IA
    console.log(chalk.bold.blue('\n=== AÇÕES DO AGENTE DE IA ==='));
    console.log(generateAgentActions(task, projectMetadata));

  } catch (error) {
    console.error(chalk.red(`Erro ao mostrar detalhes da tarefa: ${error.message}`));
  }
}

/**
 * Gera as ações que o agente de IA deve seguir
 * @param {Object} task - Tarefa
 * @param {Object} projectMetadata - Metadados do projeto
 * @returns {String} Ações formatadas
 */
function generateAgentActions(task, projectMetadata) {
  return `
1. ${chalk.bold('Análise Inicial')}
   - Revisar todos os detalhes da tarefa
   - Verificar dependências e seu status
   - Identificar requisitos técnicos

2. ${chalk.bold('Planejamento')}
   - Criar plano de implementação
   - Definir ordem de execução das subtarefas
   - Estabelecer critérios de sucesso

3. ${chalk.bold('Implementação')}
   - Seguir o roadmap de desenvolvimento
   - Implementar funcionalidades principais
   - Documentar código e decisões técnicas

4. ${chalk.bold('Testes')}
   - Executar testes conforme estratégia definida
   - Validar funcionalidades implementadas
   - Corrigir bugs identificados

5. ${chalk.bold('Integração')}
   - Integrar com sistema existente
   - Verificar compatibilidade com dependências
   - Realizar testes de integração

6. ${chalk.bold('Documentação')}
   - Atualizar documentação técnica
   - Registrar mudanças e decisões
   - Preparar guia de uso

7. ${chalk.bold('Revisão')}
   - Revisar código e implementação
   - Verificar conformidade com requisitos
   - Garantir qualidade do código

8. ${chalk.bold('Entrega')}
   - Preparar release
   - Atualizar status da tarefa
   - Notificar stakeholders
`;
}
