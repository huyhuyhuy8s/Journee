const express = require('express');
const { journalController } = require('../controllers/journal');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken);

// Journal
router.get('/', journalController.getAllJournals);
router.get('/:id', journalController.getJournalById);

router.post('/', journalController.createJournal);
router.put('/:id', journalController.updateJournal);
router.patch('/:id', journalController.updateJournal);
router.delete('/:id', journalController.deleteJournal);

// Journal Entries
router.post('/:id/entry', journalController.addJournalEntry);
router.put('/:id/entry/:entryId', journalController.updateJournalEntry);
router.patch('/:id/entry/:entryId', journalController.updateJournalEntry);
router.delete('/:id/entry/:entryId', journalController.deleteJournalEntry);

module.exports = router;
