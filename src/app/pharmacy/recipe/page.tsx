// Import yang diperlukan
"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faInfo,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Interface untuk resep (Recipe)
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
  // URL service untuk resep
  const recipeServiceUrl = "http://localhost:8082/api";

  // State untuk daftar resep, resep saat ini yang sedang diubah/hapus, dan modal
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 0,
    pageSize: 10,
  });

  // State untuk modal delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  // Mengambil daftar resep dari server
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          `${recipeServiceUrl}/order?page=${pagination.pageIndex}&per_page=${pagination.pageSize}`
        );
        if (response.ok) {
          const data = await response.json();
          setRecipes(data.data);
        } else {
          console.error("Failed to fetch recipes:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      }
    };

    fetchRecipes();
  }, [pagination]);

  // Menghapus resep dari daftar
  const handleDeleteRecipe = async (recipe: Recipe) => {
    try {
      const response = await fetch(`${recipeServiceUrl}/order/${recipe.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setRecipes((prevRecipes) =>
          prevRecipes.filter((r) => r.id !== recipe.id)
        );
      } else {
        console.error("Failed to delete recipe:", response.statusText);
        alert("Failed to delete recipe. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      alert("Failed to delete recipe. An error occurred.");
    }
  };

  // Mengubah halaman
  const handlePageChange = (pageIndex: number) => {
    setPagination({ ...pagination, pageIndex });
  };

  // Mengubah jumlah item per halaman
  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPagination({ ...pagination, pageSize: Number(e.target.value) });
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Daftar Resep</h3>
        </div>
        <div className="card-body">
          {/* Tombol Tambah Resep */}
          <Link href="/pharmacy/recipe/add" passHref>
            <Button variant="primary" className="mb-3">
              <FontAwesomeIcon icon={faPlus} /> Tambah Resep
            </Button>
          </Link>

          {/* Tabel Daftar Resep */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Nomor Resep</th>
                <th>ID Pasien</th>
                <th>ID Poli</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, index) => (
                <tr key={recipe.id}>
                  <td>{index + 1}</td>
                  <td>{recipe.no_of_receipt}</td>
                  <td>{recipe.id_patient}</td>
                  <td>{recipe.id_poli}</td>
                  <td>{recipe.date}</td>
                  <td>
                    <Button variant="info" className="me-2 btn-sm">
                      <Link
                        href={`/pharmacy/recipe/detail?id=${recipe.id}`}
                        passHref>
                        <FontAwesomeIcon icon={faInfo} size="xs" />
                      </Link>
                    </Button>

                    <Link
                      href={`/pharmacy/recipe/edit?id=${recipe.id}`}
                      passHref>
                      <Button variant="primary" className="me-2 btn-sm">
                        <FontAwesomeIcon icon={faEdit} size="xs" />
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => {
                        setRecipeToDelete(recipe);
                        setShowDeleteModal(true);
                      }}>
                      <FontAwesomeIcon icon={faTrash} size="xs" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Kontrol Halaman */}
          <div className="pagination-controls">
            <Button
              disabled={pagination.pageIndex === 0}
              onClick={() => handlePageChange(0)}>
              {"<<"}
            </Button>
            <Button
              disabled={pagination.pageIndex === 0}
              onClick={() => handlePageChange(pagination.pageIndex - 1)}>
              {"<"}
            </Button>
            <Button
              disabled={recipes.length < pagination.pageSize}
              onClick={() => handlePageChange(pagination.pageIndex + 1)}>
              {">"}
            </Button>
            <Button
              disabled={recipes.length < pagination.pageSize}
              onClick={() =>
                handlePageChange(
                  Math.ceil(recipes.length / pagination.pageSize) - 1
                )
              }>
              {">>"}
            </Button>

            {/* Pilihan Jumlah Item per Halaman */}
            <select value={pagination.pageSize} onChange={handlePageSizeChange}>
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Tampilkan {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modal Delete */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmasi Hapus Resep</Modal.Title>
        </Modal.Header>
        <Modal.Body>Apakah Anda yakin ingin menghapus resep ini?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteRecipe(recipeToDelete!);
              setShowDeleteModal(false);
            }}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RecipePage;
