### Project: Le vieux Grimoir

The Grimoir API is a RESTful backend application built with Node.js and Express.js. 
It provides endpoints for adding, rating, modifying or deleting books and user authentication. 
The application connects to a MongoDB database hosted on MongoDB Atlas.

## Features

- List, add, update, rate and delete books.
- User authentication with basic login functionality.
- Static file serving for images.

### Prerequisites : Node.js
(https://nodejs.org/)

### Installation

1. **Clone the repository:**

 git clone https://github.com/xpatk/Grimoir.git

### Setting Up Environment Variables

2. **Create an `.env` File**

   In the root directory of the project, create a file named `.env`. This file will hold your environment-specific settings. 

3. **Add Environment Variables**

   Open the `.env` file and add the necessary environment variables

   Example `.env` configuration for a custom MongoDB database:

   ```env
   USER_KEY=testuser
   USER_PSWD=testuser123

testuser has READONLY rights. Otherwise you need to set up a connection to your own database cluster. 
