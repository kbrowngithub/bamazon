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

function prompt() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // once we have the items, prompt the user for which they'd like to purchase
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(`Product ID: ${results[i].id}, Item: ${results[i].product_name}, Price: ${results[i].price.toFixed(2)}`);
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
                // console.log(`Answer =${answer.choice.split(",")[1]}`);
                for (var i = 0; i < results.length; i++) {
                    // console.log(`Item = Item: ${results[i].product_name}`);
                    if ("Item: " + results[i].product_name === answer.choice.split(",")[1].trim()) {
                        chosenItem = results[i];
                        // console.log("ChosenItem = " + JSON.stringify(results[i]));
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
                            var total = chosenItem.price * answer.quantity;
                            var pSales = chosenItem.product_sales + total;
                            connection.query(
                                "UPDATE products SET ? WHERE ?",
                                [
                                    {
                                        product_sales: pSales
                                    },
                                    {
                                        id: chosenItem.id
                                    }
                                ],
                                function (error) {
                                    if (error) throw err;
                                    // console.log(`Updated product_sales for ${chosenItem.product_name}`);
                                    console.log(`\nPurchase Complete\nItem: ${chosenItem.product_name}, Quantity: ${answer.quantity}\nTotal Cost: ${formatter.format(total)}\n`);
                                }
                            );
                            prompt();
                        }
                    );
                }
                else {
                    // Not enough in stock, so apologize and start over
                    console.log(`You can only order up to ${chosenItem.stock_quantity} ${chosenItem.product_name}`);
                    this.prompt();
                }
            });
    });
}

function start() {
    process.stdout.write('\033c'); // Refresh the screen
    prompt();
}

start();