import { relations } from "drizzle-orm";

import {
  roles,
  departments,
  users,
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
  ({ one }) => ({
    role: one(roles, {
      fields: [users.roleId],
      references: [roles.id],
    }),

    department: one(departments, {
      fields: [users.departmentId],
      references: [departments.id],
    }),
  }),
);