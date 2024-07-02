"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb, Form, Button, Col, Row } from "react-bootstrap";
import Link from "next/link";

interface Recipe {
  id_patient: number;
  id_poli: number;
  id_doctor: string;
  no_of_receipt: string;
  date: string;
  date_of_service: string;
  kind_of_medicine: number;
  total_amount: number;
  status: string;
  bpjs_sep: string;
  bpjs_iteration: string;
}

// Fungsi untuk mendapatkan tanggal sekarang dalam format YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

const AddRecipePage: React.FC = () => {
  const pharmacyServiceUrl = "http://127.0.0.1:8082/api";
  const router = useRouter();

  const [newRecipe, setNewRecipe] = useState<Recipe>({
    id_patient: 1,
    id_poli: 2,
    id_doctor: "",
    no_of_receipt: "",
    date: getCurrentDate(),
    date_of_service: getCurrentDate(),
    kind_of_medicine: 0,
    total_amount: 50000,
    status: "pending",
    bpjs_sep: "",
    bpjs_iteration: "0",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: parseInt(value, 10) });
  };

  const handleAddRecipe = async (e: any) => {
    e.preventDefault();

    try {
      const response = await fetch(`${pharmacyServiceUrl}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecipe),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      const data: any = await response.json();
      console.log(data.data);

      // Redirect ke halaman lain setelah menyimpan resep
      router.push(`/pharmacy/recipe/detail?id=${data.data.id}`); // Ganti dengan path yang sesuai setelah berhasil menyimpan
    } catch (error) {
      console.error("Failed to add recipe:", error);
      alert("Failed to add recipe. An error occurred.");
    }
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
          <h3>Tambah Resep Baru</h3>
        </div>
        <div className="card-body">
          <Form onSubmit={handleAddRecipe}>
            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeIdPatient">
              <Form.Label column sm="2">
                ID Pasien
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="number"
                  placeholder="Masukkan ID pasien"
                  name="id_patient"
                  value={newRecipe.id_patient}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formRecipeIdPoli">
              <Form.Label column sm="2">
                ID Poli
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="number"
                  placeholder="Masukkan ID poli"
                  name="id_poli"
                  value={newRecipe.id_poli}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeIdDoctor">
              <Form.Label column sm="2">
                Kode Dokter
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan kode dokter"
                  name="id_doctor"
                  value={newRecipe.id_doctor}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

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

            <Form.Group as={Row} className="mb-3" controlId="formRecipeDate">
              <Form.Label column sm="2">
                Tanggal
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="date"
                  name="date"
                  value={newRecipe.date || getCurrentDate()}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeServiceDate">
              <Form.Label column sm="2">
                Tanggal Pelayanan
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="date"
                  name="date_of_service"
                  value={newRecipe.date_of_service || getCurrentDate()}
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
                  <option value={1}>Obat PRB</option>
                  <option value={2}>Obat Kronis Blm Stabil</option>
                  <option value={3}>Obat Kemoterapi</option>
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeTotalAmount">
              <Form.Label column sm="2">
                Jumlah Total
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="number"
                  placeholder="Masukkan jumlah total"
                  name="total_amount"
                  value={newRecipe.total_amount}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formRecipeStatus">
              <Form.Label column sm="2">
                Status
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan status"
                  name="status"
                  value={newRecipe.status}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3" controlId="formRecipeBpjsSep">
              <Form.Label column sm="2">
                BPJS SEP
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan BPJS SEP"
                  name="bpjs_sep"
                  value={newRecipe.bpjs_sep}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mb-3"
              controlId="formRecipeBpjsIteration">
              <Form.Label column sm="2">
                Iterasi BPJS
              </Form.Label>
              <Col sm="10">
                <Form.Control
                  type="text"
                  placeholder="Masukkan iterasi BPJS"
                  name="bpjs_iteration"
                  value={newRecipe.bpjs_iteration}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
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
