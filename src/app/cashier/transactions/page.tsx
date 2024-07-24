"use client";
import Config from "@/app/config";
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Stack, Button, Table, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight, faEdit, faInfo, faPlus, faSave, faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/app/components/spinner/spinner";
import { SuccessToast, FailedToast } from "@/app/components/toast/toast";
import Link from "next/link";
import AsyncSelect from "react-select/async";

interface Patient {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
}
interface Outpatient {
  id: number;
  name: string;
}

interface Poli {
  id: number;
  name: string;
}

interface Transaction {
  id: number;
  id_patient: number | null;
  id_outpatient: number | null;
  id_poli: number | null;
  id_doctor: number | null;
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

interface SelectOption {
  value: number | null;
  label: string | "";
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
  const [initialPatient, setInitialPatient] = useState<SelectOption | null>(null);
  const [initialOutpatient, setInitialOutpatient] = useState<SelectOption | null>(null);
  const [initialPoli, setInitialPoli] = useState<SelectOption | null>(null);
  const [initialDoctor, setInitialDoctor] = useState<SelectOption | null>(null);

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

      if (transaction.id_patient && transaction.id_outpatient && transaction.id_poli && transaction.id_doctor) {
        try {
          const [patientResponse, outpatientResponse, poliResponse, doctorResponse] = await Promise.all([
            fetch(`${cashierServiceUrl}/patient/${transaction.id_patient}`),
            fetch(`${cashierServiceUrl}/outpatient/${transaction.id_outpatient}`),
            fetch(`${cashierServiceUrl}/poli/${transaction.id_poli}`),
            fetch(`${cashierServiceUrl}/doctor/${transaction.id_doctor}`),
          ]);

          if (!patientResponse.ok) {
            throw new Error(patientResponse.statusText);
          }
          if (!outpatientResponse.ok) {
            throw new Error(outpatientResponse.statusText);
          }
          if (!poliResponse.ok) {
            throw new Error(poliResponse.statusText);
          }
          if (!doctorResponse.ok) {
            throw new Error(doctorResponse.statusText);
          }

          const patientData = await patientResponse.json();
          const outpatientData = await outpatientResponse.json();
          const poliData = await poliResponse.json();
          const doctorData = await doctorResponse.json();

          setInitialPatient({
            value: patientData.data.id,
            label: patientData.data.name,
          });
          setInitialOutpatient({
            value: outpatientData.data.id,
            label: outpatientData.data.name,
          });
          setInitialPoli({
            value: poliData.data.id,
            label: poliData.data.name,
          });
          setInitialDoctor({
            value: doctorData.data.id,
            label: doctorData.data.name,
          });
        } catch (error: any) {
          console.error("Failed to retrieve:", error);
          FailedToast(`Failed to retrieve: ${error.message}`);
        }
      } else {
        setInitialPatient(null);
        setInitialOutpatient(null);
        setInitialPoli(null);
        setInitialDoctor(null);
      }

    } else {
      setCurrentTransaction({
        id: 0,
        id_patient: null,
        id_outpatient: null,
        id_poli: null,
        id_doctor: null,
        date: "",
        payment_methode: "",
        total_transaction: 0,
        upfront_payment: 0,
        remaining_payment: 0,
        return_amount: 0,
        payment_status: "",
      });
      setInitialPatient(null);
      setInitialOutpatient(null);
      setInitialPoli(null);
      setInitialDoctor(null);
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

  const loadPatientOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/patient?search=${inputValue}`
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const successResponse = await response.json();
        const options = successResponse.data.map((patient: any) => ({
          value: patient.id,
          label: patient.name,
        }));

        return options;
      } catch (error: any) {
        console.error("Failed to load patients:", error);
        FailedToast("Failed to load patients:" + error.message);
        return [];
      }
    },
    [cashierServiceUrl]
  );

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
          label: outpatient.name,
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

  const loadPoliOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/poli?search=${inputValue}`
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const successResponse = await response.json();
        const options = successResponse.data.map((poli: any) => ({
          value: poli.id,
          label: poli.name,
        }));

        return options;
      } catch (error: any) {
        console.error("Failed to load polis:", error);
        FailedToast("Failed to load polis:" + error.message);
        return [];
      }
    },
    [cashierServiceUrl]
  );

  const loadDoctorOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/doctor?search=${inputValue}`
        );
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const successResponse = await response.json();
        const options = successResponse.data.map((doctor: any) => ({
          value: doctor.id,
          label: doctor.name,
        }));

        return options;
      } catch (error: any) {
        console.error("Failed to load doctors:", error);
        FailedToast("Failed to load doctors:" + error.message);
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
                  <Form.Group
                    controlId="formPatientCategory"
                    style={{ flex: 1 }}>
                    <Form.Label>Pasien</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={initialPatient}
                      onChange={handleSelectChange}
                      loadOptions={loadPatientOption}
                      name="id_patient"
                    />
                  </Form.Group>
                  <Form.Group
                    controlId="formOutpatientCategory"
                    style={{ flex: 1 }}>
                    <Form.Label>Rawat Jalan</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={initialOutpatient}
                      onChange={handleSelectChange}
                      loadOptions={loadOutpatientOption}
                      name="id_outpatient"
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={2} className="mb-2">
                  <Form.Group
                    controlId="formPoliCategory"
                    style={{ flex: 1 }}>
                    <Form.Label>Poli</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={initialPoli}
                      onChange={handleSelectChange}
                      loadOptions={loadPoliOption}
                      name="id_poli"
                    />
                  </Form.Group>
                  <Form.Group
                    controlId="formDoctorCategory"
                    style={{ flex: 1 }}>
                    <Form.Label>Dokter</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={initialDoctor}
                      onChange={handleSelectChange}
                      loadOptions={loadDoctorOption}
                      name="id_doctor"
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
