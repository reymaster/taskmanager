/**
 * Utilitário de configuração para o TaskManager
 *
 * Este módulo gerencia leitura e escrita das configurações do TaskManager,
 * define valores padrão e oferece funções para manipular o arquivo de configuração.
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Versão atual do TaskManager
const VERSION = '0.1.0';

/**
 * Retorna a versão atual do TaskManager
 * @returns {String} Versão atual
 */
export function getVersion() {
  return VERSION;
}

/**
 * Cria a configuração inicial do TaskManager
 * @param {String} projectType - Tipo de projeto ('new' ou 'existing')
 * @returns {Object} Configuração inicial
 */
export async function createInitialConfig(projectType) {
  const defaultConfig = {
    version: VERSION,
    projectType: projectType,
    taskSettings: {
      defaultPriority: 'medium',
      defaultSubtasks: 3,
      statusOptions: ['pending', 'in-progress', 'done', 'cancelled', 'deferred'],
      priorityOptions: ['high', 'medium', 'low']
    },
    ai: {
      enabled: false,
      provider: null,
      apiKey: null,
      model: null
    },
    display: {
      compactMode: false,
      showDependencies: true,
      showSubtasks: true
    },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  return defaultConfig;
}

/**
 * Lê o arquivo de configuração do TaskManager
 * @returns {Object} Configuração atual ou null se não existir
 */
export async function loadConfig() {
  const configPath = path.join(process.cwd(), '.taskmanager', 'config.json');

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error(`Erro ao ler arquivo de configuração: ${error.message}`);
    return null;
  }
}

/**
 * Salva o arquivo de configuração do TaskManager
 * @param {Object} config - Configuração a ser salva
 * @returns {Boolean} True se a operação foi bem-sucedida
 */
export async function saveConfig(config) {
  const configPath = path.join(process.cwd(), '.taskmanager', 'config.json');

  try {
    // Atualiza o timestamp de última atualização
    config.lastUpdated = new Date().toISOString();

    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2)
    );

    return true;
  } catch (error) {
    console.error(`Erro ao salvar arquivo de configuração: ${error.message}`);
    return false;
  }
}

/**
 * Atualiza uma configuração específica
 * @param {String} key - Chave da configuração
 * @param {any} value - Valor a ser definido
 * @returns {Boolean} True se a operação foi bem-sucedida
 */
export async function updateConfig(key, value) {
  const config = await loadConfig();

  if (!config) {
    return false;
  }

  // Manipula chaves aninhadas com notação de ponto
  if (key.includes('.')) {
    const parts = key.split('.');
    let current = config;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  } else {
    config[key] = value;
  }

  return await saveConfig(config);
}

/**
 * Verifica se o TaskManager está inicializado no diretório atual
 * @returns {Boolean} True se inicializado
 */
export function isInitialized() {
  return existsSync(path.join(process.cwd(), '.taskmanager'));
}

/**
 * Obtém o caminho para o diretório do TaskManager
 * @returns {String} Caminho para o diretório .taskmanager
 */
export function getTaskManagerDir() {
  return path.join(process.cwd(), '.taskmanager');
}

/**
 * Obtém o caminho para o arquivo de tarefas
 * @returns {String} Caminho para o arquivo tasks.json
 */
export function getTasksFilePath() {
  return path.join(getTaskManagerDir(), 'tasks.json');
}

/**
 * Obtém o caminho para o arquivo de metadados do projeto
 * @returns {String} Caminho para o arquivo project-metadata.json
 */
export function getProjectMetadataPath() {
  return path.join(getTaskManagerDir(), 'project-metadata.json');
}

/**
 * Obtém metadados do projeto
 * @returns {Object} Metadados do projeto ou null se não existir
 */
export async function getProjectMetadata() {
  const metadataPath = getProjectMetadataPath();

  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    const metadataData = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(metadataData);
  } catch (error) {
    console.error(`Erro ao ler metadados do projeto: ${error.message}`);
    return null;
  }
}
