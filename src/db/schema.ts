import {
  sqliteTable,
  integer,
  text,
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