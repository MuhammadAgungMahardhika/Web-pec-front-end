"use client";
import Config from "@/app/config";
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AsyncSelect from "react-select/async";

import {
  faCaretLeft,
  faCaretRight,
  faEdit,
  faPlus,
  faSave,
  faTrash,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/app/components/spinner/spinner";

import { SuccessToast, FailedToast } from "@/app/components/toast/toast";

interface Services {
  id: number;
  name: string;
  price: number;
  code_of_service: string;
}

interface Pagination {
  pageIndex: number;
  pageSize: number;
}
interface SelectOption {
  value: number | null;
  label: string | "";
}

const ServicesPage: React.FC = () => {
  const cashierServiceUrl = Config.CASHIERSERVICE_URl;
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<Services[]>([]);
  const [currentServices, setCurrentServices] = useState<Services | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/service?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();
        setServices(data.data);
        setLoading(false);
      } catch (error: any) {
        console.error("Failed to load service units:", error);
        FailedToast("Failed to load service units:" + error.message);
      }
    };
    loadServices();
  }, [cashierServiceUrl, pagination, searchQuery]);

  const handleSaveService = async () => {
    if (!currentServices) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${cashierServiceUrl}/service/${currentServices.id}`
      : `${cashierServiceUrl}/service`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentServices),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const updatedService = await response.json();

      if (isEditMode) {
        setServices((prev) =>
          prev.map((product) =>
            product.id === updatedService.data.id
              ? updatedService.data
              : product
          )
        );
        SuccessToast("Berhasil mengedit produk");
      } else {
        setServices((prev) => [updatedService.data, ...prev]);
        SuccessToast("Berhasil menambahkan produk");
      }

      setShowModal(false);
      setCurrentServices(null);
    } catch (error: any) {
      console.error("Failed to save service:", error);
      FailedToast(`Failed to save service: ${error.message}`);
    }
  };

  const handleDeleteService = async () => {
    if (!currentServices) return;
    try {
      const response = await fetch(
        `${cashierServiceUrl}/service/${currentServices.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      SuccessToast("Berhasil menghapus layanan");
      setServices((prev) =>
        prev.filter((service) => service.id !== currentServices.id)
      );
      setShowDeleteModal(false);
      setCurrentServices(null);
    } catch (error: any) {
      console.error("Failed to delete service:", error);
      FailedToast(`Failed to delete service: : ${error.message}`);
    }
  };

  const handleOpenModal = async (service?: Services) => {
    if (service) {
      setCurrentServices(service);
      setIsEditMode(true);
    } else {
      setCurrentServices({
        id: 0,
        name: "",
        price: 0,
        code_of_service: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (service: Services) => {
    setCurrentServices(service);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentServices(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentServices(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (currentServices) {
      setCurrentServices({ ...currentServices, [name]: newValue });
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
    setPagination((prev) => ({ ...prev, pageIndex: 1 })); // Reset to first page on search
  };


  const handleSelectChange = (
    selectedOption: SelectOption | null,
    action: any
  ) => {
    if (currentServices && action.name) {
      setCurrentServices({
        ...currentServices,
        [action.name]: selectedOption ? selectedOption.value : 0,
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Produk Obat</h3>
        </div>
        <div className="card-body">
          <Stack direction="horizontal" gap={2} className="mb-3">
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              title="Tambah produk">
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Form.Control
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="ms-auto"
            />
          </Stack>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Kode Layanan</th>
                <th>Nama</th>
                <th className="text-end">Harga</th>

                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.id}>
                  <td>
                    {(pagination.pageIndex - 1) * pagination.pageSize +
                      index +
                      1}
                  </td>
                  <td>{service.code_of_service}</td>
                  <td>{service.name}</td>
                  <td className="text-end">{service.price}</td>
                  <td>
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        variant="primary"
                        className="me-2 btn-sm"
                        title="ubah informasi layanan"
                        onClick={() => handleOpenModal(service)}>
                        <FontAwesomeIcon icon={faEdit} size="xs" />
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleOpenDeleteModal(service)}>
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
              disabled={services.length < pagination.pageSize}
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

          {/* Modal for Add/Edit Product */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit Layanan" : "Tambah Layanan"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveService();
                }}>
                <Stack direction="horizontal" gap={2} className="mb-2">

                  <Form.Group controlId="formName" style={{ flex: 1 }}>
                    <Form.Label>
                      Nama
                      <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={currentServices?.name || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formPrice" style={{ flex: 1 }}>
                    <Form.Label>
                      Harga
                      <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={currentServices?.price || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Form.Group
                  controlId="formCodeOfService"
                  className="mb-2"
                  style={{ flex: 1 }}>
                  <Form.Label>Kode Layanan</Form.Label>
                  <Form.Control
                    type="text"
                    name="code_of_service"
                    value={currentServices?.code_of_service || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Stack direction="horizontal" gap={3}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faX} className="me-2" />
                  {"Batal"}
                </Button>
                <Button variant="primary" onClick={handleSaveService}>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {"Simpan"}
                </Button>
              </Stack>
            </Modal.Footer>
          </Modal>

          {/* Modal for Delete Confirmation */}
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Konfirmasi Hapus</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Apakah Anda yakin ingin menghapus produk ini?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteService}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
