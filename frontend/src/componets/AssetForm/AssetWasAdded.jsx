import { Result, Button } from 'antd'

export default function AssetWasAdded({
  resultAsset,
  coin,
  closeAssetDrawer,
  setCoin,
  setAssetAdded,
}) {
  console.log(resultAsset)

  return (
    <Result
      status='success'
      title='New Asset Added'
      subTitle={`Added ${resultAsset.amount} of ${coin.name} by price ${resultAsset.price}`}
      extra={[
        <Button type='primary' key='console' onClick={closeAssetDrawer}>
          Close
        </Button>,
        <Button
          key='buy'
          onClick={() => {
            ;(setAssetAdded(false), setCoin(null))
          }}
        >
          Add More
        </Button>,
      ]}
    />
  )
}
