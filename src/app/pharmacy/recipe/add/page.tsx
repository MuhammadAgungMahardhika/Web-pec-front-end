"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, Form, Button, Col, Row } from "react-bootstrap";

interface Recipe {
  no_of_receipt: string;
  id_user: string;
  date: string;
  date_of_service: string;
  code_of_poli: string;
  kind_of_medicine: string;
  code_of_doctor: string;
}

const AddRecipePage: React.FC = () => {
  const router = useRouter();

  const [newRecipe, setNewRecipe] = useState<Recipe>({
    no_of_receipt: "",
    id_user: "",
    date: "",
    date_of_service: "",
    code_of_poli: "",
    kind_of_medicine: "",
    code_of_doctor: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleAddRecipe = async (e: any) => {
    try {
      e.preventDefault();
      // Lakukan proses penyimpanan resep ke backend, misalnya menggunakan fetch
      console.log("New Recipe:", newRecipe);

      // Redirect ke halaman lain setelah menyimpan resep
      router.push("/pharmacy/recipe"); // Ganti dengan path yang sesuai setelah berhasil menyimpan
    } catch (error) {
      console.error("Failed to add recipe:", error);
      alert("Failed to add recipe. An error occurred.");
    }
  };

  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item href="/pharmacy/recipe">Resep Obat</Breadcrumb.Item>
        <Breadcrumb.Item active>Tambah Resep Baru</Breadcrumb.Item>
      </Breadcrumb>

      <div className="card">
        <div className="card-header">
          <h3>Tambah Resep Baru</h3>
        </div>
        <div className="card-body">
          <Form onSubmit={handleAddRecipe}>
            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeNoReceipt">
              <Form.Label column sm="2">
                No Resep
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan no resep"
                  name="no_of_receipt"
                  value={newRecipe.no_of_receipt}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formRecipeIdUser">
              <Form.Label column sm="2">
                ID User
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan ID user"
                  name="id_user"
                  value={newRecipe.id_user}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formRecipeDate">
              <Form.Label column sm="2">
                Tanggal
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="date"
                  placeholder="Masukkan tanggal"
                  name="date"
                  value={newRecipe.date}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeDateOfService">
              <Form.Label column sm="2">
                Tanggal Pelayanan
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="date"
                  placeholder="Masukkan tanggal pelayanan"
                  name="date_of_service"
                  value={newRecipe.date_of_service}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeCodeOfPoli">
              <Form.Label column sm="2">
                Kode Poli
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan kode poli"
                  name="code_of_poli"
                  value={newRecipe.code_of_poli}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeMedicineType">
              <Form.Label column sm="2">
                Jenis Obat
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  as="select"
                  name="kind_of_medicine"
                  value={newRecipe.kind_of_medicine}
                  onChange={handleSelectChange}
                  autoComplete="off"
                  required>
                  <option value="">Pilih jenis obat</option>
                  <option value="Obat PRB">Obat PRB</option>
                  <option value="Obat Kronis Blm Stabil">
                    Obat Kronis Blm Stabil
                  </option>
                  <option value="Obat Kemoterapi">Obat Kemoterapi</option>
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeCodeOfDoctor">
              <Form.Label column sm="2">
                Kode Dokter
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan kode dokter"
                  name="code_of_doctor"
                  value={newRecipe.code_of_doctor}
                  onChange={handleInputChange}
                />
              </Col>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-4">
              Simpan
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddRecipePage;
