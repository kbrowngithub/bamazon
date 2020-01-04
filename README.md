# bamazon
```
Designed and Developed by: Kevin Brown
```

# Project Overview
```
Bamazon is an Amazon-like storefront created using node.js and MySQL. The app will take in orders from customers 
and deplete stock from the store's inventory. The app also tracks product sales across the store's departments 
and then provides a summary of the highest-grossing departments in the store.

```
### Demo Recording Links: 

bamazonCustomer:  https://drive.google.com/file/d/1zeghP8bM8IfJiRDXjMi8xN9fzs6x34pk/view

bamazonManager:  https://drive.google.com/file/d/13VxQt5hWuUvmO6Rrght_NGmLYY5p9ERl/view

bamazonSupervisor:  https://drive.google.com/file/d/17-e3Aw9cBSyXRwcR7zhV7-YdyJsyi1wS/view

# Organizational Overview

### Application Functionality
```
    bamazonCustomer.js:
        - Initially displays a list of all available products and allows the customer to either scroll through the 
          list and select what they'd like to buy.

        - Once the user selects an item the app prompts them for the quantity they'd like to buy. If the user 
          enters a quantity that is more than the stock on hand the user is reprompted to enter a quantity up 
          to the max quantity available.

        - Once the application collects the item and quantity from the user the database is updated and the 
          total cost of their purchase is displayed.
        
        
    bamazonManager.js:
        - Initially displays the following list of activities that the user can execute:
            1. View Products for Sale
                Lists every available item (item ID, name, price, and quantity available).

            2. View Low Inventory
                Lists all items with an inventory count lower than five.

            3. Add to Inventory
                Displays a prompt that lets the manager "add more" of any item currently in the store.

            4. Add New Product
                Allows the manager to add a completely new product to the store.

            5. Exit
            Exits the application.

    bamazonSupervisor.js:
        - Initially displays the following list of activities that the user can execute:
        1. View Product Sales by Department
            Displays a summarized table in the terminal/bash window that contains the following columns:
                a. department_id: Unique ID of the particular department.
                b. department_name: Name of the department.
                c. over_head_costs: Over head cost of the department.
                d. product_sales: Running total of all sales for a particular product.
                e. total_profit: Product Sales after subtracting over head cost.

        2. Create New Department
            Allows the supervisor to add a completely new department to the store. If the department 
            already exists the user is notified and no new entry is created.

        3. Exit
            Exits the application.

```

### Technologies Used in this application

```
Technology Requirements:
    1. Data Sources
        a. MySQL Database

    2. Logic
        a. Javascript
        b. Node.js (Inquirer, mysql, console.table)
        c. SQL
    
```

### Implementation

```
User Prompts:
  - All user prompts and sub-prompts were implemented using the Node Inquirer package.

Database:
  - The MySQL Database, bamazon, contains the two tables described below.
    - products table contains:
        1. Unique id of the product
        2. The product name
        3. Unit price of the product
        4. Total stock on hand of the product
        5. The total product sales

    - departments table contains:
        1. Unique id of the department
        2. Department name
        3. Overhead Costs for the department

Database Queries:
  - All queries to the database were implemented using the mysql node package.

Display:
  - Query results for the Supervisor report were formatted for display to the user using the 
    console.table node package.

Node Dependencies:
    - "console.table": "^0.10.0",
    - "inquirer": "^7.0.1",
    - "mysql": "^2.17.1"

```

# How to run the app

### Setup

```
1.) clone bamazon to your computer (git@github.com:kbrowngithub/bamazon.git)

2.) From a terminal cd into the root directory of your bamazon instance and run
the command:  npm install
This will install the required node packages.

3.) On a MySQL Database server create the database using this script:

-- Drops the bamazon if it exists currently, (only for dev purposes) --
DROP DATABASE IF EXISTS bamazon;

-- Creates the new bamazon database --
CREATE DATABASE bamazon;

-- Make it so all of the following code will affect the new bamazon DB --
USE bamazon;

-- Creates the table products within bamazon DB --
CREATE TABLE products (
	-- Unique ID for each product --
	id INTEGER(11) AUTO_INCREMENT NOT NULL,
    PRIMARY KEY (id),
    
  -- Product name, cannot contain null, no duplicates --
	product_name VARCHAR(30) UNIQUE NOT NULL,
    
	-- Department name, cannot contain null, no duplicates --
	department_name VARCHAR(50) NOT NULL,
    
  -- Price --
	price FLOAT(10,2),
    
    -- Quantity in stock --
	stock_quantity INTEGER(10),
    
    -- Total sales for the product --
    product_sales FLOAT DEFAULT 0
);

-- Dummy Data, change the actual values to whatever you want. However, the department name --
-- must match what is in the department table below --
INSERT INTO products (product_name, department_name, price, stock_quantity) 
VALUES
("Sleeping Bag","Camping",129.99,39),
("Cot","Camping",149.99,36),
("Life Vest","Boating",49.99,10),
("Anchor","Boating",74.99,13),
("Duck Decoys","Hunting",179.99,124),
("Decoy Anchors","Hunting",24.99,75),
("Hunting Knife","Hunting",19.99,9),
("Hatchet","Camping",29.99,23),
("Matches","Camping",3.99,50),
("Buoy","Boating",34.99,8),
("12 Guage Shot Shells","Hunting",15.99,45),
("20 Guage Shot Shells","Hunting",12.99,369),
("Stove","Camping",139.99,6),
("Fishing Pole","Fishing",89.99,25),
("Pflueger Reel","Fishing",129.99,14);

-- For development purposes only --
DROP TABLE IF EXISTS departments;

-- Creates the table departments within bamazon DB --
CREATE TABLE departments (

	-- Unique ID for each department --
	department_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    PRIMARY KEY (department_id),
    
  -- Department name, cannot contain null, no duplicates --
	department_name VARCHAR(30) UNIQUE NOT NULL,

  -- over_head_costs (A dummy number you set for each department) --
	over_head_costs FLOAT(10,2) DEFAULT 0
);

-- Dummy Data, change the over_head_costs values to whatever you want --
INSERT INTO departments (department_name, over_head_costs) 
VALUES
("Camping", "1000"),
("Boating", "2000"),
("Hunting", "2500"),
("Fishing", "500"),
("Clothing", "900");

```

### Execution

```
To execute the bamazon application, from a terminal window cd into the root directory of 
the bamazon app and do one of:  
    Type 'node bamazonCustomer' to run the Customer application.
    Type 'node bamazonManager' to run the Manger application.
    Type 'node bamazonSupervisor' to run the Supervisor application.

```






