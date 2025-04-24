/**
 * Implementação do comando 'create' para o TaskManager
 *
 * Este módulo é responsável pela criação de tarefas no TaskManager,
 * com suporte a projetos novos e existentes, usando perguntas
 * direcionadas e integração com IA.
 */

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import gradient from 'gradient-string';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { isInitialized, getTaskManagerDir, getProjectMetadata, loadConfig } from '../utils/config.js';
import { loadTasks, saveTasks, addTask } from '../utils/tasks.js';
import { formatSuccess, formatError, formatWarning, formatInfo, formatTasksTable } from '../utils/format.js';
import { generateTasks } from '../utils/ai/index.js';

/**
 * Executa o comando create
 * @param {Object} options - Opções de linha de comando
 */
export async function executeCreate(options = {}) {
  console.log(gradient.pastel.multiline('\n🔨 Criação de Tarefas\n==================\n'));

  // Verifica se o TaskManager está inicializado
  if (!isInitialized()) {
    console.log(formatWarning('TaskManager não está inicializado neste diretório.'));
    console.log(chalk.blue('Execute primeiro: ') + chalk.bold('taskmanager init'));
    return;
  }

  // Carrega metadados do projeto
  const projectMetadata = await getProjectMetadata();

  if (!projectMetadata) {
    console.log(formatError('Não foi possível carregar os metadados do projeto.'));
    return;
  }

  // Determina o tipo de criação de tarefas com base no tipo de projeto
  const isNewProject = projectMetadata.type === 'new';
  const tasksData = await loadTasks();
  const hasExistingTasks = tasksData.tasks.length > 0;

  if (isNewProject && !hasExistingTasks) {
    // Fluxo para projeto novo sem tarefas
    await createTasksForNewProject(projectMetadata);
  } else {
    // Fluxo para projeto existente ou projeto novo com tarefas
    const { createType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'createType',
        message: 'O que você gostaria de fazer?',
        choices: [
          { name: '🧩 Criar novas tarefas manualmente', value: 'manual' },
          { name: '🤖 Gerar tarefas usando IA', value: 'ai' },
          { name: hasExistingTasks ? '📋 Ver tarefas existentes' : '🔙 Voltar', value: 'view' }
        ]
      }
    ]);

    if (createType === 'manual') {
      await createTaskManually();
    } else if (createType === 'ai') {
      await createTasksWithAI(projectMetadata, hasExistingTasks);
    } else if (createType === 'view' && hasExistingTasks) {
      // Mostra as tarefas existentes
      console.log(formatTasksTable(tasksData.tasks, true));
    }
  }
}

/**
 * Cria tarefas para um projeto novo
 * @param {Object} projectMetadata - Metadados do projeto
 */
async function createTasksForNewProject(projectMetadata) {
  console.log(formatInfo('Vamos configurar as tarefas iniciais para seu novo projeto.'));
  console.log(chalk.blue('Responda algumas perguntas para ajudar na definição das tarefas.'));

  // Perguntas para descrever bem o projeto
  const projectQuestions = await inquirer.prompt([
    {
      type: 'input',
      name: 'vision',
      message: 'Qual é a visão geral do projeto? O que ele deve fazer?',
      validate: (input) => input.length >= 20 ? true : 'Por favor, forneça uma descrição mais detalhada (mínimo 20 caracteres)'
    },
    {
      type: 'input',
      name: 'audience',
      message: 'Quem são os usuários ou público-alvo deste projeto?',
      default: 'Usuários gerais'
    },
    {
      type: 'input',
      name: 'features',
      message: 'Quais são as principais funcionalidades que o projeto deve ter?',
      validate: (input) => input.length >= 15 ? true : 'Por favor, liste algumas funcionalidades (mínimo 15 caracteres)'
    },
    {
      type: 'input',
      name: 'constraints',
      message: 'Existem limitações ou requisitos específicos (tempo, recursos, tecnologias)?',
      default: 'Sem limitações específicas'
    },
    {
      type: 'list',
      name: 'complexity',
      message: 'Qual é a complexidade estimada do projeto?',
      choices: [
        { name: '🟢 Simples (alguns dias de desenvolvimento)', value: 'low' },
        { name: '🟡 Média (algumas semanas de desenvolvimento)', value: 'medium' },
        { name: '🔴 Alta (alguns meses de desenvolvimento)', value: 'high' }
      ],
      default: 'medium'
    },
    {
      type: 'input',
      name: 'additionalInfo',
      message: 'Há algo mais que você gostaria de adicionar sobre o projeto?',
      default: ''
    }
  ]);

  // Atualizar os metadados do projeto com as novas informações
  const taskmanagerDir = await getTaskManagerDir();
  const updatedMetadata = {
    ...projectMetadata,
    projectInfo: {
      vision: projectQuestions.vision,
      audience: projectQuestions.audience,
      features: projectQuestions.features,
      constraints: projectQuestions.constraints,
      complexity: projectQuestions.complexity,
      additionalInfo: projectQuestions.additionalInfo
    },
    lastUpdated: new Date().toISOString()
  };

  // Salvar os metadados atualizados
  await fs.writeFile(
    path.join(taskmanagerDir, 'project-metadata.json'),
    JSON.stringify(updatedMetadata, null, 2)
  );

  // Gerar tarefas com base nas respostas
  console.log(chalk.green('\n✅ Informações coletadas e salvas com sucesso!'));
  console.log(chalk.blue('\nAgora vamos gerar as tarefas iniciais para o seu projeto...'));

  // Opção para usar IA ou criar manualmente
  const { generateMethod } = await inquirer.prompt([
    {
      type: 'list',
      name: 'generateMethod',
      message: 'Como você gostaria de criar as tarefas iniciais?',
      choices: [
        { name: '🤖 Gerar automaticamente com IA', value: 'ai' },
        { name: '✍️ Criar tarefas manualmente', value: 'manual' }
      ]
    }
  ]);

  if (generateMethod === 'ai') {
    // Gerar tarefas usando IA
    await generateTasksWithAI(updatedMetadata, projectQuestions);
  } else {
    // Criar tarefas manualmente
    console.log(chalk.blue('\nVamos criar as tarefas manualmente.'));
    await createTaskManually();
  }
}

/**
 * Gera tarefas usando IA com base nas informações do projeto
 * @param {Object} projectMetadata - Metadados do projeto
 * @param {Object} projectInfo - Informações detalhadas do projeto
 * @returns {Promise<void>}
 */
async function generateTasksWithAI(projectMetadata, projectInfo) {
  const spinner = ora('Gerando tarefas com IA...').start();

  try {
    // Construir descrição do projeto para a IA
    const projectDescription = `
Nome do Projeto: ${projectMetadata.name}
Descrição: ${projectMetadata.description}
Tecnologias: ${projectMetadata.technologies?.join(', ') || 'Não especificadas'}
Visão Geral: ${projectInfo.vision}
Público-alvo: ${projectInfo.audience}
Funcionalidades: ${projectInfo.features}
Limitações/Requisitos: ${projectInfo.constraints}
Complexidade: ${projectInfo.complexity}
Informações Adicionais: ${projectInfo.additionalInfo}
`;

    // Usar o módulo de IA para gerar tarefas
    const generatedTasks = await generateTasks(projectDescription, projectMetadata.type);

    if (!generatedTasks || generatedTasks.length === 0) {
      spinner.fail('Não foi possível gerar tarefas com IA.');
      console.log(formatWarning('Tente criar tarefas manualmente ou verifique a configuração de IA.'));
      return;
    }

    // Salvar as tarefas geradas
    const tasksData = await loadTasks();

    for (const task of generatedTasks) {
      tasksData.tasks.push(task);
    }

    await saveTasks(tasksData);

    spinner.succeed(`${generatedTasks.length} tarefas geradas com sucesso!`);

    // Mostrar as tarefas geradas
    console.log(formatTasksTable(generatedTasks, true));

    console.log(formatSuccess('Tarefas salvas com sucesso! Use o comando "taskmanager list" para vê-las.'));

  } catch (error) {
    spinner.fail(`Erro ao gerar tarefas: ${error.message}`);
    console.log(formatError('Houve um problema ao gerar tarefas com IA.'));
    console.log(chalk.blue('Tente criar tarefas manualmente com o comando: ') + chalk.bold('taskmanager create'));
  }
}

/**
 * Cria tarefas com IA para projeto existente
 * @param {Object} projectMetadata - Metadados do projeto
 * @param {Boolean} hasExistingTasks - Se já existem tarefas no projeto
 */
async function createTasksWithAI(projectMetadata, hasExistingTasks) {
  console.log(formatInfo('Vamos usar IA para gerar tarefas para seu projeto.'));

  // Definir o contexto para a geração de tarefas
  const { taskContext } = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskContext',
      message: 'Que tipo de tarefas você precisa gerar?',
      choices: [
        { name: '🏗️ Estrutura inicial do projeto', value: 'initial' },
        { name: '✨ Novo módulo ou funcionalidade', value: 'feature' },
        { name: '🐛 Correção de bugs', value: 'bugfix' },
        { name: '🧪 Testes', value: 'testing' },
        { name: '📚 Documentação', value: 'documentation' },
        { name: '♻️ Refatoração', value: 'refactoring' },
        { name: '🚀 Otimização de desempenho', value: 'performance' },
        { name: '🔒 Melhorias de segurança', value: 'security' },
        { name: '📦 Atualização de dependências', value: 'dependencies' },
        { name: '🔧 Outro (especificar)', value: 'custom' }
      ]
    },
    {
      type: 'input',
      name: 'customContext',
      message: 'Descreva o contexto para geração de tarefas:',
      when: (answers) => answers.taskContext === 'custom',
      validate: (input) => input.length >= 10 ? true : 'Por favor, forneça uma descrição mais detalhada'
    },
    {
      type: 'input',
      name: 'taskDescription',
      message: 'Descreva em detalhes o que precisa ser feito:',
      validate: (input) => input.length >= 20 ? true : 'Por favor, forneça uma descrição mais detalhada (mínimo 20 caracteres)'
    },
    {
      type: 'input',
      name: 'additionalInfo',
      message: 'Informações adicionais que podem ajudar na geração de tarefas:',
      default: ''
    },
    {
      type: 'number',
      name: 'taskCount',
      message: 'Quantas tarefas você gostaria de gerar?',
      default: 5,
      validate: (input) => input > 0 && input <= 15 ? true : 'O número deve estar entre 1 e 15'
    }
  ]);

  // Construir a descrição para a IA
  const context = taskContext === 'custom' ? taskContext.customContext : taskContext;

  // Carregar tarefas existentes para contexto adicional
  const tasksData = await loadTasks();
  const existingTasksContext = hasExistingTasks
    ? `\nTarefas existentes: ${tasksData.tasks.map(t => `#${t.id} - ${t.title}`).join(', ')}`
    : '';

  const aiPrompt = `
Nome do Projeto: ${projectMetadata.name}
Descrição: ${projectMetadata.description}
Tecnologias: ${projectMetadata.technologies?.join(', ') || 'Não especificadas'}
Contexto: ${context}
Descrição da tarefa: ${taskContext.taskDescription}
Informações adicionais: ${taskContext.additionalInfo}${existingTasksContext}
`;

  // Gerar tarefas
  const spinner = ora('Gerando tarefas com IA...').start();

  try {
    // Usar o módulo de IA para gerar tarefas
    const generatedTasks = await generateTasks(aiPrompt, 'existing', taskContext.taskCount);

    if (!generatedTasks || generatedTasks.length === 0) {
      spinner.fail('Não foi possível gerar tarefas com IA.');
      console.log(formatWarning('Tente criar tarefas manualmente ou verifique a configuração de IA.'));
      return;
    }

    // Atribuir IDs corretos, considerando as tarefas existentes
    let nextId = 1;
    if (tasksData.tasks.length > 0) {
      nextId = Math.max(...tasksData.tasks.map(t => t.id)) + 1;
    }

    generatedTasks.forEach((task, index) => {
      task.id = nextId + index;
    });

    // Adicionar as tarefas geradas às tarefas existentes
    for (const task of generatedTasks) {
      tasksData.tasks.push(task);
    }

    await saveTasks(tasksData);

    spinner.succeed(`${generatedTasks.length} tarefas geradas com sucesso!`);

    // Mostrar as tarefas geradas
    console.log(formatTasksTable(generatedTasks, true));

    console.log(formatSuccess('Tarefas salvas com sucesso! Use o comando "taskmanager list" para vê-las.'));

  } catch (error) {
    spinner.fail(`Erro ao gerar tarefas: ${error.message}`);
    console.log(formatError('Houve um problema ao gerar tarefas com IA.'));
    console.log(chalk.blue('Tente criar tarefas manualmente.'));
  }
}

/**
 * Cria uma tarefa manualmente
 */
async function createTaskManually() {
  console.log(chalk.blue('\nVamos criar uma nova tarefa:'));

  const { createAnother, ...taskData } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Título da tarefa:',
      validate: (input) => input.length > 0 ? true : 'O título é obrigatório'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Descrição da tarefa:',
      default: ''
    },
    {
      type: 'list',
      name: 'priority',
      message: 'Prioridade:',
      choices: [
        { name: '🔴 Alta', value: 'high' },
        { name: '🟡 Média', value: 'medium' },
        { name: '🟢 Baixa', value: 'low' }
      ],
      default: 'medium'
    },
    {
      type: 'input',
      name: 'details',
      message: 'Detalhes de implementação:',
      default: ''
    },
    {
      type: 'input',
      name: 'testStrategy',
      message: 'Estratégia de teste:',
      default: ''
    },
    {
      type: 'input',
      name: 'dependencies',
      message: 'IDs das tarefas dependentes (separados por vírgula):',
      default: '',
      filter: (input) => {
        if (!input) return [];
        return input.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }
    },
    {
      type: 'confirm',
      name: 'createAnother',
      message: 'Deseja criar outra tarefa?',
      default: false
    }
  ]);

  try {
    // Adiciona a tarefa
    const newTask = await addTask(taskData);

    console.log(formatSuccess(`Tarefa #${newTask.id} criada com sucesso!`));

    // Se o usuário quiser criar outra tarefa
    if (createAnother) {
      await createTaskManually();
    } else {
      // Mostrar as tarefas atuais
      const tasksData = await loadTasks();
      console.log(formatTasksTable(tasksData.tasks, false));
    }
  } catch (error) {
    console.log(formatError(`Erro ao criar tarefa: ${error.message}`));
  }
}
