var inquirer = require("inquirer");
var mysql = require("mysql");

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

var connectionData = {
    // debug: true,
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
};

var connection = mysql.createConnection(connectionData);

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // console.log(`Connected to ${dbName}`);
});

function viewProducts() {
    // DB logic
    connection.query("SELECT id, product_name, department_name, FORMAT(price,2), stock_quantity, FORMAT(product_sales,2) FROM products", function (err, results) {
        if (err) throw err;

        console.table(results);
        prompt();
    });
}

function viewLowInventory() {
    console.log(`View Low Inventory`);

    connection.query("SELECT id, product_name, department_name, FORMAT(price,2), stock_quantity, FORMAT(product_sales,2) FROM products WHERE stock_quantity < 5", function (err, results) {
        if (err) throw err;

        // for (var i = 0; i < results.length; i++) {
        //     console.log(`${results[i].product_name}: ${results[i].stock_quantity} units left.`);
        // }
        console.table(results);
        prompt();
    });
}

function addToInventory() {
    inquirer
        .prompt([
            {
                name: "choice",
                type: "list",
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
            // console.log(`Answer =${answer.choice.split(",")[1]}`);
            for (var i = 0; i < results.length; i++) {
                // console.log(`Item = Item: ${results[i].product_name}`);
                if ("Item: " + results[i].product_name === answer.choice.split(",")[1].trim()) {
                    chosenItem = results[i];
                    qty = parseInt(answer.quantity) + chosenItem.stock_quantity;
                    // console.log("ChosenItem = " + JSON.stringify(results[i]));
                    // console.log(`qty = ${qty}`);
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

                    console.log(`${answer.quantity} units added to product id ${chosenItem.id}, ${chosenItem.product_name}\n`);
                    prompt();
                }
            );
        });
}

function addNewProduct() {
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
            // console.log(`Answer =${answer.product}`);
            // for (var i = 0; i < results.length; i++) {
            //     if (results[i].product_name === answer.product.trim()) {
            //         console.log(`Entry for ${answer.product} already exists in table.`);
            //         return;
            //     }
            // }
            connection.query(
                // "UPDATE products SET ? WHERE ?",
                `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (\"${answer.product.trim()}\",\"${answer.department.trim()}\",${currPrice},${answer.quantity})`,

                function (error) {
                    if (error) {
                        if (error.code === 'ER_DUP_ENTRY') {
                            console.log(`\nDepartment \'${answer.product.trim()}\' already exists.\n`);
                            prompt();
                        } else {
                            throw error;
                        }
                    } else {
                        console.log(`Added: ${answer.product}, ${answer.department}, ${currPrice}, ${answer.quantity}\n`);
                        prompt();
                    }
                }
            );
        });
}

function prompt() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // once we have the items, prompt the user for which they'd like to purchase
        inquirer
            .prompt([
                {
                    name: "task",
                    type: "list",
                    message: "What would you like to do?",
                    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
                }
            ])
            .then(function (answer) {
                // Perform the chosen task
                // console.log(`Task was ${answer.task}`);
                switch (answer.task) {
                    case "View Products for Sale":
                        viewProducts();
                        break;

                    case "View Low Inventory":
                        viewLowInventory();
                        break;

                    case "Add to Inventory":
                        addToInventory();
                        break;

                    case "Add New Product":
                        addNewProduct();
                        break;
                    case "Exit":
                    default:
                        connection.end();
                        return;
                }
        });
    });
}

function start() {
    process.stdout.write('\033c'); // Refresh the screen
    prompt();
}

start();