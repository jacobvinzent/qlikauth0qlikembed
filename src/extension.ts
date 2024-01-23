/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext, QuickPickItemKind } from 'vscode';
import * as vscode from 'vscode';

import { showQuickPick, showInputBox } from './basicInput';
import { createAuth0Child, getQlikSenseToken, getTenantID, createOauthIDPInQlikSense, createOAuthInQlikSense, MakeOauthTrusted, PublishOAuthInQlikSense, cleanOAuthURL } from './webcalls';
import { url } from 'inspector';
import * as fs from 'fs';
import * as path from 'path';
import { changeVariables, copyFile_, copyFiles_, readAndCreateDirs, readDir } from './fileCopy';
import { rejects } from 'assert';

 

export function activate(context: ExtensionContext) {
	
	

	const _path = vscode.workspace.workspaceFolders;

	//if(typeof _path !== 'undefined') {

	//const replaceObject:object = {};
	type replaceObject_type = { [key: string]: string };
	const replaceObject: replaceObject_type = {};
	var _pathDirect = "";
	if (_path !== undefined && _path[0] !== null) {
		_pathDirect = _path[0].uri.path;
	}
	context.subscriptions.push(commands.registerCommand('samples.quickInput', async () => {

		if (typeof _path === 'undefined') {
			
				window.showInformationMessage('Please open a folder before running the extension',);


		} else {
			if (_pathDirect.startsWith("/")) { _pathDirect = _pathDirect.substring(1, _pathDirect.length); };
			

/* 			let QlikSenseURL: string | undefined = '';
			let QlikSenseToken: any | undefined = '';
			let QlikSenseClientID: string | undefined = '';
			let QlikSenseClientSecret: string | undefined = '';
			let QlikSenseAccessToken: string | undefined = '';
			let OAuthID: string | undefined = '';
			let OAuthSecret: string | undefined = '';
			let OAuthURL: string | undefined = '';
			let typeOfSenseAuth: any = '';
			let OAuth0App_clientID: string = '';
			let OAuth0App_clientSecret: string = '';
			let QlikAppID: string = '';
			let QlikSheet: string = '';
			let QlikObject: string = '';
 */

			
			let QlikSenseURL: string  = '';
			let QlikSenseToken: any  = '';
			let QlikSenseClientID: string = '';
			let QlikSenseClientSecret: string  = '';
			let QlikSenseAccessToken: string  = '';
			let OAuthID: string  = '';
			let OAuthSecret: string  = '';
			let OAuthURL: string  = '';
			let typeOfSenseAuth: any = '';
			let OAuth0App_clientID: string = '';
			let OAuth0App_clientSecret: string = '';
			let QlikAppID: string = '';
			let QlikSheet: string = '';
			let QlikObject: string = '';

			
			if(fs.existsSync(_pathDirect + '/config.json')) {
				var jsonFile = await vscode.workspace.fs.readFile(vscode.Uri.file(_pathDirect + '/config.json'));
				var json:any = JSON.parse(jsonFile.toString());
				
				var properties =  [
					"Use Oauth client_id and secret"
				];

				var res = testForEmptyJSONValue(properties,json);
				if(res !== ""){
					showError(res);
					return;
				} else {
					
				properties =  [
					"auth0 client_id",
					"auth0 client_secret",
					"auth0 audience URL",
					"Qlik Cloud URL",
					"Qlik Sense App Id",
					"Qlik Sense sheet Id",
					"Qlik Sense object Id"
				];
					if(json['Use Oauth client_id and secret'] === true){
						properties.push("Qlik Sense Oauth client_id");
						properties.push("Qlik Sense Oauth client_secret");
						
					} else {
						properties.push("Qlik Sense developer key");
					}
				}


				var res = testForEmptyJSONValue(properties,json);
				if(res !== ""){
					showError(res);
					return;
				} else {
					QlikSenseURL = json['Qlik Cloud URL'];

					if(json['Use Oauth client_id and secret'] === true){
						QlikSenseClientID =  json["Qlik Sense Oauth client_id"];
						QlikSenseClientSecret =  json["Qlik Sense Oauth client_secret"];
						typeOfSenseAuth = "Use Oauth client_id and secret";
						
					} else {
						QlikSenseToken =  json["Qlik Sense developer key"];
						typeOfSenseAuth = "Developer key";

					}

					OAuthID =json['auth0 client_id'];
					OAuthSecret = json['auth0 client_secret'];
					OAuthURL = json['auth0 audience URL'];
					QlikAppID = json["Qlik Sense App Id"];
					QlikSheet = json["Qlik Sense sheet Id"];
					QlikObject = json["Qlik Sense object Id"];

				}

			}

			

			while (OAuthID === '') {
				OAuthID = await showInputBox("Enter auth0 client_id", false);


			}

			while (OAuthSecret === '') {
				OAuthSecret = await showInputBox("Enter auth0 client_secret", true);

			}


			while (OAuthURL === '') {
				OAuthURL = await showInputBox("auth0 audience URL in following format https://xxx.yyy.auth0.com/api/v2", false);

			}

			OAuthURL = cleanOAuthURL(OAuthURL, 'auth0.com').toString();
			replaceObject["<replace_auth0_domain>"] = OAuthURL;

			while (QlikSenseURL === '') {
				QlikSenseURL = await showInputBox("Qlik Cloud URL in following format https://tenantName.region.qlikcloud.com", false);

			}

			replaceObject["<replace_URL_From_Qlik>"] = QlikSenseURL;

			let OauthApp: any = await createAuth0Child(OAuthID, OAuthSecret, OAuthURL, QlikSenseURL);

			OAuth0App_clientID = JSON.parse(OauthApp).client_id;
			OAuth0App_clientSecret = JSON.parse(OauthApp).client_secret;


			replaceObject["<replace_auth0_clientID>"] = OAuth0App_clientID;

			if(typeOfSenseAuth === "") {
				typeOfSenseAuth = await showQuickPick("Are you using a developer key or Oauth client_id and secret for Qlik Sense?", ['Developer key', 'Oauth credentials']);
			}

			if (typeOfSenseAuth !== "Developer key") {
				while (QlikSenseClientID === '') {
					QlikSenseClientID = await showInputBox("Enter Qlik Sense Oauth client_id", false);

				}

				while (QlikSenseClientSecret === '') {
					QlikSenseClientSecret = await showInputBox("Enter Qlik Sense Oauth client_secret", true);

				}

				QlikSenseToken = await getQlikSenseToken(QlikSenseClientID, QlikSenseClientSecret, QlikSenseURL);
				QlikSenseToken = JSON.parse(QlikSenseToken).access_token;


			} else {

				while (QlikSenseToken === '') {
					QlikSenseToken = await showInputBox("Enter Qlik Sense developer key", true);
				}
			}

			while (QlikAppID === '') {
				QlikAppID = await showInputBox("Enter Qlik Sense App Id", false);

			}

			while (QlikSheet === '') {
				QlikSheet = await showInputBox("Enter Qlik Sense sheet Id", false);

			}

			while (QlikObject === '') {
				QlikObject = await showInputBox("Enter Qlik Sense object Id", false);

			}

			let qlikTenantID: any = await getTenantID(QlikSenseToken, QlikSenseURL);
			let Oauth_record: any = await createOAuthInQlikSense(QlikSenseToken, QlikSenseURL);
			let Oauth_id = JSON.parse(Oauth_record).client_id;

			replaceObject["<replace_OAUTH_clientID_From_Qlik>"] = Oauth_id;


			await PublishOAuthInQlikSense(QlikSenseToken, QlikSenseURL, Oauth_id);


			let QlikIDPSetup:any = await createOauthIDPInQlikSense(QlikSenseToken, QlikSenseURL, qlikTenantID, OAuthURL,
				OAuth0App_clientID, OAuth0App_clientSecret);

			

			//let QlikIDPValidateURL =  QlikSenseURL + '/console/idp-result/' + JSON.parse(QlikIDPSetup.toString()).id;
			let QlikIDPValidateURL = QlikSenseURL + '/login?returnto=/console/idp-result/&idp_test=true&idp_id=' + JSON.parse(QlikIDPSetup.toString()).id;
			replaceObject["<replace_APPID_From_Qlik>"] = QlikAppID;
			replaceObject["<replace_SHEETID_From_Qlik>"] = QlikSheet;
			replaceObject["<replace_OBJECTID_From_Qlik>"] = QlikObject;

			await readAndCreateDirs(path.join(__dirname, '..', 'assets'), _pathDirect);
			await copyFiles_(path.join(__dirname, '..', 'assets'), _pathDirect);


			let filesToChange: string[] = ['index.html', 'auth_config.json'];
			await changeVariables(filesToChange, _pathDirect, JSON.stringify(replaceObject));

			var term = vscode.window.createTerminal('Qlik');
			term.show();
	 		term.sendText('npm install');
			term.sendText('npm start run');

			vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(QlikIDPValidateURL));

			function testForEmptyJSONValue(properties:Array<string>, JSON:any) {
				let returnVal = "";
				properties.some(r => {
					if(!JSON.hasOwnProperty(r) || JSON[r].toString().trim() === "") {
						returnVal=  r + " doesn't have a valid value in config.json";
						return true;
					}
				});

				return returnVal;
				
				
			}

			function showError(error:string) {

				window.showInformationMessage(error);
				return;
				//throw new Error('cancelled');
			}

		}
	}));
} 