/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext, QuickPickItemKind } from 'vscode';
import * as vscode from 'vscode';

import { showQuickPick, showInputBox } from './basicInput';
import { multiStepInput } from './multiStepInput';
import { quickOpen } from './quickOpen';
import { createAuth0Child, getQlikSenseToken, getTenantID, createOauthIDPInQlikSense,createOAuthInQlikSense, MakeOauthTrusted, PublishOAuthInQlikSense } from './webcalls';
import { url } from 'inspector';
import * as fs from 'fs';
import { dirname } from 'path'; 



export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand('samples.quickInput', async () => {
		/* const _path = vscode.workspace.rootPath;
		if (_path) {
			const snippets = JSON.parse(fs.readFileSync(__dirname + '/../src/snippets/snippets.json').toString());
			function addSnippet(snippetType: string) {
				return snippets[snippetType].body.join('');
			}
			fs.mkdirSync(_path + '/src');
			fs.writeFileSync(_path + '/src/index.js', addSnippet('app'));
		}
   */
		
		//const h = await multiStepInput(context);'
		let QlikSenseURL: string | undefined = ''; 
		let QlikSenseToken: any | undefined = ''; 
		let QlikSenseClientID: string | undefined = '';
		let QlikSenseClientSecret: string | undefined = '';
		let QlikSenseAccessToken: string | undefined = '';
		let OAuthID: string | undefined = '';
		let OAuthSecret: string | undefined = '';
		let OAuthURL: string | undefined = '';
		let typeOfSenseAuth: any = '';
		let OAuth0App_clientID:String ='';
		let OAuth0App_clientSecret:String ='';

 
		//fs.copyFileSync(__dirname + '\snippets\jvi.html',dirname + '\src\jvi.html');
		
		
		while (OAuthID === '') {
			OAuthID = await showInputBox("Enter auth0 client_id", false);
			var t = '';
			
		}

		while (OAuthSecret === '') {
			OAuthSecret = await showInputBox("Enter auth0 client_secret", true);
			
		}


		while (OAuthURL === '') {
			OAuthURL = await showInputBox("auth0 audience URL in following format https://xxx.yyy.auth0.com/api/v2", false);
			
		} 

		while (QlikSenseURL === '') {
			QlikSenseURL = await showInputBox("Qlik Sense URL in following format https://tenantName.region.qlikcloud.com", false);
			
		}

		let OauthApp:any = await createAuth0Child(OAuthID, OAuthSecret, OAuthURL, QlikSenseURL);
		
		OAuth0App_clientID = JSON.parse(OauthApp).client_id;
		OAuth0App_clientSecret =JSON.parse(OauthApp).client_secret;

		typeOfSenseAuth = await showQuickPick("Are you using a developer key or Oauth client_id and secret for Qlik Sense?", ['Developer key', 'Oauth credentials']);

		if (typeOfSenseAuth !== "Developer key") {
			while (QlikSenseClientID === '') {
				QlikSenseClientID = await showInputBox("Enter Qlik Sense Oauth client_id", false);

			}

			while (QlikSenseClientSecret === '') {
				QlikSenseClientSecret = await showInputBox("Enter Qlik Sense Oauth client_secret", true);

			}

			QlikSenseToken = await getQlikSenseToken(QlikSenseClientID, QlikSenseClientSecret, QlikSenseURL);

		} else {

			while (QlikSenseToken === '') {
				QlikSenseToken = await showInputBox("Enter Qlik Sense developer key", true);

			}
		}

		let qlikTenantID:any = await getTenantID(QlikSenseToken, QlikSenseURL);


		let Oauth_record:any = await createOAuthInQlikSense(QlikSenseToken,QlikSenseURL);
		let Oauth_id = JSON.parse(Oauth_record).client_id;
		
		//await MakeOauthTrusted(QlikSenseToken,QlikSenseURL, Oauth_id);
		await PublishOAuthInQlikSense(QlikSenseToken, QlikSenseURL,Oauth_id);
		



		let QlikIDPSetup = await createOauthIDPInQlikSense(QlikSenseToken, QlikSenseURL, qlikTenantID, OAuthURL,
			 OAuth0App_clientID, OAuth0App_clientSecret);




	}));

	/* context.subscriptions.push(commands.registerCommand('samples.quickInput', async () => {
		const options: { [key: string]: (context: ExtensionContext) => Promise<void> } = {
			showQuickPick,
			showInputBox,
			multiStepInput,
			quickOpen,
		};
		const quickPick = window.createQuickPick();
		
		quickPick.items = Object.keys(options).map(label => ({ label }));
		
		  quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label](context)
					.catch(console.error);
			}
		}); 

		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();

	
	})); 
	*/
} 