"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
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

const EditRecipePage: React.FC = () => {
  const pharmacyServiceUrl = "http://127.0.0.1:8082/api";
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id"); // Mengambil nilai id dari query string

  const [recipe, setRecipe] = useState<Recipe>({
    id_patient: 0,
    id_poli: 0,
    id_doctor: "",
    no_of_receipt: "",
    date: "",
    date_of_service: "",
    kind_of_medicine: 0,
    total_amount: 0,
    status: "",
    bpjs_sep: "",
    bpjs_iteration: "",
  });

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/order/${recipeId}`);
        if (response.ok) {
          const data = await response.json();
          setRecipe(data.data);
        } else {
          console.error("Failed to fetch recipe:", response.statusText);
          // Handle error fetching recipe
        }
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
        // Handle error fetching recipe
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: parseInt(value, 10) });
  };

  const handleUpdateRecipe = async (e: any) => {
    e.preventDefault();

    try {
      const response = await fetch(`${pharmacyServiceUrl}/order/${recipeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Failed to update recipe");
      }

      const data: any = await response.json();
      console.log(data.data);

      // Redirect ke halaman detail setelah berhasil update
      router.push(`/pharmacy/recipe/detail?id=${recipeId}`); // Ganti dengan path yang sesuai
    } catch (error) {
      console.error("Failed to update recipe:", error);
      alert("Failed to update recipe. An error occurred.");
    }
  };

  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} href="/pharmacy/recipe">
          Resep Obat
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Edit Resep</Breadcrumb.Item>
      </Breadcrumb>

      <div className="card">
        <div className="card-header">
          <h3>Edit Resep</h3>
        </div>
        <div className="card-body">
          <Form onSubmit={handleUpdateRecipe}>
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
                  value={recipe.id_patient}
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
                  value={recipe.id_poli}
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
                  value={recipe.id_doctor}
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
                  value={recipe.no_of_receipt}
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
                  value={recipe.date}
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
                  value={recipe.date_of_service}
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
                  value={recipe.kind_of_medicine}
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
                  value={recipe.total_amount}
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
                  value={recipe.status}
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
                  value={recipe.bpjs_sep}
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
                  value={recipe.bpjs_iteration}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Col>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-4">
              Simpan Perubahan
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditRecipePage;
