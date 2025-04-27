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

  // Verifica se é um reset do projeto
  if (options.reset) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.yellow('⚠️ ATENÇÃO: Isso irá remover todas as tarefas atuais e recriar as tarefas básicas do projeto. Deseja continuar?'),
        default: false
      }
    ]);

    if (!confirm) {
      console.log(formatInfo('Operação cancelada pelo usuário.'));
      return;
    }

    // Criar backup do tasks.json atual
    const taskmanagerDir = await getTaskManagerDir();
    const tasksPath = path.join(taskmanagerDir, 'tasks.json');
    const backupPath = path.join(taskmanagerDir, `tasks_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

    try {
      if (existsSync(tasksPath)) {
        await fs.copyFile(tasksPath, backupPath);
        console.log(formatSuccess(`Backup criado em: ${backupPath}`));
      }

      // Carregar metadados do projeto
      const projectMetadata = await getProjectMetadata();
      if (!projectMetadata) {
        console.log(formatError('Não foi possível carregar os metadados do projeto.'));
        return;
      }

      // Resetar tasks.json para estado inicial
      await saveTasks({ tasks: [], metadata: { totalTasks: 0, lastUpdated: new Date().toISOString() } });
      console.log(formatSuccess('Arquivo de tarefas resetado com sucesso.'));

      // Perguntar como o usuário deseja recriar as tarefas
      const { generateMethod } = await inquirer.prompt([
        {
          type: 'list',
          name: 'generateMethod',
          message: 'Como você deseja recriar as tarefas do projeto?',
          choices: [
            { name: '🤖 Gerar automaticamente com IA', value: 'ai' },
            { name: '✍️ Criar tarefas manualmente', value: 'manual' }
          ]
        }
      ]);

      if (generateMethod === 'ai') {
        // Usar IA para gerar tarefas usando os metadados existentes
        await generateTasksWithAI(projectMetadata, projectMetadata.projectInfo || {});
      } else {
        // Criar tarefas manualmente
        console.log(chalk.blue('\nVamos criar as tarefas manualmente.'));
        await createTaskManually();
      }

      return;
    } catch (error) {
      console.error(formatError(`Erro ao resetar tarefas: ${error.message}`));
      return;
    }
  }

  // Verifica se é uma restauração de backup
  if (options.restore) {
    const taskmanagerDir = await getTaskManagerDir();

    // Lista todos os arquivos de backup
    const files = await fs.readdir(taskmanagerDir);
    const backups = files.filter(file => file.startsWith('tasks_backup_'));

    if (backups.length === 0) {
      console.log(formatWarning('Nenhum backup encontrado.'));
      return;
    }

    // Obter informações detalhadas dos backups
    const backupsInfo = await Promise.all(backups.map(async (backup) => {
      const stats = await fs.stat(path.join(taskmanagerDir, backup));
      const fileSizeInKB = (stats.size / 1024).toFixed(2);
      return {
        filename: backup,
        size: fileSizeInKB,
        date: stats.mtime
      };
    }));

    // Ordenar do mais recente para o mais antigo
    backupsInfo.sort((a, b) => b.date - a.date);

    // Formata as escolhas para o usuário
    const choices = backupsInfo.map(backup => {
      const date = backup.filename.replace('tasks_backup_', '').replace('.json', '');
      const formattedDate = date.replace(/-/g, ':').slice(0, -4); // Remove milissegundos
      return {
        name: `📦 ${formattedDate} (${backup.size}KB)`,
        value: backup.filename
      };
    });

    // Adiciona opção para cancelar
    choices.push({ name: '❌ Cancelar', value: 'cancel' });

    // Pergunta qual backup restaurar
    const { selectedBackup } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedBackup',
        message: 'Selecione o backup que deseja restaurar:',
        choices
      }
    ]);

    if (selectedBackup === 'cancel') {
      console.log(formatInfo('Operação cancelada pelo usuário.'));
      return;
    }

    try {
      // Criar backup do tasks.json atual antes de restaurar
      const tasksPath = path.join(taskmanagerDir, 'tasks.json');
      const currentBackupPath = path.join(taskmanagerDir, `tasks_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

      if (existsSync(tasksPath)) {
        await fs.copyFile(tasksPath, currentBackupPath);
        console.log(formatSuccess(`Backup do estado atual criado em: ${currentBackupPath}`));
      }

      // Ler o conteúdo do backup selecionado
      const backupContent = await fs.readFile(path.join(taskmanagerDir, selectedBackup), 'utf-8');

      // Criar o arquivo de restore point
      const restoreDate = selectedBackup.replace('tasks_backup_', '').replace('.json', '');
      const restorePointPath = path.join(taskmanagerDir, `tasks.restorepoint.${restoreDate}.json`);

      // Salvar o conteúdo no novo arquivo
      await fs.writeFile(restorePointPath, backupContent);

      // Atualizar o tasks.json com o conteúdo do backup
      await fs.writeFile(tasksPath, backupContent);

      console.log(formatSuccess(`Backup restaurado com sucesso!`));
      console.log(formatInfo(`Restore point criado em: ${restorePointPath}`));
      console.log(chalk.blue('\nUse o comando "taskmanager list" para ver as tarefas restauradas.'));

    } catch (error) {
      console.error(formatError(`Erro ao restaurar backup: ${error.message}`));
    }
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
  const spinner = ora('Gerando tarefas básicas com IA...').start();

  try {
    // Construir descrição do projeto para a IA
    const projectDescription = `
Nome do Projeto: ${projectMetadata.name}
Descrição: ${projectMetadata.description}
Tecnologias: ${projectMetadata.technologies?.join(', ') || 'Não especificadas'}
Visão Geral: ${projectInfo.vision || projectMetadata.description}
Público-alvo: ${projectInfo.audience || 'Não especificado'}
Funcionalidades: ${projectInfo.features || 'Não especificadas'}
Limitações/Requisitos: ${projectInfo.constraints || 'Não especificados'}
Complexidade: ${projectInfo.complexity || 'Média'}
Informações Adicionais: ${projectInfo.additionalInfo || ''}
`;

    // Usar o módulo de IA para gerar tarefas básicas (sem subtarefas)
    const generatedTasks = await generateTasks(projectDescription, projectMetadata.type);

    if (!generatedTasks || generatedTasks.length === 0) {
      spinner.fail('Não foi possível gerar tarefas com IA.');
      console.log(formatWarning('Tente criar tarefas manualmente ou verifique a configuração de IA.'));
      return;
    }

    // Remover subtarefas das tarefas geradas
    const basicTasks = generatedTasks.map(task => {
      const { subtasks, ...basicTask } = task;
      return basicTask;
    });

    // Salvar as tarefas geradas
    const tasksData = await loadTasks();
    let nextId = 1;

    if (tasksData.tasks.length > 0) {
      nextId = Math.max(...tasksData.tasks.map(t => t.id)) + 1;
    }

    // Adicionar IDs corretos às novas tarefas
    basicTasks.forEach((task, index) => {
      task.id = nextId + index;
    });

    for (const task of basicTasks) {
      tasksData.tasks.push(task);
    }

    await saveTasks(tasksData);

    spinner.succeed(`${basicTasks.length} tarefas básicas geradas com sucesso!`);

    // Mostrar as tarefas geradas
    console.log(formatTasksTable(basicTasks));

    console.log(formatSuccess('\nTarefas salvas com sucesso!'));
    console.log(chalk.blue('\nDicas:'));
    console.log(chalk.blue('- Use ') + chalk.bold('taskmanager list') + chalk.blue(' para ver todas as tarefas'));
    console.log(chalk.blue('- Use ') + chalk.bold('taskmanager expand --id=X') + chalk.blue(' para adicionar subtarefas'));
    console.log(chalk.blue('  • Com ') + chalk.bold('--ai') + chalk.blue(' para análise avançada com Perplexity'));
    console.log(chalk.blue('  • Com ') + chalk.bold('--no-ai') + chalk.blue(' para criar subtarefas manualmente'));

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
    }
  ]);

  // Sempre gerar o número padrão de tarefas (ex: 5)
  const taskCount = 5;

  // Enriquecimento automático do prompt para 'Novo módulo ou funcionalidade'
  let enrichedPrompt = '';
  if (taskContext === 'feature') {
    if (projectMetadata.type === 'new') {
      enrichedPrompt = `\nGere uma lista de tarefas detalhadas para implementar a seguinte funcionalidade:\n- ${taskContext.taskDescription}\nAs tarefas devem ser claras, sequenciais, e cobrir todo o fluxo de decomposição, implementação, testes e documentação.\nInclua etapas para análise, geração de metadados, detecção de funcionalidades já implementadas, sugestões de melhorias e revisão pelo usuário.\n`;
    } else {
      enrichedPrompt = `\nGere uma lista de tarefas detalhadas para implementar a seguinte funcionalidade:\n- ${taskContext.taskDescription}\nAs tarefas devem ser claras, sequenciais, e cobrir todo o fluxo de decomposição, implementação, testes e documentação.\nInclua etapas para análise, geração de metadados, detecção de funcionalidades já implementadas, sugestões de melhorias e revisão pelo usuário.\nNão inclua tarefas de configuração de ambiente de desenvolvimento, a menos que o usuário peça explicitamente.\n`;
    }
  }

  // Carregar tarefas existentes para contexto adicional
  const tasksData = await loadTasks();
  const existingTasksContext = hasExistingTasks
    ? `\nTarefas existentes: ${tasksData.tasks.map(t => `#${t.id} - ${t.title}`).join(', ')}`
    : '';

  const aiPrompt = `\nNome do Projeto: ${projectMetadata.name}\nDescrição: ${projectMetadata.description}\nTecnologias: ${projectMetadata.technologies?.join(', ') || 'Não especificadas'}\nContexto: ${taskContext.customContext || taskContext}\n${enrichedPrompt}Informações adicionais: ${taskContext.additionalInfo}${existingTasksContext}\nGere exatamente ${taskCount} tarefas principais, numeradas de 1 a ${taskCount}, cada uma representando uma etapa distinta do fluxo solicitado. Não crie subtarefas, apenas tarefas principais. Não pare antes de chegar à tarefa ${taskCount}.\n`;

  // Gerar tarefas
  const spinner = ora('Gerando tarefas com IA...').start();

  try {
    // Usar o módulo de IA para gerar tarefas
    const generatedTasks = await generateTasks(aiPrompt, 'existing', taskCount);

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

  const { createSubtasks, createAnother, ...taskData } = await inquirer.prompt([
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
      name: 'createSubtasks',
      message: 'Deseja criar subtarefas para esta tarefa?',
      default: false
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

    // Se o usuário quiser criar subtarefas
    if (createSubtasks) {
      let createMoreSubtasks = true;
      while (createMoreSubtasks) {
        const { createMore, ...subtaskData } = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Título da subtarefa:',
            validate: (input) => input.length > 0 ? true : 'O título é obrigatório'
          },
          {
            type: 'input',
            name: 'description',
            message: 'Descrição da subtarefa:',
            default: ''
          },
          {
            type: 'input',
            name: 'dependencies',
            message: 'IDs das subtarefas dependentes (ex: 1.1, 1.2) ou tarefas principais (ex: 1, 2):',
            default: '',
            filter: (input) => {
              if (!input) return [];
              return input.split(',').map(id => id.trim());
            }
          },
          {
            type: 'confirm',
            name: 'createMore',
            message: 'Deseja criar mais uma subtarefa?',
            default: false
          }
        ]);

        // Adiciona a subtarefa
        const tasksData = await loadTasks();
        const taskIndex = tasksData.tasks.findIndex(t => t.id === newTask.id);

        if (taskIndex !== -1) {
          if (!tasksData.tasks[taskIndex].subtasks) {
            tasksData.tasks[taskIndex].subtasks = [];
          }

          const subtaskId = tasksData.tasks[taskIndex].subtasks.length + 1;
          const newSubtask = {
            id: subtaskId,
            title: subtaskData.title,
            description: subtaskData.description,
            status: 'pending',
            dependencies: subtaskData.dependencies,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          tasksData.tasks[taskIndex].subtasks.push(newSubtask);
          await saveTasks(tasksData);

          console.log(formatSuccess(`Subtarefa ${newTask.id}.${subtaskId} criada com sucesso!`));
        }

        createMoreSubtasks = createMore;
      }
    }

    // Se o usuário quiser criar outra tarefa
    if (createAnother) {
      await createTaskManually();
    } else {
      // Mostrar as tarefas atuais
      const tasksData = await loadTasks();
      console.log(formatTasksTable(tasksData.tasks, true));
    }
  } catch (error) {
    console.log(formatError(`Erro ao criar tarefa: ${error.message}`));
  }
}
