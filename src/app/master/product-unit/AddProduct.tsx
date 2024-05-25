"use client";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

function AddProduct() {
  const [show, setShow] = useState(false);
  const [inputName, setInputName] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [validated, setValidated] = useState(false);

  const handleSubmit = async (event: any) => {
    const form = event.currentTarget;

    event.preventDefault();
    const data = {
      name: inputName,
    };
    const endpoint: string = "http://127.0.0.1:8000/api/product-unit";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Data-Type": "json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert(result);
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
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Nama Satuan</Form.Label>
              <Form.Control
                type="text"
                placeholder="Masukan nama satuan"
                onChange={(evet) => setInputName(evet.target.value)}
              />
            </Form.Group>
          </Form>
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
