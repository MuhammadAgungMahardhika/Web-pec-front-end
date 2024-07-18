"use client";
import Config from "@/app/config";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingSpinner from "@/app/components/spinner/spinner";
import {
  faCaretLeft,
  faCaretRight,
  faEdit,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FailedAlert } from "@/app/components/alert/alert";

interface ProductCategory {
  id: number;
  name: string;
}

const ProductCategoryPage: React.FC = () => {
  const pharmacyServiceUrl = Config.PHARMACYSERVICE_URl;
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [currentProductCategory, setCurrentProductCategory] =
    useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
    const loadProductCategories = async () => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product-category?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`
        );
        setLoading(false);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
        setProductCategories(data.data);
        setLoading(false);
      } catch (error: any) {
        console.error("Failed to load product units:", error);
        FailedAlert("Failed to load product units:" + error.message);
      }
    };
    loadProductCategories();
  }, [pharmacyServiceUrl, pagination, searchQuery]);

  const handleSaveProductCategory = async () => {
    if (!currentProductCategory) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${pharmacyServiceUrl}/product-category/${currentProductCategory.id}`
      : `${pharmacyServiceUrl}/product-category`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentProductCategory),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const updatedProductCategory = await response.json();
      if (isEditMode) {
        setProductCategories((prev) =>
          prev.map((category) =>
            category.id === currentProductCategory.id
              ? updatedProductCategory.data
              : category
          )
        );
      } else {
        setProductCategories((prev) => [updatedProductCategory.data, ...prev]);
      }
      setShowModal(false);
      setCurrentProductCategory(null);
    } catch (error: any) {
      console.error("Failed to load product units:", error);
      FailedAlert("Failed to load product units:" + error.message);
    }
  };

  const handleDeleteProductCategory = async () => {
    if (!currentProductCategory) return;
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/product-category/${currentProductCategory.id}`,
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

      setProductCategories((prev) =>
        prev.filter((category) => category.id !== currentProductCategory.id)
      );
      setShowDeleteModal(false);
      setCurrentProductCategory(null);
    } catch (error: any) {
      console.error("Failed to load product units:", error);
      FailedAlert("Failed to load product units:" + error.message);
    }
  };

  const handleOpenModal = (category?: ProductCategory) => {
    if (category) {
      setCurrentProductCategory(category);
      setIsEditMode(true);
    } else {
      setCurrentProductCategory({
        id: 0,
        name: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (category: ProductCategory) => {
    setCurrentProductCategory(category);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProductCategory(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentProductCategory(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentProductCategory) {
      setCurrentProductCategory({ ...currentProductCategory, [name]: value });
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

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Kategori Produk</h3>
        </div>
        <div className="card-body">
          <Stack direction="horizontal" gap={2} className="mb-3">
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              title="Tambah kategori produk">
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Form.Control
              type="text"
              placeholder="Cari kategori produk..."
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
              {productCategories.map((category, index) => (
                <tr key={category.id}>
                  <td>
                    {" "}
                    {(pagination.pageIndex - 1) * pagination.pageSize +
                      index +
                      1}
                  </td>
                  <td>{category.name}</td>
                  <td>
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        variant="primary"
                        className="me-2 btn-sm"
                        title="ubah informasi kategori produk"
                        onClick={() => handleOpenModal(category)}>
                        <FontAwesomeIcon icon={faEdit} size="xs" />
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleOpenDeleteModal(category)}>
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
              disabled={productCategories.length <= pagination.pageSize}
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

          {/* Modal for Add/Edit Product Category */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit Kategori Produk" : "Tambah Kategori Produk"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProductCategory();
                }}>
                <Form.Group controlId="formName">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentProductCategory?.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveProductCategory}>
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
              Apakah Anda yakin ingin menghapus kategori produk
              {`${currentProductCategory?.name}`}?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteProductCategory}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryPage;
