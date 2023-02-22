import React, { ReactNode } from "react";

interface TableColumn {
  header: string;
  accessor: string;
  render?: (data: any) => ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
}

function Table({ columns, data }: TableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={column.accessor}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td key={column.accessor} className="px-6 py-4 whitespace-nowrap">
                {column.render
                  ? column.render(row[column.accessor])
                  : row[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
