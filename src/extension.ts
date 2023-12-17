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



export function activate(context: ExtensionContext) {

	const _path = vscode.workspace.workspaceFolders;
	//const replaceObject:object = {};
	type replaceObject_type = { [key: string]: string };
	const replaceObject: replaceObject_type = {};
	var _pathDirect = "";
	if (_path !== undefined && _path[0] !== null) {
		_pathDirect = _path[0].uri.path;
	}
	context.subscriptions.push(commands.registerCommand('samples.quickInput', async () => {
		//let files:string[] = await readDir(path.join(__dirname,'..','src','assets','html'));
		if (_pathDirect.startsWith("/")) { _pathDirect = _pathDirect.substring(1, _pathDirect.length); };
		await readAndCreateDirs(path.join(__dirname, '..', 'assets'), _pathDirect);
		await copyFiles_(path.join(__dirname, '..', 'assets'), _pathDirect);
	

			let QlikSenseURL: string | undefined = '';
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
				QlikSenseURL = await showInputBox("Qlik Sense URL in following format https://tenantName.region.qlikcloud.com", false);

			}

			replaceObject["<replace_URL_From_Qlik>"] = QlikSenseURL;

			let OauthApp: any = await createAuth0Child(OAuthID, OAuthSecret, OAuthURL, QlikSenseURL);

			OAuth0App_clientID = JSON.parse(OauthApp).client_id;
			OAuth0App_clientSecret = JSON.parse(OauthApp).client_secret;


			replaceObject["<replace_auth0_clientID>"] = OAuth0App_clientID;

			typeOfSenseAuth = await showQuickPick("Are you using a developer key or Oauth client_id and secret for Qlik Sense?", ['Developer key', 'Oauth credentials']);

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


			let QlikIDPSetup = await createOauthIDPInQlikSense(QlikSenseToken, QlikSenseURL, qlikTenantID, OAuthURL,
				OAuth0App_clientID, OAuth0App_clientSecret);

			let j = '';
			replaceObject["<replace_APPID_From_Qlik>"] = QlikAppID;
			replaceObject["<replace_SHEETID_From_Qlik>"] = QlikSheet;
			replaceObject["<replace_OBJECTID_From_Qlik>"] = QlikObject;

			let filesToChange: string[] = ['index.html', 'auth_config.json'];
			await changeVariables(filesToChange, _pathDirect, JSON.stringify(replaceObject));


		

	}));


} 