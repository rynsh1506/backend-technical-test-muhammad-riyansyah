import { db, queryClient } from "@/utils/db";
import { users } from "@/modules/auth/model";
import { products } from "@/modules/product/model";
import { suppliers } from "@/modules/supplier/model";
import { warehouses } from "@/modules/warehouse/model";

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Hash password using Bun's built-in password hasher
    const defaultPassword = await Bun.password.hash("password123");

    // 1. Seed Users (1 USER, 1 APPROVER)
    console.log("Seeding users...");
    await db.insert(users).values([
      {
        username: "staff_user",
        password: defaultPassword,
        role: "USER"
      },
      {
        username: "manager_approver",
        password: defaultPassword,
        role: "APPROVER"
      }
    ]).onConflictDoNothing();

    // 2. Seed Product
    console.log("Seeding products...");
    await db.insert(products).values([
      {
        sku: "IND-OIL-01",
        name: "Industrial Oil",
        unit: "PCS"
      },
      {
        sku: "SFT-GLV-01",
        name: "Safety Gloves",
        unit: "BOX"
      }
    ]).onConflictDoNothing();

    // 3. Seed Supplier
    console.log("Seeding suppliers...");
    await db.insert(suppliers).values([
      {
        name: "PT. Sentosa Logistik",
        email: "contact@sentosalogistik.com",
        phone: "081234567890"
      }
    ]).onConflictDoNothing();

    // 4. Seed Warehouse
    console.log("Seeding warehouses...");
    await db.insert(warehouses).values([
      {
        code: "JKT-01",
        name: "Jakarta Main Warehouse",
        location: "Jakarta, Indonesia"
      },
      {
        code: "SBY-01",
        name: "Surabaya Hub",
        location: "Surabaya, Indonesia"
      }
    ]).onConflictDoNothing();

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    // Close DB connection so the script exits
    await queryClient.end();
  }
}

main();
