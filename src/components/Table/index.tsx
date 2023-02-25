import { TableProps } from "./type";

function Table({ columns, data }: TableProps) {
  return (
    <table className="w-full divide-y divide-gray-200 text-center">
      <thead className="bg-gray-50 whitespace-nowrap">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className="px-6 py-3 text-sm text-gray-600 font-semibold uppercase tracking-wider"
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td
                key={column.key}
                className="px-6 py-4 whitespace-nowrap text-center"
              >
                {row[column.key] ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
