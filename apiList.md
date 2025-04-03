**API List**

**Base URL:** `/api/v1`

### **Profile Routes** (`/profile`)

- **GET** `/view` - View user profile _(Auth required)_
- **PATCH** `/edit` - Edit user profile _(Auth required)_
- **PATCH** `/update-img` - Update profile image _(Auth required)_

### **Auth Routes** (`/auth`)

- **(Routes not provided, assumed to exist)**

### **User Routes** (`/user`)

- **GET** `/feed` - Get user feed _(Auth required)_
- **GET** `/all-connections` - Get all connections _(Auth required)_
- **GET** `/pending-connection-requests` - Get pending connection requests _(Auth required)_

### **Request Routes** (`/request`)

- **POST** `/send/:status/:toUserId` - Send a connection request _(Auth required)_
- **POST** `/review/:status/:requestId` - Review a connection request _(Auth required)_

### **Middlewares**

- `authMiddleware` - Used to protect routes requiring authentication.

### **Server Setup**

- **Middleware Used:**
  - `helmet` - Security enhancements
  - `express.json()` - JSON parsing
  - `cookie-parser` - Cookie handling
  - `express-fileupload` - File upload handling (temporary storage in `/tmp/`)
  - `cors` - Enable CORS

### **Server Routes**

- **Base Route:** `/` - Returns `server run` message
- **PORT:** `4000` - Server runs on `http://localhost:4000`
