'use server'
import db from '../db'
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { createReviewSchema, imageSchema, profileSchema, propertySchema, validateWithZodSchema } from "../schemas";
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache';
import { uploadImageToSupabase } from '../supabase';
import { renderError, getAuthUser } from './commonActions';

export const fetchReservations = async () => {
  const user = await getAuthUser();

  const reservations = await db.booking.findMany({
    where: {
      property: {
        profileId: user.id,
      },
      paymentStatus: true
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true,
        },
      },
    },
  });
  return reservations;
};

export const fetchReservationStats = async () => {
  const user = await getAuthUser();
  const properties = await db.property.count({
    where: {
      profileId: user.id,
    },
  });

  const totals = await db.booking.aggregate({
    _sum: {
      orderTotal: true,
      totalNights: true,
    },
    where: {
      property: {
        profileId: user.id,
      },
    },
  });

  return {
    properties,
    nights: totals._sum.totalNights || 0,
    amount: totals._sum.orderTotal || 0,
  };
};