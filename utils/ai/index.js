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
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gera tarefas com base na descrição do projeto usando IA
 * @param {String} projectDescription - Descrição detalhada do projeto
 * @param {String} type - Tipo de projeto ('new' ou 'existing')
 * @param {Number} taskCount - Número de tarefas a serem geradas
 * @returns {Promise<Array>} Array de tarefas geradas
 */
export async function generateTasks(projectDescription, projectType, taskCount = 5) {
  console.log('>>>', projectType, '<<<');
  const config = loadEnvConfig();

  // Verifica se a IA está habilitada
  if (!config.enabled) {
    console.log(chalk.yellow('Atenção: IA está desabilitada nas configurações.'));
    console.log(chalk.blue('Para habilitar, configure AI_ENABLED=true no arquivo .env dentro da pasta .taskmanager'));
    return simulateTasks(projectDescription, projectType || 'new', taskCount);
  }

  // Tenta usar o provedor configurado
  try {
    switch (config.provider) {
      case 'openai':
        if (!config.openaiKey) {
          console.log(chalk.yellow('Atenção: Chave da OpenAI não configurada.'));
          console.log(chalk.blue('Configure OPENAI_API_KEY no arquivo .env dentro da pasta .taskmanager'));
          return simulateTasks(projectDescription, projectType || 'new', taskCount);
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
        console.log('>>>PROVIDER: ', config.provider, '<<<');
        console.log(chalk.yellow(`Provedor de IA '${config.provider}' não suportado.`));
        console.log(chalk.blue('Provedores suportados: openai, anthropic, huggingface'));
        console.log('>>>ProjectType:', projectType, '<<<');
        return simulateTasks(projectDescription, projectType, taskCount);
    }
  } catch (error) {
    console.error(chalk.red(`Erro ao usar o provedor de IA: ${error.message}`));
    console.log(chalk.blue('Usando modo de simulação para geração de tarefas.'));
    return simulateTasks(projectDescription, projectType, taskCount);
  }
}

/**
 * Compila regras de IA para um agente específico em um arquivo Markdown.
 * @param {string} agent Nome do agente (ex: 'copilot', 'claude', 'gemini')
 * @param {string} destinationFolder Pasta de destino (ex: '.github', '.vscode', '.cursor')
 * @param {string} [fileName] Nome do arquivo de instrução (padrão: `${agent}-instructions.md`)
 */
export async function generateAgentInstructions(agent, destinationFolder, fileName) {
  try {
    const rulesDir = path.join(__dirname, '..', '..', 'templates', 'editor', 'rules', 'cursor');
    console.log('Tentando ler regras de IA de:', rulesDir);

    if (!await fs.pathExists(rulesDir)) {
      console.log(chalk.yellow(`⚠️ Diretório de regras ${rulesDir} não encontrado. Pulando compilação de regras.`));
      return null;
    }

    const files = await fs.readdir(rulesDir);
    const mdcFiles = files.filter(f => f.endsWith('.mdc'));

    if (mdcFiles.length === 0) {
      console.log(chalk.yellow('⚠️ Nenhum arquivo .mdc encontrado para compilação. Pulando esta etapa.'));
      return null;
    }

    let compiled = `# Instruções para o agente ${agent}\n\n`;
    for (const file of mdcFiles) {
      const content = await fs.readFile(path.join(rulesDir, file), 'utf-8');
      compiled += `\n---\n## ${file}\n\n`;
      compiled += content.replace(/^---[\s\S]*?---\n/, ''); // Remove frontmatter YAML se houver
    }

    const destDir = path.resolve(destinationFolder);
    await fs.ensureDir(destDir);
    const destFile = path.join(destDir, fileName || `${agent}-instructions.md`);
    await fs.writeFile(destFile, compiled, 'utf-8');
    console.log(chalk.green(`✅ Instruções para ${agent} geradas com sucesso em ${destFile}`));
    return destFile;
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Erro ao gerar instruções para ${agent}: ${error.message}`));
    console.log(chalk.yellow('Esta etapa não é crítica e o TaskManager continuará funcionando normalmente.'));
    return null;
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
