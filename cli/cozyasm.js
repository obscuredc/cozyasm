const Numbers = "0123456789";
const Letters = "qwertyuioplkjhgfdsaxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
const Symbols = ".:";
const Whitespace = " \t";
const idxresolve = "0123456789rmxp&";
const StringResolve = "qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM.:0123456789_ \"/\\;\',<>[]{}-+=|!?()";

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

let std = {};
std.log = (Message) => {    //std.log should only be used for output the user
    console.log(Message);   //or client will see. for compiler/interpreter info
}                           //messages, see std.info().
std.genlogs = "";
std.info = (Message) => {
    std.genlogs = std.genlogs + Message + "\n";
}

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
        this.comment = false;
    }
    Continue() {
        this.index++;
        this.cc = this.text[this.index];
    }
    Main() {
        this.Continue();
        while (this.index < this.text.length) {
            if (Numbers.includes(this.cc) && this.comment == false) this.BuildNumber();
            else if (Whitespace.includes(this.cc) && this.comment == false) this.Continue();
            else if (Symbols.includes(this.cc) && this.comment == false) {
                this.tokens.push(new Token(TT_SYMBOL, this.cc));
                this.Continue();
            } else if (this.cc == "&" && this.comment == false) this.BuildParameterLike();
            else if (this.cc == "," && this.comment == false) {
                this.tokens.push(new Token(TT_ARGS, this.cc));
                this.Continue();
            } else if (this.cc == ";" && this.comment == false) {
                this.comment = true
            } else if (this.cc == "\n") {
                this.tokens.push(new Token(TT_NEWLINE, TT_NEWLINE));
                this.comment = false;
                this.Continue();
            } else if (this.cc == "\"" && this.comment == false) {
                this.BuildStringLike();
                this.Continue();
            }
            else if (Letters.includes(this.cc) && this.comment == false) this.BuildStrlike();
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
                this.tokens.push(new IR_COMMAND(new Token(TT_STRING, "lbl"), [ParseFN(this.cc).Name]))
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
    std.info("---tokens---\n")
    tokens.forEach((v) => { std.info(v.toString()) })
    var nonidxscanner = new ParameterNonIndexScanner(tokens);
    var nist = nonidxscanner.Main();
    std.info("---nisted tokens---\n")
    nist.forEach((v) => { std.info(v.toString()) })
    var liner = new Liner(nist);
    var lined_tokens = liner.Main();
    std.info("---lined tokens---\n")
    lined_tokens.forEach((v) => { std.info(v.toString()) })
    var lineassigner = new LineAssigner(lined_tokens);
    var lined_tokens = lineassigner.Main();
    std.info("---formatted lined tokens---\n");
    lined_tokens.forEach((v) => { std.info(v.toString()) })
    var ir1 = new IRBuilder1(lined_tokens);
    var ir1_tok = ir1.Main();
    std.info("---ir1 tokens---\n");
    ir1_tok.forEach((v) => { std.info(v.toString()) })
    var ir2 = new IRBuilder2(ir1_tok);
    var ir2_tok = ir2.Main();
    std.info("---ir2 tokens---\n");
    ir2_tok.forEach((v) => { std.info(v.toString()) })

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
    dup() {
        return new DHold(this.isRegister, this.ID, this.Value);
    }
}
class ENV {
    constructor(reg=[],mem=[],regid=0,memid=0,lbls=[],subrs=[]) {
        this.registers = reg;
        this.memory = mem;
        this.tempregs = [];
        this.xregs = [];

        this.depnet = null;

        this.registerid = regid;
        this.memoryid = memid;

        this.labels = lbls;
        this.subrs = subrs;
    }
    dupsub() {
        return new ENV(this.registers, this.memory, this.registerid, this.memoryid, [], this.subrs);
        //remeber, sub duplicates dont carry over labels to attempt and fix label problems
    }
    getRegister(id) {
        return this.registers.find((v) => v.ID == id);
    }
    getPRegister(id) {
        return this.tempregs.find((v) => v.ID == id);
    }
    getXRegister(id) {
        return this.xregs.find((v) => v.ID == id);
    }
    getMemory(id) {
        return this.memory.find((v) => v.ID == id);
    }
    getLabel(name) {
        return this.labels.find((v) => v.Name == name);
    }
    getFN(name) {
        return this.subrs.find((v) => v.Name == name);
    }
    resolve(T) {
        if (T[0] == '&') {
            //index value, return the Object
            switch (T[1]) {
                case "r":
                    return this.getRegister(parseInt(T.substr(2, T.length - 1)))
                case "m":
                    return this.getMemory(parseInt(T.substr(2, T.length - 1)))
                case "p":
                    return this.getPRegister(parseInt(T.substr(2, T.length - 1)))
                case "x":
                    return this.getXRegister(parseInt(T.substr(2, T.length - 1)))
            }
        } else if (T[0] == "r" || T[0] == "m" || T[0] == "p" || T[0] == "x") {
            switch (T[0]) {
                case "r":
                    return this.getRegister(parseInt(T.substr(1, T.length - 1))).Value;
                case "m":
                    return this.getMemory(parseInt(T.substr(1, T.length - 1))).Value;
                case "p":
                    return this.getPRegister(parseInt(T.substr(1, T.length - 1))).Value;
                case "x":
                    return this.getXRegister(parseInt(T.substr(1, T.length - 1))).Value;
            }
        } else {
            return parseInt(T);
        }
    }
    createRegister() {
        this.registers.push(new DHold(true, this.registerid, -1));
        this.registerid++;
    }
    createMemory() {
        this.memory.push(new DHold(false, this.memoryid, -1));
        this.memoryid++;
    }
    checkType(T) {
        if(T[0] == "&") {
            return "index";
        } else if (T[0] == "r" || T[0] == "m" || T[0] == "p" || T[0] == "x") {
            return "refrence";
        } else if (T instanceof Number) {
            return "const"
        } else {
            return "string"
        }
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
    new Command("mov", (p, env, ii) => {
        env.resolve(p[0]).Value = env.resolve(p[1]);
    }),
    new Command("ralloc", (p, env, ii) => {
        var i = 0;
        while(i < (parseInt(env.resolve(p[0])) +1)) {
            env.createRegister();
            i++;
        }
        env.depnet = env.registers[env.registers.length - 1].dup()
    }),
    new Command("malloc", (p, env, ii) => {
        var i = 0;
        while (i < (parseInt(env.resolve(p[0])) + 1)) {
            env.createMemory();
            i++;
        }
        env.depnet = env.memory[env.memory.length -1].dup() //newest created one
    }),
    new Command("nlin", (p, env, ii) => {
        let value = parseInt(env.resolve(p[0]));
        ii.index += (value);
    }),
    new Command("llin", (p, env, ii) => {
        let value = parseInt(env.resolve(p[0]));
        ii.index -= (2+value);
    }),
    new Command("add", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0]));
        let value2 = parseInt(env.resolve(p[1]));
        let res_idx = env.resolve(p[2]);
        res_idx.Value = value1 + value2;
    }),
    new Command("sub", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0]));
        let value2 = parseInt(env.resolve(p[1]));
        let res_idx = env.resolve(p[2]);
        res_idx.Value = value1 - value2;
    }),
    new Command("mul", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0]));
        let value2 = parseInt(env.resolve(p[1]));
        let res_idx = env.resolve(p[2]);
        res_idx.Value = value1 * value2;
    }),
    new Command("div", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0]));
        let value2 = parseInt(env.resolve(p[1]));
        let res_idx = env.resolve(p[2]);
        res_idx.Value = value1 / value2;
    }),
    new Command("ifeq", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0]));
        let value2 = parseInt(env.resolve(p[1]));
        if(!value1 == value2) {
            ii.index++;
        }
    }),
    new Command("iflt", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0]));
        let value2 = parseInt(env.resolve(p[1]));
        if (!(value1 < value2)) {
            ii.index += 1;
        }
    }),
    new Command("iflq", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0]));
        let value2 = parseInt(env.resolve(p[1]));
        if (!value1 <= value2) {
            ii.index++;
        }
    }),
    new Command("rad", (p, env, ii) => {
        let value1 = parseInt(env.resolve(p[0])).toString();
        let value2 = parseInt(env.resolve(p[1])).toString();
        let res_idx = env.resolve(p[2]);
        res_idx.Value = parseInt(value1 + value2);
    }),
    new Command("import", (p, env, ii) => {
        let filename = p[0]; //const::String s cannot be resolved
        let content = "callasImport\n" + fs.readFileSync(filename, "utf-8");
        if(content[content.length - 1] != "\n") content += "\n"; //hacky solution lol
        std.info("MOVI to " + filename)
        std.info("WRAP [")
        env = SubRun(content, env);
        std.info("] ENDWRAP")
    }),
    new Command("callasImport", (p, env, ii) => {
        //this does nothing. it just placeholds.
    }),
    new Command("load", (p, env, ii) => {
        env.resolve(p[1]).Value = env.resolve("m" + p[0].toString());
    }),
    new Command("store", (p, env, ii) => {
        env.resolve("&m" + p[0].toString()).Value = env.resolve(p[1]);
    }),
    new Command("end", (p, env, ii) => {
        ii.index = ii.ir.length;
    }),
    new Command("tbufpsh", (p, env, ii) => {
        ii.tbuf += String.fromCharCode(parseInt(env.resolve(p[0])))
    }),
    new Command("tbufwr", (p, env, ii) => {
        std.log(ii.tbuf); //we'll make stuff standard later, esp in cli
    }),
    new Command("tbufcls", (p, env, ii) => {
        ii.tbuf = "";
    }),
    new Command("tbufdel", (p, env, ii) => {
        ii.tbuf = ii.tbuf.slice(0, ii.tbuf.length -2); //slices end char
    }),
    new Command("puts", (p, env, ii) => {
        //this could probably be implemented in the stdlib, but, I decided to make it native.
        //you can make a puts yourself in the assembly once the subroutine update comes out.
        if (env.checkType(p[0]) == "string" || env.checkType(p[0]) == "refrence") {
            //just output it
            if (env.checkType(p[0]) == "refrence") std.log(env.resolve(p[0]));
            else std.log(p[0].toString())
        } else if (env.checkType(p[0]) == "index") {
            //parse the memory index, holding values until we come across a zero (termination).
            //then we output. (the load function will do this)

            let index = parseInt(env.resolve(p[0]).ID);
            let values = "";
            let mi = 0;
            for(mi = index; mi < env.memory.length; mi++) {
                if(env.memory[mi].Value == 0) break; //termination
                values += String.fromCharCode(env.memory[mi].Value);
            }
            std.log(values)
        } else if (env.checkType(p[0]) == "const") {
            std.log(p[0].toString());
        }
    }),
    new Command("mload", (p, env, ii) => {
        let str = p[0];
        let index = env.resolve(p[1]);
        let mloc = index.ID;
        let j = 0;
        for(i = mloc; i < env.memory.length; i++) {
            if(env.memory[i] == undefined || j == str.length) break;
            //the user didnt allocate enough memory for the length of this string!
            env.memory[i].Value = str[j].charCodeAt(0);
            j++;
        }
        //this code appends the termination at the end.
        env.memory[mloc + str.length].Value = 0;
    }),
    new Command("endl", (p, env, ii) => {
        env.tempregs = [];
        env.xregs = [];
    }),
    new Command("dep", (p, env, ii) => {
        let t = new DHold(true, env.resolve(p[0]), env.depnet.dup().Value);
        t.origin = env.depnet.dup().ID;
        env.xregs.push(t);
    }),
    new Command("depf", (p, env, ii) => {
        let idx = env.resolve(p[0]);
        let loc = idx.origin + 0;
        let reg = env.getRegister(loc);
        reg.Value = idx.dup().Value;
    })
];
const flow = [
    new Command("lbl", (p, env, ii) => {
        env.labels.push(new Label(p[0], ii.index));
    })
];

//NOTE ABOUT LABELS v SUBROUTINES:
//  subroutines ALWAYS return to where they were called. labels DO NOT unless there is a specified goto
//  subroutines are saved CROSS-FILES. labels will still be defined, but UNEXPECTED BEHAVIOR will arise!
//  this is because the instance line number is saved to the local file, so when it jumps in the main
//  thread, it will NOT BE WHERE YOU THINK IT WILL BE!

class Label {
    constructor(Name, Instance) {
        this.Name = Name;
        this.Value = Instance;
    }
}

class Runner {
    constructor(IR, env, cpkg) {
        this.ir = IR;
        this.index = -1;
        this.cc = "";
        this.tokens = [];
        this.env = env;

        this.cpkg = cpkg;
        this.tbuf = "";
    }
    Continue() {
        this.index++;
        this.cc = this.ir[this.index];
    }
    getCommand(Name) {
        return this.cpkg.find((v) => v.Name == Name);
    }
    callCommand(Name, Parameters) {
        this.getCommand(Name).call(Parameters, this.env, this);
    }
    Main() {
        this.Continue();
        //check if main label exists
        if(this.env.getLabel("main") == undefined) {
            //there is no main label!!
            std.info("WARN no main label found")
        } else {
            this.index = this.env.getLabel("main").Value - 1;
            this.Continue();
            std.info("GET main lbl")
        }
        while (this.index < this.ir.length) {
            if (this.cc instanceof IR_COMMAND) {
                if (this.getCommand(this.cc.Name) != undefined) {
                    std.info("calling command " + this.cc.Name + " with params:")
                    this.cc.Parameters.forEach((v) => {
                        std.info((v));
                    })
                    std.info("calling " + this.cc.Name + " at index" + this.index);
                    this.callCommand(this.cc.Name, this.cc.Parameters);
                } else {
                    if(this.env.getLabel(this.cc.Name) != undefined) {
                        this.index = this.env.getLabel(this.cc.Name).Value -1;
                    } else if(this.env.getFN(this.cc.Name) != undefined) {
                        //run command
                        let fn = this.env.getFN(this.cc.Name);
                        let tok = fn.Callstack;
                        tok.unshift(new IR_COMMAND(new Token(TT_STRING, "lbl"), ["main"]))
                        for (const c of tok) {
                            if (c instanceof IR_COMMAND) {
                                c.Name = c.Name.Value;
                            }
                        }
                        std.info("SUBCALL WRAP " + this.cc.Name + " [")
                        this.env = SubRunSkip(tok, this.env, this.cc.Parameters, fn);
                        std.info("] END SUBCALL WRAP")
                    }
                }
            } else if (this.cc instanceof IR_FN) {
                //ignore because we already pushed
                //functions to the enviorment and they are called
                //in the IR_COMMAND
            }
            this.Continue();
        }
        return this.env;
    }
    Pex() {
        let temp = [...this.cpkg];
        this.cpkg = [...flow];
        this.Continue();
        while (this.index < this.ir.length) {
            if (this.cc instanceof IR_COMMAND) {
                if (this.getCommand(this.cc.Name) != undefined) {
                    std.info("calling command " + this.cc.Name)
                    this.callCommand(this.cc.Name, this.cc.Parameters);
                }
                //since this is the sub function for pre-execution
                //in resolving labels, we ignore most things.
                //we will also push functions here eventually.
            } else if (this.cc instanceof IR_FN) {
                this.env.subrs.push(this.cc);
            }
            this.Continue();
        }
        //set instructions back to default.
        this.cpkg = [...temp];
    }
    ResetFlow() {
        this.index = -1;
        this.cc = "";
    }
}

function interpret(IR, env=new ENV()) {
    var runner = new Runner(IR, env, defaults);
    std.info("---pextime---\n");
    runner.Pex();
    std.info("---runtime---\n");
    runner.ResetFlow();
    return runner.Main();
}

function NativeRun(T) {
    var IR = CompileIR(T);
    var res_env = interpret(IR);
    return res_env;
}

//Future implementation notes:
//  it is VITAL that function and labels are stored in enviorments.
//  this is so subrunning will save it between "images" of envs.

function SubRun(T, cenv) {
    let IR = CompileIR(T);
    let saved_labels = [...cenv.labels];
    cenv.labels = [];
    let res_env = interpret(IR, cenv);
    res_env = res_env.dupsub();
    let new_env = new ENV(res_env.registers, res_env.memory, res_env.registerid, res_env.memoryid, saved_labels, res_env.subrs);
    return new_env;
}

function SubRunSkip(T, cenv, params, fn) {
    let IR = T;
    let saved_labels = [...cenv.labels];
    cenv.labels = [];
    let i = 0;
    while (i < params.length && i < fn.P + 1) {
        cenv.tempregs.push(new DHold(true, i, params[i]));
        i++;
    }
    let res_env = interpret(IR, cenv);
    res_env = res_env.dupsub();
    let new_env = new ENV(res_env.registers, res_env.memory, res_env.registerid, res_env.memoryid, saved_labels, res_env.subrs);
    return new_env;
}

const fs = require("fs");

module.exports = {
    interpret: (Text) => {
        return [NativeRun(Text), std.genlogs]
    },
    ENV: ENV,
    getlogs: () => { return std.genlogs },
    clslogs: () => { std.genlogs = "" }
}
/**
 * 
 * .NAME: -> LABELS
 * .subr p0 NAME: -> SUBROUTINE
 */
