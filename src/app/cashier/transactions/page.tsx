"use client";
import Config from "@/app/config";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight, faEdit, faInfo, faPlus, faSave, faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/app/components/spinner/spinner";
import { SuccessToast, FailedToast } from "@/app/components/toast/toast";
import Link from "next/link";

interface Transaction {
  id: number;
  id_patient: number;
  id_outpatient: number;
  id_poli: number;
  id_doctor: number;
  date: string;
  payment_methode: string;
  total_transaction: number;
  upfront_payment: number;
  remaining_payment: number;
  return_amount: number;
  payment_status: string;
}

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

const TransactionsPage: React.FC = () => {
  const cashierServiceUrl = Config.CASHIERSERVICE_URl;
  const [loading, setLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/transaction?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();
        setTransactions(data.data);
        setLoading(false);
      } catch (error: any) {
        console.error("Failed to load transactions:", error);
        FailedToast("Failed to load transactions: " + error.message);
      }
    };
    loadTransactions();
  }, [cashierServiceUrl, pagination, searchQuery]);

  const handleSaveTransaction = async () => {
    if (!currentTransaction) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${cashierServiceUrl}/transaction/${currentTransaction.id}`
      : `${cashierServiceUrl}/transaction`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentTransaction),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const updatedTransaction = await response.json();

      if (isEditMode) {
        setTransactions((prev) =>
          prev.map((trans) =>
            trans.id === updatedTransaction.data.id
              ? updatedTransaction.data
              : trans
          )
        );
        SuccessToast("Successfully processed transaction");
      } else {
        setTransactions((prev) => [updatedTransaction.data, ...prev]);
        SuccessToast("Successfully added transaction");
      }

      setShowModal(false);
      setCurrentTransaction(null);
    } catch (error: any) {
      console.error("Failed to save transaction:", error);
      FailedToast(`Failed to save transaction: ${error.message}`);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!currentTransaction) return;
    try {
      const response = await fetch(
        `${cashierServiceUrl}/transaction/${currentTransaction.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      SuccessToast("Successfully deleted transaction");
      setTransactions((prev) =>
        prev.filter((trans) => trans.id !== currentTransaction.id)
      );
      setShowDeleteModal(false);
      setCurrentTransaction(null);
    } catch (error: any) {
      console.error("Failed to delete transaction:", error);
      FailedToast(`Failed to delete transaction: ${error.message}`);
    }
  };

  const handleOpenModal = async (transaction?: Transaction) => {
    if (transaction) {
      setCurrentTransaction(transaction);
      setIsEditMode(true);
    } else {
      setCurrentTransaction({
        id: 0,
        id_patient: 0,
        id_outpatient: 0,
        id_poli: 0,
        id_doctor: 0,
        date: "",
        payment_methode: "",
        total_transaction: 0,
        upfront_payment: 0,
        remaining_payment: 0,
        return_amount: 0,
        payment_status: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentTransaction(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentTransaction(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (currentTransaction) {
      setCurrentTransaction({ ...currentTransaction, [name]: newValue });
    }
  };

  const handlePageChange = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value) }));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, pageIndex: 1 })); // Reset to first page on search
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Transactions</h3>
        </div>
        <div className="card-body">
          <Stack direction="horizontal" gap={2} className="mb-3">
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
              title="Add Transaction"
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            <Form.Control
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="ms-auto"
            />
          </Stack>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th className="text-end">Total Transaction</th>
                <th className="text-end">Upfront Payment</th>
                <th className="text-end">Remaining Payment</th>
                <th className="text-end">Return Amount</th>
                <th>Payment Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id}>
                  <td>
                    {(pagination.pageIndex - 1) * pagination.pageSize + index + 1}
                  </td>
                  <td>{transaction.date}</td>
                  <td>{transaction.payment_methode}</td>
                  <td className="text-end">{transaction.total_transaction}</td>
                  <td className="text-end">{transaction.upfront_payment}</td>
                  <td className="text-end">{transaction.remaining_payment}</td>
                  <td className="text-end">{transaction.return_amount}</td>
                  <td>{transaction.payment_status}</td>
                  <td>
                    <Stack direction="horizontal" gap={2}>
                      <Link
                        href={`/cashier/transactions/detail?id=${transaction.id}`}
                        passHref>
                          <Button
                            variant="primary"
                            className="me-2 btn-sm"
                            title="Details"
                          >
                            <FontAwesomeIcon icon={faInfo} size="xs" />
                          </Button>
                      </Link>
                      <Button
                        variant="primary"
                        className="me-2 btn-sm"
                        title="Edit transaction"
                        onClick={() => handleOpenModal(transaction)}
                      >
                        <FontAwesomeIcon icon={faEdit} size="xs" />
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleOpenDeleteModal(transaction)}
                      >
                        <FontAwesomeIcon icon={faTrash} size="xs" />
                      </Button>
                    </Stack>
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
              className="me-2"
            >
              {"First"}
            </Button>
            <Button
              disabled={pagination.pageIndex === 1}
              onClick={() => handlePageChange(pagination.pageIndex - 1)}
              className="me-2"
            >
              <FontAwesomeIcon icon={faCaretLeft}></FontAwesomeIcon>
              {"Previous"}
            </Button>
            <Button
              disabled={transactions.length < pagination.pageSize}
              onClick={() => handlePageChange(pagination.pageIndex + 1)}
              className="me-2"
            >
              {"Next"}
              <FontAwesomeIcon icon={faCaretRight}></FontAwesomeIcon>
            </Button>

            <Form.Select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className="ms-2"
              style={{ width: "auto", display: "inline-block" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>

          {/* Modal for Add/Edit Transaction */}
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit Transaction" : "Add Transaction"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveTransaction();
                }}
              >
                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formDate" style={{ flex: 1 }}>
                    <Form.Label>
                      Date
                      <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={currentTransaction?.date || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formPatientId" style={{ flex: 1 }}>
                    <Form.Label>
                      Patient ID
                      <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="id_patient"
                      value={currentTransaction?.id_patient || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formOutpatientId" style={{ flex: 1 }}>
                    <Form.Label>Outpatient ID</Form.Label>
                    <Form.Control
                      type="number"
                      name="id_outpatient"
                      value={currentTransaction?.id_outpatient || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formPoliId" style={{ flex: 1 }}>
                    <Form.Label>Poli ID</Form.Label>
                    <Form.Control
                      type="number"
                      name="id_poli"
                      value={currentTransaction?.id_poli || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formDoctorId" style={{ flex: 1 }}>
                    <Form.Label>Doctor ID</Form.Label>
                    <Form.Control
                      type="number"
                      name="id_doctor"
                      value={currentTransaction?.id_doctor || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formPaymentMethode" style={{ flex: 1 }}>
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Control
                      type="text"
                      name="payment_methode"
                      value={currentTransaction?.payment_methode || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formTotalTransaction" style={{ flex: 1 }}>
                    <Form.Label>
                      Total Transaction
                      <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="total_transaction"
                      value={currentTransaction?.total_transaction || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formUpfrontPayment" style={{ flex: 1 }}>
                    <Form.Label>Upfront Payment</Form.Label>
                    <Form.Control
                      type="number"
                      name="upfront_payment"
                      value={currentTransaction?.upfront_payment || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formRemainingPayment" style={{ flex: 1 }}>
                    <Form.Label>Remaining Payment</Form.Label>
                    <Form.Control
                      type="number"
                      name="remaining_payment"
                      value={currentTransaction?.remaining_payment || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group controlId="formReturnAmount" style={{ flex: 1 }}>
                    <Form.Label>Return Amount</Form.Label>
                    <Form.Control
                      type="number"
                      name="return_amount"
                      value={currentTransaction?.return_amount || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group controlId="formPaymentStatus" style={{ flex: 1 }}>
                    <Form.Label>Payment Status</Form.Label>
                    <Form.Control
                      type="text"
                      name="payment_status"
                      value={currentTransaction?.payment_status || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Stack direction="horizontal" gap={3}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faX} className="me-2" />
                  {"Cancel"}
                </Button>
                <Button variant="primary" onClick={handleSaveTransaction}>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {"Save"}
                </Button>
              </Stack>
            </Modal.Footer>
          </Modal>

          {/* Modal for Delete Confirmation */}
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete this transaction?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteTransaction}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
