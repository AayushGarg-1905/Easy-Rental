'use server'
import db from '../db'
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { createReviewSchema, imageSchema, profileSchema, propertySchema, validateWithZodSchema } from "../schemas";
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache';
import { uploadImageToSupabase } from '../supabase';
import { renderError, getAuthUser } from './commonActions';


export const fetchRentals = async () => {
    const user = await getAuthUser();
    const rentals = await db.property.findMany({
        where: {
            profileId: user.id,
        },
        select: {
            id: true,
            name: true,
            price: true,
        },
    });

    const rentalsWithBookingSums = await Promise.all(
        rentals.map(async (rental) => {
            const totalNightsSum = await db.booking.aggregate({
                where: {
                    propertyId: rental.id,
                },
                _sum: {
                    totalNights: true,
                },
            });

            const orderTotalSum = await db.booking.aggregate({
                where: {
                    propertyId: rental.id,
                },
                _sum: {
                    orderTotal: true,
                },
            });

            return {
                ...rental,
                totalNightsSum: totalNightsSum._sum.totalNights,
                orderTotalSum: orderTotalSum._sum.orderTotal,
            };
        })
    );

    return rentalsWithBookingSums;
};


export async function deleteRentalAction(prevState: { propertyId: string }) {
    const { propertyId } = prevState;
    const user = await getAuthUser();

    try {
        await db.property.delete({
            where: {
                id: propertyId,
                profileId: user.id,
            },
        });

        revalidatePath('/rentals');
        return { message: 'Rental deleted successfully' };
    } catch (error) {
        return renderError(error);
    }
}

export const fetchRentalDetails = async (propertyId: string) => {
    const user = await getAuthUser();

    return db.property.findUnique({
        where: {
            id: propertyId,
            profileId: user.id,
        },
    });
};

export const updateRentalAction = async (
    prevState: any,
    formData: FormData
): Promise<{ message: string }> => {
    const user = await getAuthUser();
    const propertyId = formData.get('id') as string;

    try {
        const rawData = Object.fromEntries(formData);
        const validatedFields = validateWithZodSchema(propertySchema, rawData);
        await db.property.update({
            where: {
                id: propertyId,
                profileId: user.id,
            },
            data: {
                ...validatedFields,
            },
        });

        revalidatePath(`/rentals/${propertyId}/edit`);
        return { message: 'Rental Updated Successfully' };
    } catch (error) {
        return renderError(error);
    }
};

export const updateRentalImageAction = async (
    prevState: any,
    formData: FormData
  ): Promise<{ message: string }> => {
    const user = await getAuthUser();
    const propertyId = formData.get('id') as string;
  
    try {
      const image = formData.get('image') as File;
      const validatedFields = validateWithZodSchema(imageSchema, { image });
      const fullPath = await uploadImageToSupabase(validatedFields.image);
  
      await db.property.update({
        where: {
          id: propertyId,
          profileId: user.id,
        },
        data: {
          image: fullPath,
        },
      });

      revalidatePath(`/rentals/${propertyId}/edit`);
      return { message: 'Rental Image Updated Successfully' };
    } catch (error) {
      return renderError(error);
    }
  };