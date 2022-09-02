import * as child_process from "child_process";
import * as vscode from 'vscode';

let process: child_process.ChildProcess;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('dartlocaldevice.startDaemon', async (scriptName, commandName, workingDirectory) => {
		process = child_process.spawn(scriptName, [commandName], { cwd: workingDirectory });
		console.log(`process started: ${scriptName} ${commandName}`);
		vscode.window.showInformationMessage(`process started: ${scriptName} ${commandName}`);

		const promise = new Promise<string>((resolve, reject) => {
			if (process === null) {
				reject("Process was not started.");
			}
			// @ts-ignore: Object is possibly 'null'.
			process.stdout.on("data", (data: Buffer | string) => {
				const message = data.toString();
				resolve(message);
			});
		});
		const result = await promise;
		return result;
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	process.kill("SIGINT");
}
