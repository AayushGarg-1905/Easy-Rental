'use server'
import db from '../db'
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { createReviewSchema, imageSchema, profileSchema, propertySchema, validateWithZodSchema } from "../schemas";
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache';
import { renderError, getAuthUser } from './commonActions';
import { calculateTotals } from '../calculateTotals';


export const createBookingAction = async (prevState: {
    propertyId: string, checkIn: Date, checkOut: Date
}, formData: FormData) => {

    const user = await getAuthUser();

    const { propertyId, checkIn, checkOut } = prevState;
    const property = await db.property.findUnique({
        where: { id: propertyId },
        select: { price: true },
    });
    if (!property) {
        return { message: 'Property not found' };
    }
    const { orderTotal, totalNights } = calculateTotals({
        checkIn,
        checkOut,
        price: property.price,
    });

    try {
        const booking = await db.booking.create({
            data: {
                checkIn,
                checkOut,
                orderTotal,
                totalNights,
                profileId: user.id,
                propertyId,
            },
        });
    } catch (error) {
        return renderError(error);
    }
    redirect('/bookings');
};

export const fetchBookings = async () => {
    const user = await getAuthUser();
    const bookings = await db.booking.findMany({
        where: {
            profileId: user.id,
        },
        include: {
            property: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return bookings;
};

export async function deleteBookingAction(prevState: { bookingId: string }) {
    const { bookingId } = prevState;
    const user = await getAuthUser();

    try {
        const result = await db.booking.delete({
            where: {
                id: bookingId,
                profileId: user.id,
            },
        });

        revalidatePath('/bookings');
        return { message: 'Booking deleted successfully' };
    } catch (error) {
        return renderError(error);
    }
}