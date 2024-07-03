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
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/order`);
        if (response.ok) {
          const data = await response.json();
          setRecipes(data.data);
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
                      href={`/pharmacy/recipe/detail?id=${recipe.id}`}
                      passHref
                      className="btn btn-primary me-2">
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
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
