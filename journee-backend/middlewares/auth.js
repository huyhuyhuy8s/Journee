const jwt = require('jsonwebtoken');
const { JWT_SECRET, userController } = require('@controllers/user');
const { getDocs, collection } = require('firebase/firestore');
const { clientDb } = require('@config/firebase');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user by ID from token
    const allUsersSnap = await getDocs(collection(clientDb, 'users'));
    const userDoc = allUsersSnap.docs.find(d => d.id === decoded.userId);

    if (!userDoc) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = { id: userDoc.id, ...userDoc.data() };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };
