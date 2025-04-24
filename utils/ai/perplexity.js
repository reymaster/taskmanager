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
        model: 'sonar-reasoning-pro',
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
# Análise Técnica e Decomposição de Tarefa

## Detalhes da Tarefa
- Título: ${title}
- Descrição: ${description || 'Não fornecida'}
- Categoria: ${category || 'Não especificada'}
- Detalhes de Implementação: ${details || 'Não fornecidos'}
- Estratégia de Teste: ${testStrategy || 'Não fornecida'}
${existingSubtasksText}

## Diretrizes para Análise
Analise a tarefa considerando os seguintes aspectos técnicos:

1. Ambiente Docker e Infraestrutura:
   - Configuração completa de serviços (databases, cache, filas, etc.)
   - Uso de LocalStack para emulação de serviços cloud
   - Scripts de automação para setup com um comando

2. Especificações Técnicas:
   - Bibliotecas e frameworks específicos com versões
   - Padrões de implementação e design patterns
   - Estrutura de diretórios e convenções de nomenclatura
   - Interfaces e contratos de comunicação

3. Clean Architecture:
   - Separação clara de camadas (adapters, application, domain, infrastructure)
   - Definição de interfaces entre camadas
   - Injeção de dependências e inversão de controle
   - Domain-driven design patterns

4. Automação e DevOps:
   - Scripts de setup de ambiente
   - Seeds e migrations
   - Hooks de git e formatação
   - CI/CD e validações automatizadas

5. Testes e Qualidade:
   - Configuração de testes por camada
   - Mocks e fixtures padronizados
   - Cobertura de código
   - Análise estática e linting

6. Documentação:
   - Geração automática de docs
   - Swagger/OpenAPI
   - Diagramas e fluxos
   - Exemplos de uso

## Instruções para Subtarefas
Decomponha a tarefa em exatamente ${numSubtasks} subtarefas técnicas, onde cada subtarefa deve:

1. Ter um título técnico específico que indica exatamente o que será feito
2. Incluir uma descrição detalhada com:
   - Tecnologias e versões específicas
   - Estrutura de arquivos e diretórios
   - Padrões e convenções a seguir
   - Dependências e pré-requisitos
   - Critérios de aceitação técnicos
   - Estratégia de teste específica
   - Pontos de integração com outras subtarefas

3. Seguir uma sequência lógica de implementação que priorize:
   - Setup inicial de ambiente e ferramentas
   - Modelagem de domínio e regras de negócio
   - Implementação de camadas internas para externas
   - Integração de serviços e infraestrutura
   - Automação e documentação

## Formato da Resposta
Retorne a resposta em formato JSON com a seguinte estrutura:
{
  "analysis": "Análise técnica detalhada da tarefa (texto em markdown)",
  "subtasks": [
    {
      "title": "Título técnico específico",
      "description": "Descrição técnica detalhada incluindo todos os pontos solicitados",
      "technicalSpecs": {
        "technologies": ["lista de tecnologias com versões"],
        "patterns": ["padrões a serem seguidos"],
        "directory": "estrutura de diretórios",
        "testStrategy": "estratégia específica de testes",
        "acceptanceCriteria": ["critérios técnicos de aceitação"]
      }
    }
  ],
  "taskImprovements": {
    "description": "Sugestão de melhoria técnica para a descrição",
    "details": "Sugestão de especificações técnicas adicionais",
    "testStrategy": "Sugestão de estratégia de teste mais abrangente"
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
