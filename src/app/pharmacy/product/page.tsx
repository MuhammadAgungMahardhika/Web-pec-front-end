"use client";
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
import {
  SuccessAlert,
  FailedAlert,
  WarningAlert,
} from "@/app/components/alert/alert";
interface Product {
  id: number;
  id_category: number | null;
  id_unit: number | null;
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

interface Pagination {
  pageIndex: number;
  pageSize: number;
}
interface SelectOption {
  value: number | null;
  label: string | "";
}

const ProductPage: React.FC = () => {
  const pharmacyServiceUrl = "http://localhost:8082/api";
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [initialCategory, setInitialCategory] = useState<SelectOption | null>(
    null
  );
  const [initialUnit, setInitialUnit] = useState<SelectOption | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data);
          setLoading(false);
        } else {
          console.error("Failed to load products:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    loadProducts();
  }, [pagination, searchQuery]);

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

      if (!response.ok) {
        // Throw an error with the response status text
        throw new Error(response.statusText);
      }

      const updatedProduct = await response.json();

      if (isEditMode) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === updatedProduct.data.id
              ? updatedProduct.data
              : product
          )
        );
        SuccessAlert("Berhasil mengedit produk");
      } else {
        setProducts((prev) => [updatedProduct.data, ...prev]);
        SuccessAlert("Berhasil menambahkan produk");
      }

      setShowModal(false);
      setCurrentProduct(null);
    } catch (error: any) {
      console.error("Failed to save product:", error);
      FailedAlert(`Failed to save product: ${error.message}`);
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

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      SuccessAlert("Berhasil menghapus produk");
      setProducts((prev) =>
        prev.filter((product) => product.id !== currentProduct.id)
      );
      setShowDeleteModal(false);
      setCurrentProduct(null);
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      FailedAlert(`Failed to delete product: : ${error.message}`);
    }
  };

  const handleOpenModal = async (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
      setIsEditMode(true);

      // Load initial values for category and unit
      if (product.id_category && product.id_unit) {
        const [categoryResponse, unitResponse] = await Promise.all([
          fetch(
            `${pharmacyServiceUrl}/product-category/${product.id_category}`
          ),
          fetch(`${pharmacyServiceUrl}/product-unit/${product.id_unit}`),
        ]);

        if (categoryResponse.ok && unitResponse.ok) {
          const categoryData = await categoryResponse.json();
          const unitData = await unitResponse.json();

          console.log(categoryData.data.name);
          console.log(unitData.data.name);
          setInitialCategory({
            value: categoryData.data.id,
            label: categoryData.data.name,
          });
          setInitialUnit({
            value: unitData.data.id,
            label: unitData.data.name,
          });
        }
      } else {
        setInitialCategory(null);
        setInitialUnit(null);
      }
    } else {
      setCurrentProduct({
        id: 0,
        id_category: null,
        id_unit: null,
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
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 1 })); // Reset to first page on search
  };

  const loadProductCategoryOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product-category?search=${inputValue}`
        );
        const successResponse = await response.json();
        const options = successResponse.data.map((productCategory: any) => ({
          value: productCategory.id,
          label: productCategory.name,
        }));

        return options;
      } catch (error) {
        console.error("Error fetching product Category options:", error);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  const loadProductUnitOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product-unit?search=${inputValue}`
        );
        const successResponse = await response.json();
        const options = successResponse.data.map((productUnit: any) => ({
          value: productUnit.id,
          label: productUnit.name,
        }));

        return options;
      } catch (error) {
        console.error("Error fetching product Unit options:", error);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  const handleSelectChange = (
    selectedOption: SelectOption | null,
    action: any
  ) => {
    console.log(selectedOption);
    console.log(action);
    if (currentProduct && action.name) {
      setCurrentProduct({
        ...currentProduct,
        [action.name]: selectedOption ? selectedOption.value : 0,
      });
    }
  };

  useEffect(() => {
    if (showModal) {
      loadProductCategoryOption("");
      loadProductUnitOption("");
    }
  }, [showModal, loadProductCategoryOption, loadProductUnitOption]);

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
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProduct();
                }}>
                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formCode" style={{ flex: 1 }}>
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

                  <Form.Group controlId="formName" style={{ flex: 1 }}>
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

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group
                    controlId="formProductCategory"
                    style={{ flex: 1 }}>
                    <Form.Label>Kategori</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={initialCategory}
                      onChange={handleSelectChange}
                      loadOptions={loadProductCategoryOption}
                      name="id_category"
                    />
                  </Form.Group>
                  <Form.Group controlId="formProductUnit" style={{ flex: 1 }}>
                    <Form.Label>Satuan</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={initialUnit}
                      onChange={handleSelectChange}
                      loadOptions={loadProductUnitOption}
                      name="id_unit"
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
                      value={currentProduct?.price || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formStockQuantity" style={{ flex: 1 }}>
                    <Form.Label>Jumlah Stok</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock_quantity"
                      value={currentProduct?.stock_quantity || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Form.Group
                  controlId="formDescription"
                  className="mb-2"
                  style={{ flex: 1 }}>
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={currentProduct?.description || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group
                  controlId="formExpired"
                  className="mb-2"
                  style={{ flex: 1 }}>
                  <Form.Label>Kedaluwarsa</Form.Label>
                  <Form.Control
                    type="date"
                    name="expired"
                    value={currentProduct?.expired || ""}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formRestriction" style={{ flex: 1 }}>
                    <Form.Label>Pembatasan</Form.Label>
                    <Form.Control
                      type="text"
                      name="restriction"
                      value={currentProduct?.restriction || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="formGeneric" style={{ flex: 1 }}>
                    <Form.Label>Generik</Form.Label>
                    <Form.Control
                      type="text"
                      name="generic"
                      value={currentProduct?.generic || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formBpjsPrb">
                    <Form.Check
                      type="checkbox"
                      label="BPJS PRB"
                      name="bpjs_prb"
                      checked={currentProduct?.bpjs_prb || false}
                      onChange={handleChange}
                      className="m-2"
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
              <Stack direction="horizontal" gap={3}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faX} className="me-2" />
                  {"Batal"}
                </Button>
                <Button variant="primary" onClick={handleSaveProduct}>
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
