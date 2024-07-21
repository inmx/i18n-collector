import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let currentLanguage = 'pt';  // Padrão para inglês
let i18nFileName = 'i18n';
let programmingLanguage = 'vuejs';  // Padrão para JavaScript

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('i18nCollector');
    i18nFileName = config.get<string>('fileName', 'i18n');
    const slugFormat = config.get<string>('slugFormat', 'lowercase_underscore');

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

        const i18nEntries: { [key: string]: string } = i18nContent ? JSON.parse(i18nContent) : {};

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

export function deactivate() {}

function generateSlug(text: string, i18nEntries: { [key: string]: string }, format: string): string {
    let baseSlug: string;

    switch (format) {
        case 'camelCase':
            baseSlug = text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
                index === 0 ? match.toLowerCase() : match.toUpperCase()
            ).replace(/\s+/g, '');
            break;
        case 'PascalCase':
            baseSlug = text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) =>
                match.toUpperCase()
            ).replace(/\s+/g, '');
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

function getFormattedKey(slug: string): string {
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
