import React, { ReactComponentElement } from "react";
import AddProduct from "./AddProduct";

const productUnit = () => {
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Order</h3>
        </div>
        <div className="card-body">
          <AddProduct></AddProduct>
        </div>
      </div>
    </>
  );
};

export default productUnit;
