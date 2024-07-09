// Import yang diperlukan
"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Button, Table, Modal, Form, Stack } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
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
    pageIndex: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  // State untuk modal delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  // Mengambil daftar resep dari server
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          `${recipeServiceUrl}/order?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`
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
  }, [pagination, searchQuery]);

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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 1 })); // Reset to first page on search
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Daftar Resep</h3>
        </div>
        <div className="card-body">
          <Stack direction="horizontal" gap={2} className="mb-3">
            <Link href="/pharmacy/recipe/add" passHref>
              <Button variant="primary">
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Link>
            <Form.Control
              type="text"
              placeholder="Cari no resep..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="ms-auto"
            />
          </Stack>
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
                    <Link
                      href={`/pharmacy/recipe/detail?id=${recipe.id}`}
                      passHref>
                      <Button variant="outline-light" className="me-2 btn-sm">
                        <FontAwesomeIcon icon={faInfo} size="xs" />
                      </Button>
                    </Link>

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

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <Button
              disabled={pagination.pageIndex === 1}
              onClick={() => handlePageChange(1)}
              className="me-2">
              {"Terbaru"}
            </Button>
            <Button
              disabled={pagination.pageIndex === 1}
              onClick={() => handlePageChange(pagination.pageIndex - 1)}
              className="me-2">
              <FontAwesomeIcon icon={faCaretLeft}></FontAwesomeIcon>
              {"Sebelumnya"}
            </Button>
            <Button
              disabled={recipes.length < pagination.pageSize}
              onClick={() => handlePageChange(pagination.pageIndex + 1)}
              className="me-2">
              {"Selanjutnya"}
              <FontAwesomeIcon icon={faCaretRight}></FontAwesomeIcon>
            </Button>

            <Form.Select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="ms-2"
              style={{ width: "auto", display: "inline-block" }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
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
