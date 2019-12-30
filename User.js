var inquirer = require("inquirer");
var DB = require("./DB");

// var db = new DB("bamazon");

var User = function (user) {
    this.user = user;
    this.prompt = function () {
        switch (this.user) {
            case "Customer":
            default:
                inquirer.prompt([
                    {
                        name: "item",
                        type: "list",
                        message: "What would you like to buy?",
                        choices: ["First line item", "Second line item", "Third line item"]
                    }
                ]).then(answer => {
                    console.log(`Answer was ${answer.item}`);
                    inquirer.prompt([
                        {
                            name: "quantity",
                            type: "input",
                            message: "How many units?",
                            validate: function checkQty(value) {
                                console.log(`\nValidate that input is an integer.`);
                                return true;
                            }
                        }
                    ]).then(answer => {
                        console.log(`Ensure ${answer.quantity} is <= available quantity.`);
                    });
                });
                break;

            case "Manager":
                    inquirer.prompt([
                        {
                            name: "task",
                            type: "list",
                            message: "What would you like to do?",
                            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
                        }
                    ]).then(answer => {
                        console.log(`Task was ${answer.task}`);
                        
                    });
                break;
            
            case "Supervisor":
                    inquirer.prompt([
                        {
                            name: "task",
                            type: "list",
                            message: "What would you like to do?",
                            choices: ["View Product Sales by Department", "Create New Department"]
                        }
                    ]).then(answer => {
                        console.log(`Task was ${answer.task}`);
                        
                    });
                break;
        }
    }

}

module.exports = User;