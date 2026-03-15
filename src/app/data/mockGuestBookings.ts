/**
 * Mock Guest Bookings Data
 * 
 * NOTE: This file contains DEMO data for the Admin portal.
 * This is currently still in use as the admin booking data
 * has not yet been migrated to the database.
 * 
 * TODO: Migrate to Supabase table when guest booking system is implemented.
 */

import type { Activity, GuestBooking } from "../../types";

export type { GuestBooking };

export const mockGuestBookings: GuestBooking[] = [
  {
    guestId: "1",
    guestName: "Sarah Johnson",
    email: "sarah.j@email.com",
    checkInDate: "2026-02-18",
    checkoutDate: "2026-02-22",
    roomNumber: "201",
    activities: [
      {
        id: "7",
        name: "ATV Trail",
        description:
          "Explore scenic mountain trails on eco-friendly bikes through villages and forests.",
        duration: "4 hours",
        price: 50,
        communityImpact: "No Direct Community Link",
        environmentalImpact: "High",
        image:
          "https://images.unsplash.com/photo-1496521061024-90e1c1221555?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800",
        category: "Adventure",
      },
      {
        id: "6",
        name: "Coffee Plantation Tour",
        description:
          "Visit local coffee farmers, learn about sustainable coffee growing, and taste fresh brews.",
        duration: "3 hours",
        price: 35,
        communityImpact: "Direct Local Partner",
        environmentalImpact: "Low",
        image:
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
        category: "Cultural",
      },
    ],
  },
  {
    guestId: "2",
    guestName: "Michael Chen",
    email: "mchen@email.com",
    checkInDate: "2026-02-19",
    checkoutDate: "2026-02-25",
    roomNumber: "305",
    activities: [
      {
        id: "3",
        name: "Lake Laut Tawar Kayaking",
        description:
          "Paddle through pristine waters while enjoying breathtaking mountain views.",
        duration: "2.5 hours",
        price: 40,
        communityImpact: "Internal Community Support",
        environmentalImpact: "Medium",
        image:
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
        category: "Adventure",
      },
      {
        id: "5",
        name: "Forest Conservation Hike",
        description:
          "Join our conservation team on a guided rainforest hike and tree-planting activity.",
        duration: "5 hours",
        price: 55,
        communityImpact: "Internal Community Support",
        environmentalImpact: "High",
        image:
          "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
        category: "Environmental",
      },
      {
        id: "6",
        name: "Coffee Plantation Tour",
        description:
          "Visit local coffee farmers, learn about sustainable coffee growing, and taste fresh brews.",
        duration: "3 hours",
        price: 35,
        communityImpact: "Direct Local Partner",
        environmentalImpact: "Medium",
        image:
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
        category: "Cultural",
      },
    ],
  },
  {
    guestId: "3",
    guestName: "Emma Rodriguez",
    email: "emma.r@email.com",
    checkInDate: "2026-02-20",
    checkoutDate: "2026-02-23",
    roomNumber: "412",
    activities: [
      {
        id: "4",
        name: "Traditional Weaving Class",
        description:
          "Learn the ancient art of Ulos weaving from local artisans and create your own piece.",
        duration: "4 hours",
        price: 60,
        communityImpact: "Direct Local Partner",
        environmentalImpact: "Low",
        image:
          "https://images.unsplash.com/photo-1545093149-618ce3bcf49d?w=800",
        category: "Cultural",
      },
      {
        id: "8",
        name: "Community Kitchen Experience",
        description:
          "Cook traditional Acehnese dishes with local families and share a meal together.",
        duration: "3.5 hours",
        price: 48,
        communityImpact: "Direct Local Partner",
        environmentalImpact: "Low",
        image:
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
        category: "Cultural",
      },
    ],
  },
  {
    guestId: "4",
    guestName: "David Park",
    email: "dpark@email.com",
    checkInDate: "2026-02-21",
    checkoutDate: "2026-02-24",
    roomNumber: "108",
    activities: [
      {
        id: "7",
        name: "Mountain Bike Trail",
        description:
          "Explore scenic mountain trails on eco-friendly bikes through villages and forests.",
        duration: "4 hours",
        price: 50,
        communityImpact: "No Direct Community Link",
        environmentalImpact: "Medium",
        image:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        category: "Adventure",
      },
    ],
  },
];