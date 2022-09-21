// Credit to https://github.com/NineCollective/node-pluralizer/ 
var _uncountables = ['equipment', 'information', 'rice', 'money', 'species', 'series', 'fish', 'sheep'],
    _plurals = [
        {pattern: "$", plural: "s"},
        {pattern: "s$", plural: "s"},
        {pattern: "(ax|test)is$", plural: "$1es"},
        {pattern: "(octop|vir)us$", plural: "$1i"},
        {pattern: "(alias|status)$", plural: "$1es"},
        {pattern: "(bu)s$", plural: "$1ses"},
        {pattern: "(buffal|tomat)o$", plural: "$1oes"},
        {pattern: "([ti])um$", plural: "$1a"},
        {pattern: "sis$", plural: "ses"},
        {pattern: "(?:([^f])fe|([lr])f)$", plural: "$1$2ves"},
        {pattern: "(hive)$", plural: "$1s"},
        {pattern: "([^aeiouy]|qu)y$", plural: "$1ies"},
        {pattern: "(x|ch|ss|sh)$", plural: "$1es"},
        {pattern: "(matr|vert|ind)ix|ex$", plural: "$1ices"},
        {pattern: "([m|l])ouse$", plural: "$1ice"},
        {pattern: "^(ox)$", plural: "$1en"},
        {pattern: "(quiz)$", plural: "$1zes"},
        {pattern: "(m)an$", plural: "$1en"},
        {pattern: "(p)erson$", plural: "$1eople"},
        {pattern: "(c)hild$", plural: "$1hildren"},
        {pattern: "(s)ex$", plural: "$1exes"},
        {pattern: "(m)ove$", plural: "$1oves"}
    ];


function do_pluralize(word) {
    return applyRules(_plurals, word);
}

function applyRules(rules, word) {
    var result = word;
    if (_uncountables.indexOf(word.toLowerCase()) === -1) {
        for (var i = rules.length - 1; i >= 0; i--) {
            if ((result = applyRule(word, rules[i].pattern, rules[i].plural)) != null) {
                break;
            }
        }
    }
    return result;
}

function applyRule(word, pattern, plural) {
    var regexp = new RegExp(pattern, 'i');

    if (!regexp.test(word)) {
        return null;
    }
    return word.replace(regexp, plural);
}

export default function pluralize(s) {
	return do_pluralize(s.trim());
}