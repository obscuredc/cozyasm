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
class Runner {
    constructor(IR, env) {
        this.ir = ir;
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
            if(this.cc instanceof IR_COMMAND) {

            } //aka we ignore function declarations.
            this.Continue();
        }
        return this.tokens;
    }
}

module.exports.execute = function(IR) {
    var env = new ENV();
    var runner = Runner(IR);
}