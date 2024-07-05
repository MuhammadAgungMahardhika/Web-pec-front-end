"use client";
import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import Link from "next/link";

interface Product {
  id: number;
  id_category: number;
  code: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  expired: string;
  restriction: string;
  bpjs_prb: boolean;
  chronic: boolean;
  generic: string;
}

const ProductPage: React.FC = () => {
  const pharmacyServiceUrl = "http://localhost:8082/api";
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/product`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data);
        } else {
          console.error("Failed to load products:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
  }, []);

  const handleSaveProduct = async () => {
    if (!currentProduct) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${pharmacyServiceUrl}/product/${currentProduct.id}`
      : `${pharmacyServiceUrl}/product`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentProduct),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        if (isEditMode) {
          setProducts((prev) =>
            prev.map((product) =>
              product.id === currentProduct.id ? updatedProduct.data : product
            )
          );
        } else {
          setProducts((prev) => [...prev, updatedProduct]);
        }
        setShowModal(false);
        setCurrentProduct(null);
      } else {
        console.error("Failed to save product:", response.statusText);
        alert("Failed to save product. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product. An error occurred.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!currentProduct) return;
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/product/${currentProduct.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setProducts((prev) =>
          prev.filter((product) => product.id !== currentProduct.id)
        );
        setShowDeleteModal(false);
        setCurrentProduct(null);
      } else {
        console.error("Failed to delete product:", response.statusText);
        alert("Failed to delete product. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. An error occurred.");
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setIsEditMode(true);
    } else {
      setCurrentProduct({
        id: 0,
        id_category: 0,
        code: "",
        name: "",
        description: "",
        price: 0,
        stock_quantity: 0,
        expired: "",
        restriction: "",
        bpjs_prb: false,
        chronic: false,
        generic: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProduct(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, [name]: newValue });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Produk Obat</h3>
        </div>
        <div className="card-body">
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleOpenModal()}>
            Tambah Produk
          </Button>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Kode</th>
                <th>Nama</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Jumlah Stok</th>
                <th>Kedaluwarsa</th>
                <th>Pembatasan</th>
                <th>BPJS PRB</th>
                <th>Kronis</th>
                <th>Generik</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.price}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.expired}</td>
                  <td>{product.restriction}</td>
                  <td>{product.bpjs_prb ? "Ya" : "Tidak"}</td>
                  <td>{product.chronic ? "Ya" : "Tidak"}</td>
                  <td>{product.generic}</td>
                  <td>
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => handleOpenModal(product)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleOpenDeleteModal(product)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal for Add/Edit Product */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit Produk" : "Tambah Produk"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formCode">
                  <Form.Label>Kode</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={currentProduct?.code || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formName">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentProduct?.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formDescription">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={currentProduct?.description || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formPrice">
                  <Form.Label>Harga</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={currentProduct?.price || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formStockQuantity">
                  <Form.Label>Jumlah Stok</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_quantity"
                    value={currentProduct?.stock_quantity || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formExpired">
                  <Form.Label>Kedaluwarsa</Form.Label>
                  <Form.Control
                    type="date"
                    name="expired"
                    value={currentProduct?.expired || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRestriction">
                  <Form.Label>Pembatasan</Form.Label>
                  <Form.Control
                    type="text"
                    name="restriction"
                    value={currentProduct?.restriction || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formBpjsPrb">
                  <Form.Label>BPJS PRB</Form.Label>
                  <Form.Check
                    type="checkbox"
                    name="bpjs_prb"
                    checked={currentProduct?.bpjs_prb || false}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct!,
                        bpjs_prb: e.target.checked,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group controlId="formChronic">
                  <Form.Label>Kronis</Form.Label>
                  <Form.Check
                    type="checkbox"
                    name="chronic"
                    checked={currentProduct?.chronic || false}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct!,
                        chronic: e.target.checked,
                      })
                    }
                  />
                </Form.Group>

                <Form.Group controlId="formGeneric">
                  <Form.Label>Generik</Form.Label>
                  <Form.Control
                    type="text"
                    name="generic"
                    value={currentProduct?.generic || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveProduct}>
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
              Apakah Anda yakin ingin menghapus produk {currentProduct?.name}?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteProduct}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
