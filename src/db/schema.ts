import {
  sqliteTable,
  integer,
  text,
  index,
} from "drizzle-orm/sqlite-core";

// =========================
// ROLES
// =========================

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull().unique(),

  description: text("description"),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),

  updatedAt: integer("updated_at", {
    mode: "timestamp",
  }).notNull(),
});

// =========================
// DEPARTMENTS
// =========================

export const departments = sqliteTable("departments", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),

  code: text("code").notNull().unique(),

  description: text("description"),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),

  updatedAt: integer("updated_at", {
    mode: "timestamp",
  }).notNull(),
});

// =========================
// USERS
// =========================

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id),

  departmentId: integer("department_id")
    .references(() => departments.id),

  name: text("name").notNull(),

  username: text("username").notNull().unique(),

  email: text("email").unique(),

  password: text("password").notNull(),

  position: text("position"),

  isActive: integer("is_active", {
    mode: "boolean",
  })
    .notNull()
    .default(true),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),

  updatedAt: integer("updated_at", {
    mode: "timestamp",
  }).notNull(),
});

// =========================
// SESSIONS
// =========================

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  expiresAt: integer("expires_at", {
    mode: "timestamp",
  }).notNull(),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),
});

// =========================
// INCOMING LETTERS
// =========================

export const incomingLetters = sqliteTable(
  "incoming_letters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    agendaNumber: text("agenda_number"),

    letterNumber: text("letter_number").notNull(),

    letterDate: text("letter_date").notNull(),

    receivedDate: text("received_date").notNull(),

    sender: text("sender").notNull(),

    subject: text("subject").notNull(),

    classification: text("classification"),

    priority: text("priority").notNull(),

    attachmentCount: integer("attachment_count").default(0),

    description: text("description"),

    status: text("status").notNull(),

    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("incoming_letters_agenda_number_idx").on(table.agendaNumber),
    index("incoming_letters_letter_number_idx").on(table.letterNumber),
    index("incoming_letters_letter_date_idx").on(table.letterDate),
    index("incoming_letters_received_date_idx").on(table.receivedDate),
    index("incoming_letters_sender_idx").on(table.sender),
    index("incoming_letters_status_idx").on(table.status),
    index("incoming_letters_classification_idx").on(table.classification),
  ],
);

// =========================
// OUTGOING LETTERS
// =========================

export const outgoingLetters = sqliteTable(
  "outgoing_letters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    letterNumber: text("letter_number").notNull(),

    letterDate: text("letter_date").notNull(),

    recipient: text("recipient").notNull(),

    subject: text("subject").notNull(),

    classification: text("classification"),

    priority: text("priority").notNull(),

    attachmentCount: integer("attachment_count").default(0),

    description: text("description"),

    status: text("status").notNull(),

    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("outgoing_letters_letter_number_idx").on(table.letterNumber),
    index("outgoing_letters_letter_date_idx").on(table.letterDate),
    index("outgoing_letters_recipient_idx").on(table.recipient),
    index("outgoing_letters_status_idx").on(table.status),
    index("outgoing_letters_classification_idx").on(table.classification),
  ],
);

// =========================
// DISPOSITIONS
// =========================

export const dispositions = sqliteTable(
  "dispositions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    incomingLetterId: integer("incoming_letter_id")
      .notNull()
      .references(() => incomingLetters.id, {
        onDelete: "cascade",
      }),

    fromUserId: integer("from_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "set null",
      }),

    instruction: text("instruction").notNull(),

    note: text("note"),

    deadline: text("deadline"),

    status: text("status").notNull(),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("dispositions_incoming_letter_id_idx").on(
      table.incomingLetterId,
    ),
    index("dispositions_from_user_id_idx").on(table.fromUserId),
    index("dispositions_status_idx").on(table.status),
    index("dispositions_deadline_idx").on(table.deadline),
  ],
);

// =========================
// DISPOSITION RECIPIENTS
// =========================

export const dispositionRecipients = sqliteTable(
  "disposition_recipients",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    dispositionId: integer("disposition_id")
      .notNull()
      .references(() => dispositions.id, {
        onDelete: "cascade",
      }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "set null",
      }),

    status: text("status").notNull(),

    note: text("note"),

    completedAt: integer("completed_at", {
      mode: "timestamp",
    }),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("disposition_recipients_disposition_id_idx").on(
      table.dispositionId,
    ),
    index("disposition_recipients_user_id_idx").on(table.userId),
    index("disposition_recipients_status_idx").on(table.status),
  ],
);

// =========================
// DISPOSITION LOGS
// =========================

export const dispositionLogs = sqliteTable(
  "disposition_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    dispositionId: integer("disposition_id")
      .notNull()
      .references(() => dispositions.id, {
        onDelete: "cascade",
      }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "set null",
      }),

    action: text("action").notNull(),

    note: text("note"),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("disposition_logs_disposition_id_idx").on(
      table.dispositionId,
    ),
    index("disposition_logs_user_id_idx").on(table.userId),
  ],
);

// =========================
// DOCUMENT CATEGORIES
// =========================

export const documentCategories = sqliteTable(
  "document_categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    name: text("name").notNull(),

    code: text("code").notNull().unique(),

    description: text("description"),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    }).notNull(),
  },
);

// =========================
// DOCUMENTS
// =========================

export const documents = sqliteTable(
  "documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    categoryId: integer("category_id")
      .notNull()
      .references(() => documentCategories.id),

    incomingLetterId: integer("incoming_letter_id").references(
      () => incomingLetters.id,
      { onDelete: "set null" },
    ),

    outgoingLetterId: integer("outgoing_letter_id").references(
      () => outgoingLetters.id,
      { onDelete: "set null" },
    ),

    documentNumber: text("document_number"),

    title: text("title").notNull(),

    documentDate: text("document_date"),

    year: integer("year"),

    description: text("description"),

    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id, {
        onDelete: "set null",
      }),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("documents_category_id_idx").on(table.categoryId),
    index("documents_document_number_idx").on(table.documentNumber),
    index("documents_year_idx").on(table.year),
    index("documents_document_date_idx").on(table.documentDate),
  ],
);

// =========================
// FILES
// =========================

export const files = sqliteTable(
  "files",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    documentId: integer("document_id").references(() => documents.id, {
      onDelete: "set null",
    }),

    incomingLetterId: integer("incoming_letter_id").references(
      () => incomingLetters.id,
      { onDelete: "set null" },
    ),

    outgoingLetterId: integer("outgoing_letter_id").references(
      () => outgoingLetters.id,
      { onDelete: "set null" },
    ),

    fileName: text("file_name").notNull(),

    driveFileId: text("drive_file_id").notNull().unique(),

    driveFolderId: text("drive_folder_id"),

    mimeType: text("mime_type"),

    fileSize: integer("file_size"),

    description: text("description"),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("files_drive_file_id_idx").on(table.driveFileId),
    index("files_document_id_idx").on(table.documentId),
    index("files_incoming_letter_id_idx").on(table.incomingLetterId),
    index("files_outgoing_letter_id_idx").on(table.outgoingLetterId),
  ],
);

// =========================
// ACTIVITY LOGS
// =========================

export const activityLogs = sqliteTable(
  "activity_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    action: text("action").notNull(),

    entityType: text("entity_type"),

    entityId: integer("entity_id"),

    description: text("description"),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    index("activity_logs_user_id_idx").on(table.userId),
    index("activity_logs_entity_type_idx").on(table.entityType),
    index("activity_logs_entity_id_idx").on(table.entityId),
    index("activity_logs_created_at_idx").on(table.createdAt),
  ],
);