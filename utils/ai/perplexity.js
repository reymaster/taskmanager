/**
 * Módulo para integração com Perplexity AI
 *
 * Este módulo implementa a análise avançada de tarefas usando a API da Perplexity,
 * permitindo uma subdivisão mais inteligente e precisa das tarefas em subtarefas.
 */

import fetch from 'node-fetch';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { getTaskManagerDir } from '../config.js';

// Carrega a chave da API do arquivo .env
async function loadPerplexityApiKey() {
  try {
    const taskManagerDir = getTaskManagerDir();
    const envPath = path.join(taskManagerDir, '.env');

    // Verifica se o arquivo .env existe
    try {
      await fs.access(envPath);
    } catch (error) {
      throw new Error('Arquivo .env não encontrado. Configure PERPLEXITY_API_KEY no arquivo .env');
    }

    // Carrega as variáveis de ambiente
    const envConfig = dotenv.parse(await fs.readFile(envPath, 'utf-8'));

    // Verifica se a chave da API está definida
    if (!envConfig.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY não encontrada no arquivo .env');
    }

    return envConfig.PERPLEXITY_API_KEY;
  } catch (error) {
    console.error(chalk.red(`Erro ao carregar chave da API Perplexity: ${error.message}`));
    throw error;
  }
}

/**
 * Chama a API da Perplexity para análise avançada da tarefa
 * @param {Object} taskContext - Contexto da tarefa a ser analisada
 * @param {Number} numSubtasks - Número de subtarefas a serem geradas
 * @returns {Object} Resultado da análise (análise, subtarefas e melhorias)
 */
export async function callPerplexityAPI(taskContext, numSubtasks) {
  try {
    // Carrega a chave da API
    const apiKey = await loadPerplexityApiKey();

    // Cria o prompt de análise da tarefa
    const prompt = createTaskAnalysisPrompt(taskContext, numSubtasks);

    // Chama a API da Perplexity
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-8x7b-instruct',
        messages: [
          { role: 'system', content: 'Você é um especialista em gerenciamento de projetos e análise de tarefas. Sua função é analisar detalhadamente uma tarefa e dividi-la em subtarefas lógicas e bem estruturadas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,  // Baixa temperatura para respostas mais determinísticas
        max_tokens: 2048
      })
    });

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro na API Perplexity: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    // Processa a resposta
    const responseData = await response.json();
    return parsePerplexityResponse(responseData);

  } catch (error) {
    console.error(chalk.red(`Erro ao chamar API Perplexity: ${error.message}`));
    throw error;
  }
}

/**
 * Cria o prompt para análise da tarefa
 * @param {Object} taskContext - Contexto da tarefa a ser analisada
 * @param {Number} numSubtasks - Número de subtarefas a serem geradas
 * @returns {String} Prompt formatado
 */
function createTaskAnalysisPrompt(taskContext, numSubtasks) {
  // Extrai as informações da tarefa
  const { title, description, details, category, testStrategy, existingSubtasks } = taskContext;

  // Formato das subtarefas existentes para o prompt
  let existingSubtasksText = '';
  if (existingSubtasks && existingSubtasks.length > 0) {
    existingSubtasksText = '\nSubtarefas existentes:\n' + existingSubtasks.map(st =>
      `- ${st.title}: ${st.description || 'Sem descrição'}`
    ).join('\n');
  }

  // Constrói o prompt
  return `
# Análise de Tarefa e Decomposição em Subtarefas

## Detalhes da Tarefa
- Título: ${title}
- Descrição: ${description || 'Não fornecida'}
- Categoria: ${category || 'Não especificada'}
- Detalhes de Implementação: ${details || 'Não fornecidos'}
- Estratégia de Teste: ${testStrategy || 'Não fornecida'}
${existingSubtasksText}

## Instruções
1. Realize uma análise aprofundada e detalhada da tarefa acima, considerando:
   - Complexidade e escopo da tarefa
   - Principais desafios técnicos
   - Possíveis dependências e pré-requisitos
   - Conhecimentos e habilidades necessários
   - Estimativa de esforço e tempo

2. Com base nessa análise, decomponha a tarefa em exatamente ${numSubtasks} subtarefas lógicas e bem estruturadas.
   - As subtarefas devem seguir uma sequência lógica
   - Cada subtarefa deve ter um título claro e objetivo
   - Cada subtarefa deve ter uma descrição detalhada
   - As subtarefas devem cobrir todo o escopo da tarefa principal
   - Evite criar subtarefas que já existam

3. Se apropriado, sugira melhorias para a descrição, detalhes ou estratégia de teste da tarefa principal.

## Formato da Resposta
Retorne a resposta em formato JSON com a seguinte estrutura:
{
  "analysis": "Análise detalhada da tarefa (texto em markdown)",
  "subtasks": [
    {
      "title": "Título da subtarefa 1",
      "description": "Descrição detalhada da subtarefa 1"
    },
    ...
  ],
  "taskImprovements": {
    "description": "Sugestão de melhoria para a descrição da tarefa (opcional)",
    "details": "Sugestão de melhoria para os detalhes da tarefa (opcional)",
    "testStrategy": "Sugestão de melhoria para a estratégia de teste (opcional)"
  }
}

IMPORTANTE: A resposta DEVE conter APENAS o JSON solicitado, sem texto adicional antes ou depois.
`;
}

/**
 * Processa a resposta da API da Perplexity
 * @param {Object} responseData - Dados da resposta da API
 * @returns {Object} Dados processados (análise, subtarefas e melhorias)
 */
function parsePerplexityResponse(responseData) {
  try {
    // Extrai o conteúdo da resposta
    const content = responseData.choices[0].message.content;

    // Encontra o JSON na resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Formato de resposta inválido: JSON não encontrado');
    }

    // Parse do JSON
    const result = JSON.parse(jsonMatch[0]);

    // Verifica se as propriedades esperadas estão presentes
    if (!result.analysis || !result.subtasks || !Array.isArray(result.subtasks)) {
      throw new Error('Formato de resposta inválido: propriedades obrigatórias ausentes');
    }

    // Verifica se o número correto de subtarefas foi gerado
    if (result.subtasks.length === 0) {
      throw new Error('Nenhuma subtarefa foi gerada');
    }

    // Verifica se cada subtarefa tem título e descrição
    for (const subtask of result.subtasks) {
      if (!subtask.title || !subtask.description) {
        throw new Error('Formato de subtarefa inválido: título ou descrição ausente');
      }
    }

    return result;
  } catch (error) {
    console.error(chalk.red(`Erro ao processar resposta da API: ${error.message}`));
    throw error;
  }
}
