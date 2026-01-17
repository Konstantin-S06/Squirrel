import React from 'react';
import styles from './QuestsTable.module.css';

interface QuestsTableProps {
  courseName: string;
}

interface Quest {
  id: number;
  name: string;
  deadline: string;
  status: 'Complete' | 'Incomplete' | 'Pending';
}

const QuestsTable: React.FC<QuestsTableProps> = ({ courseName }) => {
  const quests: Quest[] = [
    { id: 1, name: 'Assignment 1', deadline: '2026-01-25', status: 'Complete' },
    { id: 2, name: 'Quiz 1', deadline: '2026-01-28', status: 'Complete' },
    { id: 3, name: 'Assignment 2', deadline: '2026-02-05', status: 'Incomplete' },
    { id: 4, name: 'Midterm Prep', deadline: '2026-02-12', status: 'Pending' },
    { id: 5, name: 'Lab 3', deadline: '2026-02-15', status: 'Incomplete' },
    { id: 6, name: 'Quiz 2', deadline: '2026-02-20', status: 'Pending' },
    { id: 7, name: 'Assignment 3', deadline: '2026-02-28', status: 'Incomplete' },
    { id: 8, name: 'Final Project Proposal', deadline: '2026-03-05', status: 'Pending' },
  ];

  const getStatusClass = (status: Quest['status']) => {
    switch (status) {
      case 'Complete':
        return styles.statusComplete;
      case 'Incomplete':
        return styles.statusIncomplete;
      case 'Pending':
        return styles.statusPending;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{courseName} Quests</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.headerCell}>Quest</th>
              <th className={styles.headerCell}>Deadline</th>
              <th className={styles.headerCell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {quests.map((quest) => (
              <tr key={quest.id} className={styles.row}>
                <td className={styles.cell}>{quest.name}</td>
                <td className={styles.cell}>{quest.deadline}</td>
                <td className={styles.cell}>
                  <span className={`${styles.status} ${getStatusClass(quest.status)}`}>
                    {quest.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestsTable;
