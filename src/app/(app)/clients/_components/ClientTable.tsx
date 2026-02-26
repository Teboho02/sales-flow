"use client";

import { Button, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useMemo } from "react";
import type { IClient } from "@/provider/client/context";
import { useStyles } from "./styles";

const { Text } = Typography;

const clientTypeLabel: Record<number, string> = {
  1: "Government",
  2: "Private",
  3: "Partner",
};

export interface ClientTableProps {
  data?: IClient[];
  loading?: boolean;
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  searchTerm: string;
  clientTypeFilter?: number;
  isActiveFilter?: boolean;
  onSearch: (value: string) => void;
  onClientTypeChange: (value: number | undefined) => void;
  onStatusChange: (value: boolean | undefined) => void;
  onRefresh: () => void;
  onPageChange: (pagination: TablePaginationConfig) => void;
  onRowClick?: (client: IClient) => void;
  onEdit?: (client: IClient) => void;
  onDelete?: (client: IClient) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  data,
  loading,
  pageNumber,
  pageSize,
  totalCount,
  searchTerm,
  clientTypeFilter,
  isActiveFilter,
  onSearch,
  onClientTypeChange,
  onStatusChange,
  onRefresh,
  onPageChange,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const { styles } = useStyles();

  const columns: ColumnsType<IClient> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text: string | null) => text ?? "-",
      },
      {
        title: "Type",
        dataIndex: "clientType",
        key: "clientType",
        render: (val: number) => clientTypeLabel[val] ?? val,
      },
      {
        title: "Industry",
        dataIndex: "industry",
        key: "industry",
        render: (text: string | null) => text ?? "-",
      },
      {
        title: "Size",
        dataIndex: "companySize",
        key: "companySize",
        render: (text: string | null) => text ?? "-",
      },
      {
        title: "Website",
        dataIndex: "website",
        key: "website",
        render: (text: string | null) =>
          text ? (
            <a href={text} target="_blank" rel="noreferrer">
              {text}
            </a>
          ) : (
            "-"
          ),
      },
      {
        title: "Opportunities",
        dataIndex: "opportunitiesCount",
        key: "opportunitiesCount",
      },
      {
        title: "Active",
        dataIndex: "isActive",
        key: "isActive",
        render: (val: boolean) => (val ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            {onEdit && (
              <Button size="small" onClick={() => onEdit(record)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="small"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(record);
                }}
              >
                Delete
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [onDelete, onEdit],
  );

  return (
    <div className={styles.tableCard}>
      <div className={styles.header}>
        <Text strong>Clients</Text>
        <Space>
          <Button type="default" onClick={onRefresh} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      <div className={styles.filters}>
        <Input.Search
          allowClear
          placeholder="Search clients"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          onSearch={(value) => onSearch(value)}
          style={{ width: 240 }}
        />
        <Select
          allowClear
          placeholder="Client type"
          style={{ width: 180 }}
          value={clientTypeFilter}
          onChange={(val) => onClientTypeChange(val)}
          options={[
            { label: "Government", value: 1 },
            { label: "Private", value: 2 },
            { label: "Partner", value: 3 },
          ]}
        />
        <Select
          allowClear
          placeholder="Status"
          style={{ width: 140 }}
          value={typeof isActiveFilter === "boolean" ? isActiveFilter : undefined}
          onChange={(val) => onStatusChange(val as boolean | undefined)}
          options={[
            { label: "Active", value: true },
            { label: "Inactive", value: false },
          ]}
        />
      </div>

      <div className={styles.tableWrapper}>
        <Table<IClient>
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={data ?? []}
          loading={loading}
          pagination={{
            current: pageNumber ?? 1,
            pageSize: pageSize ?? 25,
            total: totalCount ?? data?.length ?? 0,
            showSizeChanger: true,
          }}
          onChange={onPageChange}
          onRow={(record) => ({
            onClick: () => onRowClick?.(record),
          })}
        />
      </div>
    </div>
  );
};

export default ClientTable;

