"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let currentLanguage = 'en'; // Padrão para inglês
let i18nFileName = 'i18n';
let programmingLanguage = 'javascript'; // Padrão para JavaScript
function activate(context) {
    const config = vscode.workspace.getConfiguration('i18nCollector');
    i18nFileName = config.get('fileName', 'i18n');
    const slugFormat = config.get('slugFormat', 'lowercase_underscore');
    let disposableSetLanguage = vscode.commands.registerCommand('i18n-collector.setLanguage', async () => {
        const languages = ['en', 'es', 'fr', 'de', 'pt', 'it'];
        const selectedLanguage = await vscode.window.showQuickPick(languages, { placeHolder: 'Selecione o idioma para i18n' });
        if (selectedLanguage) {
            currentLanguage = selectedLanguage;
            vscode.window.showInformationMessage(`Idioma definido para ${currentLanguage}`);
        }
    });
    let disposableSetProgrammingLanguage = vscode.commands.registerCommand('i18n-collector.setProgrammingLanguage', async () => {
        const languages = ['php', 'javascript', 'laravel', 'vuejs', 'react'];
        const selectedLanguage = await vscode.window.showQuickPick(languages, { placeHolder: 'Selecione a linguagem de programação' });
        if (selectedLanguage) {
            programmingLanguage = selectedLanguage;
            vscode.window.showInformationMessage(`Linguagem de programação definida para ${programmingLanguage}`);
        }
    });
    let disposableCollectTexts = vscode.commands.registerCommand('i18n-collector.collectTexts', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Abra um arquivo primeiro para coletar textos.');
            return;
        }
        const document = editor.document;
        const selections = editor.selections;
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showInformationMessage('Abra uma pasta de trabalho primeiro.');
            return;
        }
        const i18nFilePath = path.join(workspaceFolder.uri.fsPath, `${i18nFileName}.${currentLanguage}.json`);
        let i18nContent = '';
        if (fs.existsSync(i18nFilePath)) {
            i18nContent = fs.readFileSync(i18nFilePath, 'utf-8');
        }
        const i18nEntries = i18nContent ? JSON.parse(i18nContent) : {};
        editor.edit(editBuilder => {
            selections.forEach(selection => {
                const text = document.getText(selection).trim();
                let slug = generateSlug(text, i18nEntries, slugFormat);
                if (Object.values(i18nEntries).includes(text)) {
                    // Encontrar a chave existente para o texto
                    const existingKey = Object.keys(i18nEntries).find(key => i18nEntries[key] === text);
                    if (existingKey) {
                        vscode.window.showWarningMessage(`Texto "${text}" é duplicado. Usando a chave existente: "${existingKey}".`);
                        editBuilder.replace(selection, getFormattedKey(existingKey));
                        return; // Pular a adição de uma nova chave
                    }
                }
                // Se a chave não existir, adicionar o texto e criar uma nova chave
                i18nEntries[slug] = text;
                editBuilder.replace(selection, getFormattedKey(slug));
            });
        });
        fs.writeFileSync(i18nFilePath, JSON.stringify(i18nEntries, null, 2), 'utf-8');
        vscode.window.showInformationMessage('Textos coletados e substituídos com sucesso!');
    });
    let disposableOpenI18nFile = vscode.commands.registerCommand('i18n-collector.openI18nFile', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showInformationMessage('Abra uma pasta de trabalho primeiro.');
            return;
        }
        const i18nFilePath = path.join(workspaceFolder.uri.fsPath, `${i18nFileName}.${currentLanguage}.json`);
        const document = await vscode.workspace.openTextDocument(i18nFilePath);
        await vscode.window.showTextDocument(document);
    });
    context.subscriptions.push(disposableSetLanguage, disposableSetProgrammingLanguage, disposableCollectTexts, disposableOpenI18nFile);
}
function deactivate() { }
function generateSlug(text, i18nEntries, format) {
    let baseSlug;
    switch (format) {
        case 'camelCase':
            baseSlug = text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => index === 0 ? match.toLowerCase() : match.toUpperCase()).replace(/\s+/g, '');
            break;
        case 'PascalCase':
            baseSlug = text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => match.toUpperCase()).replace(/\s+/g, '');
            break;
        case 'lowercase_underscore':
        default:
            baseSlug = text.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
    }
    let slug = baseSlug;
    let counter = 1;
    while (Object.keys(i18nEntries).includes(slug)) {
        slug = `${baseSlug}_${counter}`;
        counter++;
    }
    return slug;
}
function getFormattedKey(slug) {
    switch (programmingLanguage) {
        case 'php':
            return `__('${slug}')`;
        case 'laravel':
            return `{{ __('${slug}') }}`;
        case 'vuejs':
            return `{{ $t('${slug}') }}`;
        case 'react':
            return `{t('${slug}')}`;
        case 'javascript':
        default:
            return `t('${slug}')`;
    }
}
//# sourceMappingURL=extension.js.map