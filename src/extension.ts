import * as child_process from "child_process";
import * as fs from "fs";
import * as vscode from 'vscode';
import * as path from 'path';

let daemonProcess: child_process.ChildProcess;
let logLocation: string;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('flutter-local-device-exposer.startDaemon', async ({script, command, workingDirectory}) => {
		const fileName = vscode.workspace.getConfiguration("flutter-local-device-exposer").get<string>("logFile");
		if (fileName) {
			logLocation = fileName;
		}

		daemonProcess = child_process.spawn(script, [command], { cwd: workingDirectory, shell: true, detached: true });
		maybeLogLine(`process started: ${script} ${command} ${daemonProcess.pid}`);

		const promise = new Promise<string>((resolve, reject) => {
			if (daemonProcess === null) {
				reject("Process was not started.");
			}
			// @ts-ignore: Object is possibly 'null'.
			daemonProcess.stdout.on("data", (data: Buffer | string) => {
				const message = data.toString();
				maybeLogLine(message);
				resolve(message);
			});
		});
		const result = await promise;
		return result;
	}));

	// TODO (helin24): Remove this when deactivate is fixed.
	context.subscriptions.push(vscode.commands.registerCommand('flutter-local-device-exposer.killDaemon', async () => {
		deactivate();
	}));
}

// this method is called when your extension is deactivated
export async function deactivate(): Promise<void> {
	maybeLogLine("Deactivating");
	try {
		maybeLogLine(`daemon process id: ${daemonProcess.pid} killed? ${daemonProcess.killed}`);

		const processId = daemonProcess.pid!;
		maybeLogLine(`found processId ${processId}`);
	
		const result = process.kill(-processId, "SIGINT");
		maybeLogLine(`after process killed, result: ${result}`);
	} catch (e) {
		maybeLogLine(`failure: ${e}`);
	}
}

function maybeLogLine(content: string): void {
	const time = new Date().toLocaleString();
	if (logLocation !== undefined) {
		fs.appendFileSync(logLocation, `[extension][${process.pid}]${time}: ${content}\n`);
	}
}