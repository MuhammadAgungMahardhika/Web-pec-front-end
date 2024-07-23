"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Stack, Breadcrumb, Form, Button } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import { FailedAlert } from "@/app/components/alert/alert";
import Link from "next/link";
import { FailedToast } from "@/app/components/toast/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
interface Order {
  id_patient: string;
  id_poli: number;
  id_doctor: string;
  no_of_order: string;
  date: string;
  date_of_service: string;
  kind_of_medicine: number;
  bpjs_sep: string;
  iteration: boolean;
  order_type: string;
}

const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

const AddOrderPage: React.FC = () => {
  const pharmacyServiceUrl = "http://127.0.0.1:8082/api";
  const router = useRouter();

  const [newOrder, setNewOrder] = useState<Order>({
    id_patient: "",
    id_poli: 1,
    id_doctor: "",
    no_of_order: "",
    date: getCurrentDate(),
    date_of_service: getCurrentDate(),
    kind_of_medicine: 0,
    iteration: false,
    bpjs_sep: "",
    order_type: "Umum",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: parseInt(value, 10) });
  };

  const handleSelectChange = (selectedOption: any | null, action: any) => {
    if (newOrder && action.name) {
      setNewOrder({
        ...newOrder,
        [action.name]: selectedOption ? selectedOption.value : null,
      });
    }
  };

  const handleOrderTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewOrder({
      ...newOrder,
      order_type: value,
      bpjs_sep: value === "BPJS" ? newOrder.bpjs_sep : "",
    });
  };

  const handleAddOrder = async (e: any) => {
    e.preventDefault();

    try {
      const response = await fetch(`${pharmacyServiceUrl}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }

      const data: any = await response.json();

      router.push(`/pharmacy/order/detail?id=${data.data.id}`);
    } catch (error: any) {
      FailedAlert(error.message);
    }
  };

  const loadNoMrOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/patient?search=${inputValue}`
        );
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }
        const successResponse = await response.json();
        const options = successResponse.data.map((patient: any) => ({
          value: patient.no_mr,
          label: patient.no_mr + " | " + patient.name,
        }));

        return options;
      } catch (error: any) {
        FailedToast(error.message);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  const loadPoliOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/outpatient-clinic?search=${inputValue}`
        );
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }
        const successResponse = await response.json();
        const options = successResponse.data.map((outpatientClinic: any) => ({
          value: outpatientClinic.id,
          label: outpatientClinic.name,
        }));

        return options;
      } catch (error: any) {
        FailedToast(error.message);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  const loadDoctorOption = useCallback(
    async (inputValue: string) => {
      try {
        const response = await fetch(
          `${pharmacyServiceUrl}/doctor?search=${inputValue}`
        );
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.message);
        }
        const successResponse = await response.json();
        const options = successResponse.data.map((doctor: any) => ({
          value: doctor.code,
          label: doctor.name,
        }));

        return options;
      } catch (error: any) {
        FailedToast(error.message);
        return [];
      }
    },
    [pharmacyServiceUrl]
  );

  return (
    <div className="container mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} href="/pharmacy/order">
          Daftar Permintaan Obat
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Tambah Permintaan Obat</Breadcrumb.Item>
      </Breadcrumb>

      <div className="card">
        <div className="card-header">
          <h3>Tambah Permintaan Obat</h3>
        </div>
        <div className="card-body">
          <Form onSubmit={handleAddOrder}>
            <Row className="mb-3">
              <Col>
                <Stack direction="horizontal" gap={2}>
                  <Form.Group controlId="formOrderUmum">
                    <Form.Check
                      type="radio"
                      name="order_type"
                      value="Umum"
                      checked={newOrder.order_type === "Umum"}
                      onChange={handleOrderTypeChange}
                      inline
                    />
                    <Form.Label className="me-2">Umum</Form.Label>
                  </Form.Group>
                  <Form.Group controlId="formOrderBpjs">
                    <Form.Check
                      type="radio"
                      name="order_type"
                      value="BPJS"
                      checked={newOrder.order_type === "BPJS"}
                      onChange={handleOrderTypeChange}
                      inline
                    />
                    <Form.Label className="me-2">Bpjs</Form.Label>
                  </Form.Group>
                </Stack>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formNoOrder">
                  <Form.Label>
                    Nomor Resep<span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="no_of_order"
                    onChange={handleInputChange}
                    value={newOrder.no_of_order}
                    autoComplete="off"
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formPoli">
                  <Form.Label>
                    Poli
                    <span className="text-danger"> * </span>
                  </Form.Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    onChange={handleSelectChange}
                    loadOptions={loadPoliOption}
                    name="id_poli"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formNoMrPatient">
                  <Form.Label>
                    Pasien <span className="text-danger"> * </span>
                  </Form.Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    onChange={handleSelectChange}
                    loadOptions={loadNoMrOption}
                    name="id_patient"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formDoctorCode">
                  <Form.Label>
                    Dokter <span className="text-danger"> * </span>
                  </Form.Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    onChange={handleSelectChange}
                    loadOptions={loadDoctorOption}
                    name="id_doctor"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formDate">
                  <Form.Label>
                    Tanggal Resep <span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={newOrder.date || getCurrentDate()}
                    onChange={handleInputChange}
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
                    value={newOrder.date_of_service || getCurrentDate()}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formOrderMedicineType">
                  <Form.Label>
                    Jenis Obat <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="kind_of_medicine"
                    value={newOrder.kind_of_medicine}
                    onChange={handleChange}
                    autoComplete="off"
                    required>
                    <option value="">Pilih jenis obat</option>
                    <option value={1}>Obat PRB</option>
                    <option value={2}>Obat Kronis Blm Stabil</option>
                    <option value={3}>Obat Kemoterapi</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formOrderBpjsIteration">
                  <Form.Label>Resep lanjutan? </Form.Label>
                  <Form.Check
                    type="checkbox"
                    name="iteration"
                    checked={newOrder.iteration}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className="mt-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            {newOrder.order_type === "BPJS" && (
              <Row className="mb-2">
                <Col>
                  <Form.Group controlId="formOrderBpjsSep">
                    <Form.Label>BPJS SEP</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Masukkan BPJS SEP"
                      name="bpjs_sep"
                      value={newOrder.bpjs_sep}
                      onChange={handleInputChange}
                      autoComplete="off"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <Row>
              <Col className="text-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="mt-4"
                  aria-label="simpan resep"
                  title="simpan resep">
                  <FontAwesomeIcon icon={faSave} size="2x" className="me-2" />
                  Simpan
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddOrderPage;
