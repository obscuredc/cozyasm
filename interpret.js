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
        return this.registers.find((v) => v.id == id);
    }
    getMemory(id) {
        return this.memory.find((v) => v.id == id);
    }
    resolve(T) {
        if(T[0] == '&') {
            //index value, return the Object
            switch(T[1]) {
                case "r":
                    return this.getRegister(parseInt(T.substr(2, T.length-2)))
                case "m":
                    return this.getMemory(parseInt(T.substr(2, T.length-2)))
            }
        } else {
            switch(T[0]) {
                case "r":
                    return this.getRegister(parseInt(T.substr(1, T.length - 2))).Value;
                case "m":
                    return this.getMemory(parseInt(T.substr(1, T.length - 2))).Value;
            }
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

const defaults = [
new Command("mov", (p, env) => {
    env.getMemory(p[0]).Value = p[1];
}),
new Command("ralloc", (p, env) => {
    env.createRegister();
})
];

class Runner {
    constructor(IR, env) {
        this.ir = IR;
        this.index = -1;
        this.cc = "";
        this.tokens = [];
        this.env = env;

        this.cpkg = [];
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
            if(this.cc instanceof IR_COMMAND) {
                if(this.getCommand(this.cc.Name) != undefined) {
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
    var runner = new Runner(IR, env);
    return runner.Main();
}