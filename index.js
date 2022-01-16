const Numbers = "0123456789";
const Letters = "qwertyuioplkjhgfdsaxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
const Symbols = ".:";
const Whitespace = " \t";
const idxresolve = "0123456789rmxp&";
const StringResolve = "qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM.:0123456789_ \"";

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
            } else if(this.cc == "\"") {
                this.BuildStringLike();
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
    BuildStringLike() {
        var t = "";
        while (StringResolve.includes(this.cc)) {
            t += this.cc;
            this.Continue();
            if(this.cc == "\"") {
                break;
            }
        }
        t = t.substring(1, t.length);
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
        this.Continue();
        while (this.index < this.text.length && this.cc != TT_EOF) {
            if(this.cc.Type == TT_EOF) break;
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
function ParseFN(Token) {
    var m = "";
    for(i = 0; i < Token.Value.length; i++) {
        m+=Token.Value[i].Value.toString();
    }
    //now m is the path thing.
    m = m.replace(/\./g, "")
    m = m.replace(/:/g, "");
    let isComplex = false;
    if(m.includes("subr")) {
        isComplex = true;
        let IndexOfP = m.indexOf('p');
        let number = "";
        let i = IndexOfP + 1;
        while (i < m.length) {
            if(Numbers.includes(m[i])) {
                number += m[i];
            } else {
                break;
            }
            i++;
        }
        let name = "";
        while (i < m.length) {
            if (Letters.includes(m[i])) {
                name += m[i];
            } else if (Whitespace.includes(m[i])) {
                continue;
            } else {
                break;
            }
            i++;
        }
        var Name = name;
        var P = parseInt(number);
    } else {
        var Name = m;
        var P = 0;
    }
    return {
        Name: Name,
        P: P,
        IsComplex: isComplex
    };
}

class IRBuilder1 { //sets up commands
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
            if(this.cc.Type == TT_NORMALEXPR) {
                //setup
                let temp_cmd = new IR_COMMAND("", []);
                temp_cmd.Name = this.cc.Value[0];
                var i;
                for(i=1;i<this.cc.Value.length;i++) {
                    if(this.cc.Value[i].Type == TT_ARGS) {
                        continue; //dont push commas
                    } else {
                        temp_cmd.Parameters.push(this.cc.Value[i].Value);
                    }
                }
                this.tokens.push(temp_cmd);
            } else {
                //its a function, functions are setup in IRBuilder2.
                this.tokens.push(this.cc);
            }
            this.Continue();
        }
        return this.tokens;
    }
}
class IRBuilder2 { //organizes into functions for endl
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
            if(this.cc.Type == TT_FNDAEXPR) {
                let Name = ParseFN(this.cc).Name;
                let P = ParseFN(this.cc).P;
                let FN = new IR_FN(Name, P, []);
                this.Continue();
                while(this.cc instanceof IR_COMMAND && this.cc.Name.Value != "lbl" && this.cc.Name.Value != "endl") {
                    FN.Callstack.push(this.cc);
                    this.Continue();
                }
                FN.Callstack.push(new IR_COMMAND(new Token(TT_STRING, "endl"), []));
                this.tokens.push(FN);
            } else if (this.cc.Type == TT_FNDEXPR) {
                //label expression, really
                this.tokens.push(new IR_COMMAND("lbl", [ParseFN(this.cc).Name]))
            } else {
                this.tokens.push(this.cc);
            }
            this.Continue();
        }
        return this.tokens;
    }
}

class IR_COMMAND {
    constructor(Name, Parameters) {
        this.Name = Name;
        this.Parameters = Parameters;
    }
    toString() {
        return `Command ${this.Name}::(${this.Parameters.join(", ")})`;
    }
}

class IR_FN {
    constructor(Name, P, Callstack) {
         this.Name = Name;
         this.P = P;
         this.Callstack = Callstack;
    }
    toString() {
        return `Function ${this.Name}[p${this.P.toString()}]::{\n\t${this.Callstack.join("\n\t")}\n}`;
    }
}
//given raw text T, generate the IR tokens ir_tok2. Returns an array of IR tokens.
function CompileIR(T) {
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
    console.log("---formatted lined tokens---\n");
    lined_tokens.forEach((v) => { console.log(v.toString()) })
    var ir1 = new IRBuilder1(lined_tokens);
    var ir1_tok = ir1.Main();
    console.log("---ir1 tokens---\n");
    ir1_tok.forEach((v) => { console.log(v.toString()) })
    var ir2 = new IRBuilder2(ir1_tok);
    var ir2_tok = ir2.Main();
    console.log("---ir2 tokens---\n");
    ir2_tok.forEach((v) => { console.log(v.toString()) })

    for(const c of ir2_tok) {
        if(c instanceof IR_COMMAND) {
            c.Name = c.Name.Value;
        }
    }

    return ir2_tok;
}

class DHold {
    constructor(isRegister, id, Value) {
        this.IsRegister = isRegister;
        this.ID = id;
        this.Value = Value;
    }
}
class ENV {
    constructor() {
        this.registers = [];
        this.memory = [];

        this.registerid = 0;
        this.memoryid = 0;

        this.labels = [];
        this.subrs = [];
    }
    getRegister(id) {
        return this.registers.find((v) => v.ID == id);
    }
    getMemory(id) {
        return this.memory.find((v) => v.ID == id);
    }
    resolve(T) {
        if (T[0] == '&') {
            //index value, return the Object
            switch (T[1]) {
                case "r":
                    return this.getRegister(parseInt(T.substr(2, T.length - 1)))
                case "m":
                    return this.getMemory(parseInt(T.substr(2, T.length - 1)))
            }
        } else if (T[0] == "r" || T[0] == "m") {
            switch (T[0]) {
                case "r":
                    return this.getRegister(parseInt(T.substr(1, T.length - 1))).Value;
                case "m":
                    return this.getMemory(parseInt(T.substr(1, T.length - 1))).Value;
            }
        } else {
            return parseInt(T);
        }
    }
    createRegister() {
        this.registers.push(new DHold(true, this.registerid, 0));
        this.registerid++;
    }
    createMemory() {
        this.memory.push(new DHold(false, this.memoryid, 0));
        this.memoryid++;
    }
}
class Command {
    constructor(Name, Call) {
        this.Name = Name; //name of function to be called when in code
        this.call = Call; //function, accepts p as array of args
    }
}
/** These are the builtins. */
const defaults = [
    new Command("mov", (p, env) => {
        env.resolve(p[0]).Value = env.resolve(p[1]);
    }),
    new Command("ralloc", (p, env) => {
        var i = 0;
        while(i < (parseInt(env.resolve(p[0])) +1)) {
            env.createRegister();
            i++;
        }
    }),
    new Command("malloc", (p, env) => {
        var i = 0;
        while (i < (parseInt(env.resolve(p[0])) + 1)) {
            env.createMemory();
            i++;
        }
    })
];

class Runner {
    constructor(IR, env, cpkg) {
        this.ir = IR;
        this.index = -1;
        this.cc = "";
        this.tokens = [];
        this.env = env;

        this.cpkg = cpkg;
    }
    Continue() {
        this.index++;
        this.cc = this.ir[this.index];
    }
    getCommand(Name) {
        return this.cpkg.find((v) => v.Name == Name);
    }
    callCommand(Name, Parameters) {
        this.getCommand(Name).call(Parameters, this.env);
    }
    Main() {
        this.Continue();
        while (this.index < this.ir.length) {
            if (this.cc instanceof IR_COMMAND) {
                if (this.getCommand(this.cc.Name) != undefined) {
                    this.callCommand(this.cc.Name, this.cc.Parameters);
                } else {
                    //invalid command, we'll do errors later.
                }
            } //aka we ignore function declarations.
            this.Continue();
        }
        return this.env;
    }
}

function interpret(IR) {
    var env = new ENV();
    var runner = new Runner(IR, env, defaults);
    return runner.Main();
}

function NativeRun(T) {
    var IR = CompileIR(T);
    var res_env = interpret(IR);
    return res_env;
}

const fs = require('fs');

fs.writeFileSync("./dump", JSON.stringify(NativeRun(`
ralloc 0
`), null, 5));

/**
 * 
 * .NAME: -> LABELS
 * .subr p0 NAME: -> SUBROUTINE
 */
