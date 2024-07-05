"use client";
import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import Link from "next/link";

interface ProductCategory {
  id: number;
  name: string;
}

const ProductCategoryPage: React.FC = () => {
  const pharmacyServiceUrl = "http://localhost:8082/api";
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<ProductCategory | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/product-category`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data);
        } else {
          console.error("Failed to load categories:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  const handleSaveCategory = async () => {
    if (!currentCategory) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${pharmacyServiceUrl}/product-category/${currentCategory.id}`
      : `${pharmacyServiceUrl}/product-category`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentCategory),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        if (isEditMode) {
          setCategories((prev) =>
            prev.map((category) =>
              category.id === currentCategory.id
                ? updatedCategory.data
                : category
            )
          );
        } else {
          setCategories((prev) => [...prev, updatedCategory.data]);
        }
        setShowModal(false);
        setCurrentCategory(null);
      } else {
        console.error("Failed to save category:", response.statusText);
        alert("Failed to save category. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category. An error occurred.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/product-category/${currentCategory.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setCategories((prev) =>
          prev.filter((category) => category.id !== currentCategory.id)
        );
        setShowDeleteModal(false);
        setCurrentCategory(null);
      } else {
        console.error("Failed to delete category:", response.statusText);
        alert("Failed to delete category. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. An error occurred.");
    }
  };

  const handleOpenModal = (category?: ProductCategory) => {
    if (category) {
      setCurrentCategory(category);
      setIsEditMode(true);
    } else {
      setCurrentCategory({
        id: 0,
        name: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (category: ProductCategory) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentCategory(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentCategory) {
      setCurrentCategory({ ...currentCategory, [name]: value });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Kategori Produk</h3>
        </div>
        <div className="card-body">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleOpenModal()}>
            Tambah Kategori
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
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td>{index + 1}</td>
                  <td>{category.name}</td>
                  <td>
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => handleOpenModal(category)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleOpenDeleteModal(category)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal for Add/Edit Category */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit Kategori" : "Tambah Kategori"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formName">
                  <Form.Label>Nama Kategori</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentCategory?.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveCategory}>
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
              Apakah Anda yakin ingin menghapus kategori {currentCategory?.name}
              ?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteCategory}>
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
