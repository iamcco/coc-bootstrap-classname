import { readFile } from 'fs';
import { join } from 'path';
import { ExtensionContext, languages, workspace } from 'coc.nvim';
import { CompletionItem, InsertTextFormat } from 'vscode-languageserver-protocol';

const preLinePattern = /class(Name)?\s*=\s*['"]([^'"]*)$/;
let classNames: string[];

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('bootstrap-classname');
  const filetypes = config.get<string[]>('filetypes', ['html']);
  context.subscriptions.push(
    languages.registerCompletionItemProvider('bootstrap-classname', 'bscn', filetypes, {
      async provideCompletionItems(document, position) {
        if (!classNames) {
          await new Promise(resolve => {
            readFile(join(context.extensionPath, 'classNames.json'), { encoding: 'utf-8' }, (err, data) => {
              if (err) {
                workspace.showMessage('read classNames fail');
                return resolve();
              }
              try {
                classNames = JSON.parse(data);
                resolve();
              } catch (error) {
                workspace.showMessage('parse classNames fail');
                classNames = [];
                resolve();
              }
            });
          });
        }
        const preLine = document.getText({
          start: {
            line: position.line,
            character: 0,
          },
          end: position,
        });
        const m = preLine.match(preLinePattern);
        if (!m) {
          return [];
        }
        const existNames = (m[2] || '').split(' ');
        return classNames
          .filter(cn => existNames.indexOf(cn) === -1)
          .map<CompletionItem>(cn => {
            return {
              label: cn,
              insertText: cn,
              insertTextFormat: InsertTextFormat.PlainText,
            };
          });
      },
    }),
  );
}
