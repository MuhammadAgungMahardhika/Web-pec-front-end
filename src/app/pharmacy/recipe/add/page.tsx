"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Image,
  Stack,
  Breadcrumb,
  Form,
  Button,
  FormControl,
} from "react-bootstrap";
import AsyncSelect from "react-select/async";

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
  bpjs_iteration: boolean;
  recipe_type: string;
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
    bpjs_iteration: false,
    recipe_type: "Umum",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewRecipe({
      ...newRecipe,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: parseInt(value, 10) });
  };

  const handleRecipeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewRecipe({
      ...newRecipe,
      recipe_type: value,
      bpjs_sep: value === "BPJS" ? newRecipe.bpjs_sep : "",
      bpjs_iteration: value === "BPJS" ? newRecipe.bpjs_iteration : false,
    });
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

  const loadNoMrOption = () => {};

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
            <Form.Group controlId="formRecipeType">
              <Form.Label>Jaminan</Form.Label>
              <Stack direction="horizontal" gap={2}>
                <Form.Check
                  type="radio"
                  label={
                    <Stack direction="horizontal" gap={2}>
                      <Image
                        src="/assets/images/logo/logo_pec.svg"
                        width={40}
                        height={40}
                        alt="Umum"
                      />
                      <span>Umum</span>
                    </Stack>
                  }
                  name="recipe_type"
                  value="Umum"
                  checked={newRecipe.recipe_type === "Umum"}
                  onChange={handleRecipeTypeChange}
                />
                <Form.Check
                  type="radio"
                  label="BPJS"
                  name="recipe_type"
                  value="BPJS"
                  checked={newRecipe.recipe_type === "BPJS"}
                  onChange={handleRecipeTypeChange}
                />
              </Stack>
            </Form.Group>
            <Stack direction="horizontal" gap={3} className="mb-2">
              <Form.Group controlId="formNoRecipe">
                <Form.Label>
                  Nomor Resep <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="no_of_receipt"
                  onChange={handleInputChange}
                  value={newRecipe.no_of_receipt}
                />
              </Form.Group>

              <Form.Group controlId="formPoli">
                <Form.Label>
                  Poli
                  <span className="text-danger"> * </span>
                </Form.Label>
                <FormControl
                  as={"select"}
                  name="id_poli"
                  onChange={handleSelectChange}
                  value={newRecipe.id_poli}>
                  <option value="1">Poli 1</option>
                  <option value="2">Poli 2</option>
                  <option value="3">Poli 3</option>
                </FormControl>
              </Form.Group>
              <Form.Group controlId="formNoMrPatient">
                <Form.Label>No MR</Form.Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  onChange={handleSelectChange}
                  loadOptions={loadNoMrOption}
                  name="id_patient"
                />
              </Form.Group>
              <Form.Group controlId="formDoctorCode">
                <Form.Label>Kode Dokter</Form.Label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  onChange={handleSelectChange}
                  loadOptions={loadNoMrOption}
                  name="id_doctor"
                />
              </Form.Group>
              <Form.Group controlId="formDate">
                <Form.Label>
                  Tanggal Resep <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={newRecipe.date || getCurrentDate()}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formDateOfService">
                <Form.Label>
                  Tanggal Dilayani <span className="text-danger"> * </span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date_of_service"
                  value={newRecipe.date_of_service || getCurrentDate()}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Stack>
            <Stack direction="horizontal" gap={3} className="mb-2">
              <Form.Group controlId="formRecipeMedicineType">
                <Form.Label>Jenis Obat</Form.Label>
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
              </Form.Group>
              <Form.Group controlId="formRecipeTotalAmount">
                <Form.Label>Jumlah Total</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Masukkan jumlah total"
                  name="total_amount"
                  value={newRecipe.total_amount}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formRecipeStatus">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Masukkan status"
                  name="status"
                  value={newRecipe.status}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                />
              </Form.Group>

              {newRecipe.recipe_type === "BPJS" && (
                <>
                  <Form.Group controlId="formRecipeBpjsSep">
                    <Form.Label>BPJS SEP</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Masukkan BPJS SEP"
                      name="bpjs_sep"
                      value={newRecipe.bpjs_sep}
                      onChange={handleInputChange}
                      autoComplete="off"
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formRecipeBpjsIteration">
                    <Form.Label>Iterasi BPJS</Form.Label>
                    <Form.Check
                      type="checkbox"
                      placeholder="Masukkan iterasi BPJS"
                      name="bpjs_iteration"
                      checked={newRecipe.bpjs_iteration}
                      onChange={handleInputChange}
                      autoComplete="off"
                      required
                    />
                  </Form.Group>
                </>
              )}
            </Stack>

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
