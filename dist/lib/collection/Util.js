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

class Util {
	static parseClause(clause) {
		return new Promise((resolve, reject) => {
			const parts = clause.split(' ');

			if(parts.length != 3) {
				reject('Incorrect argument count, format should be "<col> <comparator> <value>"');
			}

			resolve({
				col: parts[0],
				comparator: parts[1],
				value: parts[2]
			});
		});
	}

	// TODO: REFACTOR
	static async getRecords(db, collection_name, amt=10, clause=null) {
		const myCol = collection(db, collection_name);

		const query_params = [myCol];

		if (Number.isInteger(parseInt(amt))) {
			query_params.push(limit(amt));
		}

		if (clause) {
			query_params.push(clause);
		}
		
		const q = query.apply(null, query_params);
		const mySnapshot = await getDocs(q);

		const output = {}
		const escaped_name = collection_name.replace(/[^a-zA-Z0-9-.]+/, '')

		output[escaped_name] =  await mySnapshot.docs.map(doc => {
				return {id: doc.id, data:doc.data()}
		})

		return output;
	}

	// TODO: REFACTOR
	static getRecordsAsJSON(db, collection_name, amt=10, clause=null) {
			if(clause && clause != 'null') {
				return Util.parseClause(clause).then((r) => {
					const query_clause = where(r.col, r.comparator, r.value);
					return Util.getRecords(db, collection_name, amt, query_clause)
				});
			}

			return Util.getRecords(db, collection_name, amt)
	}
}

export default Util;
