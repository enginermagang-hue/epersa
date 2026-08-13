import "dotenv/config";
import { db } from "./index";
import {
  roles,
  departments,
  users,
} from "./schema";
import argon2 from "argon2";

async function seed() {
  console.log("Seeding database...");

  const now = new Date();

  // =========================
  // ROLES
  // =========================

  await db
    .insert(roles)
    .values([
      {
        name: "administrator",
        description: "Pengelola sistem",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "pimpinan",
        description: "Pimpinan instansi",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "sekretariat",
        description: "Pengelola administrasi dan persuratan",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "pegawai",
        description: "Pegawai/penerima disposisi",
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing();

  // =========================
  // DEPARTMENT
  // =========================

  await db
    .insert(departments)
    .values({
      name: "UPTD Tekkomdik",
      code: "UPTD-TEKKOMDIK",
      description:
        "Unit Pelaksana Teknis Daerah Teknologi Komunikasi dan Pendidikan",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  // =========================
  // GET ROLE
  // =========================

  const administratorRole = await db.query.roles.findFirst({
    where: (roles, { eq }) =>
      eq(roles.name, "administrator"),
  });

  // =========================
  // GET DEPARTMENT
  // =========================

  const department = await db.query.departments.findFirst({
    where: (departments, { eq }) =>
      eq(departments.code, "UPTD-TEKKOMDIK"),
  });

  if (!administratorRole || !department) {
    throw new Error(
      "Role atau department tidak ditemukan.",
    );
  }

  // =========================
  // PASSWORD
  // =========================

  const passwordHash = await argon2.hash(
    "ChangeMe123!",
  );

  // =========================
  // ADMIN
  // =========================

  await db
    .insert(users)
    .values({
      roleId: administratorRole.id,
      departmentId: department.id,

      name: "Administrator",
      username: "admin",
      email: "admin@example.com",

      password: passwordHash,

      position: "Administrator Sistem",

      isActive: true,

      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  console.log("Seed berhasil.");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed gagal:", error);
  process.exit(1);
});