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


export const fetchPropertiesAction = async({search='',category}:{search?:string, category?:string})=>{
  const properties = await db.property.findMany({
    where:{
      category:category,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
      ],
    },
    select:{
      id:true,
      name:true,
      tagline:true,
      country:true,
      image:true,
      price:true
    },
    orderBy:{
      createdAt:'desc'
    }
  })
  return properties;
}

export const fetchFavoriteId = async({propertyId}:{propertyId:string})=>{
  const user = await getAuthUser();

  const favorite = await db.favorite.findFirst({
    where:{
      propertyId,
      profileId:user.id
    },
    select:{
      id:true
    }
  })

  return favorite?.id || null;
}

export const toggleFavoriteAction = async(prevState:{
  propertyId:string;
  favoriteId:string | null;
  pathname:string;
},formData:FormData)=>{

  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;
  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          propertyId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return { message: favoriteId ? 'Removed from Favorites' : 'Added to Favorites' };
  } catch (error) {
    return renderError(error);
  }
}

export const fetchFavorites  = async()=>{

  const user = await getAuthUser();

  const favorites = await db.favorite.findMany({
    where:{
      profileId:user.id
    },
    select:{
      property:{
        select:{
          id: true,
          name: true,
          tagline: true,
          price: true,
          country: true,
          image: true,
        }
      }
    }
  })
  return favorites.map((favorite)=>favorite.property);
}


export const fetchPropertyDetails = (id:string)=>{
  return db.property.findUnique({
    where:{
      id
    },
    include:{
      profile:true
    }
  })
}