/**
 * Módulo principal de IA para o TaskManager
 *
 * Este módulo exporta as funções públicas do sistema de IA para uso em outros módulos.
 */

import chalk from 'chalk';
import { generateTasksWithOpenAI } from './openai.js';
import { generateTasksWithAnthropic } from './anthropic.js';
import { generateTasksWithHuggingFace } from './huggingface.js';
import { simulateTasks } from './simulation.js';
import {
  loadEnvConfig,
  isAIEnabled,
  getAIProvider,
  getAIModel,
  hasApiKey
} from './env-loader.js';

/**
 * Gera tarefas com base na descrição do projeto usando IA
 * @param {String} projectDescription - Descrição detalhada do projeto
 * @param {String} projectType - Tipo de projeto ('new' ou 'existing')
 * @param {Number} taskCount - Número de tarefas a serem geradas
 * @returns {Array} Array de tarefas geradas
 */
export async function generateTasks(projectDescription, projectType = 'new', taskCount = 5) {
  const config = loadEnvConfig();

  // Verifica se a IA está habilitada
  if (!config.enabled) {
    console.log(chalk.yellow('Atenção: IA está desabilitada nas configurações.'));
    console.log(chalk.blue('Para habilitar, configure AI_ENABLED=true no arquivo .env dentro da pasta .taskmanager'));
    return simulateTasks(projectDescription, projectType, taskCount);
  }

  // Tenta usar o provedor configurado
  try {
    switch (config.provider) {
      case 'openai':
        if (!config.openaiKey) {
          console.log(chalk.yellow('Atenção: Chave da OpenAI não configurada.'));
          console.log(chalk.blue('Configure OPENAI_API_KEY no arquivo .env dentro da pasta .taskmanager'));
          return simulateTasks(projectDescription, projectType, taskCount);
        }
        return await generateTasksWithOpenAI(
          projectDescription,
          projectType,
          taskCount,
          { apiKey: config.openaiKey, model: config.model }
        );

      case 'anthropic':
        if (!config.anthropicKey) {
          console.log(chalk.yellow('Atenção: Chave da Anthropic não configurada.'));
          console.log(chalk.blue('Configure ANTHROPIC_API_KEY no arquivo .env dentro da pasta .taskmanager'));
          return simulateTasks(projectDescription, projectType, taskCount);
        }
        return await generateTasksWithAnthropic(
          projectDescription,
          projectType,
          taskCount,
          { apiKey: config.anthropicKey, model: config.model }
        );

      case 'huggingface':
        if (!config.huggingfaceKey) {
          console.log(chalk.yellow('Atenção: Chave do Hugging Face não configurada.'));
          console.log(chalk.blue('Configure HUGGINGFACE_API_KEY no arquivo .env dentro da pasta .taskmanager'));
          return simulateTasks(projectDescription, projectType, taskCount);
        }
        return await generateTasksWithHuggingFace(
          projectDescription,
          projectType,
          taskCount,
          { apiKey: config.huggingfaceKey, model: config.model }
        );

      default:
        console.log(chalk.yellow(`Provedor de IA '${config.provider}' não suportado.`));
        console.log(chalk.blue('Provedores suportados: openai, anthropic, huggingface'));
        return simulateTasks(projectDescription, projectType, taskCount);
    }
  } catch (error) {
    console.error(chalk.red(`Erro ao usar o provedor de IA: ${error.message}`));
    console.log(chalk.blue('Usando modo de simulação para geração de tarefas.'));
    return simulateTasks(projectDescription, projectType, taskCount);
  }
}

// Re-exportar funções relacionadas a configurações de IA
export {
  loadEnvConfig,
  isAIEnabled,
  getAIProvider,
  getAIModel,
  hasApiKey
};
