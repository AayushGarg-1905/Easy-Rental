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