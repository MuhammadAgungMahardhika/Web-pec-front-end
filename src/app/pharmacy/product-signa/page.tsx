"use client";
import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import Link from "next/link";

interface Signa {
  id: number;
  name: string;
}

const SignaPage: React.FC = () => {
  const pharmacyServiceUrl = "http://localhost:8082/api";
  const [signas, setSignas] = useState<Signa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSigna, setCurrentSigna] = useState<Signa | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const loadSignas = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/signa`);
        if (response.ok) {
          const data = await response.json();
          setSignas(data.data);
        } else {
          console.error("Failed to load signas:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load signas:", error);
      }
    };

    loadSignas();
  }, []);

  const handleSaveSigna = async () => {
    if (!currentSigna) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${pharmacyServiceUrl}/signa/${currentSigna.id}`
      : `${pharmacyServiceUrl}/signa`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentSigna),
      });

      if (response.ok) {
        const updatedSigna = await response.json();
        if (isEditMode) {
          setSignas((prev) =>
            prev.map((signa) =>
              signa.id === currentSigna.id ? updatedSigna.data : signa
            )
          );
        } else {
          setSignas((prev) => [...prev, updatedSigna.data]);
        }
        setShowModal(false);
        setCurrentSigna(null);
      } else {
        console.error("Failed to save signa:", response.statusText);
        alert("Failed to save signa. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save signa:", error);
      alert("Failed to save signa. An error occurred.");
    }
  };

  const handleDeleteSigna = async () => {
    if (!currentSigna) return;
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/signa/${currentSigna.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setSignas((prev) =>
          prev.filter((signa) => signa.id !== currentSigna.id)
        );
        setShowDeleteModal(false);
        setCurrentSigna(null);
      } else {
        console.error("Failed to delete signa:", response.statusText);
        alert("Failed to delete signa. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete signa:", error);
      alert("Failed to delete signa. An error occurred.");
    }
  };

  const handleOpenModal = (signa?: Signa) => {
    if (signa) {
      setCurrentSigna(signa);
      setIsEditMode(true);
    } else {
      setCurrentSigna({
        id: 0,
        name: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (signa: Signa) => {
    setCurrentSigna(signa);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentSigna(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentSigna(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentSigna) {
      setCurrentSigna({ ...currentSigna, [name]: value });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Signa</h3>
        </div>
        <div className="card-body">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleOpenModal()}>
            Tambah Signa
          </Button>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {signas.map((signa, index) => (
                <tr key={signa.id}>
                  <td>{index + 1}</td>
                  <td>{signa.name}</td>
                  <td>
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => handleOpenModal(signa)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleOpenDeleteModal(signa)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal for Add/Edit Signa */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit Signa" : "Tambah Signa"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formName">
                  <Form.Label>Nama Signa</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentSigna?.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveSigna}>
                Simpan
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal for Delete Confirmation */}
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Konfirmasi Hapus</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Apakah Anda yakin ingin menghapus signa {currentSigna?.name}?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteSigna}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default SignaPage;
