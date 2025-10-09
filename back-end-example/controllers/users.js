const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authLogger } = require('../middlewares/logger');

// In-memory user storage (replace with database in production)
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    avatar: 'https://example.com/avatar1.jpg'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    avatar: 'https://example.com/avatar2.jpg'
  }
];

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Controller functions
const userController = {
  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'Unknown';

      // Validate input
      if (!email || !password) {
        authLogger.logLogin(email || 'unknown', false, ip, userAgent);
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = users.find(u => u.email === email);
      if (!user) {
        authLogger.logLogin(email, false, ip, userAgent);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        authLogger.logLogin(email, false, ip, userAgent);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user.id);

      // Log successful login
      authLogger.logLogin(email, true, ip, userAgent);

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
        message: 'Login successful'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'Unknown';

      // Validate input
      if (!name || !email || !password) {
        authLogger.logRegister(email || 'unknown', false, ip, userAgent);
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        authLogger.logRegister(email, false, ip, userAgent);
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = {
        id: String(users.length + 1),
        name,
        email,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };

      users.push(newUser);

      // Generate token
      const token = generateToken(newUser.id);

      // Log successful registration
      authLogger.logRegister(email, true, ip, userAgent);

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        user: userWithoutPassword,
        token,
        message: 'Registration successful'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Logout user
  logout: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Log logout
    authLogger.logLogout(req.user.email, ip, userAgent);

    res.json({ message: 'Logout successful' });
  },

  // Validate token
  validateToken: (req, res) => {
    // If middleware passes, token is valid
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({
      valid: true,
      user: userWithoutPassword
    });
  },

  // Get current user profile
  getProfile: (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  },

  // Update user profile
  updateProfile: (req, res) => {
    try {
      const { name, avatar } = req.body;
      const userId = req.user.id;

      // Find and update user
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user data
      if (name) users[userIndex].name = name;
      if (avatar) users[userIndex].avatar = avatar;

      // Return updated user (without password)
      const { password: _, ...userWithoutPassword } = users[userIndex];
      res.json(userWithoutPassword);

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all users (protected route example)
  getAllUsers: (req, res) => {
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  },

  // Find user by ID (for middleware)
  findUserById: (userId) => {
    return users.find(u => u.id === userId);
  }
};

module.exports = { userController, JWT_SECRET };
