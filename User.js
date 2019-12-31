var inquirer = require("inquirer");
var mysql = require("mysql");

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

// function which prompts the user for what action they should take
function start() {
    var user = new User("Manager", connection);
    user.prompt();
}


var User = function (user, db) {
    this.connection = db;
    this.user = user;
    this.prompt = function () {
        switch (this.user) {
            case "Customer":
            default:
                this.connection.query("SELECT * FROM products", function (err, results) {
                    if (err) throw err;
                    // once we have the items, prompt the user for which they'd like to purchase
                    inquirer
                        .prompt([
                            {
                                name: "choice",
                                type: "rawlist",
                                choices: function () {
                                    var choiceArray = [];
                                    for (var i = 0; i < results.length; i++) {
                                        choiceArray.push(`Product ID: ${results[i].id}, Item: ${results[i].product_name}, Price: ${results[i].price}`);
                                    }
                                    return choiceArray;
                                },
                                message: "Which item would you like to purchase?"
                            },
                            {
                                name: "quantity",
                                type: "input",
                                message: `How many units?`,
                                validate: function validateQty(value) {
                                    var pass = value.match(/^[0-9]+$/);
                                    if (pass) {
                                        return true;
                                    }
                                    return "Must be a number (use backspace to re-enter a valid number)";
                                }
                            }
                        ])
                        .then(function (answer) {
                            // get the information of the chosen item
                            var chosenItem;
                            console.log(`Answer =${answer.choice.split(",")[1]}`);
                            for (var i = 0; i < results.length; i++) {
                                console.log(`Item = Item: ${results[i].product_name}`);
                                if ("Item: " + results[i].product_name === answer.choice.split(",")[1].trim()) {
                                    chosenItem = results[i];
                                    console.log("ChosenItem = " + JSON.stringify(results[i]));
                                }
                            }

                            // determine if quantity was too high
                            if (chosenItem.stock_quantity >= parseInt(answer.quantity)) {
                                // number in stock can meet the order, so update db, let the user know, and start over
                                var newQuantity = chosenItem.stock_quantity - answer.quantity;
                                connection.query(
                                    "UPDATE products SET ? WHERE ?",
                                    [
                                        {
                                            stock_quantity: newQuantity
                                        },
                                        {
                                            id: chosenItem.id
                                        }
                                    ],
                                    function (error) {
                                        if (error) throw err;
                                        var total = formatter.format(chosenItem.price * answer.quantity);
                                        console.log(`Total Cost: ${total}`);
                                        start();
                                    }
                                );
                            }
                            else {
                                // Not enough in stock, so apologize and start over
                                console.log(`You can only order up to ${chosenItem.stock_quantity} ${chosenItem.product_name}`);
                                start();
                            }
                        });
                });
                break;

            case "Manager":
                this.connection.query("SELECT * FROM products", function (err, results) {
                    if (err) throw err;
                    // once we have the items, prompt the user for which they'd like to purchase
                    inquirer
                        .prompt([
                            {
                                name: "task",
                                type: "list",
                                message: "What would you like to do?",
                                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
                            }
                        ])
                        .then(function (answer) {
                            // Perform the chosen task
                            console.log(`Task was ${answer.task}`);
                            switch (answer.task) {
                                case "View Products for Sale":
                                default:
                                    // DB logic
                                    connection.query("SELECT * FROM products", function (err, results) {
                                        if (err) throw err;

                                        for (var i = 0; i < results.length; i++) {
                                            console.log(`${results[i].product_name}`);
                                        }
                                        start();
                                    });
                                    break;

                                case "View Low Inventory":
                                    // DB logic
                                    console.log(`View Low Inventory`);

                                    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, results) {
                                        if (err) throw err;

                                        for (var i = 0; i < results.length; i++) {
                                            console.log(`${results[i].product_name}`);
                                        }
                                        start();
                                    });
                                    break;

                                case "Add to Inventory":
                                    // DB logic
                                    inquirer
                                        .prompt([
                                            {
                                                name: "choice",
                                                type: "rawlist",
                                                choices: function () {
                                                    var choiceArray = [];
                                                    for (var i = 0; i < results.length; i++) {
                                                        choiceArray.push(`Product ID: ${results[i].id}, Item: ${results[i].product_name}, Price: ${results[i].price}, Quantity: ${results[i].stock_quantity}`);
                                                    }
                                                    return choiceArray;
                                                },
                                                message: "Select item to update quantity."
                                            },
                                            {
                                                name: "quantity",
                                                type: "input",
                                                message: `How many units?`,
                                                validate: function validateQty(value) {
                                                    var pass = value.match(/^[0-9]+$/);
                                                    if (pass) {
                                                        return true;
                                                    }
                                                    return "Must be a number (use backspace to re-enter a valid number)";
                                                }
                                            }
                                        ])
                                        .then(function (answer) {
                                            // get the information of the chosen item
                                            var chosenItem;
                                            var qty = 0;
                                            console.log(`Answer =${answer.choice.split(",")[1]}`);
                                            for (var i = 0; i < results.length; i++) {
                                                console.log(`Item = Item: ${results[i].product_name}`);
                                                if ("Item: " + results[i].product_name === answer.choice.split(",")[1].trim()) {
                                                    chosenItem = results[i];
                                                    qty = parseInt(answer.quantity) + chosenItem.stock_quantity;
                                                    console.log("ChosenItem = " + JSON.stringify(results[i]));
                                                    console.log(`qty = ${qty}`);
                                                    break;
                                                }
                                                
                                            }
                                            connection.query(
                                                "UPDATE products SET ? WHERE ?",
                                                [
                                                    {
                                                        stock_quantity: qty
                                                    },
                                                    {
                                                        id: chosenItem.id
                                                    }
                                                ],
                                                function (error) {
                                                    if (error) throw err;

                                                    console.log(`${answer.quantity} units added to product id ${chosenItem.id}, ${chosenItem.product_name}`);
                                                    start();
                                                }
                                            );
                                        });
                                    break;

                                case "Add New Product":
                                    // DB logic
                                    inquirer
                                        .prompt([
                                            {
                                                name: "product",
                                                type: "input",
                                                message: `Item Name?`
                                            },
                                            {
                                                name: "department",
                                                type: "input",
                                                message: `Department Name?`
                                            },
                                            {
                                                name: "price",
                                                type: "input",
                                                message: `Unit Price?`,
                                                validate: function validateQty(value) {
                                                    var pass = value.match(/^[0-9]+$/);
                                                    if (pass) {
                                                        return true;
                                                    }
                                                    return "Must be a number (use backspace to re-enter a valid number)";
                                                }
                                            },
                                            {
                                                name: "quantity",
                                                type: "input",
                                                message: `How many units?`,
                                                validate: function validateQty(value) {
                                                    var pass = value.match(/^[0-9]+$/);
                                                    if (pass) {
                                                        return true;
                                                    }
                                                    return "Must be a number (use backspace to re-enter a valid number)";
                                                }
                                            }
                                        ])
                                        .then(function (answer) {
                                            // get the information of the chosen item
                                            var currPrice = parseFloat(answer.price).toFixed(2);
                                            console.log(`Answer =${answer.product}`);
                                            for (var i = 0; i < results.length; i++) {
                                                if (results[i].product_name === answer.product.trim()) {
                                                    console.log(`Entry for ${answer.product} already exists in table.`);
                                                    return;
                                                }
                                            }
                                            connection.query(
                                                // "UPDATE products SET ? WHERE ?",
                                                `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (\"${answer.product.trim()}\",\"${answer.department.trim()}\",${currPrice},${answer.quantity})`,
                                                
                                                function (error) {
                                                    if (error) throw err;

                                                    console.log(`Added: ${answer.product}, ${answer.department}, ${currPrice}, ${answer.quantity}`);
                                                    start();
                                                }
                                            );
                                        });
                                    break;
                            }
                        });
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
                    switch (answer.task) {
                        case "View Product Sales by Department":
                        default:
                            // DB logic
                            break;
                        case "Create New Department":
                            // DB logic
                            break;
                    }
                });
                break;
        }
    }

}

module.exports = User;