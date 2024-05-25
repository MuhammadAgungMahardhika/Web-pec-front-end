'use client'

import { useState } from "react"

export const AddProduct = () => {
  const [countHello, setCountHello]= useState(1);
  
  const handleClick = ()=>{
    alert(countHello)
   
  }
  return (
    <button className="btn btn-success" onClick={handleClick}>AddProduct</button>
  )
}
