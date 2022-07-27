import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import Colours from 'colors-cli';

class UserCommand {
	constructor(db, auth) {
		this.db = db;
		this.auth = auth;
		this.user_context = null;
	}

	getCommands() {
		return {
			login: {
				parameters: ['username', 'password'],
				action: (params) => this.login(params.username, params.password)
			},
			register: {
				parameters: ['username', 'password'],
				action: (params) => this.register(params.username, params.password)
			},
			logout: {
				action: () => this.logout()
			},
			dump: {
				options: [{label:'uid', description:'Return only the user id'}],
				action: (parameters, options) => {
					console.log(
						this.user_context 
						? (options.uid ? this.user_context.user.uid : this.user_context)
						: Colours.red('Not logged in.')
					);
				}
			}
		}
	}

	async login(username, password, suppress=false) {
		await signInWithEmailAndPassword(this.auth, username, password).
		then((r) => { 
			this.user_context = r;
			if (!suppress) {
				console.log(Colours.green('User now authorised'))
			}
		})
		.catch((error) => {
			console.log(Colours.red(error.message));
		});
	}

	async register(username, password) {
			await createUserWithEmailAndPassword(this.auth, username, password).
				then((user) => {
					console.log(Colours.green('User now registered.'));
				})
				.catch((error) => {
					console.log(Colours.red(error.message));
				});

	}

	async logout() {
		await signOut(this.auth)
		.then(() => {
			this.user_context = null;
			console.log(Colours.green('User logged out'));
		})
		.catch((error) => {
			console.log(Colours.red(error.message));
		});
	}
}

export default UserCommand;
