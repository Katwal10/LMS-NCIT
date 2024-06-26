const express = require('express');
const app = express();
const mysql = require('mysql2');
const session = require('express-session');
const crypto = require('crypto');
const path= require('path');

app.use(express.json()); // Middleware to parse JSON
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ayush9841190033',
  database: 'library_management_system'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

const port = 3000; // Specify the port number you want to use

// Serve static files from the "public" directory
app.use(express.static('public'));

// Generate a random secure secret key
const generateRandomSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secretKey = generateRandomSecret();
console.log('Generated Secret Key:', secretKey);

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
}));

//Authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM login_credential WHERE User_ID = ? AND Password = ?';
  connection.query(query, [username, password], (error, results) => {
      if (error) {
          console.error('Database error:', error);
          res.status(500).json({ error: 'Database error' });
      } else {
          if (results.length > 0) {
              res.status(200).json({ message: 'Login successful.' });
              console.log("Login Successful!")
          } else {
              res.status(401).json({ error: 'Invalid username or password!' });
          }
      }
  });
});


// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session.usernod) {   // User is authenticated, proceed to the next middleware or route
    next();
  } else {                         // User is not authenticated, redirect to the login page
    res.redirect('/login');        // Change this to the correct login page URL
  }
};

app.get('/dashboard', requireAuth, (req, res) => {
  // Send the existing HTML file as the response
  const dashboardFilePath = path.join(__dirname, 'Public', 'dashboard.html');
  res.sendFile(dashboardFilePath);
});

// Logout route
app.post('/logout', (req, res) => {
  // Clear the session and redirect to the login page
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).json({ message: 'Logout error' });
    } else {
      res.status(200).json({ message: 'Logout successful' });
    }
  });
});


// Route for handling form submission of inventory.form
app.post('/submit', (req, res) => {
  const { bookID, category, name, numOfBooks, authorPublication, price } = req.body;

  console.log('bookID:', bookID); // Log the value of bookID

  // Check if the bookID already exists in the database
  const selectQuery = 'SELECT * FROM inventory WHERE Book_ID = ?';
  connection.query(selectQuery, [bookID], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'An error occurred', details: err });
      return;
    }

    if (results.length === 0) {
      // If the bookID doesn't exist, insert a new row
      const insertQuery = 'INSERT INTO inventory (Book_ID, Course_Category, Book_Name, No_of_Books, `Author/Publication`, Price) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [bookID, category, name, numOfBooks, authorPublication, price];

      connection.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error saving data:', err);
          res.status(500).json({ error: 'An error occurred', details: err });
        } else {
          console.log('Data saved successfully');
          res.status(200).json({ message: 'Data saved successfully' });
        }
      });
    } else {
      // If the bookID already exists, update the existing row
      const updateQuery = 'UPDATE inventory SET No_of_Books = No_of_Books + ? WHERE Book_ID = ?';
      const values = [numOfBooks, bookID];

      connection.query(updateQuery, values, (err, result) => {
        if (err) {
          console.error('Error updating data:', err);
          res.status(500).json({ error: 'An error occurred', details: err });
        } else {
          console.log('Data updated successfully');
          res.status(200).json({ message: 'Data updated successfully' });
        }
      });
    }
  });
});



// Route for displaying the inventory table
app.get('/inventory', (req, res) => {
  const selectQuery = 'SELECT * FROM inventory';

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'An error occurred', details: err });
    } else {
      res.send(generateInventoryTable(results));
    }
  });
});

function generateInventoryTable(data) {
  let tableHTML = `
    <table id="inventoryTable" class="inventory-table">
      <thead>
        <tr>
          <th>Book ID</th>
          <th>Category</th>
          <th>Name</th>
          <th>Number of Books</th>
          <th>Author/Publication</th>
          <th>Price</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach(row => {
    tableHTML += `
      <tr>
        <td>${row.Book_ID}</td>
        <td>${row.Course_Category}</td>
        <td>${row.Book_Name}</td>
        <td>${row.No_of_Books}</td>
        <td>${row['Author/Publication']}</td>
        <td>${row.Price}</td>
        <td><button title="Delete" class="delete-button" data-bookid="${row.Book_ID}">
        <img src="Logo&Images/Trash_Can.png" alt="Delete" height="20px" width="20px"></button></td>
      </tr>`;
  });

  tableHTML += `
      </tbody>
    </table>`;

  return `
    <html>
    <head>
      <title>LMS-Nagarjuna College of IT</title>
      <link rel="icon" href="Logo&Images/nagarjuna-logo.png" type="image/png"> <!--favicon-->
      <style>
        .inventory-table {
          border-collapse: collapse;
          width: 100%;
        }

        .inventory-table th,
        .inventory-table td {
          border: 1px solid black;
          padding: 8px;
          text-align: center;
        }

        .inventory-table th {
          background-color: #6C22C9;
          color: white;
        }
      </style>

      <script>
      document.addEventListener("DOMContentLoaded", function () {
        const deleteButtons = document.querySelectorAll(".delete-button");
      
        deleteButtons.forEach(button => {
          button.addEventListener("click", function () {
            const bookId = this.getAttribute("data-bookid");
      
            // Display a confirmation box
            const confirmation = confirm("Are you sure you want to delete this book from inventory?");
            if (!confirmation) {
              return; // If user cancels, do nothing
            }
      
            fetch('/delete-book', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ bookId }),
            })
              .then(response => response.json())
              .then(data => {
                if (data.message === 'Book deleted successfully') {
                  const row = this.closest("tr");
                  row.remove();
                } else {
                  console.error('Error deleting book:', data.error);
                }
              })
              .catch(error => {
                console.error('Error deleting book:', error);
              });
          });
        });
      });
      </script>
    </head>
    <body>
      ${tableHTML}
    </body>
    </html>
  `;
}

//Route for deleting the books (Inventory) row 
app.post('/delete-book', (req, res) => {
  const bookId = req.body.bookId;
  const deleteQuery = 'DELETE FROM inventory WHERE Book_ID = ?';

  connection.query(deleteQuery, [bookId], (err, results) => {
    if (err) {
      console.error('Error deleting from the database:', err);
      res.status(500).json({ error: 'An error occurred', details: err });
    } else {
      res.status(200).json({ message: 'Book deleted successfully' });
    }
  });
});




app.post('/submit-student', (req, res) => {
  const { date, id, name, program, semester, book } = req.body;

  // Check if the Student_ID already exists in the student_account table
  const selectQuery = 'SELECT * FROM student_account WHERE Student_ID = ?';
  connection.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'An error occurred', details: err });
      return;
    }

    if (results.length === 0) {
      // If the Student_ID doesn't exist, insert a new row in both tables
      const studentQuery = 'INSERT INTO student_account (Student_ID, Student_name, Program, Semester) VALUES (?, ?, ?, ?)';
      const studentValues = [id, name, program, semester];

      connection.query(studentQuery, studentValues, (err, result) => {
        if (err) {
          console.error('Error inserting data into student_account table:', err);
          res.status(500).json({ error: 'An error occurred', details: err });
          return;
        }
        console.log('Data inserted into student_account table.');

        // Insert data into books table
        const bookValues = book.map(bookName => [id, date, bookName]);
        const bookQuery = 'INSERT INTO books (Student_ID, Book_Issued_Date, Book_Name) VALUES ?';

        connection.query(bookQuery, [bookValues], (err, result) => {
          if (err) {
            console.error('Error inserting data into books table:', err);
            res.status(500).json({ error: 'An error occurred', details: err });
            return;
          }
          console.log('Data inserted into books table.');
          res.status(200).json({ message: 'Data inserted successfully' });
        });
      });
    } else {
      // If the Student_ID already exists, insert data into books table only
      const bookValues = book.map(bookName => [id, date, bookName]);
      const bookQuery = 'INSERT INTO books (Student_ID, Book_Issued_Date, Book_Name) VALUES ?';

      connection.query(bookQuery, [bookValues], (err, result) => {
        if (err) {
          console.error('Error inserting data into books table:', err);
          res.status(500).json({ error: 'An error occurred', details: err });
          return;
        }
        console.log('Data inserted into books table.');
        res.status(200).json({ message: 'Data inserted successfully' });
      });
    }
  });
});


// Route to handle the account checking request
app.post('/check-account', (req, res) => {
  const { studentID, studentName } = req.body;

  // Construct the SQL query
  const query = `
    SELECT sa.Student_ID, sa.Student_name, sa.Program, sa.Semester, b.Book_Name, DATE_FORMAT(b.Book_Issued_Date, '%Y-%m-%d') AS Book_Issued_Date
    FROM student_account sa
    LEFT JOIN books b ON sa.Student_ID = b.Student_ID
    WHERE sa.Student_ID = ? AND sa.Student_name = ?
  `;

  // Execute the query with the provided student ID and name
  connection.query(query, [studentID, studentName], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ accountFound: false, error: 'An error occurred while checking the account.' });
    } else {
      if (results.length > 0) {
        // Account found, return the data
        const accountData = {
          studentID: results[0].Student_ID,
          studentName: results[0].Student_name,
          program: results[0].Program,
          semester: results[0].Semester,
          books: results.map(row => ({
            bookName: row.Book_Name,
            bookIssuedDate: row.Book_Issued_Date
          }))
        };
        res.json({ accountFound: true, accountData });
      } else {
        // Account not found
        res.json({ accountFound: false });
      }
    }
  });
});


//Route to handle book removal
app.delete('/remove-book/:studentID/:bookName/:bookIssuedDate', (req, res) => {
  const { studentID, bookName, bookIssuedDate } = req.params;

  // Perform the SQL delete query to remove the book from the database
  const deleteQuery = `DELETE FROM books WHERE Student_ID = ? AND Book_Name = ?`;

  connection.query(deleteQuery, [studentID, bookName, bookIssuedDate], (error, results) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'An error occurred while removing the book.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found for the given student ID and book name.' });
    }

    // Book successfully deleted from the database
    return res.status(200).json({ message: 'Book removed successfully.' });
  });
});                 




// Route to handle account deletion request
app.delete('/delete-account/:studentID', (req, res) => {
  const studentID = req.params.studentID;

  // Delete rows from the 'books' table associated with the student ID
  const deleteBooksQuery = `
    DELETE FROM books
    WHERE Student_ID = ?
  `;

  // Execute the 'deleteBooksQuery' first to remove associated rows from the 'books' table
  connection.query(deleteBooksQuery, [studentID], (deleteBooksErr) => {
    if (deleteBooksErr) {
      console.error('Error executing delete query for books:', deleteBooksErr);
      res.status(500).json({ success: false, message: 'An error occurred while deleting the account.' });
    } else {
      // Now delete the row from the 'student_account' table
      const deleteStudentAccountQuery = `
        DELETE FROM student_account
        WHERE Student_ID = ?
      `;

      connection.query(deleteStudentAccountQuery, [studentID], (deleteStudentAccountErr, deleteResult) => {
        if (deleteStudentAccountErr) {
          console.error('Error executing delete query for student_account:', deleteStudentAccountErr);
          res.status(500).json({ success: false, message: 'An error occurred while deleting the account.' });
        } else {
          if (deleteResult.affectedRows > 0) {
            res.json({ success: true, message: 'Account deleted successfully.' });
          } else {
            res.status(404).json({ success: false, message: 'Account not found.' });
          }
        }
      });
    }
  });
});


//Route to store login credentials    
app.post('/changeCredentials', (req, res) => {
  const userID = req.body.changeUserID;
  const password = req.body.newPassword;
  const confirmPassword = req.body.confirmNewPassword;

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Password Not Matched.' });
    return;
  }

  // Update the credentials in the login_credential table
  const sql = 'UPDATE login_credential SET User_ID = ?, Password = ? WHERE `S.N.` = 1';
  connection.query(sql, [userID, password], (err, result) => {
    if (err) {
      console.error('Error updating credentials:', err);
      res.status(500).json({ error: 'Error updating credentials in the database.' });
      return;
    }
    console.log('Rows affected:', result.affectedRows); // Add this line
    res.status(200).json({ message: 'Credentials updated successfully!' });
  });  
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
