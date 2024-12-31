'use server'
import db from '../db'
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { createReviewSchema, imageSchema, profileSchema, propertySchema, validateWithZodSchema } from "../schemas";
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache';
import { uploadImageToSupabase } from '../supabase';
import { renderError, getAuthUser } from './commonActions';
import { formatDate } from '../format';




const getAdminUser = async () => {
    const user = await getAuthUser();
    if (user.id !== process.env.ADMIN_USER_ID) redirect('/');
    return user;
};

export const fetchStats = async () => {
    await getAdminUser();

    const usersCount = await db.profile.count();
    const propertiesCount = await db.property.count();
    const bookingsCount = await db.booking.count();

    return {
        usersCount,
        propertiesCount,
        bookingsCount,
    };
};

export const fetchChartsData = async () => {
    await getAdminUser();
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    const sixMonthsAgo = date;
  
    const bookings = await db.booking.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    let bookingsPerMonth = bookings.reduce((total, current) => {
      const date = formatDate(current.createdAt, true);
  
      const existingEntry = total.find((entry) => entry.date === date);
      if (existingEntry) {
        existingEntry.count += 1;
      } else {
        total.push({ date, count: 1 });
      }
      return total;
    }, [] as Array<{ date: string; count: number }>);
    
    return bookingsPerMonth;
  };