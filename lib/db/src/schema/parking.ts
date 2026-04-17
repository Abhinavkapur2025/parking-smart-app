import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const parkingLocationsTable = pgTable("parking_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  area: text("area").notNull(),
  address: text("address").notNull(),
  landmark: text("landmark").notNull(),
  operatorName: text("operator_name").notNull(),
  totalSlots: integer("total_slots").notNull(),
  availableSlots: integer("available_slots").notNull(),
  hourlyRate: doublePrecision("hourly_rate").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  openTime: text("open_time").notNull(),
  closeTime: text("close_time").notNull(),
  securityAvailable: boolean("security_available").notNull().default(false),
  evCharging: boolean("ev_charging").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id")
    .notNull()
    .references(() => parkingLocationsTable.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  phone: text("phone").notNull(),
  vehicleNumber: text("vehicle_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  durationHours: integer("duration_hours").notNull(),
  amount: doublePrecision("amount").notNull(),
  paymentMode: text("payment_mode").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ParkingLocation = typeof parkingLocationsTable.$inferSelect;
export type NewParkingLocation = typeof parkingLocationsTable.$inferInsert;
export type Booking = typeof bookingsTable.$inferSelect;
export type NewBooking = typeof bookingsTable.$inferInsert;