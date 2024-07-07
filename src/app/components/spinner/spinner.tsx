// components/Spinner.tsx
import React from "react";
import { Spinner } from "react-bootstrap";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="spinner-container">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <style jsx>{`
        .spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 90vh;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
