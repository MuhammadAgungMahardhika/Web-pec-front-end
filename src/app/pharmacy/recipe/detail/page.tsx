"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import {
  Breadcrumb,
  Modal,
  Button,
  Table,
  Form,
  Stack,
  Container,
} from "react-bootstrap";

import Link from "next/link";

interface Recipe {
  id: number;
  no_of_receipt: string;
  id_patient: string;
  id_poli: string;
  id_doctor: string;
  date: string;
  date_of_service: string;
  kind_of_medicine: string;
}

interface RecipeDetail {
  id: number;
  id_product: number;
  id_signa: number;
  id_order: number;
  quantity: number;
  price: number;
  dosis?: number;
  note?: string;
  note2?: string;
}

interface Props {
  recipeId: string;
}

const DetailRecipe: React.FC<Props> = () => {
  const pharmacyServiceUrl = "http://127.0.0.1:8082/api";
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id");
  const [recipeInfo, setRecipeInfo] = useState<Recipe | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<RecipeDetail[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newDetail, setNewDetail] = useState<RecipeDetail>({
    id: 0,
    id_product: 0,
    id_signa: 0,
    id_order: 0,
    quantity: 0,
    price: 0,
    dosis: undefined,
    note: "",
    note2: "",
  });

  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/order/${recipeId}`);
        if (response.ok) {
          const successResponse = await response.json();
          const data = successResponse.data;
          setRecipeInfo(data);
        } else {
          throw new Error("Failed to fetch recipe info");
        }
      } catch (error) {
        console.error("Error fetching recipe info:", error);
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
          setRecipeDetails(data);
        } else {
          throw new Error("Failed to fetch recipe details");
        }
      } catch (error) {
        console.error("Error fetching recipe details:", error);
      }
    };

    if (recipeId) {
      fetchRecipeInfo();
      fetchRecipeDetails();
    }
  }, [recipeId]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleAddDetail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${pharmacyServiceUrl}/detail-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId, ...newDetail }),
      });
      if (response.ok) {
        const data = await response.json();
        setRecipeDetails([...recipeDetails, data.newDetail]);
        setNewDetail({
          id: 0,
          id_product: 0,
          id_signa: 0,
          id_order: 0,
          quantity: 0,
          price: 0,
          dosis: undefined,
          note: "",
          note2: "",
        });
        handleCloseModal();
      } else {
        throw new Error("Failed to add recipe detail");
      }
    } catch (error) {
      console.error("Error adding recipe detail:", error);
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/recipe-details/${detailId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        const updatedDetails = recipeDetails.filter(
          (detail) => detail.id !== detailId
        );
        setRecipeDetails(updatedDetails);
      } else {
        throw new Error("Failed to delete recipe detail");
      }
    } catch (error) {
      console.error("Error deleting recipe detail:", error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewDetail({ ...newDetail, [name]: value });
  };

  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} href="/pharmacy/recipe">
          Resep Obat
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Tambah Resep Baru</Breadcrumb.Item>
      </Breadcrumb>
      <div className="card">
        <div className="card-header">
          <h3>Detail Resep Obat</h3>
        </div>
        <div className="card-body">
          <div>
            {recipeInfo && (
              <Container className="border mb-4">
                <Stack direction="horizontal" gap={3} className="p-2">
                  <strong>No. Resep:</strong> {recipeInfo.no_of_receipt}
                  <strong>ID Pasien:</strong> {recipeInfo.id_patient}
                  <strong>ID Poli:</strong> {recipeInfo.id_poli}
                </Stack>
                <Stack direction="horizontal" gap={3} className="p-2">
                  <strong>ID Dokter:</strong> {recipeInfo.id_doctor}
                  <strong>Tanggal:</strong> {recipeInfo.date}
                  <strong>Tanggal Pelayanan:</strong>{" "}
                  {recipeInfo.date_of_service}
                </Stack>
                <Stack direction="horizontal" gap={3} className="p-2">
                  <strong>Jenis Obat:</strong> {recipeInfo.kind_of_medicine}
                </Stack>
              </Container>
            )}

            <div>
              <Button
                variant="primary"
                onClick={handleShowModal}
                className=" mb-3">
                Tambah Detail Resep
              </Button>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nama Obat</th>
                    <th>Signa</th>
                    <th>Jumlah</th>
                    <th>Harga</th>
                    <th>Dosis</th>
                    <th>Catatan</th>
                    <th>Catatan 2</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recipeDetails.map((detail) => (
                    <tr key={detail.id}>
                      <td>{detail.id_product}</td>
                      <td>{detail.id_signa}</td>
                      <td>{detail.quantity}</td>
                      <td>{detail.price}</td>
                      <td>{detail.dosis ?? "-"}</td>
                      <td>{detail.note ?? "-"}</td>
                      <td>{detail.note2 ?? "-"}</td>
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteDetail(detail.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Modal untuk tambah detail resep */}
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Tambah Detail Resep</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group>
                    <Form.Control
                      type="hidden"
                      name="id_order"
                      value={recipeInfo?.id}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form onSubmit={handleAddDetail}>
                    <Form.Group>
                      <Form.Label>Obat</Form.Label>
                      <Form.Control
                        type="number"
                        name="id_product"
                        value={newDetail.id_product}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Signa</Form.Label>
                      <Form.Control
                        type="number"
                        name="id_signa"
                        value={newDetail.id_signa}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Stack direction="horizontal" gap={2}>
                      <Form.Group>
                        <Form.Label>Jumlah:</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={newDetail.quantity}
                          onChange={handleChange}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Dosis:</Form.Label>
                        <Form.Control
                          type="number"
                          name="dosis"
                          value={newDetail.dosis ?? ""}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Stack>

                    <Form.Group>
                      <Form.Control
                        type="hidden"
                        name="price"
                        value={newDetail.price}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Stack direction="horizontal" gap={2}>
                      <Form.Group>
                        <Form.Label>Catatan:</Form.Label>
                        <Form.Control
                          type="text"
                          name="note"
                          value={newDetail.note}
                          onChange={handleChange}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Catatan 2:</Form.Label>
                        <Form.Control
                          type="text"
                          name="note2"
                          value={newDetail.note2}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Stack>
                    <div className="text-end">
                      <Button variant="primary" type="submit" className="mt-2 ">
                        Simpan
                      </Button>
                    </div>
                  </Form>
                </Modal.Body>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailRecipe;
