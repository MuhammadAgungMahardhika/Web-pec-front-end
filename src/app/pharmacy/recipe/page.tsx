// components/RecipePage.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
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

const RecipePage: React.FC = () => {
  const pharmacyServiceUrl = "http://localhost:8082/api";
  // const pharmacyServiceUrl = process.env.PHARMACYSERVICE_URL;
  console.log(pharmacyServiceUrl);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [newRecipe, setNewRecipe] = useState<Recipe>({
    id: 0,
    no_of_receipt: "",
    id_patient: "",
    date: "",
    date_of_service: "",
    id_poli: "",
    kind_of_medicine: "",
    id_doctor: "",
  });

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/order`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "success") {
            setRecipes(data.data); // Assuming data.data contains the array of recipes
          } else {
            console.error("Failed to load recipes:", data.message);
          }
        } else {
          console.error("Failed to load recipes:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load recipes:", error);
      }
    };

    loadRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleDeleteRecipe = async (recipeToDelete: Recipe) => {
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/order/${recipeToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Recipe deleted successfully:", recipeToDelete);
        // Update recipes state after deleting the recipe
        const updatedRecipes = recipes.filter(
          (recipe) => recipe.id !== recipeToDelete.id
        );
        setRecipes(updatedRecipes);
      } else {
        console.error("Failed to delete recipe:", response.statusText);
        alert("Failed to delete recipe. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      alert("Failed to delete recipe. An error occurred.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Resep Obat</h3>
        </div>
        <div className="card-body">
          <Link href="/pharmacy/recipe/add" passHref>
            <Button variant="primary" className="mb-3">
              Tambah Resep
            </Button>
          </Link>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>No Resep</th>
                <th>Id User</th>
                <th>Tanggal</th>
                <th>Tanggal Pelayanan</th>
                <th>Kode Poli</th>
                <th>Jenis Obat</th>
                <th>Kode Dokter</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, index) => (
                <tr key={recipe.id}>
                  <td>{index + 1}</td>
                  <td>{recipe.no_of_receipt}</td>
                  <td>{recipe.id_patient}</td>
                  <td>{recipe.date}</td>
                  <td>{recipe.date_of_service}</td>
                  <td>{recipe.id_poli}</td>
                  <td>{recipe.kind_of_medicine}</td>
                  <td>{recipe.id_doctor}</td>
                  <td>
                    <Link
                      href={`/pharmacy/recipe/detail/${recipe.id}`}
                      passHref>
                      Detail
                    </Link>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteRecipe(recipe)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Modal Tambah Resep */}
          {/* <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Tambah Resep Baru</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formRecipeNoReceipt">
                  <Form.Label>No Resep</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan no resep"
                    name="no_of_receipt"
                    value={newRecipe.no_of_receipt}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeIdUser">
                  <Form.Label>ID User</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan ID user"
                    name="id_patient"
                    value={newRecipe.id_patient}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeDate">
                  <Form.Label>Tanggal</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="Masukkan tanggal"
                    name="date"
                    value={newRecipe.date}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeDateOfService">
                  <Form.Label>Tanggal Pelayanan</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="Masukkan tanggal pelayanan"
                    name="date_of_service"
                    value={newRecipe.date_of_service}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeCodeOfPoli">
                  <Form.Label>Kode Poli</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan kode poli"
                    name="id_poli"
                    value={newRecipe.id_poli}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeMedicineType">
                  <Form.Label>Medicine Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="kind_of_medicine"
                    value={newRecipe.kind_of_medicine}
                    onChange={handleInputChange}>
                    <option value="">Select medicine type</option>
                    {medicineTypes.map((medicine) => (
                      <option key={medicine.id} value={medicine.name}>
                        {medicine.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group controlId="formRecipeCodeOfDoctor">
                  <Form.Label>Kode Dokter</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan kode dokter"
                    name="id_doctor"
                    value={newRecipe.id_doctor}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleAddRecipe}>
                Simpan
              </Button>
            </Modal.Footer>
          </Modal> */}
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
