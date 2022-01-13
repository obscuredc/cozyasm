const Numbers = "0123456789";
const Letters = "qwertyuioplkjhgfdsaxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
const Symbols = ".:";
const Whitespace = " \t";

const TT_INT = "token_int";
const TT_SYMBOL = "token_symbol";
const TT_STRING = "token_string";
const TT_POS = "token_indexof";
const TT_ARGS = "token_parameters";
const TT_NEWLINE = "token_newline";
const TT_EOF = "token_end_of_file";

class Token {
    constructor(Type, Value) {
        this.Type = Type;
        this.Value = Value;
    }
    toString() {
        return "Token." + this.Type + ":" + this.Value
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
            } else if (this.cc == "&") {
                this.tokens.push(new Token(TT_POS, this.cc));
                this.Continue();
            } else if (this.cc == ",") {
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
}

function Main(T) {
    var lexer = new Lexer(T);
    var tokens = lexer.Main();
    console.log("---tokens---\n")
    tokens.forEach((v) => { console.log(v.toString()) })
}

/** Unit tests */
Main(`.main:
    mov &r1,20
    endl
`)