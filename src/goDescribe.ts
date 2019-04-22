'use strict';

import vscode = require('vscode');
import cp = require('child_process');
import path = require('path');
import {
	byteOffsetAt,
	getBinPath,
	canonicalizeGOPATHPrefix,
	getWorkspaceFolderPath,
	killTree
} from './util';
import { promptForMissingTool } from './goInstallTools';
import { getToolsEnvVars } from './util';

const outputChannel = vscode.window.createOutputChannel('Go Guru');

export function descCursor() {
	const cursor = vscode.window.activeTextEditor.selection;
	const document = vscode.window.activeTextEditor.document;
	runGoGuru(cursor.start, document);
}

function runGoGuru(position: vscode.Position, document: vscode.TextDocument) {
	const filename = canonicalizeGOPATHPrefix(document.fileName);
	const cwd = path.dirname(filename);
	const offset = byteOffsetAt(document, position);
	const goGuru = getBinPath('guru');
	const buildTags = vscode.workspace.getConfiguration('go', document.uri)[
		'buildTags'
	];
	const args = buildTags ? ['-tags', buildTags] : [];
	args.push('describe', `${filename}:#${offset.toString()}`);
	const env = getToolsEnvVars();
	const guruProcess = cp.execFile(
		goGuru,
		args,
		{ env },
		(err, stdout, stderr) => {
			outputChannel.clear();
			err ? outputChannel.append(stderr) : outputChannel.append(stdout);
			outputChannel.show();
		}
	);
}
