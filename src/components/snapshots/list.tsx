import type { Types as TListSnapshots } from "~/api/types/snapshots";

type SnapshotsListProps = {
  snapshots: TListSnapshots | undefined;
};

export default function SnapshotsList({ snapshots }: SnapshotsListProps) {
  if (!snapshots) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Uuid
            </th>
            <th scope="col" className="px-6 py-3">
              Username
            </th>
            <th scope="col" className="px-6 py-3">
              Hostname
            </th>
            <th scope="col" className="px-6 py-3">
              Date
            </th>
            <th scope="col" className="px-6 py-3">
              Directories
            </th>
            <th scope="col" className="px-6 py-3">
              Files
            </th>
            <th scope="col" className="px-6 py-3">
              Size
            </th>
          </tr>
        </thead>
        <tbody>
          {snapshots.Headers.map((snapshot) => (
            <tr
              className="border-b odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800"
              key={snapshot.IndexID}
            >
              <td className="px-6 py-4">{snapshot.IndexID}</td>
              <td className="px-6 py-4">{snapshot.Username}</td>
              <td className="px-6 py-4">{snapshot.Hostname}</td>
              <td className="px-6 py-4">
                {new Date(snapshot.CreationTime).toISOString()}
              </td>
              <td className="px-6 py-4">{snapshot.DirectoriesCount}</td>
              <td className="px-6 py-4">{snapshot.FilesCount}</td>
              <td className="px-6 py-4">{snapshot.ChunksSize}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
