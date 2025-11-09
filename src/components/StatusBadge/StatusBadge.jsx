import React from "react";
import "./StatusBadge.scss";

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "approved":
        return {
          label: "Disetujui",
          className: "status-approved",
        };
      case "pending":
        return {
          label: "Menunggu",
          className: "status-pending",
        };
      case "rejected":
        return {
          label: "Ditolak",
          className: "status-rejected",
        };
      default:
        return {
          label: status,
          className: "status-default",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`status-badge ${config.className}`}>{config.label}</span>
  );
};

export default StatusBadge;
