import { relations } from "drizzle-orm";

import {
  roles,
  departments,
  users,
  sessions,
  incomingLetters,
  outgoingLetters,
  dispositions,
  dispositionRecipients,
  dispositionLogs,
  documentCategories,
  documents,
  files,
  activityLogs,
} from "./schema";

export const rolesRelations = relations(
  roles,
  ({ many }) => ({
    users: many(users),
  }),
);

export const departmentsRelations = relations(
  departments,
  ({ many }) => ({
    users: many(users),
  }),
);

export const usersRelations = relations(
  users,
  ({ one, many }) => ({
    role: one(roles, {
      fields: [users.roleId],
      references: [roles.id],
    }),

    department: one(departments, {
      fields: [users.departmentId],
      references: [departments.id],
    }),

    sessions: many(sessions),

    incomingLetters: many(incomingLetters),

    outgoingLetters: many(outgoingLetters),

    dispositions: many(dispositions, {
      relationName: "dispositionFromUser",
    }),

    dispositionRecipients: many(dispositionRecipients),

    dispositionLogs: many(dispositionLogs),

    documents: many(documents),

    activityLogs: many(activityLogs),
  }),
);

export const sessionsRelations = relations(
  sessions,
  ({ one }) => ({
    user: one(users, {
      fields: [sessions.userId],
      references: [users.id],
    }),
  }),
);

export const incomingLettersRelations = relations(
  incomingLetters,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [incomingLetters.createdBy],
      references: [users.id],
    }),

    dispositions: many(dispositions),

    documents: many(documents),

    files: many(files, {
      relationName: "incomingLetterFiles",
    }),
  }),
);

export const outgoingLettersRelations = relations(
  outgoingLetters,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [outgoingLetters.createdBy],
      references: [users.id],
    }),

    documents: many(documents),

    files: many(files, {
      relationName: "outgoingLetterFiles",
    }),
  }),
);

export const dispositionsRelations = relations(
  dispositions,
  ({ one, many }) => ({
    incomingLetter: one(incomingLetters, {
      fields: [dispositions.incomingLetterId],
      references: [incomingLetters.id],
    }),

    fromUser: one(users, {
      fields: [dispositions.fromUserId],
      references: [users.id],
      relationName: "dispositionFromUser",
    }),

    recipients: many(dispositionRecipients),

    logs: many(dispositionLogs),
  }),
);

export const dispositionRecipientsRelations = relations(
  dispositionRecipients,
  ({ one }) => ({
    disposition: one(dispositions, {
      fields: [dispositionRecipients.dispositionId],
      references: [dispositions.id],
    }),

    user: one(users, {
      fields: [dispositionRecipients.userId],
      references: [users.id],
    }),
  }),
);

export const dispositionLogsRelations = relations(
  dispositionLogs,
  ({ one }) => ({
    disposition: one(dispositions, {
      fields: [dispositionLogs.dispositionId],
      references: [dispositions.id],
    }),

    user: one(users, {
      fields: [dispositionLogs.userId],
      references: [users.id],
    }),
  }),
);

export const documentCategoriesRelations = relations(
  documentCategories,
  ({ many }) => ({
    documents: many(documents),
  }),
);

export const documentsRelations = relations(
  documents,
  ({ one, many }) => ({
    category: one(documentCategories, {
      fields: [documents.categoryId],
      references: [documentCategories.id],
    }),

    incomingLetter: one(incomingLetters, {
      fields: [documents.incomingLetterId],
      references: [incomingLetters.id],
    }),

    outgoingLetter: one(outgoingLetters, {
      fields: [documents.outgoingLetterId],
      references: [outgoingLetters.id],
    }),

    createdBy: one(users, {
      fields: [documents.createdBy],
      references: [users.id],
    }),

    files: many(files, {
      relationName: "documentFiles",
    }),
  }),
);

export const filesRelations = relations(
  files,
  ({ one }) => ({
    document: one(documents, {
      fields: [files.documentId],
      references: [documents.id],
      relationName: "documentFiles",
    }),

    incomingLetter: one(incomingLetters, {
      fields: [files.incomingLetterId],
      references: [incomingLetters.id],
      relationName: "incomingLetterFiles",
    }),

    outgoingLetter: one(outgoingLetters, {
      fields: [files.outgoingLetterId],
      references: [outgoingLetters.id],
      relationName: "outgoingLetterFiles",
    }),
  }),
);

export const activityLogsRelations = relations(
  activityLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [activityLogs.userId],
      references: [users.id],
    }),
  }),
);