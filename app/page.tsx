import CategoriesList from '@/components/home/CategoriesList'
import PropertiesContainer from '@/components/home/PropertiesContainer'
import React from 'react'

function HomePage() {
  return (
    <section>
      <CategoriesList/>
      <PropertiesContainer/>
    </section>
  )
}

export default HomePage