import { 
	getFirestore, 
	collection, 
	getDocs, 
	addDoc, 
	deleteDoc, 
	deleteField,
	doc, 
	getDoc,
	updateDoc,
	query, 
	limit 
} from 'firebase/firestore';

import Colours from 'colors-cli';
import Table from 'cli-table';

class CrudCommand {
	constructor(db, auth, canary) {
		this.db = db;
		this.auth = auth;
		this.canary = canary || 'firestore_poker';
	}

	getCommands() { 
		return {
			create: {
				description: 'Create a record',
				parameters: ['collection', {label:'json_data', description:'Escaped JSON string for input'}],
				action: (params, options) => this.create(params.collection, params.json_data)
			},
			read: {
				description: 'Read a record',
				parameters: ['collection', 'reference'],
				action: (params, options) => this.read(params.collection, params.reference)
			},
			update: {
				description: 'Create a record',
				parameters: ['collection', 'reference', {label:'json_data', description:'Escaped JSON string for input'}],
				action: (params, options) => this.update(params.collection, params.reference, params.json_data)
			},
			delete: {
				description: 'Delete a record',
				parameters: ['collection', 'reference'],
				action: (params, options) => this.delete_(params.collection, params.reference)
			},
			check: {
				description: 'Attempt all permissions',
				options: [{label:'delete', description:'Destroy record when supplied with reference, destructive.'}],
				parameters: ['collection', {label:'reference', description:'Specific record to try operations against', optional:true}],
				action: async (params, options) => this.check(params.collection, params.reference, options.delete)
			}
		}
	}

	async create(_collection, data) {
		return addDoc(collection(this.db, _collection), JSON.parse(data))
			.then((r) => console.log(Colours.green("Document with reference: " + r.id + " created")))
			.catch((e) => console.log(Colours.red(e.message)));
	}

	async read(_collection, reference) {
		return getDoc(doc(this.db, _collection, reference))
			.then((r) => console.log(r.data())) 
			.catch((e) => console.log(Colours.red(e.message)));
	}

	async update(_collection, reference, data) {
		return await updateDoc(doc(this.db, _collection, reference), JSON.parse(data))
			.then((r) => console.log(Colours.green('Update complete')))
			.catch((e) => console.log(Colours.red(e.message)));
	}

	async delete_(_collection, reference) {
		return await deleteDoc(doc(this.db, _collection, reference))
			.then((r) => console.log(Colours.green('Delete complete')))
			.catch((e) => console.log(Colours.red(e.message)));
	}

	async check(_collection, reference = null, do_delete = false) {
			let permissions = {
				get: false,
				list: false,
				create: '-',
				update: false,
				remove: '-'
			};

			let ref = reference;

			console.log('Testing list...');
			try {
				const snapshot = await getDocs(collection(this.db, _collection));
				console.log(Colours.green('List access'));
				permissions.list = true;
			} catch {}

			if (!reference) {
				console.log('Testing create...');

				const create_test = {};
				create_test[this.canary] = this.canary + '-updated';

				ref = await addDoc(collection(this.db, _collection), create_test)
					.then((doc) => {
						console.log(Colours.green('Create access'))
						console.log('Ref: ' + doc.id)
						permissions.create = true;
						return doc.id
					})
					.catch((e) => {
						console.log('Unable to create: ' + Colours.red(e.message))
						permissions.create = false;
					});
			}
			
			if (ref) {
				console.log('Testing get...');
				const docref = doc(this.db, _collection, ref);
				const docSnap = await getDoc(docref)
				.catch(() => {});

					try {
						docSnap.data()
						console.log(Colours.green('Get access'));
						permissions.get = true;
					} catch {}


					console.log('Testing update...');
						const update_test = {};
						update_test[this.canary] = this.canary + '-updated';

						await updateDoc(docref, update_test)
						.then(async () => {
							console.log(Colours.green('Update access'));
							permissions.update = true;
							
							await updateDoc(docref, {
								firestore_poker: deleteField()
							}).catch(() => {});
						})
						.catch((e) => console.log('Failed to update'));

					if (!reference || do_delete) {
						console.log('Testing delete...');
						await deleteDoc(docref)
						.then(() => {
							console.log(Colours.green('Delete access'));
							permissions.remove = true;
						})
						.catch(() => { permissions.remove = false; });
					}
			} else {
				console.log(Colours.red('Error: Unable to create starting reference, please supply a known reference to continue write operation tests'));
			}


				const table = new Table({
					head: Object.keys(permissions),
					rows: [Object.values(permissions)]
				});
				//const table = new Table({'Get', 'List', 'Create', 'Update', 'Delete'});

				console.log(table.toString());
		}
}

export default CrudCommand;
