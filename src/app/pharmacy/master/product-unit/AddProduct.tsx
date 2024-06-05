'use client'
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';


function AddProduct() {
  const [show, setShow] = useState(false);
  const [name,setName] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [validated, setValidated] = useState(false);

  const handleNameChange = (event:any)=> {
    setName(event.target.value);
   
  }
  const handleSubmit = async (event:any) => {
    const data = { name };
    const endpoint = "https://your-api-endpoint.com/api/names"
    const token = 'YOUR_JWT_TOKEN_HERE';
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('Success:', jsonResponse);
            // Handle successful response
        } else {
            console.error('Failed to submit:', response.statusText);
            // Handle error response
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle fetch error
    }
    setShow(true)
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Tambah
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Menambahkan Satuan Produk</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">Satuan</InputGroup.Text>
              <Form.Control
                placeholder="Satuan"
                aria-label="Satuan"
                aria-describedby="Satuan"
                onChange={handleNameChange}
              />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Tutup
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
           Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddProduct;
