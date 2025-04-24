/**
 * Módulo para integração com Hugging Face
 *
 * Este módulo implementa a geração de tarefas usando a API do Hugging Face.
 */

import chalk from 'chalk';
import { simulateTasks } from './simulation.js';

/**
 * Gera tarefas usando a API do Hugging Face
 * @param {String} projectDescription - Descrição detalhada do projeto
 * @param {String} projectType - Tipo de projeto ('new' ou 'existing')
 * @param {Number} taskCount - Número de tarefas a serem geradas
 * @param {Object} aiConfig - Configuração da IA
 * @returns {Array} Array de tarefas geradas
 */
export async function generateTasksWithHuggingFace(projectDescription, projectType, taskCount, aiConfig) {
  // Verificar se a chave de API está configurada
  if (!aiConfig.apiKey) {
    throw new Error('Chave de API do Hugging Face não configurada');
  }

  try {
    // Aqui seria implementada a integração real com a API do Hugging Face
    // Para implementação futura

    console.log(chalk.yellow('Funcionalidade de integração com Hugging Face ainda não implementada.'));
    return simulateTasks(projectDescription, projectType, taskCount);

    /*
    // Exemplo de como a implementação seria:

    const prompt = createPromptForTaskGeneration(projectDescription, projectType, taskCount);

    const response = await fetch(`https://api-inference.huggingface.co/models/${aiConfig.model || 'mistralai/Mixtral-8x7B-Instruct-v0.1'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Hugging Face: ${response.statusText}`);
    }

    const result = await response.json();
    const tasksJson = parseTasksFromResponse(result[0].generated_text);
    return tasksJson;
    */

  } catch (error) {
    console.error(chalk.red(`Erro na API do Hugging Face: ${error.message}`));
    // Em caso de erro, retorna tarefas simuladas
    return simulateTasks(projectDescription, projectType, taskCount);
  }
}

/**
 * Cria um prompt para geração de tarefas com Hugging Face
 * @param {String} projectDescription - Descrição do projeto
 * @param {String} projectType - Tipo de projeto
 * @param {Number} taskCount - Número de tarefas
 * @returns {String} Prompt formatado
 */
function createPromptForTaskGeneration(projectDescription, projectType, taskCount) {
  return `
<s>[INST]
Você é um especialista em gerenciamento de projetos e desenvolvimento de software.
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

Seu resultado deve conter apenas e exatamente o array JSON com as tarefas, sem explicações adicionais.
[/INST]</s>
`;
}

/**
 * Faz o parse da resposta da API em formato JSON para um array de tarefas
 * @param {String} responseText - Texto da resposta da API
 * @returns {Array} Array de tarefas
 */
function parseTasksFromResponse(responseText) {
  try {
    // Encontra o objeto JSON na resposta
    const jsonMatch = responseText.match(/\[\s*{.*}\s*\]/s);

    if (jsonMatch) {
      // Adiciona timestamps a todas as tarefas
      const tasks = JSON.parse(jsonMatch[0]);
      const now = new Date().toISOString();

      for (const task of tasks) {
        task.createdAt = now;
        task.updatedAt = now;

        if (task.subtasks) {
          for (const subtask of task.subtasks) {
            subtask.createdAt = now;
            subtask.updatedAt = now;
          }
        }
      }

      return tasks;
    } else {
      throw new Error('Não foi possível encontrar JSON válido na resposta');
    }
  } catch (error) {
    console.error(chalk.red(`Erro ao fazer parse da resposta: ${error.message}`));
    throw error;
  }
}
