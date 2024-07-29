"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, ChangeEvent, useCallback, useRef } from "react";
import {
  Row,
  Col,
  Stack,
  Breadcrumb,
  Modal,
  Button,
  Table,
  Form,
} from "react-bootstrap";
import Link from "next/link";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFilePdf,
  faPlus,
  faPrint,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FailedToast, SuccessToast } from "@/app/components/toast/toast";
import Config from "@/app/config";
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
  date: string;
  payment_methode: string;
  total_transaction: number;
  remaining_payment: number;
  amount: number;
  return_amount: number;
  payment_status: string;
}
interface ProcessTransaction {
  id: number;
  payment_methode: string;
  amount: number;
}
interface Services {
  id: number;
  name: string;
  price: number;
  code_of_service: string;
}
interface TransactionDetails {
  id: number;
  id_transaction: number | null | undefined;
  service: Services;
  time: string;
  quantity: number;
  discount: number;
  total_price: number;
}

const DetailTransaction: React.FC = () => {
  const cashierServiceUrl = Config.CASHIERSERVICE_URl;
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<
    TransactionDetails[]
  >([]);
  const [currentTransaction, setCurrentTransaction] =
    useState<ProcessTransaction | null>(null);
  const [currentDetail, setCurrentDetail] = useState<TransactionDetails | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const componentRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [isLunas, setIsLunas] = useState(false);
  const [isPrintable, setIsPrintable] = useState(true);
  const [isAdd, setIsAdd] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/transaction/${transactionId}`
        );
        if (response.ok) {
          const successResponse = await response.json();
          const data = successResponse.data;
          if (data.payment_status == "Lunas") {
            setIsLunas(true);
            setIsPrintable(false);
            setIsAdd(true);
            setIsEdit(true);
            setIsDelete(true);
          }
          setTransaction(data);
        } else {
          throw new Error("Gagal mendapatkan informasi transaksi");
        }
      } catch (error) {
        console.error("Error saat mendapatkan informasi transaksi:", error);
      }
    };

    const fetchTransactionDetails = async () => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/detail-transaction/transaction-id/${transactionId}`
        );
        if (response.ok) {
          const successResponse = await response.json();
          const data = successResponse.data;
          console.log(data);
          setTransactionDetails(data);
        } else {
          throw new Error("Gagal mendapatkan detail transaksi");
        }
      } catch (error) {
        console.error("Error saat mendapatkan detail transaksi:", error);
      }
    };

    if (transactionId) {
      fetchTransaction();
      fetchTransactionDetails();
    }
  }, [cashierServiceUrl, transactionId]);

  const fetchPaymentMethodeOptions = async () => {
    // Replace this with your actual API call
    return [
      { value: "Cash", label: "Cash" },
      { value: "QRIS", label: "QRIS" },
      { value: "Debet Card", label: "Debet Card" },
      { value: "Credit Card", label: "Credit Card" },
      { value: "Piutang BPJS", label: "Piutang BPJS" },
      { value: "Piutang Perusahaan", label: "Piutang Perusahaan" },
      { value: "Piutang Pasien", label: "Piutang Pasien" },
      { value: "Piutang Karyawan", label: "Piutang Karyawan" },
      { value: "Piutang Rawat Inap", label: "Piutang Rawat Inap" },
      { value: "Piutang Asuransi", label: "Piutang Asuransi" },
      { value: "Piutang Pemda", label: "Piutang Pemda" },
    ];
  };

  const handleSaveDetail = async () => {
    if (!currentDetail) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${cashierServiceUrl}/detail-transaction/${currentDetail.id}`
      : `${cashierServiceUrl}/detail-transaction`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentDetail),
      });

      if (response.ok) {
        const updatedDetail = await response.json();
        console.log(updatedDetail);
        if (isEditMode) {
          setTransactionDetails((prev) =>
            prev.map((detail) =>
              detail.id === currentDetail.id ? updatedDetail.data : detail
            )
          );
        } else {
          setTransactionDetails((prev) => [updatedDetail.data, ...prev]);
        }
        setShowModal(false);
        setCurrentDetail(null);
        setIsLunas(false);
      } else {
        const failedResponse = await response.json();
        console.log(failedResponse);

        // Extract error message from failedResponse
        const errorMessage = failedResponse.message || "Unknown error occurred";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      // Use type assertion and type guard to handle 'unknown' error
      let errorMessage = "Gagal memproses transaksi. ";

      if (error instanceof Error) {
        errorMessage += error.message;
      } else if (typeof error === "string") {
        errorMessage += error;
      } else {
        errorMessage += "Unknown error occurred";
      }

      FailedToast(errorMessage);
    }
  };

  const handleProcess = async () => {
    if (!currentTransaction) return;
    const method = "PUT";
    const url = `${cashierServiceUrl}/transaction/process/${currentTransaction.id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentTransaction),
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        console.log(updatedTransaction);
        setTransaction((prev) => {
          if (prev) {
            return {
              ...prev,
              amount: updatedTransaction.data.amount,
              return_amount: updatedTransaction.data.return_amount,
              payment_methode: updatedTransaction.data.payment_methode,
            };
          }
          return null;
        });
        setShowProcessModal(false);
        setCurrentTransaction(null);
        setIsLunas(true);
        setIsPrintable(false);
        setIsAdd(true);
        setIsEdit(true);
        setIsDelete(true);
        SuccessToast("Transaksi berhasil diproses! Silakan cetak struk!");
      } else {
        const failedResponse = await response.json();
        console.log(failedResponse);

        // Extract error message from failedResponse
        const errorMessage = failedResponse.message || "Unknown error occurred";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      // Use type assertion and type guard to handle 'unknown' error
      let errorMessage = "Gagal memproses transaksi. ";

      if (error instanceof Error) {
        errorMessage += error.message;
      } else if (typeof error === "string") {
        errorMessage += error;
      } else {
        errorMessage += "Unknown error occurred";
      }

      FailedToast(errorMessage);
    }
  };

  const handleDeleteDetail = async () => {
    if (!currentDetail) return;
    try {
      const response = await fetch(
        `${cashierServiceUrl}/detail-transaction/${currentDetail.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setTransactionDetails((prev) => {
          const updatedDetails = prev.filter(
            (detail) => detail.id !== currentDetail.id
          );
          return updatedDetails;
        });
        setShowDeleteModal(false);
        setCurrentDetail(null);
      } else {
        const failedResponse = await response.json();
        console.log(failedResponse);

        // Extract error message from failedResponse
        const errorMessage = failedResponse.message || "Unknown error occurred";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(error);
      // Use type assertion and type guard to handle 'unknown' error
      let errorMessage = "Gagal memproses transaksi. ";

      if (error instanceof Error) {
        errorMessage += error.message;
      } else if (typeof error === "string") {
        errorMessage += error;
      } else {
        errorMessage += "Unknown error occurred";
      }

      FailedToast(errorMessage);
    }
  };

  const handleOpenModal = (detail?: TransactionDetails) => {
    if (detail) {
      console.log(detail);
      setCurrentDetail(detail);
      setIsEditMode(true);
    } else {
      setCurrentDetail({
        id: 0,
        id_transaction: transaction?.id,
        service: {
          id: 0,
          name: "",
          price: 0,
          code_of_service: "",
        },
        time: "",
        quantity: 1,
        discount: 0,
        total_price: 0,
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenProcessModal = (transaction: ProcessTransaction) => {
    console.log(transaction);
    setCurrentTransaction(transaction);
    setShowProcessModal(true);
  };

  const handleOpenDeleteModal = (detail: TransactionDetails) => {
    setCurrentDetail(detail);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDetail(null);
  };

  const handleCloseProcessModal = () => {
    setShowProcessModal(false);
    setCurrentTransaction(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentDetail(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentDetail) {
      setCurrentDetail({ ...currentDetail, [name]: value });
    }
  };

  const handleProcessTransaction = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (currentTransaction) {
      setCurrentTransaction({ ...currentTransaction, [name]: value });
    }
  };

  const loadServiceOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/service?search=${inputValue}`
        );
        const successResponse = await response.json();
        return successResponse.data.map((services: any) => ({
          value: services.id,
          label: services.name + " - " + services.code_of_service,
        }));
      } catch (error) {
        console.error("Gagal mendapatkan layanan:", error);
        return [];
      }
    },
    [cashierServiceUrl]
  );

  const handleSelectChange = (selectedOption: any, action: any) => {
    console.log(selectedOption);
    console.log(action);
    if (currentDetail && action.name) {
      setCurrentDetail({
        ...currentDetail,
        [action.name]: selectedOption ? selectedOption.value : 0,
      });
    }
  };

  const handleSelectProcessChange = (selectedOption: any, action: any) => {
    console.log(selectedOption);
    console.log(action);
    if (currentTransaction && action.name) {
      setCurrentTransaction({
        ...currentTransaction,
        [action.name]: selectedOption ? selectedOption.value : 0,
      });
    }
  };

  const handleClick = () => {
    if (!isPrintable) {
      window.open(
        `${cashierServiceUrl}/detail-transaction/printpdf/${transactionId}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const totalJumlahHarga: number = transactionDetails.reduce(
    (total, detail) =>
      total + detail.quantity * detail.service.price - detail.discount,
    0
  );
  return (
    <div className="container">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} href="/cashier/transactions">
          Daftar Transaksi
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Detail Transaksi</Breadcrumb.Item>
      </Breadcrumb>

      <div className="card">
        <div className="card-header">
          <h3>Detail Transaksi</h3>
        </div>
        <div className="card-body">
          {transaction && (
            <Form className="btransaction mb-2 p-2">
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="formNoTransaction">
                    <Form.Label>ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="id"
                      value={transaction.id}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formDate">
                    <Form.Label>Tanggal</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={transaction.date}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="formOutpatient">
                    <Form.Label>Nomor Registrasi</Form.Label>
                    <Form.Control
                      type="text"
                      name="outpatient_name"
                      value={transaction.outpatient.no_registration}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formPoli">
                    <Form.Label>Unit</Form.Label>
                    <Form.Control
                      type="text"
                      name="poli_name"
                      value={transaction.outpatient.poli_name}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="formPatient">
                    <Form.Label>Nama Pasien</Form.Label>
                    <Form.Control
                      type="text"
                      name="patient_name"
                      value={transaction.outpatient.patient_name}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formDoctor">
                    <Form.Label>Nama Dokter</Form.Label>
                    <Form.Control
                      type="text"
                      name="doctor_name"
                      value={transaction.outpatient.doctor_name}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Form.Group controlId="formPoli">
                  <Form.Label>Asuransi</Form.Label>
                  <Form.Control
                    type="text"
                    name="poli_name"
                    value={transaction.outpatient.assurance}
                    disabled={!editing}
                  />
                </Form.Group>
              </Row>
            </Form>
          )}
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
            disabled={isAdd}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
          <Table
            striped
            bordered
            hover
            responsive
            className="mt-3"
            ref={componentRef}
          >
            <thead>
              <tr>
                <th style={{ width: "0%" }}>No</th>
                <th>Nama Layanan</th>
                <th className="text-end" style={{ width: "0%" }}>
                  Jumlah
                </th>
                <th className="text-end" style={{ width: "0%" }}>
                  Harga
                </th>
                <th className="text-end" style={{ width: "0%" }}>
                  Diskon
                </th>
                <th className="text-end" style={{ width: "0%" }}>
                  Total harga
                </th>
                <th className="text-center" style={{ width: "0%" }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {transactionDetails.map((detail, index) => (
                <tr key={detail.id}>
                  <td>{index + 1}</td>
                  <td>{detail.service.name}</td>
                  <td className="text-end">{detail.quantity}</td>
                  <td className="text-end">
                    {formatNumber(detail.service.price)}
                  </td>
                  <td className="text-end">{formatNumber(detail.discount)}</td>
                  <td className="text-end">
                    {formatNumber(
                      detail.quantity * detail.service.price - detail.discount
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-row justify-content-center align-items-center gap-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenModal(detail)}
                        disabled={isEdit}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(detail)}
                        disabled={isDelete}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th className="text-end" colSpan={5}>
                  Jumlah Harga
                </th>
                <th className="text-end">{formatNumber(totalJumlahHarga)}</th>
                <th rowSpan={4}>
                  <div className="d-flex flex-column justify-content-center align-items-center gap-1">
                    <Button
                      className="w-100"
                      variant="secondary"
                      disabled={isPrintable}
                      onClick={handleClick}
                    >
                      Cetak Struk
                    </Button>
                    {transaction && (
                      <Button
                        className="w-100"
                        variant="primary"
                        disabled={isLunas}
                        onClick={() =>
                          handleOpenProcessModal({
                            id: transaction.id,
                            payment_methode: transaction.payment_methode,
                            amount: transaction.amount,
                          })
                        }
                      >
                        Proses Transaksi
                      </Button>
                    )}
                  </div>
                </th>
              </tr>
              <tr>
                <th className="text-end" colSpan={5}>
                  Terima Uang
                </th>
                <th className="text-end">
                  {formatNumber(transaction?.amount ?? 0)}
                </th>
              </tr>
              <tr>
                <th className="text-end" colSpan={5}>
                  Uang Kembali
                </th>
                <th className="text-end">
                  {formatNumber(transaction?.return_amount ?? 0)}
                </th>
              </tr>
              <tr>
                <th className="text-end" colSpan={5}>
                  Metode Pembayaran
                </th>
                <td className="text-end">
                  {transaction?.payment_methode ?? ""}
                </td>
              </tr>
            </tfoot>
          </Table>
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>
                {isEditMode ? "Edit" : "Tambah"} Detail Transaksi
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDetail();
                }}
              >
                <Form.Control
                  type="hidden"
                  name="id_transaction"
                  value={currentDetail?.id_transaction ?? ""}
                  onChange={handleChange}
                />
                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="service" style={{ flex: 1 }}>
                    <Form.Label>Layanan</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={{
                        value: currentDetail?.service.id,
                        label:
                          currentDetail?.service.name +
                          " - " +
                          currentDetail?.service.code_of_service,
                      }}
                      onChange={handleSelectChange}
                      loadOptions={loadServiceOptions}
                      name="id_service"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="quantity" style={{ flex: 1 }}>
                    <Form.Label>Jumlah</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={currentDetail?.quantity || 0}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Stack>
                <Form.Group controlId="discount" style={{ flex: 1 }}>
                  <Form.Label>Diskon</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={currentDetail?.discount || 0}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleSaveDetail}>
                Simpan
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showProcessModal} onHide={handleCloseProcessModal}>
            <Modal.Header closeButton>
              <Modal.Title>Proses Transaksi</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcess();
                }}
              >
                <div className="alert alert-warning">
                  Setelah memproses transaksi ini, detail transaksi tidak dapat
                  diubah lagi. Silakan perika kembali detail transaksi sebelum
                  memproses transaksi ini.
                </div>
                <Form.Group controlId="payment_methode" style={{ flex: 1 }}>
                  <Form.Label>Metode Pembayaran</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    defaultValue={{
                      value: currentTransaction?.payment_methode,
                      label: currentTransaction?.payment_methode,
                    }}
                    onChange={handleSelectProcessChange}
                    loadOptions={fetchPaymentMethodeOptions}
                    name="payment_methode"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="amount" style={{ flex: 1 }}>
                  <Form.Label>Jumlah</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={currentTransaction?.amount}
                    onChange={handleProcessTransaction}
                    required
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseProcessModal}>
                Batal
              </Button>
              <Button variant="primary" onClick={handleProcess}>
                Proses
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Konfirmasi Hapus</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Apakah Anda yakin ingin menghapus detail transaksi ini?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteDetail}>
                Hapus
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default DetailTransaction;
