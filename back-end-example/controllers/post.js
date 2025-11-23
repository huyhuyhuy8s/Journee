const { errorLogger } = require('../middlewares/logger');

const { db } = require('../utilities/firebase');

const { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } = require('firebase/firestore');

const postController = {
  getAllPosts: async (req, res) => {
    try {
      const allPostsSnap = await getDocs(collection(db, 'posts'));
      const allReactionsSnap = await getDocs(collection(db, 'reactions'));
      const allCommentsSnap = await getDocs(collection(db, 'comments'));
      const allPosts = allPostsSnap.docs.map(doc => ({
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        ...doc.data(),
        reactions: allReactionsSnap.docs
          .filter(reactionDoc => reactionDoc.data().postId === doc.id)
          .map(reactionDoc => ({ id: reactionDoc.id, ...reactionDoc.data() })),
        comments: allCommentsSnap.docs
          .filter(commentDoc => commentDoc.data().postId === doc.id)
          .map(commentDoc => ({ id: commentDoc.id, ...commentDoc.data() }))
      }));

      res.status(200).json(allPosts);
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  },

  getPostById: async (req, res) => {
    try {
      const postId = req.params.id;
      const postDoc = await getDoc(doc(db, 'posts', postId));

      if (!postDoc.exists()) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const post = {
        id: postDoc.id,
        userId: postDoc.data().userId,
        createdAt: postDoc.data().createdAt.toDate(),
        updatedAt: postDoc.data().updatedAt.toDate(),
        ...postDoc.data()
      };

      const reactionQuery = query(collection(db, 'reactions'), where('postId', '==', postId));
      const commentQuery = query(collection(db, 'comments'), where('postId', '==', postId));
      const reactionsSnap = await getDocs(reactionQuery);
      const commentsSnap = await getDocs(commentQuery);

      post.reactions = reactionsSnap.docs
        .map(reactionDoc => ({ id: reactionDoc.id, ...reactionDoc.data() }));

      post.comments = commentsSnap.docs
        .map(commentDoc => ({ id: commentDoc.id, ...commentDoc.data() }));

      res.status(200).json(post);
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  },

  createPost: async (req, res) => {
    try {
      const userId = req.user.id;
      const { caption, image, journal } = req.body;

      if (!caption) {
        return res.status(400).json({ error: 'Caption is required' });
      }

      const newPost = {
        userId,
        caption,
        image: image && Array.isArray(image) ? image : [],
        journal: journal && Array.isArray(journal) ? journal : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const postRef = await addDoc(collection(db, 'posts'), newPost);
      res.status(201).json({ post: { id: postRef.id, ...newPost }, message: 'Post created successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  },

  updatePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const postDoc = await getDoc(doc(db, 'posts', postId));

      if (!postDoc.exists()) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const userId = req.user.id;
      if (userId !== postDoc.data().userId) {
        return res.status(403).json({ error: 'Unauthorized to update this post' });
      }

      const { caption, image, journal } = req.body;
      const updatedPost = {
        caption,
        updatedAt: new Date()
      };

      if (image && Array.isArray(image)) {
        updatedPost.image = image;
      }

      if (journal && Array.isArray(journal)) {
        updatedPost.journal = journal;
      }

      await updateDoc(postDoc.ref, updatedPost);
      res.status(200).json({ post: { id: postId, ...updatedPost }, message: 'Post updated successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  },

  deletePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const postDoc = await getDoc(doc(db, 'posts', postId));

      if (!postDoc.exists()) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const userId = req.user.id;
      if (userId !== postDoc.data().userId) {
        return res.status(403).json({ error: 'Unauthorized to delete this post' });
      }

      await deleteDoc(postDoc.ref);
      res.status(200).json({ message: 'Post deleted successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  },

  reactPost: async (req, res) => {

    try {    // Implementation for reacting to a post (like, love, etc.)
      const postId = req.params.id;
      const { reactionType } = req.body;
      const userId = req.user.id;

      if (!postId) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (!reactionType) {
        return res.status(400).json({ error: 'Reaction type is required' });
      }

      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (!postDoc.exists()) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const reactionQuery = query(collection(db, 'reactions'), where('postId', '==', postId), where('userId', '==', userId));
      const reactDocs = await getDocs(reactionQuery);
      if (!reactDocs.empty) {
        await updateDoc(reactDocs.docs[0].ref, { reactionType, updatedAt: new Date() });
        return res.status(400).json({ error: 'Reaction has been updated' });
      }

      await addDoc(collection(db, 'reactions'), { postId, userId, reactionType, updatedAt: new Date() });
      return res.json({ message: 'Reacted to post successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to react to post' });
    }
  },

  commentOnPost: async (req, res) => {
    try {
      const postId = req.params.id;
      const { comment } = req.body;
      const userId = req.user.id;

      if (!postId) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (!postDoc.exists()) {
        return res.status(404).json({ error: 'Post not found' });
      }

      await addDoc(collection(db, 'comments'), {
        userId,
        postId,
        comment,
        createdAt: new Date()
      });

      res.status(200).json({ message: 'Comment added to post successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to add comment to post' });
    }
  }
}

module.exports = { postController };
