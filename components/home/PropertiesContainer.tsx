import { fetchPropertiesAction } from '@/utils/actions/propertyActions'
import { PropertyCardProps } from '@/utils/types'
import React from 'react'
import EmptyList from './EmptyList'
import PropertiesList from './PropertiesList'

type PropertiesContainerProps = {
  category?:string,
  search?:string
}
const PropertiesContainer = async({category,search}:PropertiesContainerProps) => {
  
  const properties:PropertyCardProps[] = await fetchPropertiesAction({search,category});

  if(properties.length==0){
    return (
      <EmptyList
        heading='No results.'
        message='Try changing or removing some of your filters.'
        btnText='Clear Filters'
      />
    )
  }

  return (
    <PropertiesList properties={properties}/>
  )
}

export default PropertiesContainer