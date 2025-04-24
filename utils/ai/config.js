/**
 * Módulo de configuração de IA
 *
 * Este módulo gerencia as configurações e preferências
 * relacionadas à integração com IA no TaskManager.
 */

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { getTaskManagerDir, loadConfig } from '../config.js';

/**
 * Habilita a configuração de IA
 * @param {String} provider - Provedor de IA ('openai', 'anthropic', 'huggingface', 'perplexity')
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
          config.ai.model = 'gpt-4o';
          break;
        case 'anthropic':
          config.ai.model = 'claude-3-5-sonnet-20240409';
          break;
        case 'huggingface':
          config.ai.model = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
          break;
        case 'perplexity':
          config.ai.model = 'mistral-8x7b-instruct';
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
      defaultModel: 'gpt-4o',
      models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-4.5', 'gpt-3.5-turbo']
    },
    {
      id: 'anthropic',
      name: 'Anthropic (Claude)',
      defaultModel: 'claude-3-5-sonnet-20240409',
      models: [
        'claude-3-7-sonnet-20250222',
        'claude-3-5-sonnet-20240409',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ]
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      defaultModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      models: [
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'mistralai/Mistral-Large-2407',
        'mistralai/Mistral-Small-2503',
        'mistralai/Mistral-Nemo-2407',
        'meta-llama/Llama-3-70b-chat-hf'
      ]
    },
    {
      id: 'perplexity',
      name: 'Perplexity AI',
      defaultModel: 'sonar-pro',
      models: [
        'sonar-pro',
        'sonar-small-online',
        'sonar-medium-online',
        'mistral-8x7b-instruct',
        'llama-3-70b-instruct',
        'claude-3-5-sonnet',
      ]
    }
  ];
}

/**
 * Retorna a chave de API do Perplexity
 * @returns {String|null} Chave de API ou null se não encontrada
 */
export async function getPerplexityApiKey() {
  try {
    const config = await loadConfig();

    if (!config || !config.ai || !config.ai.perplexityApiKey) {
      // Tenta carregar do arquivo .env
      const envPath = path.join(getTaskManagerDir(), '.env');
      if (!existsSync(envPath)) {
        return null;
      }

      try {
        const envContent = await fs.readFile(envPath, 'utf-8');
        const envConfig = dotenv.parse(envContent);
        return envConfig.PERPLEXITY_API_KEY || null;
      } catch (error) {
        return null;
      }
    }

    return config.ai.perplexityApiKey;
  } catch (error) {
    console.error(chalk.red(`Erro ao obter chave de API do Perplexity: ${error.message}`));
    return null;
  }
}

/**
 * Define a chave de API do Perplexity
 * @param {String} apiKey - Chave de API
 * @returns {Boolean} Sucesso da operação
 */
export async function setPerplexityApiKey(apiKey) {
  try {
    const config = await loadConfig();

    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    if (!config.ai) {
      config.ai = {};
    }

    config.ai.perplexityApiKey = apiKey;

    // Salvar configuração
    const configPath = path.join(getTaskManagerDir(), 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return true;
  } catch (error) {
    console.error(chalk.red(`Erro ao definir chave de API do Perplexity: ${error.message}`));
    return false;
  }
}
