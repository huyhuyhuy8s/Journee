const { db } = require('../utilities/firebase');

const { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where } = require('firebase/firestore');

const { arrayUnion } = require('firebase/firestore');

const getDocJournalEntry = async (journalId, entryId) => {
  try {
    const journalDocRef = doc(db, 'journals', journalId);
    const journalDoc = await getDoc(journalDocRef);
    if (!journalDoc.exists()) {
      return [];
    }

    const entryRef = doc(db, 'entries', entryId)
    const entryDoc = await getDoc(entryRef);
    if (!entryDoc.exists()) {
      return [];
    }

    if (entryDoc.data().journalId !== journalId) {
      return [];
    }

    return [journalDoc, entryDoc];
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

const journalController = {
  // Journal CRUD
  getAllJournals: async (req, res) => {
    try {
      const allJournalsSnap = await getDocs(collection(db, 'journals'));
      const allEntriesSnap = await getDocs(collection(db, 'entries'));
      const allJournals = allJournalsSnap.docs.map(doc => ({
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        ...doc.data(),
        entries: allEntriesSnap.docs
          .filter(entryDoc => entryDoc.data().journalId === doc.id)
          .map(entryDoc => ({ id: entryDoc.id, ...entryDoc.data() }))
      }));

      res.json({ journals: allJournals });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch journals' });
    }
  },
  getJournalById: async (req, res) => {
    try {
      const journalId = req.params.id;
      const journalDoc = await getDoc(doc(db, 'journals', journalId));

      if (!journalDoc.exists()) {
        return res.status(404).json({ error: 'Journal not found' });
      }

      const entriesQuery = query(collection(db, 'entries'), where('journalId', '==', journalId));
      const entriesSnap = await getDocs(entriesQuery);

      const journal = {
        id: journalDoc.id,
        userId: journalDoc.data().userId,
        name: journalDoc.data().name,
        createdAt: journalDoc.data().createdAt.toDate(),
        updatedAt: journalDoc.data().updatedAt.toDate(),
        ...journalDoc.data(),
        entries: entriesSnap.docs.map(entryDoc => ({
          id: entryDoc.id,
          ...entryDoc.data()
        }))
      };

      res.json(journal);
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch journal' });
    }
  },

  createJournal: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const newJournal = {
        userId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const journalRef = await addDoc(collection(db, 'journals'), newJournal);
      res.status(201).json({ journal: { id: journalRef.id, ...newJournal }, message: 'Journal created successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create journal' });
    }
  },

  updateJournal: async (req, res) => {
    try {
      const journalId = req.params.id;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const journalDocRef = doc(db, 'journals', journalId);
      if (!journalDocRef) {
        return res.status(404).json({ error: 'Journal not found' });
      }

      await updateDoc(journalDocRef, {
        name,
        updatedAt: new Date()
      });

      res.json({ message: 'Journal updated successfully', journal: { id: journalId, name } });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to update journal' });
    }
  },

  deleteJournal: async (req, res) => {
    try {
      const journalId = req.params.id;
      const journalDocRef = doc(db, 'journals', journalId);
      if (!journalDocRef) {
        return res.status(404).json({ error: 'Journal not found' });
      }

      await deleteDoc(journalDocRef);
      res.json({ message: 'Journal deleted successfully' });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to delete journal' });
    }
  },

  // Entry
  addJournalEntry: async (req, res) => {
    try {
      const journalId = req.params.id;
      const { name, coordinate, image } = req.body;
      if (!name || !coordinate) {
        return res.status(400).json({ error: 'Name and coordinate are required' });
      }

      const journalDocRef = doc(db, 'journals', journalId);
      const journalDoc = await getDoc(journalDocRef);
      if (!journalDoc.exists()) {
        return res.status(404).json({ error: 'Journal not found' });
      }

      const newEntry = {
        name,
        coordinate,
        journalId,
        image: image && Array.isArray(image) ? image : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entryDoc = await addDoc(collection(db, 'entries'), newEntry);

      res.status(201).json({ message: 'Journal entry added successfully', entry: { id: entryDoc.id, ...newEntry } });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to add journal entry' });
    }
  },

  updateJournalEntry: async (req, res) => {
    try {
      const journalId = req.params.id;
      const entryId = req.params.entryId;
      const { name, coordinate, image } = req.body;

      if (!journalId || !entryId) {
        return res.status(400).json({ error: 'Journal ID and Entry ID are required' });
      }

      const [journalDoc, entryDoc] = await getDocJournalEntry(journalId, entryId);
      if (journalDoc.length === 0 || entryDoc.length === 0) {
        return res.status(404).json({ error: 'Journal or Entry not found' });
      }

      const updatedEntry = {
        ...entryDoc.data(),
        updatedAt: new Date(),
      };

      if (name && name !== entryDoc.data().name) {
        updatedEntry.name = name;
      }

      if (coordinate && coordinate !== entryDoc.data().coordinate) {
        updatedEntry.coordinate = coordinate;
      }

      if (image && Array.isArray(image)) {
        updatedEntry.image = image;
      }

      await updateDoc(entryDoc.ref, updatedEntry);

      res.json({ message: 'Journal entry updated successfully', entry: { id: entryId, ...updatedEntry } });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to update journal entry' });
    }
  },

  deleteJournalEntry: async (req, res) => {
    try {
      const journalId = req.params.id;
      const entryId = req.params.entryId;

      if (!journalId || !entryId) {
        return res.status(400).json({ error: 'Journal ID and Entry ID are required' });
      }

      const [journalDoc, entryDoc] = await getDocJournalEntry(journalId, entryId);
      if (journalDoc.length === 0 || entryDoc.length === 0) {
        return res.status(404).json({ error: 'Journal or Entry not found' });
      }

      await deleteDoc(entryDoc.ref);

      res.json({
        message: 'Journal entry deleted successfully',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to delete journal entry' });
    }
  },
};

module.exports = { journalController };
