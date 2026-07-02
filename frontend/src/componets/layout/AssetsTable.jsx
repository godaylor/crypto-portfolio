import { Table } from 'antd'

import { useCrypto } from '../../context/CryptoContext'

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    sortDirections: ['descend'],
  },
  {
    title: 'Price, $',
    dataIndex: 'price',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.amount - b.amount,
  },
]

export default function AssetsTable() {
  const { userPortfolio } = useCrypto()

  // Подготавливаем данные
  // для отображения в таблице.
  const tableData = userPortfolio.map((portfolioCoin) => ({
    key: portfolioCoin.id,
    name: portfolioCoin.name,
    price: portfolioCoin.price,
    amount: portfolioCoin.amount,
  }))

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={false}
    />
  )
}