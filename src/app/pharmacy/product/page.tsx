"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faDiagramNext,
  faEdit,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/app/components/spinner/spinner";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product?page=${pagination.pageIndex}&per_page=${pagination.pageSize}`
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data);
          console.log(data.count);
          setLoading(false);
        } else {
          console.error("Failed to load products:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    loadProducts();
  }, [pagination]);

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
          setProducts((prev) => [updatedProduct.data, ...prev]);
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, [name]: newValue });
    }
  };

  const handlePageChange = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
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
          <Button
            variant="primary"
            className="mb-3"
            onClick={() => handleOpenModal()}
            title="Tambah produk ">
            <FontAwesomeIcon icon={faPlus} /> {"Tambah"}
          </Button>

          <Table striped bordered hover responsive>
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
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td>
                    {(pagination.pageIndex - 1) * pagination.pageSize +
                      index +
                      1}
                  </td>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td className="text-end">{product.price}</td>
                  <td className="text-end">{product.stock_quantity}</td>
                  <td>{product.expired}</td>
                  <td>{product.restriction}</td>
                  <td>{product.bpjs_prb ? "Ya" : "Tidak"}</td>
                  <td>{product.chronic ? "Ya" : "Tidak"}</td>
                  <td>{product.generic}</td>
                  <td>
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        variant="primary"
                        className="me-2 btn-sm"
                        title="ubah informasi produk"
                        onClick={() => handleOpenModal(product)}>
                        <FontAwesomeIcon icon={faEdit} size="xs" />
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleOpenDeleteModal(product)}>
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
              disabled={products.length < pagination.pageSize}
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
                {isEditMode ? "Edit Produk" : "Tambah Produk"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Stack direction="horizontal" gap={2}>
                  <Form.Group controlId="formCode">
                    <Form.Label>
                      Kode <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="code"
                      value={currentProduct?.code || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formName">
                    <Form.Label>
                      Nama
                      <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={currentProduct?.name || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2}>
                  <Form.Group controlId="formPrice">
                    <Form.Label>
                      Harga
                      <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={currentProduct?.price || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formStockQuantity">
                    <Form.Label>Jumlah Stok</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock_quantity"
                      value={currentProduct?.stock_quantity || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Form.Group controlId="formDescription">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={currentProduct?.description || ""}
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

                <Stack direction="horizontal" gap={2}>
                  <Form.Group controlId="formRestriction">
                    <Form.Label>Pembatasan</Form.Label>
                    <Form.Control
                      type="text"
                      name="restriction"
                      value={currentProduct?.restriction || ""}
                      onChange={handleChange}
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
                </Stack>

                <Stack direction="horizontal" gap={2}>
                  <Form.Group controlId="formBpjsPrb">
                    <Form.Check
                      type="checkbox"
                      label="BPJS PRB"
                      name="bpjs_prb"
                      checked={currentProduct?.bpjs_prb || false}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formChronic">
                    <Form.Check
                      type="checkbox"
                      label="Kronis"
                      name="chronic"
                      checked={currentProduct?.chronic || false}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>
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
              <p>Apakah Anda yakin ingin menghapus produk ini?</p>
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
