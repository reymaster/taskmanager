/**
 * Implementação do comando 'init' para o TaskManager
 *
 * Este módulo é responsável por inicializar o TaskManager em um projeto,
 * criando a estrutura de diretórios e arquivos necessários sem modificar
 * o projeto existente.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { existsSync } from 'fs';
import { createInitialConfig } from '../utils/config.js';
import { generateAgentInstructions } from '../utils/ai/index.js';
import fsExtra from 'fs-extra';

// Obter o diretório atual do módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Inicializa o TaskManager no diretório atual
 * @param {Object} options - Opções de linha de comando
 */
export async function initializeTaskManager(options = {}) {
  console.log(chalk.cyan.bold('\n📋 Inicializando TaskManager...\n'));
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
  console.log('import.meta.url:', import.meta.url);

  // Verifica se o TaskManager já está inicializado
  const taskmanagerDir = path.join(process.cwd(), '.taskmanager');
  if (existsSync(taskmanagerDir)) {
    if (!options.yes) {
      const { reinitialize } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'reinitialize',
          message: 'TaskManager já está inicializado neste diretório. Deseja reinicializar?',
          default: false
        }
      ]);

      if (!reinitialize) {
        console.log(chalk.yellow('Inicialização cancelada.'));
        return;
      }
    }
  }

  try {
    console.log('ETAPA 1: Determinando tipo de projeto...');
    // Determina o tipo de projeto (novo ou existente)
    const projectType = await determineProjectType(options);

    console.log('ETAPA 2: Criando estrutura do TaskManager...');
    // Cria a estrutura do TaskManager
    await createTaskManagerStructure(taskmanagerDir, projectType);

    console.log('ETAPA 3: Configurando projeto...');
    // Configura o projeto com base no tipo
    await configureProject(projectType, taskmanagerDir);

    console.log('ETAPA 4: Gerando instruções para Copilot...');
    // Gera instruções para o Copilot em .github (padrão)
    // Para outros agentes/editores, basta alterar o destino e o nome do arquivo
    try {
      await generateAgentInstructions('copilot', '.github');
      console.log('Instruções para Copilot geradas com sucesso.');
    } catch (error) {
      console.log(chalk.yellow(`Aviso: Não foi possível gerar instruções para Copilot: ${error.message}`));
    }

    console.log('ETAPA 5: Copiando regras do cursor...');
    // Copia as regras do cursor para .cursor/rules (sem sobrescrever existentes)
    try {
      const cursorRulesSrc = path.join(__dirname, '..', 'templates', 'editor', 'rules', 'cursor');
      console.log('Caminho absoluto para regras:', cursorRulesSrc);
      console.log('Este diretório existe?', existsSync(cursorRulesSrc) ? 'SIM' : 'NÃO');

      const cursorRulesDest = path.resolve('.cursor/rules');
      console.log('Destino das regras:', cursorRulesDest);
      console.log('Diretório de destino existe?', existsSync(cursorRulesDest) ? 'SIM' : 'NÃO');

      console.log('Criando diretório de destino se não existir...');
      await fsExtra.ensureDir(cursorRulesDest);
      console.log('Diretório de destino criado/verificado.');

      if (await fsExtra.pathExists(cursorRulesSrc)) {
        console.log('Diretório de origem existe, lendo arquivos...');
        const ruleFiles = await fsExtra.readdir(cursorRulesSrc);
        console.log('Arquivos encontrados:', ruleFiles);

        for (const file of ruleFiles) {
          if (file.endsWith('.mdc')) {
            const destFile = path.join(cursorRulesDest, file);
            console.log(`Verificando se destino existe para ${file}:`, await fsExtra.pathExists(destFile) ? 'SIM' : 'NÃO');

            if (!await fsExtra.pathExists(destFile)) {
              console.log(`Copiando ${file}...`);
              await fsExtra.copyFile(path.join(cursorRulesSrc, file), destFile);
              console.log(`${file} copiado com sucesso.`);
            } else {
              console.log(`${file} já existe no destino, ignorando.`);
            }
          }
        }
        console.log(chalk.green('✅ Regras do Cursor copiadas com sucesso.'));
      } else {
        console.log(chalk.yellow('⚠️ Diretório de regras do Cursor não encontrado. Ignorando esta etapa.'));
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Não foi possível copiar as regras do Cursor: ${error.message}`));
      console.log(chalk.yellow('Stacktrace:'), error.stack);
      console.log(chalk.yellow('Esta etapa não é crítica e o TaskManager continuará funcionando normalmente.'));
    }

    console.log(chalk.green.bold('\n✅ TaskManager inicializado com sucesso!'));
    console.log(chalk.blue(`\nPara começar a gerenciar tarefas, experimente os seguintes comandos:`));
    console.log(chalk.cyan(`\n  - taskmanager create`));
    console.log(chalk.cyan(`  - taskmanager list`));
    console.log(chalk.cyan(`  - taskmanager next\n`));
  } catch (error) {
    console.log(chalk.red(`\n❌ Erro ao inicializar TaskManager: ${error.message}`));
    console.log(chalk.red('Stacktrace completo:'));
    console.log(error.stack);
    throw error;
  }
}

/**
 * Determina se o projeto é novo ou existente
 * @param {Object} options - Opções de linha de comando
 * @returns {String} Tipo do projeto ('new' ou 'existing')
 */
async function determineProjectType(options) {
  // Se a opção --yes foi fornecida, usa o valor padrão (projeto existente)
  if (options.yes) {
    return 'existing';
  }

  // Verifica se existem arquivos no diretório além de .git, .taskmanager, etc.
  const currentDir = process.cwd();
  const files = await fs.readdir(currentDir);

  // Filtra arquivos e diretórios que não indicam um projeto existente
  const nonProjectFiles = [
    '.git', '.gitignore', '.taskmanager', '.DS_Store', 'node_modules',
    'README.md', 'LICENSE', 'package.json', 'package-lock.json', 'yarn.lock'
  ];

  const projectFiles = files.filter(file => !nonProjectFiles.includes(file));

  // Determina sugestão padrão com base nos arquivos existentes
  const defaultType = projectFiles.length > 0 ? 'existing' : 'new';

  // Pergunta ao usuário para confirmar
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'Qual tipo de projeto você está trabalhando?',
      choices: [
        { name: '🆕 Novo projeto (ainda não iniciado)', value: 'new' },
        { name: '🔄 Projeto existente (já iniciado)', value: 'existing' }
      ],
      default: defaultType
    }
  ]);

  return projectType;
}

/**
 * Cria a estrutura de diretórios e arquivos do TaskManager
 * @param {String} taskmanagerDir - Caminho para o diretório .taskmanager
 * @param {String} projectType - Tipo do projeto ('new' ou 'existing')
 */
async function createTaskManagerStructure(taskmanagerDir, projectType) {
  const spinner = ora('Criando estrutura do TaskManager...').start();

  try {
    // Cria o diretório .taskmanager se não existir
    await fs.mkdir(taskmanagerDir, { recursive: true });

    // Cria os subdiretórios
    await fs.mkdir(path.join(taskmanagerDir, 'tasks'), { recursive: true });
    await fs.mkdir(path.join(taskmanagerDir, 'scripts'), { recursive: true });
    await fs.mkdir(path.join(taskmanagerDir, 'templates'), { recursive: true });

    // Cria o arquivo de tarefas inicial
    const initialTasks = {
      tasks: [],
      metadata: {
        projectType,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };

    await fs.writeFile(
      path.join(taskmanagerDir, 'tasks.json'),
      JSON.stringify(initialTasks, null, 2)
    );

    // Cria o arquivo .gitignore dentro de .taskmanager para arquivos temporários
    await fs.writeFile(
      path.join(taskmanagerDir, '.gitignore'),
      '# Arquivos temporários\n*.tmp\n*.temp\n'
    );

    // Cria o arquivo .env.example para configuração de IA
    // Lê do template
    const templatePath = path.join(__dirname, '..', 'templates', 'env.example');
    let envExampleContent;

    try {
      envExampleContent = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      // Se não conseguir ler do template, usa um conteúdo padrão
      envExampleContent = `# Configuração de Integrações com IA
# Remova o sufixo .example deste arquivo e preencha suas chaves

# OpenAI (para geração de tarefas usando GPT-4/GPT-3.5)
# OPENAI_API_KEY=sk-...

# Anthropic (para geração de tarefas usando Claude)
# ANTHROPIC_API_KEY=sk-ant-...

# Hugging Face (para geração de tarefas usando modelos open source)
# HUGGINGFACE_API_KEY=hf_...

# Configurações gerais
# Defina como "true" para habilitar IA na geração de tarefas
AI_ENABLED=false

# Provedor de IA padrão (openai, anthropic, huggingface)
AI_PROVIDER=openai

# Modelo de IA padrão
# - Para OpenAI: gpt-4, gpt-3.5-turbo
# - Para Anthropic: claude-3-opus-20240229, claude-3-sonnet-20240229, claude-3-haiku-20240307
# - Para Hugging Face: mistralai/Mistral-7B-Instruct-v0.2
AI_MODEL=gpt-4`;
    }

    await fs.writeFile(
      path.join(taskmanagerDir, '.env.example'),
      envExampleContent
    );

    spinner.succeed('Estrutura do TaskManager criada com sucesso');
  } catch (error) {
    spinner.fail(`Erro ao criar estrutura do TaskManager: ${error.message}`);
    throw error;
  }
}

/**
 * Configura o projeto com base no tipo selecionado
 * @param {String} projectType - Tipo do projeto ('new' ou 'existing')
 * @param {String} taskmanagerDir - Caminho para o diretório .taskmanager
 */
async function configureProject(projectType, taskmanagerDir) {
  if (projectType === 'new') {
    await configureNewProject(taskmanagerDir);
  } else {
    await configureExistingProject(taskmanagerDir);
  }

  // Cria o arquivo de configuração
  const config = await createInitialConfig(projectType);
  await fs.writeFile(
    path.join(taskmanagerDir, 'config.json'),
    JSON.stringify(config, null, 2)
  );
}

/**
 * Configura um novo projeto
 * @param {String} taskmanagerDir - Caminho para o diretório .taskmanager
 */
async function configureNewProject(taskmanagerDir) {
  const spinner = ora('Configurando novo projeto...').start();

  try {
    // Coleta informações sobre o novo projeto
    spinner.stop();

    const { projectName, projectDescription, projectTech } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Nome do projeto:',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'projectDescription',
        message: 'Descrição do projeto:',
        default: 'Um novo projeto'
      },
      {
        type: 'checkbox',
        name: 'projectTech',
        message: 'Selecione as tecnologias principais:',
        choices: [
          { name: 'JavaScript', value: 'javascript' },
          { name: 'TypeScript', value: 'typescript' },
          { name: 'React', value: 'react' },
          { name: 'Node.js', value: 'nodejs' },
          { name: 'Express', value: 'express' },
          { name: 'Vue.js', value: 'vue' },
          { name: 'Angular', value: 'angular' },
          { name: 'Python', value: 'python' },
          { name: 'Django', value: 'django' },
          { name: 'Flask', value: 'flask' },
          { name: 'Java', value: 'java' },
          { name: 'Spring', value: 'spring' },
          { name: 'C#', value: 'csharp' },
          { name: '.NET', value: 'dotnet' }
        ]
      }
    ]);

    // Atualiza o arquivo de metadados do projeto
    const projectMetadata = {
      type: 'new',
      name: projectName,
      description: projectDescription,
      technologies: projectTech,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(taskmanagerDir, 'project-metadata.json'),
      JSON.stringify(projectMetadata, null, 2)
    );

    spinner.succeed('Projeto configurado com sucesso');
  } catch (error) {
    spinner.fail(`Erro ao configurar projeto: ${error.message}`);
    throw error;
  }
}

/**
 * Configura um projeto existente
 * @param {String} taskmanagerDir - Caminho para o diretório .taskmanager
 */
async function configureExistingProject(taskmanagerDir) {
  const spinner = ora('Configurando projeto existente...').start();

  try {
    // Coleta informações sobre o projeto existente
    spinner.stop();

    const { projectName, projectDescription, scanProject } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Nome do projeto:',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'projectDescription',
        message: 'Descrição do projeto:',
        default: 'Projeto existente'
      },
      {
        type: 'confirm',
        name: 'scanProject',
        message: 'Deseja escanear a estrutura do projeto para identificar tecnologias?',
        default: true
      }
    ]);

    let technologies = [];

    if (scanProject) {
      spinner.text = 'Escaneando estrutura do projeto...';
      spinner.start();

      // Aqui implementaríamos uma lógica para escanear o projeto
      // Por enquanto, vamos simular uma detecção básica

      const hasPackageJson = existsSync(path.join(process.cwd(), 'package.json'));
      const hasTsConfig = existsSync(path.join(process.cwd(), 'tsconfig.json'));
      const hasGemfile = existsSync(path.join(process.cwd(), 'Gemfile'));
      const hasRequirements = existsSync(path.join(process.cwd(), 'requirements.txt'));
      const hasPom = existsSync(path.join(process.cwd(), 'pom.xml'));
      const hasGradleFile = existsSync(path.join(process.cwd(), 'build.gradle'));
      const hasCsproj = existsSync(path.join(process.cwd(), '*.csproj'));

      if (hasPackageJson) technologies.push('javascript', 'nodejs');
      if (hasTsConfig) technologies.push('typescript');
      if (hasGemfile) technologies.push('ruby');
      if (hasRequirements) technologies.push('python');
      if (hasPom || hasGradleFile) technologies.push('java');
      if (hasCsproj) technologies.push('csharp', 'dotnet');

      spinner.succeed('Projeto escaneado com sucesso');

      // Permite ao usuário corrigir as tecnologias detectadas
      const { confirmTechnologies, selectedTech } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmTechnologies',
          message: `Tecnologias detectadas: ${technologies.join(', ') || 'Nenhuma'}. Isso está correto?`,
          default: true
        },
        {
          type: 'checkbox',
          name: 'selectedTech',
          message: 'Selecione as tecnologias utilizadas no projeto:',
          choices: [
            { name: 'JavaScript', value: 'javascript', checked: technologies.includes('javascript') },
            { name: 'TypeScript', value: 'typescript', checked: technologies.includes('typescript') },
            { name: 'React', value: 'react', checked: technologies.includes('react') },
            { name: 'Node.js', value: 'nodejs', checked: technologies.includes('nodejs') },
            { name: 'Express', value: 'express', checked: technologies.includes('express') },
            { name: 'Vue.js', value: 'vue', checked: technologies.includes('vue') },
            { name: 'Angular', value: 'angular', checked: technologies.includes('angular') },
            { name: 'Python', value: 'python', checked: technologies.includes('python') },
            { name: 'Django', value: 'django', checked: technologies.includes('django') },
            { name: 'Flask', value: 'flask', checked: technologies.includes('flask') },
            { name: 'Java', value: 'java', checked: technologies.includes('java') },
            { name: 'Spring', value: 'spring', checked: technologies.includes('spring') },
            { name: 'C#', value: 'csharp', checked: technologies.includes('csharp') },
            { name: '.NET', value: 'dotnet', checked: technologies.includes('dotnet') }
          ],
          when: (answers) => !answers.confirmTechnologies
        }
      ]);

      technologies = confirmTechnologies ? technologies : selectedTech;
    } else {
      // Se o usuário optar por não escanear, pergunta diretamente
      const { selectedTech } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedTech',
          message: 'Selecione as tecnologias utilizadas no projeto:',
          choices: [
            { name: 'JavaScript', value: 'javascript' },
            { name: 'TypeScript', value: 'typescript' },
            { name: 'React', value: 'react' },
            { name: 'Node.js', value: 'nodejs' },
            { name: 'Express', value: 'express' },
            { name: 'Vue.js', value: 'vue' },
            { name: 'Angular', value: 'angular' },
            { name: 'Python', value: 'python' },
            { name: 'Django', value: 'django' },
            { name: 'Flask', value: 'flask' },
            { name: 'Java', value: 'java' },
            { name: 'Spring', value: 'spring' },
            { name: 'C#', value: 'csharp' },
            { name: '.NET', value: 'dotnet' }
          ]
        }
      ]);

      technologies = selectedTech;
    }

    // Atualiza o arquivo de metadados do projeto
    const projectMetadata = {
      type: 'existing',
      name: projectName,
      description: projectDescription,
      technologies: technologies,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(taskmanagerDir, 'project-metadata.json'),
      JSON.stringify(projectMetadata, null, 2)
    );

    spinner.succeed('Projeto configurado com sucesso');
  } catch (error) {
    spinner.fail(`Erro ao configurar projeto: ${error.message}`);
    throw error;
  }
}
