// Import yang diperlukan
"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Button, Table, Modal, Form, Stack } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faInfo,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FailedToast } from "@/app/components/toast/toast";

// Interface untuk  (Order)
interface Order {
  id: number;
  no_of_order: string;
  id_patient: string;
  id_poli: string;
  id_doctor: string;
  date: string;
  date_of_service: string;
  kind_of_medicine: string;
}

const MedicationRequestFormPage: React.FC = () => {
  // URL service untuk farmasi
  const orderServiceUrl = "http://localhost:8082/api";

  const [orders, setOrders] = useState<Order[]>([]);
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
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Mengambil daftar resep dari server
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${orderServiceUrl}/order?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`
        );
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }

        const successResponse = await response.json();
        setOrders(successResponse.data);
      } catch (error: any) {
        FailedToast(error.message);
      }
    };

    fetchOrders();
  }, [pagination, searchQuery]);

  // Menghapus resep dari daftar
  const handleDeleteOrder = async (order: Order) => {
    try {
      const response = await fetch(`${orderServiceUrl}/order/${order.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }

      setOrders((prevOrders) => prevOrders.filter((r) => r.id !== order.id));
    } catch (error: any) {
      FailedToast(error.message);
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
    setPagination((prev) => ({ ...prev, pageIndex: 1 }));
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Daftar Permintaan Obat</h3>
        </div>
        <div className="card-body">
          <Stack direction="horizontal" gap={2} className="mb-3">
            <Link href="/pharmacy/order/add" passHref>
              <Button variant="primary">
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Link>
            <Form.Control
              type="text"
              placeholder="Cari resep..."
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
                <th>Nomor MR Pasien</th>
                <th>Poli</th>
                <th>Tanggal Resep</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{order.no_of_order}</td>
                  <td>{order.id_patient}</td>
                  <td>{order.id_poli}</td>
                  <td>{order.date}</td>
                  <td>
                    <Link
                      href={`/pharmacy/order/detail?id=${order.id}`}
                      passHref>
                      <Button variant="primary" className="me-2 btn-sm">
                        <FontAwesomeIcon icon={faInfo} size="xs" />
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => {
                        setOrderToDelete(order);
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
              disabled={orders.length < pagination.pageSize}
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
              handleDeleteOrder(orderToDelete!);
              setShowDeleteModal(false);
            }}>
            Hapus
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MedicationRequestFormPage;
