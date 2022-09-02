// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as child_process from "child_process";
import * as stream from "stream";
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dartlocaldevice" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('dartlocaldevice.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from DartLocalDevice!');
	});

	// run flutter daemon
	context.subscriptions.push(vscode.commands.registerCommand('dartlocaldevice.startDaemon', (scriptName, commandName, workingDirectory) => {
		const process = child_process.spawn(scriptName, [commandName], { cwd: workingDirectory });
		console.log(`process started: ${scriptName} ${commandName}`);
		vscode.window.showInformationMessage(`process started: ${scriptName} ${commandName}`);

		const promise = new Promise((resolve, reject) => {
			process.stdout.on("data", (data: Buffer | string) => {
				const message = data.toString();
				resolve(message);
			});
			reject("Unable to start command");
		});
		return promise;
	}));

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
