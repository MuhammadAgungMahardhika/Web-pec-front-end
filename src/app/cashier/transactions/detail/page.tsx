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
  faPlus,
  faPrint,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ReactToPrint from "react-to-print";
import { FailedToast } from "@/app/components/toast/toast";
import Config from "@/app/config";
interface Poli {
  id: number;
  name: string;
}

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
interface Transaction {
  id: number;
  patient: Patient;
  outpatient: Outpatient;
  poli: Poli;
  doctor: Doctor;
  date: string;
  payment_methode: number;
  total_transaction: number;
  upfront_payment: number;
  remaining_payment: number;
  return_amount: number;
  payment_status: string;
}
interface Services {
  id: number;
  name: string;
  price: number;
  code_of_service: string;
}
interface TransactionDetails {
  id: number;
  id_transaction: number | null;
  service: Services;
  doctor: Doctor;
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
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails[]>([]);
  const [currentDetail, setCurrentDetail] = useState<TransactionDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const componentRef = useRef(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`${cashierServiceUrl}/transaction/${transactionId}`);
        if (response.ok) {
          const successResponse = await response.json();
          const data = successResponse.data;
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
  }, [transactionId]);

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
      } else {
        const failedResponse = await response.json();
        console.log(failedResponse);
        throw new Error(failedResponse);
      }
    } catch (error) {
      console.error(error);
      FailedToast("Gagal menyimpan detail transaksi. Terjadi kesalahan.");
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
        setTransactionDetails((prev) =>
          prev.filter((detail) => detail.id !== currentDetail.id)
        );
        setShowDeleteModal(false);
        setCurrentDetail(null);
      } else {
        console.error("Gagal menghapus detail transaksi:", response.statusText);
        FailedToast("Gagal menghapus detail transaksi. Coba lagi.");
      }
    } catch (error) {
      console.error("Gagal menghapus detail transaksi:", error);
      FailedToast("Gagal menghapus detail transaksi. Terjadi kesalahan.");
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
        id_transaction: 0,
        service: {
            id: 0,
            name: "",
            price: 0,
            code_of_service: ""
        },
        doctor: {
            id: 0,
            name: ""
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

  const handleOpenDeleteModal = (detail: TransactionDetails) => {
    setCurrentDetail(detail);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDetail(null);
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

  const loadServiceOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/service?search=${inputValue}`
        );
        const successResponse = await response.json();
        return successResponse.data.map((services: any) => ({
          value: services.id,
          label: services.name,
        }));
      } catch (error) {
        console.error("Gagal mendapatkan layanan:", error);
        return [];
      }
    },
    [cashierServiceUrl]
  );

  const loadDoctorOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${cashierServiceUrl}/doctor?search=${inputValue}`
        );
        const successResponse = await response.json();
        return successResponse.data.map((doctor: any) => ({
          value: doctor.id,
          label: doctor.name,
        }));
      } catch (error) {
        console.error("Gagal mendapatkan dokter:", error);
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
  const totalJumlahHarga = transactionDetails.reduce(
    (total, detail) => total + detail.quantity * detail.service.price,
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
                    <Form.Label>
                      ID <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="id"
                      value={transaction.id}
                      disabled={!editing}
                      autoComplete="off"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formDate">
                    <Form.Label>
                      Tanggal <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={transaction.date}
                      disabled={!editing}
                      // onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <FontAwesomeIcon icon={faPlus} />
          </Button>
          <Table striped bordered hover className="mt-3" ref={componentRef}>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Layanan</th>
                <th className="text-end">Jumlah</th>
                <th className="text-end">Total harga</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactionDetails.map((detail, index) => (
                <tr key={detail.id}>
                  <td>{index + 1}</td>
                  <td>{detail.service.name}</td>
                  <td className="text-end">{detail.quantity}</td>
                  <td className="text-end">
                    {detail.quantity * detail.service.price}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenModal(detail)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenDeleteModal(detail)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th></th>
              </tr>
              <tr>
                <th className="text-end" colSpan={3}>
                  Jumlah Harga
                </th>
                <th className="text-end">{totalJumlahHarga}</th>
                <th>
                  <ReactToPrint
                    trigger={() => (
                      <Button variant="secondary" className="ms-2">
                        <FontAwesomeIcon icon={faPrint} /> Cetak Struk Transaksi
                      </Button>
                    )}
                    content={() => componentRef.current}
                  />
                </th>
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
                }}>
                    <Form.Control
                      type="hidden"
                      name="id_transaction"
                      value={transactionId}
                    >
                    </Form.Control>
                  <Form.Group controlId="doctor" style={{ flex: 1 }}>
                    <Form.Label>Dokter</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={{
                        value: currentDetail?.doctor.id,
                        label: currentDetail?.doctor.name,
                      }}
                      onChange={handleSelectChange}
                      loadOptions={loadDoctorOptions}
                      name="id_doctor"
                    />
                  </Form.Group>
                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="service" style={{ flex: 1 }}>
                    <Form.Label>Layanan</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={{
                        value: currentDetail?.service.id,
                        label: currentDetail?.service.name,
                      }}
                      onChange={handleSelectChange}
                      loadOptions={loadServiceOptions}
                      name="id_service"
                    />
                  </Form.Group>
                  <Form.Group controlId="quantity" style={{ flex: 1 }}>
                    <Form.Label>Jumlah</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={currentDetail?.quantity || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>
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
