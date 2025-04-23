/**
 * Módulo de configuração de IA
 *
 * Este módulo gerencia as configurações e preferências
 * relacionadas à integração com IA no TaskManager.
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { getTaskManagerDir, loadConfig } from '../config.js';

/**
 * Habilita a configuração de IA
 * @param {String} provider - Provedor de IA ('openai', 'anthropic', 'huggingface')
 * @param {String} apiKey - Chave de API do provedor
 * @param {String} model - Modelo de IA a ser usado (opcional)
 * @returns {Boolean} Sucesso da operação
 */
export async function enableAI(provider, apiKey, model = null) {
  try {
    const config = await loadConfig();

    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    if (!config.ai) {
      config.ai = {};
    }

    config.ai.enabled = true;
    config.ai.provider = provider;
    config.ai.apiKey = apiKey;

    if (model) {
      config.ai.model = model;
    } else {
      // Definir modelo padrão com base no provedor
      switch (provider) {
        case 'openai':
          config.ai.model = 'gpt-4';
          break;
        case 'anthropic':
          config.ai.model = 'claude-3-haiku-20240307';
          break;
        case 'huggingface':
          config.ai.model = 'mistralai/Mistral-7B-Instruct-v0.2';
          break;
        default:
          config.ai.model = null;
      }
    }

    // Salvar configuração
    const configPath = path.join(getTaskManagerDir(), 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return true;
  } catch (error) {
    console.error(chalk.red(`Erro ao habilitar IA: ${error.message}`));
    return false;
  }
}

/**
 * Desabilita a configuração de IA
 * @returns {Boolean} Sucesso da operação
 */
export async function disableAI() {
  try {
    const config = await loadConfig();

    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    if (!config.ai) {
      config.ai = {};
    }

    config.ai.enabled = false;

    // Salvar configuração
    const configPath = path.join(getTaskManagerDir(), 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return true;
  } catch (error) {
    console.error(chalk.red(`Erro ao desabilitar IA: ${error.message}`));
    return false;
  }
}

/**
 * Verifica se a IA está habilitada
 * @returns {Boolean} True se a IA estiver habilitada
 */
export async function isAIEnabled() {
  try {
    const config = await loadConfig();

    if (!config || !config.ai) {
      return false;
    }

    return config.ai.enabled === true;
  } catch (error) {
    console.error(chalk.red(`Erro ao verificar configuração de IA: ${error.message}`));
    return false;
  }
}

/**
 * Retorna as configurações de IA
 * @returns {Object} Configurações de IA
 */
export async function getAIConfig() {
  try {
    const config = await loadConfig();

    if (!config || !config.ai) {
      return {
        enabled: false,
        provider: null,
        model: null
      };
    }

    return {
      enabled: config.ai.enabled === true,
      provider: config.ai.provider || null,
      model: config.ai.model || null,
      // Não retorna a chave de API por segurança
    };
  } catch (error) {
    console.error(chalk.red(`Erro ao obter configuração de IA: ${error.message}`));
    return {
      enabled: false,
      provider: null,
      model: null
    };
  }
}

/**
 * Atualiza um campo específico da configuração de IA
 * @param {String} field - Campo a ser atualizado
 * @param {any} value - Valor a ser definido
 * @returns {Boolean} Sucesso da operação
 */
export async function updateAIConfig(field, value) {
  try {
    const config = await loadConfig();

    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    if (!config.ai) {
      config.ai = {};
    }

    // Atualiza o campo específico
    config.ai[field] = value;

    // Salvar configuração
    const configPath = path.join(getTaskManagerDir(), 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return true;
  } catch (error) {
    console.error(chalk.red(`Erro ao atualizar configuração de IA: ${error.message}`));
    return false;
  }
}

/**
 * Retorna uma lista dos provedores de IA suportados
 * @returns {Array} Lista de provedores
 */
export function getSupportedProviders() {
  return [
    {
      id: 'openai',
      name: 'OpenAI',
      defaultModel: 'gpt-4',
      models: ['gpt-4', 'gpt-3.5-turbo']
    },
    {
      id: 'anthropic',
      name: 'Anthropic (Claude)',
      defaultModel: 'claude-3-haiku-20240307',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      defaultModel: 'mistralai/Mistral-7B-Instruct-v0.2',
      models: ['mistralai/Mistral-7B-Instruct-v0.2', 'meta-llama/Llama-2-70b-chat-hf']
    }
  ];
}
