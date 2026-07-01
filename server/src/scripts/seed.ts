import { connectDatabase } from "../config/database";
import { env } from "../config/env";
import { HabitModel } from "../models/Habit";
import { HabitLogModel } from "../models/HabitLog";
import { NlpParsedEntryModel } from "../models/NlpParsedEntry";
import { ProgressHistoryModel } from "../models/ProgressHistory";
import { UserModel } from "../models/User";

async function seed() {
  await connectDatabase();

  await Promise.all([
    HabitLogModel.deleteMany({}),
    HabitModel.deleteMany({}),
    NlpParsedEntryModel.deleteMany({}),
    ProgressHistoryModel.deleteMany({}),
    UserModel.deleteMany({})
  ]);

  const [user, admin] = await UserModel.create([
    {
      name: "Demo User",
      email: "user@trackme.demo",
      password: "password123",
      role: "user"
    },
    {
      name: "Admin User",
      email: "admin@trackme.demo",
      password: "password123",
      role: "admin"
    }
  ]);

  await HabitModel.create([
    {
      name: "Running",
      category: "Fitness",
      targetValue: 2,
      unit: "miles",
      frequency: "daily",
      createdBy: user._id
    },
    {
      name: "Water",
      category: "Health",
      targetValue: 8,
      unit: "cups",
      frequency: "daily",
      createdBy: user._id
    },
    {
      name: "Studying",
      category: "Learning",
      targetValue: 60,
      unit: "minutes",
      frequency: "daily",
      createdBy: user._id
    }
  ]);

  console.log("TrackMe seed complete");
  console.log("User: user@trackme.demo / password123");
  console.log("Admin: admin@trackme.demo / password123");
  console.log(`Admin invite code for manual signup: ${env.ADMIN_INVITE_CODE}`);
  console.log(admin.email);

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
