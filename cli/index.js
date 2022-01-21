const cozyasm = require("./cozyasm");
const fs = require("fs");
/**
 * 2 is the default length for process.argv.length.
 */

/**
 * @param {String} Message 
 * the message to output
 */

const coolout = (Message) => {
    Message = Message.split("\n");
    Message.forEach((v) => console.log("cozyasm: " + v))
}
/**
 * @function getFirstFile finds the first filename of a list
 * @param {Array} List the list of flags and filename to search through.
 */
const getFirstFile = (List) => {
    List = List.slice(2, List.length -1);
    return List.find((v) => v[0] != "-")
}

if(process.argv.length == 2) {
    coolout("no options were provided!\n   some options to try are:\n      --dump\n      --gdump\n      --int")
} else if(getFirstFile(process.argv) == undefined && !(process.argv.includes("--gdump"))) {
    coolout("no file provided!")
} else if(getFirstFile(process.argv) != undefined) {
    //ok then
    let res = undefined;
    let file = fs.readFileSync(getFirstFile(process.argv), "utf-8");
    if (file[file.length - 1] != "\n") file += "\n";
    if(process.argv.includes("--int")) {
        //interpret mode
        res = cozyasm.interpret(file);
    }
    //notice how its not elseif? its because
    //we want to handle all flags that match, not
    //just one.
    if(process.argv.includes("--dump")) {
        if(res == undefined) {
            //bro, we did nothing. what are we supposed to dump
            coolout("could not dump. did you include a method to make dumps?\n   try:\n      --int")
        } else {
            //ok good, dump the stuff
            fs.writeFileSync("./dump", JSON.stringify({
                env: res[0],
                logs: res[1]
            }, null, 4));
        }
    }
} else if(process.argv.includes("--gdump")) {
    //output contents of ./dump, except cool
    let contents = fs.readFileSync("./dump", "utf-8");
    let json = JSON.parse(contents);
    coolout(JSON.stringify(json.env));
    coolout(json.logs);
}