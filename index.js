/* Variables start here */
const inquirer = require("inquirer");
// Get the client
const mysql = require("mysql2");
//Not Found - GET https://registry.npmjs.org/@types%2fconsole.table - Not found
const console_table = require("console.table");

// Create the connection to database
// https://www.npmjs.com/package/mysql2
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'businessDataBase'
    },
);
/* Variables end here */


/* Functions start here */
function main_choice() {
    inquirer
    .prompt([{
    type: "list",
    name: "main_choice",
    message: "Select an operation",
    choices: [
        "Add new Department",
        "Add new Role",
        "Add new exmployee",
        "View existing Department",
        "View existing Roles",
        "View existing Employees",
        "Update Existing Employee",
        "Quit"
        ]
        }])
        .then((answers) => {
            switch (answers.main_choice) {
                case "Add new Department":
                    newDepartment();
                    break;
                case "Add new Role":
                    newRole();
                    break;
                case "Add new exmployee":
                    newEmployee();
                    break;
                case "View existing Departments":
                    existingDepartments();
                    break;
                case "View existing Roles":
                    existingRoles();
                    break;
                case "View existing Employees":
                    existingEmployees();
                    break;
                case "Update Existing Employee":
                    updateEmployee();
                    break;
                case "Quit":
                    return;
                default:
                    return console.log("Error")
            }}).catch((err) => console.log(err))
}


//Test if statment
// if (answers.main == "Add new Department"){
//     addDepartment();
// } else if (answers.main == "Add new Role"){
//     addRole();
// } else if (answers.main == "Add new exmployee"){
//     addEmployee();
// } else if (answers.main == "View existing Departments"){
//     existingDepartments();
// } else if (answers.main == "View existing Roles"){
//     existingRoles();
// } else if (answers.main == "View existing Employees"){
//     existingEmployees();
// } else if (answers.main == "Update Existing Employee"){
//     updateEmployee();
// } else if (answers.main == "Add new Role"){
//     addRole();
// } else 
// console.log("Error")

function newDepartment(departmentName) {
    inquirer.prompt([{
        type: "input",
        name: 'departmentName',
        message: "Type new Department name"
        }]).then((answer) => {
            const departmentName = answer.departmentName;
            const query = `INSERT INTO department (name) VALUES ('${departmentName}')`;
            db.promise().query(query).then((results) => {
                console.log("Succesfully added new department")
            }).catch((err) => console.log(err)).then(() => {
                main_choice();
                })
                })
}

function newRole() {
    let departments = []
    const query = 'SELECT name FROM department';
    db.promise().query(query).then((results) => {results[0].forEach((dept) => departments.push(dept.name))
        inquirer.prompt([
            {
                type: "input",
                name: "roleName",
                message: "Type new role"
            },
            {
                type: "number",
                name: "Salary",
                message: "Input salary, include decimals."
            },
            {
                type: "list",
                name: "department",
                message: "Assign to a department",
                choices: departments
            }]).then((answer) => {
                const { rolename, salary } = answer; 
                const department_id = departments.indexOf(answer.department) + 1;
                const query = `INSERT INTO roles (title, salary, department_id) VALUES ('${rolename}', ${salary}, ${department_id})`;
                db.promise().query(query).then((results) => {
                    console.log('Successfully added new role')
                    }).catch((err) => console.log(err)).then(() => {
                        main_choice();
                        })
                    })
                })
}


function newEmployee() {
    let roles = []
    let roleIds = [] 
    let managers = [] 
    let managerIds = [] 
    const query = `select employee.id as manager_id, concat(employee.first_name, ' ', employee.last_name) as Managers, 
        roles.title, roles.id as roles_id, employees.manager_id 
        from employees right join roles on employees.role_id = roles.id 
        where employees.manager_id is null or roles.title is not null`;
        db.promise().query(query).then((results) => {
            results[0].forEach((role) => {
                if (role.title !== null ) {
                    let role_id_Object = {}
                    role_id_Object.title = role.title
                    role_id_Object.id = role.roles_id
                    roleIds.push(role_id_Object)
                    if(!roles.includes(role.title)) {
                        roles.push(role.title);
                        }
                }

                if (role.Managers !== null && role.manager_id === null) { 
                    let manager_Object = {}
                    manager_Object.name = role.Managers
                    manager_Object.id = role.manager_id
                    managerIds.push(manager_Object);
                    managers.push(role.Managers)
                }
            })
            inquirer.prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "Input new employee first name"
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "Input new employee last name"
                },
                {
                    type: "list",
                    name: "role",
                    message: "Input new employee's role",
                    choices: roles
                }
                ]).then((answer) => {
                    const { firstName, lastName } = answer;
                    let empRole = roleIds.find(r => r.title === answer.role);
                    let roleId = empRole.id
                    const query = `INSERT INTO employees (first_name, last_name, role_id, manager_id) 
                        VALUES ('${firstName}', '${lastName}', ${roleId})`;
                    db.promise().query(query)
                        .then((results) => {
                        console.log('Successfully added new Employee')
                    }).catch((err) => console.log(err)).then(() => {
                        main_choice();
                    })
                })
            })
}

// simple query
// https://www.npmjs.com/package/mysql2 First Query
// connection.query(
//     'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45',
//     function(err, results, fields) {
//       console.log(results); // results contains rows returned by server
//       console.log(fields); // fields contains extra meta data about results, if available
//     }
//   );

// https://www.npmjs.com/package/mysql2
// Alternative
// async function main() {
//     // get the client
//     const mysql = require('mysql2/promise');
//     // create the connection
//     const connection = await mysql.createConnection({host:'localhost', user: 'root', database: 'test'});
//     // query database
//     const [rows, fields] = await connection.execute('SELECT * FROM `table` WHERE `name` = ? AND `age` > ?', ['Morty', 14]);
//   }

function existingDepartments() { 
    const query = "SELECT * FROM department"
    db.promise().query(query).then((results) => {
        console.table(results[0])
        }).catch((err)).then(() => {
            main_choice()
            })
}

// 'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?',
function existingRoles() {
    const query = `SELECT roles.id, roles.title, roles.salary, department.name as department FROM roles right join department on roles.department_id = department.id`;
    db.promise().query(query).then((results) => {
        console.table(results[0])
        }).catch((err)).then(() => {
            main_choice();
            })
}

function existingEmployees() {
    const query = `SELECT employee.id, employee.first_name as 'first name', employee.last_name as 'last name', 
        role.title, department.name as department, role.salary, 
        concat(m.first_name, ' ', m.last_name) as manager 
        FROM employee INNER JOIN roles ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id 
        LEFT JOIN employee m ON m.id = employee.manager_id`;
        db.promise().query(query).then((results) => {
            console.table(results[0])
            }).catch((err)).then(() => {
                main_choice();
                })
}

// Not working properly, check
function updateEmployee() {
    let employees = [] 
    let employeeIds = [] 
    let roles = [] 
    let roleIds = [] 
    const query = `SELECT employee.id as employee_id, 
    CONCAT(first_name, ' ', last_name) as name, roles.title as role, roles.id as roles_id 
    FROM employees RIGHT JOIN roles ON employees.role_id = roles.id`;
    db.promise().query(query).then((results) => {
        results[0].forEach((employee) => {
            if (employee.employee_id !== null ) {
                let employee_Object = {}
                employee_Object.name = employee.name
                employee_Object.id = employee.employee_id
                employeeIds.push(employee_Object)
                if(!employees.includes(employee.employee_id)) {
                    employees.push(employee.name);
                    }
                }
            if (employee.roles_id !== null) {
                let role_id_Object = {}
                role_id_Object.title = employee.role
                role_id_Object.id = employee.roles_id
                roleIds.push(role_id_Object);
                if (!roles.includes(employee.role)) {
                    roles.push(employee.role)
                }
                }})
            inquirer.prompt([
                {
                    type: "list",
                    name: "name",
                    message: "Select an employee to update",
                    choices: employees
                },
                {
                    type: "list",
                    name: "role",
                    message: "Select a new role to assign",
                    choices: roles
                }]).then((answer) => {
                    const { name, role } = answer;
                    let employee_Object = employeeIds.find(employee => employee.name === name);
                    let role_id_Object = roleIds.find(role => role.title === role);
                    const query = `UPDATE employees SET role_id = ${role_id_Object.id} 
                    WHERE id = ${employee_Object.id}`;
                    db.promise().query(query).then((results) => {
                        console.log(`successfully updated role for ${employee_Object.name}`)
                    }).catch((err) => console.log(err)).then(() => {
                        main_choice();
                    })
                })
            })
}

/* Functions end here */

/* Start here */

function init() {
    main_choice()
}

init();