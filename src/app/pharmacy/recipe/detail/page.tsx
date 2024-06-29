"use client";
import { useState, useEffect, FormEvent } from "react";
import { Breadcrumb, Modal, Button, Table, Form } from "react-bootstrap";
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

const DetailRecipe: React.FC<Props> = ({ recipeId }) => {
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes/${recipeId}`
        );
        if (response.ok) {
          const data = await response.json();
          setRecipeInfo(data.recipe);
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
          `${process.env.NEXT_PUBLIC_API_URL}/recipe-details?recipeId=${recipeId}`
        );
        if (response.ok) {
          const data = await response.json();
          setRecipeDetails(data.recipeDetails);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recipe-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId, ...newDetail }),
        }
      );
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
        `${process.env.NEXT_PUBLIC_API_URL}/recipe-details/${detailId}`,
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
              <div>
                <h2>Informasi Resep</h2>
                <p>
                  <strong>ID Resep:</strong> {recipeInfo.id}
                </p>
                <p>
                  <strong>No. Resep:</strong> {recipeInfo.no_of_receipt}
                </p>
                <p>
                  <strong>ID Pasien:</strong> {recipeInfo.id_patient}
                </p>
                <p>
                  <strong>ID Poli:</strong> {recipeInfo.id_poli}
                </p>
                <p>
                  <strong>ID Dokter:</strong> {recipeInfo.id_doctor}
                </p>
                <p>
                  <strong>Tanggal:</strong> {recipeInfo.date}
                </p>
                <p>
                  <strong>Tanggal Pelayanan:</strong>{" "}
                  {recipeInfo.date_of_service}
                </p>
                <p>
                  <strong>Jenis Obat:</strong> {recipeInfo.kind_of_medicine}
                </p>
              </div>
            )}

            <div>
              <Button variant="primary" onClick={handleShowModal}>
                Tambah Detail Resep
              </Button>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ID Produk</th>
                    <th>ID Signa</th>
                    <th>ID Order</th>
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
                      <td>{detail.id}</td>
                      <td>{detail.id_product}</td>
                      <td>{detail.id_signa}</td>
                      <td>{detail.id_order}</td>
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
                  <Form onSubmit={handleAddDetail}>
                    <Form.Group>
                      <Form.Label>ID Produk:</Form.Label>
                      <Form.Control
                        type="number"
                        name="id_product"
                        value={newDetail.id_product}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>ID Signa:</Form.Label>
                      <Form.Control
                        type="number"
                        name="id_signa"
                        value={newDetail.id_signa}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>ID Order:</Form.Label>
                      <Form.Control
                        type="number"
                        name="id_order"
                        value={newDetail.id_order}
                        onChange={handleChange}
                      />
                    </Form.Group>
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
                      <Form.Label>Harga:</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={newDetail.price}
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
                    <Button variant="primary" type="submit">
                      Simpan
                    </Button>
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
