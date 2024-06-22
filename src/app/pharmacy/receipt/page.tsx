"use client";
import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";

interface Recipe {
  id: number;
  TGLSJP: string;
  REFASALSJP: string;
  POLIRSP: string;
  KDJNSOBAT: string;
  NORESEP: string;
  IDUSERSJP: string;
  TGLRSP: string;
  TGLPELRSP: string;
  KdDokter: string;
  iterasi: string;
}

const RecipePage: React.FC = () => {
  let mode = "dev";
  let bpjsApotekUrl = process.env.BPJS_APOTEK_DEV_URL;
  if (mode == "prod") {
    bpjsApotekUrl = process.env.BPJS_APOTEK_PROD_URL;
  }

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    id: 0,
    TGLSJP: "",
    REFASALSJP: "",
    POLIRSP: "",
    KDJNSOBAT: "",
    NORESEP: "",
    IDUSERSJP: "",
    TGLRSP: "",
    TGLPELRSP: "",
    KdDokter: "",
    iterasi: "",
  });

  useEffect(() => {
    // Load recipes when component mounts
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await fetch(`${bpjsApotekUrl}/api/recipes`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        console.error("Failed to load recipes:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to load recipes:", error);
    }
  };

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleAddRecipeToBPJS = async (data: any) => {
    const response = await fetch(`${bpjsApotekUrl}/sjpresep/v3/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRecipe),
    });
  };
  const handleAddRecipe = async () => {
    try {
      const response = await fetch(`${bpjsApotekUrl}/sjpresep/v3/insert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecipe),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Recipe added successfully:", data);

        // Update recipes state with the new recipe
        setRecipes([...recipes, { ...newRecipe, id: data.id }]);
        setNewRecipe({
          id: 0,
          TGLSJP: "",
          REFASALSJP: "",
          POLIRSP: "",
          KDJNSOBAT: "",
          NORESEP: "",
          IDUSERSJP: "",
          TGLRSP: "",
          TGLPELRSP: "",
          KdDokter: "",
          iterasi: "",
        });
        handleClose();
      } else {
        console.error("Failed to add recipe:", response.statusText);
        alert("Failed to add recipe. Please try again.");
      }
    } catch (error) {
      console.error("Failed to add recipe:", error);
      alert("Failed to add recipe. An error occurred.");
    }
  };

  const handleDeleteRecipe = async (recipe: any) => {
    try {
      const response = await fetch(`${bpjsApotekUrl}/hapusresep`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });

      if (response.ok) {
        console.log("Recipe deleted successfully:", recipe);
        // Update recipes state after deleting the recipe
        const updatedRecipes = recipes.filter(
          (recipe) =>
            recipe.nosjp !== recipe.nosjp &&
            recipe.REFASALSJP !== recipe.REFASALSJP &&
            recipe.NORESEP !== recipe.NORESEP
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
          <Button variant="primary" onClick={handleShow} className="mb-3">
            Tambah Resep
          </Button>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Tanggal SJP</th>
                <th>Refasal SJP</th>
                <th>Polis SJP</th>
                <th>Kode Jenis Obat</th>
                <th>No Resep</th>
                <th>Id User SJP</th>
                <th>Tanggal RSP</th>
                <th>Tanggal Pelaksanaan RSP</th>
                <th>Kode Dokter</th>
                <th>Iterasi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((recipe, index) => (
                <tr key={recipe.id}>
                  <td>{index + 1}</td>
                  <td>{recipe.TGLSJP}</td>
                  <td>{recipe.REFASALSJP}</td>
                  <td>{recipe.POLIRSP}</td>
                  <td>{recipe.KDJNSOBAT}</td>
                  <td>{recipe.NORESEP}</td>
                  <td>{recipe.IDUSERSJP}</td>
                  <td>{recipe.TGLRSP}</td>
                  <td>{recipe.TGLPELRSP}</td>
                  <td>{recipe.KdDokter}</td>
                  <td>{recipe.iterasi}</td>
                  <td>
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
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Tambah Resep Baru</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formRecipeTGLSJP">
                  <Form.Label>Tanggal SJP</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="Masukkan tanggal SJP"
                    name="TGLSJP"
                    value={newRecipe.TGLSJP}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeREFASALSJP">
                  <Form.Label>Refasal SJP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan refasal SJP"
                    name="REFASALSJP"
                    value={newRecipe.REFASALSJP}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipePOLIRSP">
                  <Form.Label>Polis SJP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan polis SJP"
                    name="POLIRSP"
                    value={newRecipe.POLIRSP}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeKDJNSOBAT">
                  <Form.Label>Kode Jenis Obat</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan kode jenis obat"
                    name="KDJNSOBAT"
                    value={newRecipe.KDJNSOBAT}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeNORESEP">
                  <Form.Label>No Resep</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan no resep"
                    name="NORESEP"
                    value={newRecipe.NORESEP}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeIDUSERSJP">
                  <Form.Label>ID User SJP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan ID user SJP"
                    name="IDUSERSJP"
                    value={newRecipe.IDUSERSJP}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeTGLRSP">
                  <Form.Label>Tanggal RSP</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="Masukkan tanggal RSP"
                    name="TGLRSP"
                    value={newRecipe.TGLRSP}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeTGLPELRSP">
                  <Form.Label>Tanggal Pelaksanaan RSP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan tanggal pelaksanaan RSP"
                    name="TGLPELRSP"
                    value={newRecipe.TGLPELRSP}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeKdDokter">
                  <Form.Label>Kode Dokter</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan kode dokter"
                    name="KdDokter"
                    value={newRecipe.KdDokter}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group controlId="formRecipeIterasi">
                  <Form.Label>Iterasi</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan iterasi"
                    name="iterasi"
                    value={newRecipe.iterasi}
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
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
