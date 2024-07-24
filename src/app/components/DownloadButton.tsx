import React from 'react';

interface Props {
  id: string;
}

const DownloadButton: React.FC<Props> = ({ id }) => {
  const handleDownload = () => {
    window.location.href = `/api/generatePdf?id=${id}`;
  };

  return (
    <button onClick={handleDownload}>
      Download PDF
    </button>
  );
};

export default DownloadButton;