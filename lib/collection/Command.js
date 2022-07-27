import { 
	getFirestore, 
	collection, 
	getDocs, 
	addDoc, 
	deleteDoc, 
	doc, 
	getDoc,
	updateDoc,
	query, 
	where,
	limit 
} from 'firebase/firestore';
import Colours from 'colors-cli';
import Util from './Util.js';
import Common from '../util/Common.js';
import fs from 'fs';
import nodeUtil from 'util';
import path from 'path';
import YAML from 'yaml';
import Table from 'cli-table';

class CollectionDumpCommand {
	constructor(db, auth, collections) {
		this.db = db;
		this.auth = auth;
		this.collections = collections;
	}

	getCommands() {
		return {
			all: {
				description: 'Dump all collections',
				parameters: [
					{label: 'file', 'description':'File to export to', optional:true}
				],
				action: (params, options) => this.all(params, options)
			},
			single: {
				description: 'Dump a single collection',
				parameters: [
					{label: 'collection', description: 'Name of Firestore collection'},
					{label: 'file', description: 'File to export to', optional: true}
				],
				action: (params, options) => this.single(params, options)
			}
		}
	}

	async all(params, options) {
		try {
			let all = []; 
			let failed = [];

			for(let i = 0; i < this.collections.length; i++) {
				await Util.getRecordsAsJSON(this.db, this.collections[i])
					.then((d) => {
						all.push(d);
					})
					.catch((e) => {
						failed.push([this.collections[i], e.message]);
						//console.log('\n' + this.collections[i] + ': ' + Colours.red(e.message))
					})
			}

			console.log(nodeUtil.inspect(all, false, null, true))

			if (failed.length > 0) {
				console.log('\n' + Colours.red('Error: '));

				let errorTable = new Table({
					head: ['Name', 'Error'],
					rows: failed	
				});	

				console.log(errorTable.toString());
			}
			

			if (params.file) {
				// TODO: Repetition
				fs.writeFile(params.file, JSON.stringify(all, null, 4), err => {
					if (err) {
						console.log('Error writing file ' + err);
					}
				});
				console.log('Dump written to ' + params.file);
				
			} 
		} catch(e) {
			console.log(e);
		}
	}

	async single(params, options) {
		// TODO: Abstract this into a single class for extracting
		await Util.getRecordsAsJSON(this.db, params.collection)
		.then((d) =>  { 
			//let json_dump = '\n' + params.collection + ': ' + (d.length > 0 ? JSON.stringify(d, null, 4) : colours.red('no records'));
			console.log(nodeUtil.inspect(d, false, null, true))

			return d;
		})
		.then((d) => {
			if (params.file) {
				fs.writeFile(params.file, JSON.stringify(d, null, 4), err => {
					if (err) {
						console.log('Error writing file ' + err);
					}
				});
				console.log('Dump written to ' + params.file);
			}
		})
		.catch((e) => console.log('\n' + params.collection + ': ' + Colours.red(e.message)))
	}
}

class CollectionCommand {
	constructor(db, auth, config, config_file) {
		this.db = db;
		this.auth = auth;
		this.config = config;
		this.collections = config.collections;
		this.config_file = config_file;
		this.dumpCommand = new CollectionDumpCommand(this.db, this.auth, this.collections);
	}

	getCommands() {
		return {
			query: {
				description: 'Execute a select query',
				parameters: [
					'collection', 
					{label: 'query'}, 
					{label: 'limit', optional: true},
					{label: 'file', optional: true, description: 'File to export to'}
				],
				action: (params, options) => this.query(params, options)
			},
			dump: {
				description: 'Dump all or single collection(s)',
				action: () => console.log('Run help collection dump for commands'),
				subcommands: this.dumpCommand.getCommands()
			},
			list: {
				description: 'List defined collections (config)',
				action: () => this.list()
			},
			discovery: {
				description: 'Discover collections using brute force',
				options: [{label: 'wordlist', description: 'Text file containing words to test for collections'}],
				action: async (params, options) => {
					await this.discovery(options.wordlist)
				}
			},
			commit: {
				description: 'Commit discovered collections to config.',
				action: () => this.commit()
			}
		}
	}

	list() {
		this.collections = Array.from(new Set(this.collections))
		console.log(this.collections)

	}

	async query(params, options) {
			await Util.getRecordsAsJSON(this.db, params.collection, params.limit, params.query)
			.then((d) => {
				console.log(nodeUtil.inspect(d, false, null, true))

				if (params.file) {
					fs.writeFile(params.file, JSON.stringify(d, null, 4), err => {
						if (err) {
							console.log('Error writing file ' + err);
						}
					});
					console.log('Dump written to ' + params.file);
				}
			})
			.catch((e) => console.log(Colours.red(e.message)));
	}

	async discovery(wordlist) {
		const wl = wordlist||'collections.txt';

		/* TODO: Add write check too
		const res = async () => {
			await readLine.eachLine(wl, async (line, last) => {
				await getDoc(doc(this.db, line, 'test'))
				.then(() => { return line })
				.catch((e) => {})
			})
		};*/

		console.log('New entries will appears within collection list, commit them with collection commit.');
		const	data = fs.readFileSync(wl, 'UTF-8');
		const lines = data.split(/\r?\n/);

		let f = await lines.forEach(async (line) => {
				let linet = line.trim();
				if (linet.length == 0) return;

				await getDoc(doc(this.db, linet, 'test'))
				.then(() => { this.collections.push(linet) })
				.catch((e) => {})
		});
	}

	commit() {
		const configCopy = this.config;
		configCopy.collections = this.collections

		const yamlStr = YAML.stringify(this.config)
		fs.writeFileSync(this.config_file, yamlStr, 'UTF-8');
		console.log('Committing collections to config');
	}
} 

export default CollectionCommand;
