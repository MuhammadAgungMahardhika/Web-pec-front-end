"use client";
import Config from "@/app/config";
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faEdit,
  faInfo,
  faPlus,
  faSave,
  faTrash,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/app/components/spinner/spinner";
import { SuccessToast, FailedToast } from "@/app/components/toast/toast";
import Link from "next/link";
import AsyncSelect from "react-select/async";
import { formatNumber } from "@/app/utils/formatNumber";

interface Outpatient {
  id: number;
  no_registration: string;
  code_of_poli: string;
  code_of_doctor: string;
  no_mr: string;
  code_of_assurance: string;
  poli_name: string;
  doctor_name: string;
  patient_name: string;
  assurance: string;
  date: string;
}

interface Transaction {
  id: number;
  outpatient: Outpatient;
  id_outpatient: number | null;
  date: string;
  payment_methode: string;
  total_transaction: number;
  remaining_payment: number;
  amount: number;
  return_amount: number;
  payment_status: string;
  no_registration: string;
  patient_name: string;
}

interface Pagination {
  pageIndex: number;
  pageSize: number;
}

interface SelectOption {
  value: number | null;
  label: string | "";
}

const TransactionsPage: React.FC = () => {
  const cashierServiceUrl = Config.CASHIERSERVICE_URl;
  const [loading, setLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [initialOutpatient, setInitialOutpatient] =
    useState<SelectOption | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        const response = await fetch(
          `${cashierServiceUrl}/transaction?page=${pagination.pageIndex}&per_page=${pagination.pageSize}&search=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        SuccessToast("Transaksi berhasil diedit!");
      } else {
        setTransactions((prev) => [updatedTransaction.data, ...prev]);
        SuccessToast("Transaksi berhasil ditambahkan!");
      }

      setShowModal(false);
      setCurrentTransaction(null);
    } catch (error: any) {
      console.error("Transaksi gagal disimpan: ", error);
      FailedToast(`Transaksi gagal disimpan: ${error.message}`);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!currentTransaction) return;

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    try {
      const response = await fetch(
        `${cashierServiceUrl}/transaction/${currentTransaction.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

      if (transaction.id_outpatient) {
        try {
          const outpatientResponse = await fetch(
            `${cashierServiceUrl}/outpatient/${transaction.id_outpatient}`
          );

          if (!outpatientResponse.ok) {
            throw new Error(outpatientResponse.statusText);
          }

          const outpatientData = await outpatientResponse.json();

          setInitialOutpatient({
            value: outpatientData.data.id,
            label:
              outpatientData.data.no_registration +
              " - " +
              outpatientData.data.patient_name,
          });
        } catch (error: any) {
          console.error("Failed to retrieve:", error);
          FailedToast(`Failed to retrieve: ${error.message}`);
        }
      } else {
        setInitialOutpatient(null);
      }
    } else {
      setCurrentTransaction({
        id: 0,
        outpatient: {
          id: 0,
          no_registration: "",
          code_of_poli: "",
          code_of_doctor: "",
          no_mr: "",
          code_of_assurance: "",
          poli_name: "",
          doctor_name: "",
          patient_name: "",
          assurance: "",
          date: "",
        },
        id_outpatient: null,
        date: "",
        payment_methode: "",
        total_transaction: 0,
        remaining_payment: 0,
        amount: 0,
        return_amount: 0,
        payment_status: "",
        no_registration: "",
        patient_name: "",
      });
      setInitialOutpatient(null);
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

  const loadOutpatientOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/outpatient?search=${inputValue}`
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const successResponse = await response.json();
        const options = successResponse.data.map((outpatient: any) => ({
          value: outpatient.id,
          label: outpatient.no_registration + " - " + outpatient.patient_name,
        }));

        return options;
      } catch (error: any) {
        console.error("Failed to load outpatients:", error);
        FailedToast("Failed to load outpatients:" + error.message);
        return [];
      }
    },
    [cashierServiceUrl]
  );

  const handleSelectChange = (
    selectedOption: SelectOption | null,
    action: any
  ) => {
    if (currentTransaction && action.name) {
      setCurrentTransaction({
        ...currentTransaction,
        [action.name]: selectedOption ? selectedOption.value : 0,
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3>Daftar Transaksi</h3>
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
              placeholder="Cari daftar transaksi..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="ms-auto"
            />
          </Stack>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: "0%" }}>No</th>
                <th className="text-center" style={{ width: "0%" }}>
                  Aksi
                </th>
                <th>Nomor Registrasi</th>
                <th>Nama Pasien</th>
                <th style={{ width: "0%" }}>Tanggal</th>
                <th style={{ width: "0%" }}>Metode Bayar</th>
                <th className="text-end" style={{ width: "0%" }}>
                  Total Harga
                </th>
                <th className="text-end" style={{ width: "0%" }}>
                  Sisa Bayar
                </th>
                <th className="text-end" style={{ width: "0%" }}>
                  Terima Uang
                </th>
                <th className="text-end" style={{ width: "0%" }}>
                  Kembali
                </th>
                <th style={{ width: "0%" }}>Status Bayar</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id}>
                  <td>
                    {(pagination.pageIndex - 1) * pagination.pageSize +
                      index +
                      1}
                  </td>
                  <td>
                    <div className="d-flex flex-row justify-content-center align-items-center gap-1">
                      <Link
                        href={`/cashier/transactions/detail?id=${transaction.id}`}
                        passHref
                      >
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
                    </div>
                  </td>
                  <td className="text-nowrap">
                    {transaction.outpatient.no_registration}
                  </td>
                  <td>{transaction.outpatient.patient_name}</td>
                  <td className="text-nowrap">{transaction.date}</td>
                  <td>{transaction.payment_methode}</td>
                  <td className="text-end">
                    {formatNumber(transaction.total_transaction)}
                  </td>
                  <td className="text-end">
                    {formatNumber(transaction.remaining_payment)}
                  </td>
                  <td className="text-end">
                    {formatNumber(transaction.amount)}
                  </td>
                  <td className="text-end">
                    {formatNumber(transaction.return_amount)}
                  </td>
                  <td>{transaction.payment_status}</td>
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
                {isEditMode ? "Edit" : "Tambah"} Transaksi
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveTransaction();
                }}
              >
                <Form.Group
                  controlId="formOutpatientCategory"
                  style={{ flex: 1 }}
                >
                  <Form.Label>Nomor Registrasi</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    defaultValue={initialOutpatient}
                    onChange={handleSelectChange}
                    loadOptions={loadOutpatientOption}
                    name="id_outpatient"
                    required
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Stack direction="horizontal" gap={3}>
                <Button variant="secondary" onClick={handleCloseModal}>
                  <FontAwesomeIcon icon={faX} className="me-2" />
                  {"Batal"}
                </Button>
                <Button variant="primary" onClick={handleSaveTransaction}>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {"Simpan"}
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
