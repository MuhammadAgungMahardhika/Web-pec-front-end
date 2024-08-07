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
  no_mr: string;
  name: string;
}

interface Doctor {
  code: string;
  name: string;
}
interface Order {
  id: number;
  poli: Poli;
  patient: Patient;
  doctor: Doctor;
  no_of_order: string;
  date: string;
  date_of_service: string;
  kind_of_medicine: string;
  iteration: boolean;
}
interface Product {
  id: number;
  name: string;
  price: number;
}
interface Signa {
  id: number;
  name: string;
}
interface OrderDetail {
  id: number;
  id_order: number;
  product: Product;
  signa: Signa;
  quantity: number;
  dosis?: string;
  note?: string;
  note2?: string;
}

const DetailOrder: React.FC = () => {
  const pharmacyServiceUrl = Config.PHARMACYSERVICE_URl;
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState<OrderDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const componentRef = useRef(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${pharmacyServiceUrl}/order/${orderId}`);
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }

        const successResponse = await response.json();
        const data = successResponse.data;
        setOrder(data);
      } catch (error: any) {
        console.error(error.message);
      }
    };

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/detail-order/order-id/${orderId}`
        );
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }

        const successResponse = await response.json();
        const data = successResponse.data;
        console.log(data);

        setOrderDetails(data);
      } catch (error: any) {
        console.error(error.message);
      }
    };

    if (orderId) {
      fetchOrder();
      fetchOrderDetails();
    }
  }, [pharmacyServiceUrl, orderId]);

  const handleSaveDetail = async () => {
    if (!currentDetail) return;
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode
      ? `${pharmacyServiceUrl}/detail-order/${currentDetail.id}`
      : `${pharmacyServiceUrl}/detail-order`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentDetail),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }

      const updatedDetail = await response.json();
      console.log(updatedDetail);
      if (isEditMode) {
        setOrderDetails((prev) =>
          prev.map((detail) =>
            detail.id === currentDetail.id ? updatedDetail.data : detail
          )
        );
      } else {
        setOrderDetails((prev) => [updatedDetail.data, ...prev]);
      }
      setShowModal(false);
      setCurrentDetail(null);
    } catch (error: any) {
      FailedToast(error.message);
    }
  };

  const handleDeleteDetail = async () => {
    if (!currentDetail) return;
    try {
      const response = await fetch(
        `${pharmacyServiceUrl}/detail-order/${currentDetail.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }
      setOrderDetails((prev) =>
        prev.filter((detail) => detail.id !== currentDetail.id)
      );
      setShowDeleteModal(false);
      setCurrentDetail(null);
    } catch (error: any) {
      FailedToast(error.message);
    }
  };

  const handleOpenModal = (detail?: OrderDetail) => {
    if (detail) {
      console.log(detail);
      setCurrentDetail(detail);
      setIsEditMode(true);
    } else {
      setCurrentDetail({
        id: 0,
        product: {
          id: 0,
          name: "",
          price: 0,
        },
        signa: {
          id: 0,
          name: "",
        },
        id_order: parseInt(orderId as string, 10),
        quantity: 1,
        dosis: "",
        note: "",
        note2: "",
      });
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  const handleOpenDeleteModal = (detail: OrderDetail) => {
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

  const loadProductOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/product?search=${inputValue}`
        );
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }
        const successResponse = await response.json();
        return successResponse.data.map((product: any) => ({
          value: product.id,
          label: product.name,
        }));
      } catch (error: any) {
        FailedToast(error.message);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  const loadSignaOptions = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/signa?search=${inputValue}`
        );
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }
        const successResponse = await response.json();
        return successResponse.data.map((signa: any) => ({
          value: signa.id,
          label: signa.name,
        }));
      } catch (error: any) {
        FailedToast(error.message);
        return [];
      }
    },
    [pharmacyServiceUrl]
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
  const totalJumlahHarga = orderDetails.reduce(
    (total, detail) => total + detail.quantity * detail.product.price,
    0
  );
  return (
    <div className="container">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} href="/pharmacy/order">
          Daftar Permintaan Obat
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Detail Permintaan Obat</Breadcrumb.Item>
      </Breadcrumb>

      <div className="card">
        <div className="card-header">
          <h3>Detail Permintaan Obat</h3>
        </div>
        <div className="card-body">
          {order && (
            <Form className="border mb-2 p-2">
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="formNoOrder">
                    <Form.Label>
                      Nomor <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="no_of_order"
                      value={order.no_of_order}
                      disabled={!editing}
                      autoComplete="off"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formDate">
                    <Form.Label>
                      Tanggal Resep <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={order.date}
                      disabled={!editing}
                      // onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formDateOfService">
                    <Form.Label>
                      Tanggal Dilayani <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_of_service"
                      value={order.date_of_service}
                      disabled={!editing}
                      // onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formOrderMedicineType">
                    <Form.Label>
                      Jenis Obat <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="kind_of_medicine"
                      value={order.kind_of_medicine}
                      disabled={!editing}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="formOrderBpjsIteration">
                    <Form.Label>Resep lanjutan? </Form.Label>
                    <Form.Check
                      type="checkbox"
                      name="iteration"
                      disabled={!editing}
                      checked={order.iteration}
                      // onChange={handleInputChange}
                      autoComplete="off"
                      className="mt-2"
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
                <th>Nama Produk</th>
                <th>Signa</th>
                <th>Note 1</th>
                <th>Note 2</th>
                <th>Dosis</th>
                <th className="text-end">Jumlah</th>
                <th className="text-end">Harga</th>
                <th className="text-end">Total harga</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((detail, index) => (
                <tr key={detail.id}>
                  <td>{index + 1}</td>
                  <td>{detail.product.name}</td>
                  <td>{detail.signa.name}</td>
                  <td>{detail.note}</td>
                  <td>{detail.note2}</td>
                  <td>{detail.dosis}</td>
                  <td className="text-end">{detail.quantity}</td>
                  <td className="text-end">{detail.product.price}</td>
                  <td className="text-end">
                    {detail.quantity * detail.product.price}
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
                <th className="text-end" colSpan={8}>
                  Jumlah Harga
                </th>
                <th className="text-end">{totalJumlahHarga}</th>
                <th>
                  <ReactToPrint
                    trigger={() => (
                      <Button variant="secondary" className="ms-2">
                        <FontAwesomeIcon icon={faPrint} /> Cetak Permintaan Obat
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
                {isEditMode ? "Edit" : "Tambah"} Permintaan Obat
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDetail();
                }}>
                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="product" style={{ flex: 1 }}>
                    <Form.Label>Produk</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={{
                        value: currentDetail?.product.id,
                        label: currentDetail?.product.name,
                      }}
                      onChange={handleSelectChange}
                      loadOptions={loadProductOptions}
                      name="id_product"
                    />
                  </Form.Group>
                  <Form.Group controlId="signa" style={{ flex: 1 }}>
                    <Form.Label>Signa</Form.Label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      defaultValue={{
                        value: currentDetail?.signa.id,
                        label: currentDetail?.signa.name,
                      }}
                      onChange={handleSelectChange}
                      loadOptions={loadSignaOptions}
                      name="id_signa"
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="quantity" style={{ flex: 1 }}>
                    <Form.Label>Jumlah</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={currentDetail?.quantity || 0}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="dosis" style={{ flex: 1 }}>
                    <Form.Label>Dosis</Form.Label>
                    <Form.Control
                      type="text"
                      name="dosis"
                      value={currentDetail?.dosis || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Stack>

                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group controlId="note" style={{ flex: 1 }}>
                    <Form.Label>Catatan</Form.Label>
                    <Form.Control
                      type="text"
                      name="note"
                      value={currentDetail?.note || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="note2" style={{ flex: 1 }}>
                    <Form.Label>Catatan Tambahan</Form.Label>
                    <Form.Control
                      type="text"
                      name="note2"
                      value={currentDetail?.note2 || ""}
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
              Apakah Anda yakin ingin menghapus Permintaan Obat ini?
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

export default DetailOrder;
