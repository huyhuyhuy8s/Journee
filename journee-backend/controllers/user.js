const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authLogger } = require('../middlewares/logger');
const { clientDb, adminDb } = require('@config/firebase');

const { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc } = require('firebase/firestore');

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET;
// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const checkIsUserExist = async (userId) => {
  if (!userId) return false;

  const allSettingsSnap = await getDocs(collection(clientDb, 'userSettings'));
  if (allSettingsSnap.docs && allSettingsSnap.docs.some(d => d.data().userId === userId)) {
    return false;
  }

  return true
}

const settingCreation = async (userId) => {
  if (!checkIsUserExist(userId)) return;

  const userSettings = {
    userId,
    visibility: {
      journalEntries: false,
      locationHistory: false,
      location: "Precise",
    },
    action: {
      addFriend: true,
      commentPost: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await addDoc(collection(clientDb, 'userSettings'), userSettings);
}

const blacklistCreation = async (userId) => {
  if (!checkIsUserExist(userId)) return;

  const userBlacklist = {
    userId,
    blockedUsers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await addDoc(collection(clientDb, 'userBlacklists'), userBlacklist);
}

// Controller functions
const userController = {
  createUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const allUsersSnap = await getDocs(collection(clientDb, 'users'));
      if (allUsersSnap.docs.some(d => d.data().email === email)) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = {
        name,
        email,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      }

      const ref = await addDoc(collection(clientDb, 'users'), newUser);

      await settingCreation(ref.id);
      await blacklistCreation(ref.id);

      res.status(201).json({ message: 'User created successfully', id: ref.id })
    } catch (err) {
      console.log('createUser err:', err)
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getAllUsers: async (req, res) => {
    const allUsersSnap = await getDocs(collection(clientDb, 'users'));
    const allUsers = allUsersSnap.docs.map(doc => ({
      id: doc.id,
      avatar: doc.data().avatar,
      email: doc.data().email,
      name: doc.data().name,
    }));

    res.json(allUsers);
  },

  getUserById: async (req, res) => {
    const userId = req.params.id;
    const userDoc = await getDoc(doc(clientDb, 'users', userId));

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      id: userDoc.id,
      avatar: userData.avatar,
      email: userData.email,
      name: userData.name,
    });
  },

  getCurrentUser: async (req, res) => {
    const userId = req.user.id;
    const userDoc = await getDoc(doc(clientDb, 'users', userId));

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      id: userDoc.id,
      avatar: userData.avatar,
      email: userData.email,
      name: userData.name,
    });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const allUsersSnap = await getDocs(collection(clientDb, 'users'));
      const userDoc = allUsersSnap.docs.find(d => d.data().email === email);
      if (!userDoc) {
        return res.status(401).json({ error: 'There is no user with this email' });
      }
      await updateDoc(userDoc.ref, { lastLogin: new Date() });

      const user = { id: userDoc.id, ...userDoc.data() };
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id);
      res.json({ id: user.id, email: user.email, name: user.name, token, message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // logout: async (req, res) => {
  //   const token = req.headers['authorization']?.split(' ')[1];
  //   if (!token) {
  //     return res.status(401).json({ error: 'Access token required' });
  //   }
};

module.exports = { userController, JWT_SECRET };
