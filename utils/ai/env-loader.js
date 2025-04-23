/**
 * Módulo para carregar configurações de IA a partir do arquivo .env
 *
 * Este módulo carrega configurações e chaves de API para integrações com IA,
 * permitindo que o sistema de IA use as configurações definidas pelo usuário.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { getTaskManagerDir } from '../config.js';

/**
 * Carrega configurações a partir do arquivo .env
 * @returns {Object} Configurações de IA carregadas
 */
export function loadEnvConfig() {
  const taskManagerDir = getTaskManagerDir();
  const envPath = path.join(taskManagerDir, '.env');

  // Verifica se o arquivo .env existe
  if (!fs.existsSync(envPath)) {
    console.log(chalk.yellow('Arquivo .env não encontrado. Usando configurações padrão.'));
    console.log(chalk.blue(`Copie o arquivo .env.example para .env em ${taskManagerDir} e configure suas chaves de API.`));
    return {
      enabled: false,
      provider: null,
      model: null,
      openaiKey: null,
      anthropicKey: null,
      huggingfaceKey: null
    };
  }

  // Carrega o arquivo .env
  const envConfig = dotenv.config({ path: envPath });

  if (envConfig.error) {
    console.error(chalk.red(`Erro ao carregar arquivo .env: ${envConfig.error.message}`));
    return {
      enabled: false,
      provider: null,
      model: null,
      openaiKey: null,
      anthropicKey: null,
      huggingfaceKey: null
    };
  }

  // Retorna as configurações
  return {
    enabled: process.env.AI_ENABLED === 'true',
    provider: process.env.AI_PROVIDER || 'openai',
    model: process.env.AI_MODEL || null,
    openaiKey: process.env.OPENAI_API_KEY || null,
    anthropicKey: process.env.ANTHROPIC_API_KEY || null,
    huggingfaceKey: process.env.HUGGINGFACE_API_KEY || null
  };
}

/**
 * Obtém a chave de API para o provedor especificado
 * @param {String} provider - Provedor de IA (openai, anthropic, huggingface)
 * @returns {String|null} Chave de API ou null se não encontrada
 */
export function getApiKey(provider) {
  const config = loadEnvConfig();

  switch (provider) {
    case 'openai':
      return config.openaiKey;
    case 'anthropic':
      return config.anthropicKey;
    case 'huggingface':
      return config.huggingfaceKey;
    default:
      return null;
  }
}

/**
 * Verifica se a IA está habilitada
 * @returns {Boolean} True se a IA estiver habilitada
 */
export function isAIEnabled() {
  const config = loadEnvConfig();
  return config.enabled === true;
}

/**
 * Retorna o provedor de IA configurado
 * @returns {String|null} Provedor de IA ou null se não configurado
 */
export function getAIProvider() {
  const config = loadEnvConfig();
  return config.provider;
}

/**
 * Retorna o modelo de IA configurado
 * @returns {String|null} Modelo de IA ou null se não configurado
 */
export function getAIModel() {
  const config = loadEnvConfig();
  return config.model;
}

/**
 * Verifica se há uma chave de API configurada para o provedor especificado
 * @param {String} provider - Provedor de IA (openai, anthropic, huggingface)
 * @returns {Boolean} True se houver uma chave configurada
 */
export function hasApiKey(provider) {
  const key = getApiKey(provider);
  return key !== null && key !== undefined && key !== '';
}
