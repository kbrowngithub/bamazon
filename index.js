var inquirer = require("inquirer");
var User = require("./User");

inquirer.prompt([
    {
        name: "user",
        type: "list",
        message: "Are you a customer, manager, or supervisor?",
        choices: ["Customer", "Manager", "Supervisor"]
    }
]).then(answer => {
    console.log(`User is a ${answer.user}`);
    var user = new User(answer.user);
    user.prompt();
});