import { admin, clientDb } from "@/config/firebase";
import { adminDb } from "@/config/firebase";
import { IEntry, IJournal, ILocation } from "@/types/global";
import {
  fetchDocument,
  fetchDocuments,
  fetchDocumentWithRelation,
  validateRequiredFields,
} from "@/utils/firestore.helper";
import { Request, Response } from "express";
import { GeoPoint, Timestamp } from "firebase-admin/firestore";
import _ from "lodash";

const journalController = {
  getAllJournals: async (req: Request, res: Response) => {
    try {
      const journalsResult = await fetchDocuments<IJournal>(
        "journals",
        res,
        "Journals"
      );
      if (!journalsResult.success) return;

      const entriesResult = await fetchDocuments<IEntry>(
        "entries",
        res,
        "Entries"
      );
      if (!entriesResult.success) return;

      const allJournals = journalsResult.data!.map((journal) => ({
        ...journal,
        createdAt: (journal.createdAt as any).toDate(),
        updatedAt: (journal.updatedAt as any).toDate(),
        entries: entriesResult.data!.filter(
          (entry) => entry.journalId === journal.id
        ),
      }));

      return res.apiResponse(
        { message: "Journals fetched successfully" },
        { journals: allJournals }
      );
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to fetch journals",
        error: String(error),
      });
    }
  },

  getJournalById: async (req: Request, res: Response) => {
    try {
      const journalId = req.params.id;

      const result = await fetchDocumentWithRelation<IJournal, IEntry>(
        "journals",
        journalId,
        "entries",
        "journalId",
        res,
        "Journal",
        "Entries"
      );

      if (!result.success) return;

      const journal: IJournal = {
        id: journalId,
        userId: result.parent!.userId,
        name: result.parent!.name,
        createdAt: (result.parent!.createdAt as any).toDate(),
        updatedAt: (result.parent!.updatedAt as any).toDate(),
        entries: result.children || [],
      };

      return res.apiResponse(
        { message: "Journal retrieved successfully" },
        { journal }
      );
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to retrieve journal",
        error: String(error),
      });
    }
  },

  createJournal: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!validateRequiredFields(req.body, ["name"], res)) return;
      const { name } = req.body;

      const newJournal = {
        userId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const journalRef = await adminDb.collection("journals").add(newJournal);

      return res.apiResponse(
        { message: "Journal created successfully" },
        { journal: { id: journalRef.id, ...newJournal } }
      );
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to create journal",
        error: String(error),
      });
    }
  },

  updateJournal: async (req: Request, res: Response) => {
    try {
      const journalId = req.params.id;
      const userId = req.user!.id;
      if (!validateRequiredFields(req.body, ["name"], res)) return;
      const { name } = req.body;

      const result = await adminDb.collection("journals").doc(journalId).get();
      if (!result.exists) {
        return res.apiError({
          status: 404,
          message: "Journal not found",
          error: "Not Found",
        });
      }

      if (result.data()?.userId !== userId) {
        return res.apiError({
          status: 403,
          message: "Forbidden",
          error: "You do not have permission to update this journal",
        });
      }

      await adminDb.collection("journals").doc(journalId).update({
        name,
        updatedAt: new Date(),
      });

      return res.apiResponse(
        { message: "Journal updated successfully" },
        { journal: { id: journalId, name } }
      );
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to update journal",
        error: String(error),
      });
    }
  },

  deleteJournal: async (req: Request, res: Response) => {
    try {
      const journalId = req.params.id;
      const userId = req.user!.id;

      const result = await adminDb.collection("journals").doc(journalId).get();
      if (result.data()?.userId !== userId) {
        return res.apiError({
          status: 403,
          message: "Forbidden",
          error: "You do not have permission to delete this journal",
        });
      }

      if (!result.exists) {
        return res.apiError({
          status: 404,
          message: "Journal not found",
          error: "Not Found",
        });
      }

      await adminDb.collection("journals").doc(journalId).delete();

      return res.apiResponse({ message: "Journal deleted successfully" }, null);
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to delete journal",
        error: String(error),
      });
    }
  },

  addJournalEntry: async (req: Request, res: Response) => {
    try {
      const journalId = req.params.id;
      const userId = req.user!.id;
      if (!validateRequiredFields(req.body, ["name", "location"], res)) return;
      const {
        name,
        location,
        images,
        thought,
      }: {
        name: string;
        location: ILocation;
        images?: string[];
        thought?: string;
      } = req.body;

      const journalResult = await adminDb
        .collection("journals")
        .doc(journalId)
        .get();
      if (!journalResult.exists) {
        return res.apiError({
          status: 404,
          message: "Journal not found",
          error: "Not Found",
        });
      }

      if (journalResult.data()?.userId !== userId) {
        return res.apiError({
          status: 403,
          message: "Forbidden",
          error: "You do not have permission to add entries to this journal",
        });
      }

      const newEntry: Partial<IEntry> = {
        name,
        location: {
          place: location.place,
          street: location.street,
          city: location.city,
          region: location.region,
          country: location.country,
          value: location.value,
          coordinate: new GeoPoint(
            location.coordinate.latitude,
            location.coordinate.longitude
          ),
        },
        journalId,
        images: images && Array.isArray(images) ? images : [],
        thought,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const entryRef = await adminDb.collection("entries").add(newEntry);

      return res.apiResponse(
        { message: "Journal entry added successfully" },
        { entry: { id: entryRef.id, ...newEntry } }
      );
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to add journal entry",
        error: String(error),
      });
    }
  },

  updateJournalEntry: async (req: Request, res: Response) => {
    try {
      const journalId = req.params.id;
      const entryId = req.params.entryId;
      const userId = req.user!.id;
      if (!req.body || _.isEmpty(req.body)) {
        return res.apiError({
          status: 400,
          message: "Bad Request",
          error: "No fields to update",
        });
      }
      const { name, location, images, thought } = req.body;

      if (name && !validateRequiredFields(req.body, ["name"], res)) return;
      if (location && !validateRequiredFields(req.body, ["location"], res))
        return;
      if (images && !validateRequiredFields(req.body, ["images"], res)) return;
      if (thought && !validateRequiredFields(req.body, ["thought"], res))
        return;

      const journalResult = await adminDb
        .collection("journals")
        .doc(journalId)
        .get();
      if (!journalResult.exists) {
        return res.apiError({
          status: 404,
          message: "Journal not found",
          error: "Not Found",
        });
      }

      const entryResult = await adminDb
        .collection("entries")
        .doc(entryId)
        .get();
      if (!entryResult.exists) {
        return res.apiError({
          status: 404,
          message: "Entry not found",
          error: "Not Found",
        });
      }

      if (entryResult.data()?.journalId !== journalId) {
        return res.apiError({
          status: 400,
          message: "Bad Request",
          error: "Entry does not belong to this journal",
        });
      }

      if (userId !== journalResult.data()?.userId) {
        return res.apiError({
          status: 403,
          message: "Forbidden",
          error: "You do not have permission to update this journal entry",
        });
      }

      const updatedEntry: Partial<IEntry> = {
        updatedAt: new Date() as any,
      };

      if (name) updatedEntry.name = name;
      if (location)
        updatedEntry.location = {
          place: location.place,
          street: location.street,
          city: location.city,
          region: location.region,
          country: location.country,
          value: location.value,
          coordinate: new GeoPoint(
            location.coordinate.latitude,
            location.coordinate.longitude
          ),
        };
      if (images && _.isArray(images)) updatedEntry.images = images;
      if (thought) updatedEntry.thought = thought;

      await adminDb.collection("entries").doc(entryId).update(updatedEntry);

      return res.apiResponse(
        { message: "Journal entry updated successfully" },
        { entry: { id: entryId, ...entryResult.data, ...updatedEntry } }
      );
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to update journal entry",
        error: String(error),
      });
    }
  },

  deleteJournalEntry: async (req: Request, res: Response) => {
    try {
      const journalId = req.params.id;
      const entryId = req.params.entryId;
      const userId = req.user!.id;

      const journalResult = await fetchDocument(
        "journals",
        journalId,
        res,
        "Journal"
      );
      if (!journalResult.success) return;

      const entryResult = await fetchDocument<IEntry>(
        "entries",
        entryId,
        res,
        "Entry"
      );
      if (!entryResult.success) return;

      if (entryResult.data!.journalId !== journalId) {
        return res.apiError({
          status: 400,
          message: "Bad Request",
          error: "Entry does not belong to this journal",
        });
      }

      if (userId !== journalResult.data!.userId) {
        return res.apiError({
          status: 403,
          message: "Forbidden",
          error: "You do not have permission to delete this journal entry",
        });
      }

      await adminDb.collection("entries").doc(entryId).delete();

      return res.apiResponse(
        { message: "Journal entry deleted successfully" },
        null
      );
    } catch (error) {
      console.log(error);
      return res.apiError({
        status: 500,
        message: "Failed to delete journal entry",
        error: String(error),
      });
    }
  },
};

export { journalController };
