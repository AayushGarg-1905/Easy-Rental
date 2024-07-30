'use server'
import db from '../db'
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { imageSchema, profileSchema, propertySchema, validateWithZodSchema } from "../schemas";
import {redirect} from 'next/navigation'
import { revalidatePath } from 'next/cache';
import { uploadImageToSupabase } from '../supabase';
import { renderError, getAuthUser } from './commonActions';

export const createPropertyAction = async(prevData:any, formData:FormData):Promise<{message:string}>=>{

    const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get('image') as File;
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    const validatedFile = validateWithZodSchema(imageSchema,{image:file})
    const uploadedImageUrl = await uploadImageToSupabase(validatedFile.image);
    await db.property.create({
      data: {
        ...validatedFields,
        image: uploadedImageUrl,
        profileId: user.id,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect('/');
}