// components/ProductUnit.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import Link from "next/link";

interface Product {
  id: number;
  id_category: number;
  code: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  expired: string;
  restriction?: string;
  bpjs_prb: boolean;
  chronic: boolean;
  generic: string;
}

const ProductUnit: React.FC = () => {
  const pharmacyServiceUrl = "http://localhost:8082/api";
  // const pharmacyServiceUrl = process.env.PHARMACYSERVICE_URL;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/product`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data);
        } else {
          console.error("Failed to load products:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteProduct = async (productToDelete: Product) => {
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/product/${productToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Product deleted successfully:", productToDelete);
        // Update products state after deleting the product
        const updatedProducts = products.filter(
          (product) => product.id !== productToDelete.id
        );
        setProducts(updatedProducts);
      } else {
        console.error("Failed to delete product:", response.statusText);
        alert("Failed to delete product. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. An error occurred.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Produk Obat</h3>
        </div>
        <div className="card-body">
          <Link href="/pharmacy/product/add" passHref>
            <Button variant="primary" className="mb-3">
              Tambah Produk
            </Button>
          </Link>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>

                <th>Kode</th>
                <th>Nama</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Jumlah Stok</th>
                <th>Kedaluwarsa</th>
                <th>Pembatasan</th>
                <th>BPJS PRB</th>
                <th>Kronis</th>
                <th>Generik</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.price}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.expired}</td>
                  <td>{product.restriction}</td>
                  <td>{product.bpjs_prb ? "Ya" : "Tidak"}</td>
                  <td>{product.chronic ? "Ya" : "Tidak"}</td>
                  <td>{product.generic}</td>
                  <td>
                    <Link
                      href={`/pharmacy/product/detail?id=${product.id}`}
                      passHref
                      className="btn btn-primary me-2">
                      Detail
                    </Link>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteProduct(product)}>
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

export default ProductUnit;
