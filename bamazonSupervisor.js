var inquirer = require("inquirer");
var mysql = require("mysql");
const cTable = require('console.table');

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

// connection.end();

function salesByDepartment() {
    // Alias A = departments table and B = proucts table.
    // Right join A and B on department_name.
    // Take department_id, department_name, and over_head_costs from departments table.
    // Sum up the product sales column from products table. If it's null return 0.
    // Calculate total_profit by subtracting over_head_costs from the product sales sum.  If it's null return 0.
    // Group it all by department_id, department_name, and over_head_costs
    // Pass it to the npm console.table for proper display.
    connection.query(" SELECT A.department_id, A.department_name, A.over_head_costs, " + 
                        "SUM(IFNULL(B.product_sales, 0)) as product_sales, " +
                        "SUM(IFNULL(B.product_sales, 0)) - A.over_head_costs as total_profit " +
                        "FROM products B RIGHT JOIN departments A ON B.department_name = A.department_name " +
                        "GROUP BY A.department_id, A.department_name, A.over_head_costs", function (err, results) {
            console.table(results);
            prompt();
        }
    );
}

function createNewDepartment() {
    inquirer
        .prompt([
            {
                name: "department",
                type: "input",
                message: `Department Name?`
            }
        ])
        .then(function (answer) {
            connection.query(
                // "UPDATE products SET ? WHERE ?",
                `INSERT INTO departments (department_name) VALUES (\"${answer.department.trim()}\")`,

                function (error) {
                    if (error) throw err;

                    console.log(`Added Department: ${answer.department} to departments table.`);
                    prompt();
                }
            );
        });
}

function prompt() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // once we have the items, prompt the user for which they'd like to purchase
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
                case "Create New Department":
                    createNewDepartment();
                    break;

                case "View Product Sales by Department":
                default:
                    salesByDepartment();
                    break;
            }
        });
    });
}

function start() {
    prompt();
}

start();