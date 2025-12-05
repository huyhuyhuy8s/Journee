// services/jwtBlacklist.js
const { clientDb } = require('@/config/firebase');
const { collection, addDoc, getDocs, query, where, deleteDoc } = require('firebase/firestore');

class JWTBlacklistService {
  static COLLECTION_NAME = 'blacklistedTokens';

  /**
   * Add token to blacklist
   */
  static async blacklistToken(token, userId, expiresAt) {
    try {
      const blacklistedToken = {
        token,
        userId,
        blacklistedAt: new Date(),
        expiresAt: new Date(expiresAt * 1000), // Convert from Unix timestamp
      };

      await addDoc(collection(clientDb, this.COLLECTION_NAME), blacklistedToken);
      console.log(`✅ Token blacklisted for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token) {
    try {
      const q = query(
        collection(clientDb, this.COLLECTION_NAME),
        where('token', '==', token)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ Error checking token blacklist:', error);
      return false; // If error, allow the request to proceed
    }
  }

  /**
   * Clean up expired tokens (optional maintenance function)
   */
  static async cleanupExpiredTokens() {
    try {
      const q = query(
        collection(clientDb, this.COLLECTION_NAME),
        where('expiresAt', '<', new Date())
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
      console.log(`🧹 Cleaned up ${querySnapshot.size} expired tokens`);
      return querySnapshot.size;
    } catch (error) {
      console.error('❌ Error cleaning up expired tokens:', error);
      return 0;
    }
  }
}

module.exports = { JWTBlacklistService };
