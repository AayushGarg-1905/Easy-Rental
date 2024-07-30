'use server'
import { currentUser } from "@clerk/nextjs/server";
import {redirect} from 'next/navigation'

export const getAuthUser = async()=>{
    const user = await currentUser();
    if(!user){
        throw new Error('You must be logged in to access this route');
    }
    if(!user.privateMetadata.hasProfile){
        redirect('/profile/create');
    }

    return user;
}

export const renderError = (error:unknown):{message:string}=>{
    return {message: error instanceof Error ? error.message : 'An Error occured'}
}