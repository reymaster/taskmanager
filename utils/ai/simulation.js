/**
 * Módulo de simulação para geração de tarefas
 *
 * Este módulo é usado quando a integração com IA não está disponível
 * ou quando ocorre algum erro na geração de tarefas.
 */

import { validateAndAdjustDependencies } from './openai.js';

/**
 * Simula a geração de tarefas para um projeto
 * @param {String} projectDescription - Descrição do projeto
 * @param {String} projectType - Tipo do projeto ('new' ou 'existing')
 * @param {Number} taskCount - Número de tarefas a serem geradas
 * @returns {Array} Array de tarefas geradas
 */
export function simulateTasks(projectDescription, projectType, taskCount) {
  const now = new Date().toISOString();
  const tasks = [];

  // Gera tarefas base dependendo do tipo de projeto
  if (projectType === 'new') {
    // Para projetos novos, começa com setup e configuração
    tasks.push({
      id: 1,
      title: 'Setup inicial do projeto',
      description: 'Configuração do ambiente de desenvolvimento e estrutura base do projeto',
      status: 'pending',
      priority: 'high',
      dependencies: [],
      details: 'Configurar ambiente de desenvolvimento, estrutura de diretórios e ferramentas necessárias',
      testStrategy: 'Verificar se todas as ferramentas estão instaladas e funcionando corretamente',
      category: 'setup',
      createdAt: now,
      updatedAt: now,
      subtasks: [
        {
          id: 1,
          title: 'Inicializar repositório',
          description: 'Criar repositório e configurar controle de versão',
          status: 'pending',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 2,
          title: 'Configurar ambiente de desenvolvimento',
          description: 'Instalar e configurar ferramentas necessárias',
          status: 'pending',
          createdAt: now,
          updatedAt: now
        }
      ]
    });

    tasks.push({
      id: 2,
      title: 'Configuração de dependências',
      description: 'Instalação e configuração das dependências do projeto',
      status: 'pending',
      priority: 'high',
      dependencies: [1],
      details: 'Identificar e instalar todas as dependências necessárias para o projeto',
      testStrategy: 'Verificar se todas as dependências estão instaladas e funcionando',
      category: 'setup',
      createdAt: now,
      updatedAt: now,
      subtasks: [
        {
          id: 1,
          title: 'Criar arquivo de dependências',
          description: 'Definir as dependências no arquivo de configuração',
          status: 'pending',
          createdAt: now,
          updatedAt: now
        }
      ]
    });
  }

  // Gera tarefas adicionais
  const categories = ['frontend', 'backend', 'database', 'testing', 'documentation'];
  const priorities = ['high', 'medium', 'low'];

  for (let i = tasks.length + 1; i <= taskCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    // Gera dependências aleatórias (apenas para IDs menores)
    const possibleDeps = Array.from({length: i - 1}, (_, j) => j + 1);
    const dependencies = possibleDeps
      .filter(() => Math.random() > 0.7) // 30% de chance de cada tarefa anterior ser dependência
      .slice(0, Math.floor(Math.random() * Math.min(3, i))); // No máximo 3 dependências

    tasks.push({
      id: i,
      title: `Tarefa ${i} - ${category}`,
      description: `Descrição da tarefa ${i} na categoria ${category}`,
      status: 'pending',
      priority,
      dependencies,
      details: `Detalhes de implementação para a tarefa ${i}`,
      testStrategy: `Estratégia de teste para a tarefa ${i}`,
      category,
      createdAt: now,
      updatedAt: now,
      subtasks: [
        {
          id: 1,
          title: `Subtarefa 1 da Tarefa ${i}`,
          description: `Implementação inicial da tarefa ${i}`,
          status: 'pending',
          createdAt: now,
          updatedAt: now
        }
      ]
    });
  }

  // Valida e ajusta as dependências antes de retornar
  return validateAndAdjustDependencies(tasks);
}
