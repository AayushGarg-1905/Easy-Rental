import React from 'react'
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { tempDefaultDescription } from '@/utils/constants';

type TextAreaInputProps = {
  name: string;
  labelText?: string;
  defaultValue?: string;
};

function TextAreaInput({name,labelText,defaultValue}:TextAreaInputProps) {
  return (
    <div className='mb-2'>
      <Label htmlFor={name} className='capitalize'>
        {labelText || name}
      </Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue || tempDefaultDescription}
        rows={5}
        required
        className='leading-loose'
      />
    </div>
  )
}

export default TextAreaInput