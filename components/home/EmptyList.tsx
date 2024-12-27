import React from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'

type EmptyListProps = {
  heading?:string,
  message?:string,
  btnText?:string
}

const EmptyList = ({
heading='No items in the list',
message='Keep exploring our properties',
btnText='Back home'
}:EmptyListProps) => {
  return (
    <div className='mt-4'>
      <h2 className='text-xl font-bold'>{heading}</h2>
      <p className='text-lg'>{message}</p>
      <Button asChild className='mt-4 capitalize' size='lg'>
        <Link href='/'>{btnText}</Link>
      </Button>
    </div>
  )
}

export default EmptyList