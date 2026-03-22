// Compiler-like DFA Generator with Lexer, Parser, Code Generator, and Simulator

// Lexer: Tokenizes the input pattern
function lexer(input) {
    const tokens = [];
    const words = input.toLowerCase().split(/\s+/);
    for (let word of words) {
        if (['start', 'with', 'ends', 'contain', 'only', 'combination', 'of'].includes(word)) {
            tokens.push({ type: 'keyword', value: word });
        } else if (/^[a-zA-Z0-9]+$/.test(word)) {
            tokens.push({ type: 'string', value: word });
        } else {
            tokens.push({ type: 'unknown', value: word });
        }
    }
    return tokens;
}

// Parser: Parses tokens into an AST
function parser(tokens) {
    let i = 0;
    function consume(type) {
        if (i < tokens.length && tokens[i].type === type) {
            return tokens[i++].value;
        }
        return null;
    }

    if (consume('keyword') === 'start' && consume('keyword') === 'with') {
        const str = consume('string');
        if (str) return { type: 'start_with', string: str };
    } else if (consume('keyword') === 'ends' && consume('keyword') === 'with') {
        const str = consume('string');
        if (str) return { type: 'ends_with', string: str };
    } else if (consume('keyword') === 'contain') {
        const str = consume('string');
        if (str) return { type: 'contain', string: str };
    } else if (consume('keyword') === 'only' && consume('keyword') === 'combination' && consume('keyword') === 'of') {
        const str = consume('string');
        if (str) return { type: 'only_combination', alphabet: str.split('') };
    }
    return null;
}

// Code Generator: Builds DFA from AST
function codeGenerator(ast) {
    if (!ast) return null;

    let alphabet;
    if (ast.type === 'only_combination') {
        alphabet = ast.alphabet;
    } else {
        alphabet = [...new Set(ast.string.split(''))];
    }

    if (ast.type === 'start_with') {
        return buildStartWithDFA(ast.string, alphabet);
    } else if (ast.type === 'ends_with') {
        return buildEndsWithDFA(ast.string, alphabet);
    } else if (ast.type === 'contain') {
        return buildContainDFA(ast.string, alphabet);
    } else if (ast.type === 'only_combination') {
        return buildOnlyCombinationDFA(ast.alphabet);
    }
    return null;
}

//functions for DFA building
function buildStartWithDFA(prefix, alphabet) {
    let dfa = {};
    for (let i = 0; i <= prefix.length; i++) {
        let state = "q" + i;
        dfa[state] = {};
        for (let c of alphabet) {
            if (i < prefix.length && c === prefix[i]) {
                dfa[state][c] = "q" + (i + 1);
            } else if (i < prefix.length) {
                dfa[state][c] = "qReject";
            } else {
                dfa[state][c] = "q" + prefix.length;
            }
        }
        dfa[state]["else"] = "qReject";
    }
    dfa["qReject"] = {};
    alphabet.forEach(c => dfa["qReject"][c] = "qReject");
    dfa["qReject"]["else"] = "qReject";
    dfa["q" + prefix.length].accept = true;
    return dfa;
}

function buildEndsWithDFA(suffix, alphabet) {
    let dfa = {};
    let len = suffix.length;
    for (let i = 0; i <= len; i++) {
        dfa["q" + i] = {};
    }
    dfa["qReject"] = {};
    alphabet.forEach(c => dfa["qReject"][c] = "qReject");
    dfa["qReject"]["else"] = "qReject";

    for (let i = 0; i <= len; i++) {
        let state = "q" + i;
        for (let c of alphabet) {
            let next = i;
            if (c === suffix[i]) next = i + 1;
            else if (i > 0 && c === suffix[0]) next = 1;
            else next = 0;
            if (next > len) next = len;
            dfa[state][c] = "q" + next;
        }
        dfa[state]["else"] = "qReject";
    }
    dfa["q" + len].accept = true;
    return dfa;
}

function buildContainDFA(pattern, alphabet) {
    let len = pattern.length;
    let dfa = {};
    for (let i = 0; i <= len; i++) {
        dfa["q" + i] = {};
    }
    dfa["qReject"] = {};
    alphabet.forEach(c => dfa["qReject"][c] = "qReject");
    dfa["qReject"]["else"] = "qReject";

    for (let i = 0; i <= len; i++) {
        for (let c of alphabet) {
            let next = 0;
            for (let j = Math.min(i + 1, len); j >= 0; j--) {
                if (pattern.slice(0, j) === (pattern.slice(0, i) + c).slice(-j)) {
                    next = j;
                    break;
                }
            }
            dfa["q" + i][c] = "q" + next;
        }
        dfa["q" + i]["else"] = "qReject";
    }
    dfa["q" + len].accept = true;
    return dfa;
}

//Himanshu Write here

