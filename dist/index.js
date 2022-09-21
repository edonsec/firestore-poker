#!/usr/bin/env node

import fs from 'fs';
import YAML from 'yaml';

import { initializeApp, setLogLevel } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Command } from 'commander';
import { CLI } from 'cliffy';
import Colours from 'colors-cli';
import UserCommand from './lib/user/Command.js';
import CollectionCommand from './lib/collection/Command.js';
import CrudCommand from './lib/crud/Command.js';

const program = new Command();

program
	.description('Interact with Firebase\'s Firestore')
	.requiredOption('-c, --config <config>', 'Firebase Configuration', 'config.yaml')
	.showHelpAfterError()

try {
	program.parse(process.args);

	const options = program.opts();

	if (!fs.existsSync(options.config)) {
		console.log(Colours.red('Error: Missing configuration. Please copy "config.yaml.dist" to "config.yaml" and set the required parameters'));
		process.exit();	
	}
	
	const config_file = fs.readFileSync(options.config, 'utf8')
	const config = YAML.parse(config_file)

	const firebaseConfig = {
	  apiKey: config.api_key,
	  authDomain: config.auth_domain,
	  projectId: config.project_id,
	  storageBucket: config.storage_bucket
	};

	const app = initializeApp(firebaseConfig);
	setLogLevel('silent');

	const db = getFirestore(app);
	const auth = getAuth();

	const userCommand = new UserCommand(db, auth);
	const collectionCommand = new CollectionCommand(db, auth, config, options.config);
	const crudCommand = new CrudCommand(db, auth);

	const firestore = `         ^^                                  
        .~~^.                                
        :~~~^.                               
        ^~^~~~.    ::                        
       .~~~~~~~: .^~~^.        .             
       :~~~~~~~~^~~~~~^.    ..::.            
       ^~~~~~~~!77!~~~~~. ..::::.            
      .~~~~~~~!7777!~~~~^::::::::            
      :~~~~~~!777777!~^::::::::::.           
      ^~~~~~!777777!~::::::::::::.           
     .~~~~~!77777!^:::::::::::::::           
     :~~~~!7777!^:::::::::::::::::.          
     ^~~~!777!^:::::::::::::::::::.          
    .~~~777!^::::::::::::::::::::::          
    :~~77!^::::::::::::::::::::::::.         
    ^!7!^::::::::::::::::::::::::::.         
   .!!^:::::::::::::::::::::::::::::.        
   .^:::::::::::::::::::::::::::::::.        
      .::::::::::::::::::::::::::.           
         ..::::::::::::::::::..              
            ...::::::::::...                 
                ...::...

	  [ FireStore Poker ]`

	// TODO: Implement other login methods (facebook, apple, google etc)
	const cli = await new CLI({quietBlank: true})
	.setInfo(Colours.x208(firestore))
	.setDelimiter(Colours.x208('firestore-> '))
	.addCommand('collection', {
		description: 'Commands for collection interaction (i.e dump)',
		action: () => {
			console.log('For available commands type collection help');
		},
		subcommands: collectionCommand.getCommands()
	})
	.addCommand('crud', {
		description: 'Commands for Create, Read, Update and Delete on single records',
		action: () => {
			console.log('For available commands type crud help');
		},
		subcommands: crudCommand.getCommands()
	})
	.addCommand('user', {
		action: () => {
			console.log('For available commands type user help');
		},
		description: 'Commands for user authentication',
		subcommands: userCommand.getCommands()
	})
	.addCommand('exit', () => process.exit())
	.showHelp()
	.show()

	if (config.login !== undefined && config.login.username !== undefined && config.login.password !== undefined) {
		await userCommand.login(config.login.username, config.login.password, true);
	}
} catch (e) {
	console.log(e.message);
	console.log('node index.js --help');
}

// TODO: Select command should auto completes when tab is pressed and populate the collections
