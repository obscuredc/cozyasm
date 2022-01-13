const Numbers = "0123456789";
const Letters = "qwertyuioplkjhgfdsaxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
const Symbols = ".:";
const Whitespace = " \t";
const idxresolve = "0123456789rmx&"

const TT_INT = "token_int";
const TT_SYMBOL = "token_symbol";
const TT_STRING = "token_string";
const TT_POS = "token_indexof";
const TT_ARGS = "token_parameters";
const TT_NEWLINE = "token_newline";
const TT_EOF = "token_end_of_file";
const TT_LINELIST = "a list of tokens";
const TT_PLIKE = "a parameter";

const TT_NORMALEXPR = "a normal statement";
const TT_FNDEXPR = "a function declare statment";
const TT_FNDAEXPR = "a function delcare statment with args";

class Token {
    constructor(Type, Value) {
        this.Type = Type;
        this.Value = Value;
    }
    toString() {
        return "Token." + this.Type + ":(" + this.Value.toString() + ")";
    }
}

class Lexer {
    constructor(text) {
        this.text = text;
        this.index = -1;
        this.cc = "";
        this.tokens = [];
    }
    Continue() {
        this.index++;
        this.cc = this.text[this.index];
    }
    Main() {
        this.Continue();
        while (this.index < this.text.length) {
            if (Numbers.includes(this.cc)) this.BuildNumber();
            else if (Whitespace.includes(this.cc)) this.Continue();
            else if (Symbols.includes(this.cc)) {
                this.tokens.push(new Token(TT_SYMBOL, this.cc));
                this.Continue();
            } else if (this.cc == "&") this.BuildParameterLike();
            else if (this.cc == ",") {
                this.tokens.push(new Token(TT_ARGS, this.cc));
                this.Continue();
            } else if (this.cc == "\n") {
                this.tokens.push(new Token(TT_NEWLINE, TT_NEWLINE));
                this.Continue();
            }
            else if (Letters.includes(this.cc)) this.BuildStrlike();
            else this.Continue(); //ignore anything we dont know
        }
        this.tokens.push(new Token(TT_EOF, TT_EOF));
        return this.tokens;
    }
    BuildNumber() {
        var t = "";
        while (Numbers.includes(this.cc)) {
            t += this.cc;
            this.Continue();
        }
        t = parseFloat(t);
        this.tokens.push(new Token(TT_INT, t));
    }
    BuildStrlike() {
        var t = "";
        while (Letters.includes(this.cc)) {
            t += this.cc;
            this.Continue();
        }
        this.tokens.push(new Token(TT_STRING, t));
    }
    BuildParameterLike() {
        var t = "";
        while (idxresolve.includes(this.cc)) {
            t += this.cc;
            this.Continue();
        }
        this.tokens.push(new Token(TT_PLIKE, t));
    }
}
class ParameterNonIndexScanner {
    constructor(text) {
        this.text = text;
        this.index = -1;
        this.cc = "";
        this.tokens = [];
    }
    Continue() {
        this.index++;
        this.cc = this.text[this.index];
    }
    Main() {
        this.Continue();
        while (this.index < this.text.length) {
            if(this.cc.Type == TT_STRING && idxresolve.includes(this.cc.Value)) {
                let l = this.cc.Value;
                let t = this.cc;
                this.Continue();
                if(this.cc.Type == TT_INT) {
                    this.tokens.push(new Token(TT_PLIKE, l + this.cc.Value.toString()));
                    this.Continue();
                } else {
                    this.tokens.push(t);
                    this.tokens.push(this.cc);
                    this.Continue();
                }
            } else {
                this.tokens.push(this.cc);
                this.Continue();
            }
        }
        return this.tokens;
    }
}
class Liner {
    constructor(text) {
        this.text = text;
        this.index = -1;
        this.cc = "";
        this.tokens = [];
        this.sub = [];
    }
    Continue() {
        this.index++;
        this.cc = this.text[this.index];
    }
    Main() {
        this.Continue();
        while (this.index < this.text.length) {
            if(this.cc.Type != TT_NEWLINE) {
                this.sub.push(this.cc);
            } else {
                this.tokens.push(new Token(TT_LINELIST, this.sub));
                this.sub = [];
            }
            this.Continue();
        }
        this.tokens.push(new Token(TT_EOF, TT_EOF));
        return this.tokens;
    }
}
class LineAssigner {
    constructor(text) {
        this.text = text;
        this.index = -1;
        this.cc = "";
        this.tokens = [];
    }
    Continue() {
        this.index++;
        this.cc = this.text[this.index];
    }
    Main() {
        this.Continue();
        while (this.index < this.text.length && this.cc != TT_EOF) {
            if(this.cc.Value[0].Type == TT_STRING) {
                this.tokens.push(new Token(TT_NORMALEXPR, this.cc.Value))
            } else if (this.cc.Value[0].Type == TT_SYMBOL && this.cc.Value.some(obj => obj['Type'] == TT_PLIKE)) {
                //its a complex function declaration w/ args
                this.tokens.push(new Token(TT_FNDAEXPR, this.cc.Value))
            } else if (this.cc.Value[0].Type == TT_SYMBOL) {
                //its a noncomplex (doesnt take in agrs) function declaration
                this.tokens.push(new Token(TT_FNDEXPR, this.cc.Value))
            }
            this.Continue();
        }
        this.tokens.push(new Token(TT_EOF, TT_EOF));
        return this.tokens;
    }
}

function Main(T) {
    var lexer = new Lexer(T);
    var tokens = lexer.Main();
    console.log("---tokens---\n")
    tokens.forEach((v) => { console.log(v.toString()) })
    var nonidxscanner = new ParameterNonIndexScanner(tokens);
    var nist = nonidxscanner.Main();
    console.log("---nisted tokens---\n")
    nist.forEach((v) => { console.log(v.toString()) })
    var liner = new Liner(nist);
    var lined_tokens = liner.Main();
    console.log("---lined tokens---\n")
    lined_tokens.forEach((v) => { console.log(v.toString()) })
    var lineassigner = new LineAssigner(lined_tokens);
    var lined_tokens = lineassigner.Main();
    console.log("---formatted lined tokens---");
    lined_tokens.forEach((v) => { console.log(v.toString()) })
}

/** Unit tests */
Main(`.main:
    mov &r1,20
    kill m20
    endl
`)