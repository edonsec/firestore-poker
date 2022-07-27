export default function pluralize(s) {
	if(s.slice(-1) == 's' || s.slice(-2) == 'ed') return s;
	
	return s + 's';
}
