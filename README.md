**Overview**
A comprehensive employee management system with role-based access control (Admin, Manager, Employee) featuring expense management, leave processing, performance appraisals, and weekly reviews.

**Installation**
   **Prerequisites**
     Node.js (v16 or higher)

     MongoDB (v4.4 or higher)

     npm (v8 or higher) or yarn

     
**Setup Instructions**
    **Clone the repository:**
    git clone https://github.com/priyanshu2552/Emp_P.git
    cd Emp_P

    
   **Install Frontend dependencies:**
   cd frontend
   npm install

   **Install Bakcend dependencies:**
   cd backend
   npm install

   **Set up environment variables:**
   cp .env.example .env

**Configure your .env file with these essential variables:**
PORT=3000
# Database
MONGODB_URI=your MongoDb Atlas URI
JWT_SECRET=your_jwt_secret_key

**Tech Stack**

   **Frontend:**
     React.js
     Material-UI
     Axios (HTTP Client)
     Formik + Yup (Form Handling)
     
   **Backend:**
    Node.js
    Express.js
    MongoDB (Database)
    Mongoose (ODM)
    JWT (Authentication)

   
 




