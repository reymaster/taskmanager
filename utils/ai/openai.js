/**
 * Módulo para integração com OpenAI
 *
 * Este módulo implementa a geração de tarefas usando a API da OpenAI.
 */

import chalk from 'chalk';
import OpenAI from 'openai';
import { simulateTasks } from './simulation.js';

/**
 * Gera tarefas usando a API da OpenAI
 * @param {String} projectDescription - Descrição detalhada do projeto
 * @param {String} projectType - Tipo de projeto ('new' ou 'existing')
 * @param {Number} taskCount - Número de tarefas a serem geradas
 * @param {Object} aiConfig - Configuração da IA
 * @returns {Array} Array de tarefas geradas
 */
export async function generateTasksWithOpenAI(projectDescription, projectType, taskCount, aiConfig) {
  // Verificar se a chave de API está configurada
  if (!aiConfig.apiKey) {
    throw new Error('Chave de API da OpenAI não configurada');
  }

  try {
    const openai = new OpenAI({ apiKey: aiConfig.apiKey });

    const prompt = createPromptForTaskGeneration(projectDescription, projectType, taskCount);

    const response = await openai.chat.completions.create({
      model: aiConfig.model || 'gpt-4',
      messages: [
        { role: 'system', content: 'Você é um assistente especializado em gerenciamento de projetos, com experiência em desenvolvimento de software e metodologias ágeis.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096
    });

    const tasksJson = parseTasksFromResponse(response.choices[0].message.content);
    return tasksJson;

  } catch (error) {
    console.error(chalk.red(`Erro na API da OpenAI: ${error.message}`));
    // Em caso de erro, retorna tarefas simuladas
    return simulateTasks(projectDescription, projectType, taskCount);
  }
}

/**
 * Cria um prompt para geração de tarefas
 * @param {String} projectDescription - Descrição do projeto
 * @param {String} projectType - Tipo de projeto
 * @param {Number} taskCount - Número de tarefas
 * @returns {String} Prompt formatado
 */
function createPromptForTaskGeneration(projectDescription, projectType, taskCount) {
  return `
Gere ${taskCount} tarefas para um ${projectType === 'new' ? 'novo' : 'existente'} projeto com a seguinte descrição:

${projectDescription}

Retorne as tarefas no formato JSON, seguindo esta estrutura:
[
  {
    "id": 1,
    "title": "Título da tarefa",
    "description": "Descrição detalhada da tarefa",
    "status": "pending",
    "priority": "high|medium|low",
    "dependencies": [array de IDs das tarefas dependentes],
    "details": "Detalhes de implementação",
    "testStrategy": "Estratégia de teste",
    "category": "setup|frontend|backend|database|etc",
    "subtasks": [
      {
        "id": 1,
        "title": "Título da subtarefa",
        "description": "Descrição da subtarefa",
        "status": "pending"
      }
    ]
  }
]

Gere tarefas lógicas e bem estruturadas que sigam boas práticas de desenvolvimento.
Se o projeto for novo, comece com tarefas de setup e configuração inicial.
Se for um projeto existente, concentre-se em tarefas de desenvolvimento, melhoria ou correção.

Certifique-se de que:
1. As tarefas sejam específicas e mensuráveis
2. As dependências entre tarefas sejam lógicas
3. As prioridades reflitam a importância real das tarefas
4. As subtarefas sejam relevantes e ajudem a quebrar tarefas complexas
5. As estratégias de teste sejam práticas e efetivas
`;
}

/**
 * Analisa a resposta da OpenAI e extrai as tarefas
 * @param {String} responseText - Texto da resposta da OpenAI
 * @returns {Array} Array de tarefas
 */
function parseTasksFromResponse(responseText) {
  try {
    // Tenta extrair o JSON da resposta
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Não foi possível encontrar JSON na resposta');
    }

    const tasks = JSON.parse(jsonMatch[0]);

    // Adiciona timestamps e garante que todos os campos necessários existam
    const now = new Date().toISOString();
    return tasks.map((task, index) => ({
      id: index + 1,
      title: task.title || `Tarefa ${index + 1}`,
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      dependencies: task.dependencies || [],
      details: task.details || '',
      testStrategy: task.testStrategy || '',
      category: task.category || 'general',
      createdAt: now,
      updatedAt: now,
      subtasks: (task.subtasks || []).map((subtask, subIndex) => ({
        id: subIndex + 1,
        title: subtask.title || `Subtarefa ${subIndex + 1}`,
        description: subtask.description || '',
        status: subtask.status || 'pending',
        createdAt: now,
        updatedAt: now
      }))
    }));
  } catch (error) {
    console.error(chalk.red(`Erro ao analisar resposta da OpenAI: ${error.message}`));
    throw error;
  }
}
