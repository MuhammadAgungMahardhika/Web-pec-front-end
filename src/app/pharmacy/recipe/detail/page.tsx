"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";
import {
  Stack,
  Breadcrumb,
  Modal,
  Button,
  Table,
  Form,
  Container,
} from "react-bootstrap";
import Link from "next/link";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faPrint,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface Recipe {
  id: number;
  id_poli: string;
  id_patient: string;
  id_doctor: string;
  no_of_receipt: string;
  date: string;
  date_of_service: string;
  kind_of_medicine: string;
}
interface Product {
  id: number;
  name: string;
  price: number;
}
interface Signa {
  id: number;
  name: string;
}
interface RecipeDetail {
  id: number;
  id_order: number;
  product: Product;
  signa: Signa;
  quantity: number;
  price: number;
  dosis?: string;
  note?: string;
  note2?: string;
}

interface SelectOption {
  label: string;
  value: number;
}

const DetailRecipe: React.FC = () => {
  const pharmacyServiceUrl = "http://127.0.0.1:8082/api";
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id");
  const [recipeInfo, setRecipeInfo] = useState<Recipe | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState<RecipeDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/order/${recipeId}`);
        if (response.ok) {
          const successResponse = await response.json();
          const data = successResponse.data;
          setRecipeInfo(data);
        } else {
          throw new Error("Gagal mendapatkan informasi resep");
        }
      } catch (error) {
        console.error("Error saat mendapatkan informasi resep:", error);
      }
    };

    const fetchRecipeDetails = async () => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/detail-order/order-id/${recipeId}`
        );
        if (response.ok) {
          const successResponse = await response.json();
          const data = successResponse.data;
          console.log(data);

          setRecipeDetails(data);
        } else {
          throw new Error("Gagal mendapatkan detail resep");
        }
      } catch (error) {
        console.error("Error saat mendapatkan detail resep:", error);
      }
    };

    if (recipeId) {
      fetchRecipeInfo();
      fetchRecipeDetails();
    }
  }, [recipeId]);

  const handleSaveDetail = async () => {
    if (!currentDetail) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${pharmacyServiceUrl}/detail-order/${currentDetail.id}`
      : `${pharmacyServiceUrl}/detail-order`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentDetail),
      });

      if (response.ok) {
        const updatedDetail = await response.json();
        console.log(updatedDetail);
        if (isEditMode) {
          setRecipeDetails((prev) =>
            prev.map((detail) =>
              detail.id === currentDetail.id ? updatedDetail.data : detail
            )
          );
        } else {
          setRecipeDetails((prev) => [updatedDetail.data, ...prev]);
        }
        setShowModal(false);
        setCurrentDetail(null);
      } else {
        const failedResponse = await response.json();
        console.log(failedResponse);
        throw new Error(failedResponse);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan detail resep. Terjadi kesalahan.");
    }
  };

  const handleDeleteDetail = async () => {
    if (!currentDetail) return;
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/detail-order/${currentDetail.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setRecipeDetails((prev) =>
          prev.filter((detail) => detail.id !== currentDetail.id)
        );
        setShowDeleteModal(false);
        setCurrentDetail(null);
      } else {
        console.error("Gagal menghapus detail resep:", response.statusText);
        alert("Gagal menghapus detail resep. Coba lagi.");
      }
    } catch (error) {
      console.error("Gagal menghapus detail resep:", error);
      alert("Gagal menghapus detail resep. Terjadi kesalahan.");
    }
  };

  const handleOpenModal = (detail?: RecipeDetail) => {
    if (detail) {
      console.log(detail);
      setCurrentDetail(detail);
      setIsEditMode(true);
    } else {
      setCurrentDetail({
        id: 0,
        product: {
          id: 0,
          name: "",
          price: 0,
        },
        signa: {
          id: 0,
          name: "",
        },
        id_order: parseInt(recipeId as string, 10),
        quantity: 1,
        price: 0,
        dosis: "",
        note: "",
        note2: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (detail: RecipeDetail) => {
    setCurrentDetail(detail);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDetail(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentDetail(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentDetail) {
      setCurrentDetail({ ...currentDetail, [name]: value });
    }
  };

  const loadProductOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product?search=${inputValue}`
        );
        const successResponse = await response.json();
        return successResponse.data.map((product: any) => ({
          value: product.id,
          label: product.name,
        }));
      } catch (error) {
        console.error("Error fetching product options:", error);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  const loadSignaOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/signa?search=${inputValue}`
        );
        const successResponse = await response.json();
        return successResponse.data.map((signa: any) => ({
          value: signa.id,
          label: signa.name,
        }));
      } catch (error) {
        console.error("Error fetching signa options:", error);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  const handleSelectChange = (selectedOption: any, action: any) => {
    console.log(selectedOption);
    console.log(action);
    if (currentDetail && action.name) {
      setCurrentDetail({
        ...currentDetail,
        [action.name]: selectedOption ? selectedOption.value : 0,
      });
    }
  };
  const totalJumlahHarga = recipeDetails.reduce(
    (total, detail) => total + detail.quantity * detail.product.price,
    0
  );
  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} href="/pharmacy/recipe">
          Resep Obat
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Detail Resep</Breadcrumb.Item>
      </Breadcrumb>

      <div className="card">
        <div className="card-header">
          <h3>Detail Resep</h3>
        </div>
        <div className="card-body">
          {recipeInfo && (
            <div>
              <p>Nomor Resep: {recipeInfo.no_of_receipt}</p>
              <p>Tanggal: {recipeInfo.date}</p>
              <p>Jenis Obat: {recipeInfo.kind_of_medicine}</p>
            </div>
          )}
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FontAwesomeIcon icon={faPlus} /> Tambah Detail Resep
          </Button>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Produk</th>
                <th>Signa</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Total harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recipeDetails.map((detail, index) => (
                <tr key={detail.id}>
                  <td>{index + 1}</td>
                  <td>{detail.product.name}</td>
                  <td>{detail.signa.name}</td>
                  <td>{detail.quantity}</td>
                  <td>{detail.product.price}</td>
                  <td>{detail.quantity * detail.product.price}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleOpenModal(detail)}>
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenDeleteModal(detail)}>
                      <FontAwesomeIcon icon={faTrash} /> Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th></th>
              </tr>
              <tr>
                <th className="text-end" colSpan={5}>
                  Jumlah Harga
                </th>
                <th>{totalJumlahHarga}</th>
                <th>
                  <Button variant="outline-danger" onClick={handleCloseModal}>
                    <FontAwesomeIcon icon={faPrint} /> Cetak resep
                  </Button>
                </th>
              </tr>
            </tfoot>
          </Table>
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit" : "Tambah"} Detail Resep
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDetail();
                }}>
                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="product" style={{ flex: 1 }}>
                    <Form.Label>Produk</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={{
                        value: currentDetail?.product.id,
                        label: currentDetail?.product.name,
                      }}
                      onChange={handleSelectChange}
                      loadOptions={loadProductOptions}
                      name="id_product"
                    />
                  </Form.Group>
                  <Form.Group controlId="signa" style={{ flex: 1 }}>
                    <Form.Label>Signa</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={{
                        value: currentDetail?.signa.id,
                        label: currentDetail?.signa.name,
                      }}
                      onChange={handleSelectChange}
                      loadOptions={loadSignaOptions}
                      name="id_signa"
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="quantity" style={{ flex: 1 }}>
                    <Form.Label>Jumlah</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={currentDetail?.quantity || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="dosis" style={{ flex: 1 }}>
                    <Form.Label>Dosis</Form.Label>
                    <Form.Control
                      type="number"
                      name="dosis"
                      value={currentDetail?.dosis || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="note" style={{ flex: 1 }}>
                    <Form.Label>Catatan</Form.Label>
                    <Form.Control
                      type="text"
                      name="note"
                      value={currentDetail?.note || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="note2" style={{ flex: 1 }}>
                    <Form.Label>Catatan Tambahan</Form.Label>
                    <Form.Control
                      type="text"
                      name="note2"
                      value={currentDetail?.note2 || ""}
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
              <Button variant="primary" onClick={handleSaveDetail}>
                Simpan
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Konfirmasi Hapus</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Apakah Anda yakin ingin menghapus detail resep ini?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteDetail}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default DetailRecipe;
