"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

interface Signa {
  id: number;
  name: string;
}

const SignaPage: React.FC = () => {
  const pharmacyServiceUrl = "http://localhost:8082/api";
  const [signas, setSignas] = useState<Signa[]>([]);
  const [currentSigna, setCurrentSigna] = useState<Signa | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const loadSignas = async () => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/signa?page=${pagination.pageIndex}&per_page=${pagination.pageSize}`
        );
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
  }, [pagination]);

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
          setSignas((prev) => [updatedSigna.data, ...prev]);
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentSigna) {
      setCurrentSigna({ ...currentSigna, [name]: value });
    }
  };

  const handlePageChange = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
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
            onClick={() => handleOpenModal()}
            title="Tambah Signa">
            <FontAwesomeIcon icon={faPlus} /> {"Tambah"}
          </Button>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {signas.map((signa, index) => (
                <tr key={signa.id}>
                  <td>{index + 1}</td>
                  <td>{signa.name}</td>
                  <td>
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        variant="primary"
                        className="me-2 btn-sm"
                        title="ubah informasi Signa"
                        onClick={() => handleOpenModal(signa)}>
                        <FontAwesomeIcon icon={faEdit} size="xs" />
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleOpenDeleteModal(signa)}>
                        <FontAwesomeIcon icon={faTrash} size="xs" />
                      </Button>
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <Button
              disabled={pagination.pageIndex === 0}
              onClick={() => handlePageChange(0)}>
              {"<<"}
            </Button>
            <Button
              disabled={pagination.pageIndex === 0}
              onClick={() => handlePageChange(pagination.pageIndex - 1)}>
              {"<"}
            </Button>
            <Button
              disabled={signas.length < pagination.pageSize}
              onClick={() => handlePageChange(pagination.pageIndex + 1)}>
              {">"}
            </Button>
            <Button
              disabled={signas.length < pagination.pageSize}
              onClick={() =>
                handlePageChange(
                  Math.ceil(signas.length / pagination.pageSize) - 1
                )
              }>
              {">>"}
            </Button>

            <select value={pagination.pageSize} onChange={handlePageSizeChange}>
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>

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
                  <Form.Label>Nama</Form.Label>
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
              Apakah Anda yakin ingin menghapus signa {`${currentSigna?.name}`}?
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
