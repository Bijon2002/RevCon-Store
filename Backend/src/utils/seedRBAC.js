const bcrypt = require("bcrypt");
const Permission = require("../models/Permission");
const Role = require("../models/Role");
const User = require("../models/User");

async function seedRBAC() {
  // ✅ Permissions you can expand anytime
  const keys = [
    "permission:create",
    "permission:view",

    "role:create",
    "role:update",
    "role:delete",
    "role:view",

    "product:create",
    "product:update",
    "product:delete",
    "product:view",

    "order:view",
    "order:update",

    "checkout:create"
  ];

  // 1) Upsert permissions
  const permissions = [];
  for (const key of keys) {
    const p = await Permission.findOneAndUpdate(
      { key },
      { key, description: key },
      { upsert: true, returnDocument: "after" }
    );
    permissions.push(p);
  }

  // helper to get permission ids by key list
  const idsOf = (list) =>
    permissions.filter((p) => list.includes(p.key)).map((p) => p._id);

  // 2) Roles
  const superAdminRole = await Role.findOneAndUpdate(
    { name: "super_admin" },
    { name: "super_admin", permissions: permissions.map((p) => p._id) },
    { upsert: true, returnDocument: "after" }
  );

  await Role.findOneAndUpdate(
    { name: "admin" },
    {
      name: "admin",
      permissions: idsOf([
        "product:view",
        "product:create",
        "product:update",
        "product:delete",
        "order:view"
      ])
    },
    { upsert: true, returnDocument: "after" }
  );

  await Role.findOneAndUpdate(
    { name: "customer" },
    {
      name: "customer",
      permissions: idsOf(["product:view", "checkout:create"])
    },
    { upsert: true, returnDocument: "after" }
  );

  // 3) Super Admin user
  const email = "superadmin@store.com";
  const exists = await User.findOne({ email });

  if (!exists) {
    const passwordHash = await bcrypt.hash("SuperAdmin123!", 10);
    await User.create({
      name: "Super Admin",
      email,
      passwordHash,
      role: superAdminRole._id
    });
    console.log("✅ Super Admin created: superadmin@store.com / SuperAdmin123!");
  } else {
    console.log("ℹ️ Super Admin already exists");
  }

  console.log("✅ RBAC seeding done (permissions + roles)");
}

module.exports = seedRBAC;