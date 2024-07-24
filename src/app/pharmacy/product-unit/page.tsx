"use client";
import Config from "@/app/config";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faEdit,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FailedAlert } from "@/app/components/alert/alert";
import LoadingSpinner from "@/app/components/spinner/spinner";
import { FailedToast } from "@/app/components/toast/toast";

interface ProductUnit {
  id: number;
  name: string;
}

const ProductUnitPage: React.FC = () => {
  const pharmacyServiceUrl = Config.PHARMACYSERVICE_URl;
  const [loading, setLoading] = useState<boolean>(true);
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);
  const [currentProductUnit, setCurrentProductUnit] =
    useState<ProductUnit | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadProductUnits = async () => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product-unit?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`
        );

        setLoading(false);
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }
        const data = await response.json();
        setProductUnits(data.data);
      } catch (error: any) {
        FailedAlert(error.message);
      }
    };
    loadProductUnits();
  }, [pharmacyServiceUrl, pagination, searchQuery]);

  const handleSaveProductUnit = async () => {
    if (!currentProductUnit) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${pharmacyServiceUrl}/product-unit/${currentProductUnit.id}`
      : `${pharmacyServiceUrl}/product-unit`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentProductUnit),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }

      const updatedProductUnit = await response.json();
      if (isEditMode) {
        setProductUnits((prev) =>
          prev.map((unit) =>
            unit.id === currentProductUnit.id ? updatedProductUnit.data : unit
          )
        );
      } else {
        setProductUnits((prev) => [updatedProductUnit.data, ...prev]);
      }
      setShowModal(false);
      setCurrentProductUnit(null);
    } catch (error: any) {
      FailedAlert(error.message);
    }
  };

  const handleDeleteProductUnit = async () => {
    if (!currentProductUnit) return;
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/product-unit/${currentProductUnit.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }

      setProductUnits((prev) =>
        prev.filter((unit) => unit.id !== currentProductUnit.id)
      );
      setShowDeleteModal(false);
      setCurrentProductUnit(null);
    } catch (error: any) {
      FailedToast(error.message);
    }
  };

  const handleOpenModal = (unit?: ProductUnit) => {
    if (unit) {
      setCurrentProductUnit(unit);
      setIsEditMode(true);
    } else {
      setCurrentProductUnit({
        id: 0,
        name: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (unit: ProductUnit) => {
    setCurrentProductUnit(unit);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProductUnit(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentProductUnit(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentProductUnit) {
      setCurrentProductUnit({ ...currentProductUnit, [name]: value });
    }
  };

  const handlePageChange = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 1 }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Satuan Produk</h3>
        </div>
        <div className="card-body">
          <Stack direction="horizontal" gap={2} className="mb-3">
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              title="Tambah satuan produk">
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Form.Control
              type="text"
              placeholder="Cari satuan produk..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="ms-auto"
            />
          </Stack>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {productUnits.map((unit, index) => (
                <tr key={unit.id}>
                  <td>
                    {" "}
                    {(pagination.pageIndex - 1) * pagination.pageSize +
                      index +
                      1}
                  </td>
                  <td>{unit.name}</td>
                  <td className="text-center">
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        variant="primary"
                        className="me-2 btn-sm"
                        title="ubah informasi satuan produk"
                        onClick={() => handleOpenModal(unit)}>
                        <FontAwesomeIcon icon={faEdit} size="xs" />
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleOpenDeleteModal(unit)}>
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
              disabled={pagination.pageIndex === 1}
              onClick={() => handlePageChange(1)}
              className="me-2">
              {"Terbaru"}
            </Button>
            <Button
              disabled={pagination.pageIndex === 1}
              onClick={() => handlePageChange(pagination.pageIndex - 1)}
              className="me-2">
              <FontAwesomeIcon icon={faCaretLeft}></FontAwesomeIcon>
              {"Sebelumnya"}
            </Button>
            <Button
              disabled={productUnits.length < pagination.pageSize}
              onClick={() => handlePageChange(pagination.pageIndex + 1)}
              className="me-2">
              {"Selanjutnya"}
              <FontAwesomeIcon icon={faCaretRight}></FontAwesomeIcon>
            </Button>

            <Form.Select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="ms-2"
              style={{ width: "auto", display: "inline-block" }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>

          {/* Modal for Add/Edit Product Unit */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit Satuan Produk" : "Tambah Satuan Produk"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProductUnit();
                }}>
                <Form.Group controlId="formName">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentProductUnit?.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveProductUnit}>
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
              Apakah Anda yakin ingin menghapus satuan produk
              {`${currentProductUnit?.name}`}?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteProductUnit}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ProductUnitPage;
