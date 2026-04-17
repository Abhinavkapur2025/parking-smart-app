import { Router, type IRouter } from "express";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import {
  CreateBookingBody,
  CreateParkingLocationBody,
  DeleteParkingLocationParams,
  GetParkingSummaryResponse,
  ListBookingsQueryParams,
  ListBookingsResponse,
  ListParkingLocationsQueryParams,
  ListParkingLocationsResponse,
  ListParkingLocationsResponseItem,
  UpdateBookingBody,
  UpdateBookingParams,
  UpdateBookingResponse,
  UpdateParkingLocationBody,
  UpdateParkingLocationParams,
  UpdateParkingLocationResponse,
} from "@workspace/api-zod";
import { bookingsTable, db, parkingLocationsTable } from "@workspace/db";

const router: IRouter = Router();

function toIso(value: Date | string) {
  return new Date(value).toISOString();
}

function toLocation(location: typeof parkingLocationsTable.$inferSelect) {
  return {
    ...location,
    vehicleType: location.vehicleType as "car" | "bike" | "auto",
    createdAt: toIso(location.createdAt),
  };
}

type BookingWithLocation = typeof bookingsTable.$inferSelect & {
  locationName: string;
  city: string;
  area: string;
};

function toBooking(booking: BookingWithLocation) {
  return {
    id: booking.id,
    locationId: booking.locationId,
    locationName: booking.locationName,
    city: booking.city,
    area: booking.area,
    userName: booking.userName,
    phone: booking.phone,
    vehicleNumber: booking.vehicleNumber,
    vehicleType: booking.vehicleType as "car" | "bike" | "auto",
    startTime: toIso(booking.startTime),
    durationHours: booking.durationHours,
    amount: booking.amount,
    paymentMode: booking.paymentMode as "cash" | "upi",
    status: booking.status as "confirmed" | "active" | "completed" | "cancelled",
    createdAt: toIso(booking.createdAt),
  };
}

let seedPromise: Promise<void> | null = null;

async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db.select({ value: count() }).from(parkingLocationsTable);
      if ((existing[0]?.value ?? 0) > 0) {
        return;
      }

      const locations = await db
        .insert(parkingLocationsTable)
        .values([
          {
            name: "Connaught Place Smart Park",
            city: "Delhi",
            area: "Connaught Place",
            address: "Block F, Inner Circle, New Delhi",
            landmark: "Near Rajiv Chowk Metro Gate 5",
            operatorName: "NDMC Parking Authority",
            totalSlots: 180,
            availableSlots: 42,
            hourlyRate: 60,
            vehicleType: "car",
            openTime: "06:00",
            closeTime: "23:30",
            securityAvailable: true,
            evCharging: true,
          },
          {
            name: "Bandra Market Parking Hub",
            city: "Mumbai",
            area: "Bandra West",
            address: "Hill Road Municipal Parking, Mumbai",
            landmark: "Opposite Linking Road Market",
            operatorName: "BMC Smart Mobility",
            totalSlots: 120,
            availableSlots: 18,
            hourlyRate: 80,
            vehicleType: "car",
            openTime: "07:00",
            closeTime: "00:00",
            securityAvailable: true,
            evCharging: false,
          },
          {
            name: "MG Road Bike Stand",
            city: "Bengaluru",
            area: "MG Road",
            address: "Metro Station Service Lane, Bengaluru",
            landmark: "Near MG Road Metro",
            operatorName: "BBMP Parking Services",
            totalSlots: 240,
            availableSlots: 96,
            hourlyRate: 20,
            vehicleType: "bike",
            openTime: "05:30",
            closeTime: "23:00",
            securityAvailable: true,
            evCharging: false,
          },
          {
            name: "Charminar Visitor Parking",
            city: "Hyderabad",
            area: "Old City",
            address: "Pathergatti Parking Complex, Hyderabad",
            landmark: "600 m from Charminar",
            operatorName: "GHMC Parking Cell",
            totalSlots: 90,
            availableSlots: 11,
            hourlyRate: 45,
            vehicleType: "auto",
            openTime: "08:00",
            closeTime: "22:00",
            securityAvailable: true,
            evCharging: false,
          },
        ])
        .returning();

      await db.insert(bookingsTable).values([
        {
          locationId: locations[0].id,
          userName: "Aarav Sharma",
          phone: "9876543210",
          vehicleNumber: "DL 01 AB 2345",
          vehicleType: "car",
          startTime: new Date(),
          durationHours: 2,
          amount: 120,
          paymentMode: "upi",
          status: "active",
        },
        {
          locationId: locations[1].id,
          userName: "Meera Iyer",
          phone: "9123456780",
          vehicleNumber: "MH 02 CD 7788",
          vehicleType: "car",
          startTime: new Date(),
          durationHours: 3,
          amount: 240,
          paymentMode: "upi",
          status: "confirmed",
        },
      ]);
    })();
  }

  await seedPromise;
}

async function getBookingRows(filters?: { phone?: string; status?: string }) {
  const conditions = [];
  if (filters?.phone) {
    conditions.push(eq(bookingsTable.phone, filters.phone));
  }
  if (filters?.status) {
    conditions.push(eq(bookingsTable.status, filters.status));
  }

  const rows = await db
    .select({
      id: bookingsTable.id,
      locationId: bookingsTable.locationId,
      locationName: parkingLocationsTable.name,
      city: parkingLocationsTable.city,
      area: parkingLocationsTable.area,
      userName: bookingsTable.userName,
      phone: bookingsTable.phone,
      vehicleNumber: bookingsTable.vehicleNumber,
      vehicleType: bookingsTable.vehicleType,
      startTime: bookingsTable.startTime,
      durationHours: bookingsTable.durationHours,
      amount: bookingsTable.amount,
      paymentMode: bookingsTable.paymentMode,
      status: bookingsTable.status,
      createdAt: bookingsTable.createdAt,
    })
    .from(bookingsTable)
    .innerJoin(parkingLocationsTable, eq(bookingsTable.locationId, parkingLocationsTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(bookingsTable.createdAt));

  return rows.map(toBooking);
}

router.get("/parking/locations", async (req, res, next) => {
  try {
    await ensureSeedData();
    const params = ListParkingLocationsQueryParams.parse(req.query);
    const conditions = [];
    if (params.city) {
      conditions.push(eq(parkingLocationsTable.city, params.city));
    }
    if (params.vehicleType) {
      conditions.push(eq(parkingLocationsTable.vehicleType, params.vehicleType));
    }

    const locations = await db
      .select()
      .from(parkingLocationsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(parkingLocationsTable.city, parkingLocationsTable.area);

    res.json(ListParkingLocationsResponse.parse(locations.map(toLocation)));
  } catch (error) {
    next(error);
  }
});

router.post("/parking/locations", async (req, res, next) => {
  try {
    await ensureSeedData();
    const body = CreateParkingLocationBody.parse(req.body);
    const [location] = await db.insert(parkingLocationsTable).values(body).returning();
    res.status(201).json(ListParkingLocationsResponseItem.parse(toLocation(location)));
  } catch (error) {
    next(error);
  }
});

router.patch("/parking/locations/:id", async (req, res, next) => {
  try {
    await ensureSeedData();
    const params = UpdateParkingLocationParams.parse(req.params);
    const body = UpdateParkingLocationBody.parse(req.body);
    const [location] = await db
      .update(parkingLocationsTable)
      .set(body)
      .where(eq(parkingLocationsTable.id, params.id))
      .returning();

    if (!location) {
      res.status(404).json({ message: "Parking location not found" });
      return;
    }

    res.json(UpdateParkingLocationResponse.parse(toLocation(location)));
  } catch (error) {
    next(error);
  }
});

router.delete("/parking/locations/:id", async (req, res, next) => {
  try {
    await ensureSeedData();
    const params = DeleteParkingLocationParams.parse(req.params);
    await db.delete(parkingLocationsTable).where(eq(parkingLocationsTable.id, params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/parking/bookings", async (req, res, next) => {
  try {
    await ensureSeedData();
    const params = ListBookingsQueryParams.parse(req.query);
    const bookings = await getBookingRows(params);
    res.json(ListBookingsResponse.parse(bookings));
  } catch (error) {
    next(error);
  }
});

router.post("/parking/bookings", async (req, res, next) => {
  try {
    await ensureSeedData();
    const body = CreateBookingBody.parse(req.body);

    const booking = await db.transaction(async (tx) => {
      const [location] = await tx
        .select()
        .from(parkingLocationsTable)
        .where(eq(parkingLocationsTable.id, body.locationId));

      if (!location) {
        throw Object.assign(new Error("Parking location not found"), { statusCode: 404 });
      }

      if (location.availableSlots <= 0) {
        throw Object.assign(new Error("No parking slots available"), { statusCode: 409 });
      }

      const amount = location.hourlyRate * body.durationHours;
      const [created] = await tx
        .insert(bookingsTable)
        .values({
          ...body,
          startTime: new Date(body.startTime),
          amount,
          status: "confirmed",
        })
        .returning();

      await tx
        .update(parkingLocationsTable)
        .set({ availableSlots: location.availableSlots - 1 })
        .where(eq(parkingLocationsTable.id, body.locationId));

      return toBooking({
        ...created,
        locationName: location.name,
        city: location.city,
        area: location.area,
      });
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.patch("/parking/bookings/:id", async (req, res, next) => {
  try {
    await ensureSeedData();
    const params = UpdateBookingParams.parse(req.params);
    const body = UpdateBookingBody.parse(req.body);

    const booking = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.id, params.id));

      if (!existing) {
        throw Object.assign(new Error("Booking not found"), { statusCode: 404 });
      }

      const [updated] = await tx
        .update(bookingsTable)
        .set(body)
        .where(eq(bookingsTable.id, params.id))
        .returning();

      if (
        body.status === "cancelled" &&
        existing.status !== "cancelled" &&
        (existing.status === "confirmed" || existing.status === "active")
      ) {
        await tx
          .update(parkingLocationsTable)
          .set({ availableSlots: sql`${parkingLocationsTable.availableSlots} + 1` })
          .where(eq(parkingLocationsTable.id, existing.locationId));
      }

      const [location] = await tx
        .select()
        .from(parkingLocationsTable)
        .where(eq(parkingLocationsTable.id, updated.locationId));

      return toBooking({
        ...updated,
        locationName: location.name,
        city: location.city,
        area: location.area,
      });
    });

    res.json(UpdateBookingResponse.parse(booking));
  } catch (error) {
    next(error);
  }
});

router.get("/parking/summary", async (_req, res, next) => {
  try {
    await ensureSeedData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [locationTotals] = await db
      .select({
        totalLocations: count(),
        totalSlots: sql<number>`coalesce(sum(${parkingLocationsTable.totalSlots}), 0)`,
        availableSlots: sql<number>`coalesce(sum(${parkingLocationsTable.availableSlots}), 0)`,
      })
      .from(parkingLocationsTable);

    const [bookingTotals] = await db
      .select({
        activeBookings: sql<number>`count(*) filter (where ${bookingsTable.status} in ('confirmed', 'active'))`,
        todayRevenue: sql<number>`coalesce(sum(${bookingsTable.amount}) filter (where ${bookingsTable.createdAt} >= ${today} and ${bookingsTable.status} <> 'cancelled'), 0)`,
      })
      .from(bookingsTable);

    const cityBreakdown = await db
      .select({
        city: parkingLocationsTable.city,
        locations: count(),
        availableSlots: sql<number>`coalesce(sum(${parkingLocationsTable.availableSlots}), 0)`,
      })
      .from(parkingLocationsTable)
      .groupBy(parkingLocationsTable.city)
      .orderBy(parkingLocationsTable.city);

    const recentBookings = (await getBookingRows()).slice(0, 5);

    res.json(
      GetParkingSummaryResponse.parse({
        totalLocations: locationTotals?.totalLocations ?? 0,
        totalSlots: Number(locationTotals?.totalSlots ?? 0),
        availableSlots: Number(locationTotals?.availableSlots ?? 0),
        activeBookings: Number(bookingTotals?.activeBookings ?? 0),
        todayRevenue: Number(bookingTotals?.todayRevenue ?? 0),
        cityBreakdown: cityBreakdown.map((item) => ({
          city: item.city,
          locations: item.locations,
          availableSlots: Number(item.availableSlots),
        })),
        recentBookings,
      }),
    );
  } catch (error) {
    next(error);
  }
});

router.use((error: unknown, req, res, _next) => {
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : 400;
  const message = error instanceof Error ? error.message : "Request failed";
  req.log.warn({ error }, "Parking API request failed");
  res.status(statusCode).json({ message });
});

export default router;