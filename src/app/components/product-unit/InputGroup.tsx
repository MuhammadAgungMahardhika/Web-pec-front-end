'use client'
import React from 'react'
import { Form } from 'react-bootstrap'
const InputGroup:React.FC = ()=>{
    return (
      <>
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Nama</Form.Label>
            <Form.Control type="text" placeholder="nama satuan" />
          </Form.Group>
      </Form>
      </>
    )
  }

export default InputGroup;