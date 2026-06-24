import { Divider, Flex, Form, InputNumber, Button, DatePicker } from 'antd'
import SelectAssetForm from './SelectAssetForm'
import { useState, useEffect, useRef } from 'react'
import CoinIfo from '../CoinInfo'
import AssetWasAdded from './AssetWasAdded'
import { useCrypto } from '../../context/CryptoContext'

const validateMessages = {
  required: '${label} is required!',
  types: {
    number: '${label} is not valid number',
  },
  number: {
    range: '${label} must be between ${min} and ${max} ',
  },
}

export default function AddAssetForm({ closeAssetDrawer }) {
  const [coin, setCoin] = useState(null)
  const [form] = Form.useForm()
  const { addCoinToPortfolio } = useCrypto()
  const [assetAdded, setAssetAdded] = useState(false)

  // Подписка на поле amount, price: обновляется при вводе числа пользователем
  const amount = Form.useWatch('amount', form)
  const price = Form.useWatch('price', form)

  const assetRef = useRef()

  // 1) При смене монеты — устанавливаем исходную цену (только при смене coin)
  useEffect(() => {
    if (!coin) {
      form.setFieldsValue({ price: null, total: null })
      return
    }
    const currentAmount = form.getFieldValue('amount')
    // const currentPrice = form.getFieldValue('price')

    form.setFieldsValue({
      price: +coin.price.toFixed(2),
      total: +(currentAmount * coin.price).toFixed(2),
    })
  }, [coin, form]) // НЕ включаем watched price сюда

  // 2) При изменении amount или при ручной правке price — пересчитываем total
  useEffect(() => {
    // Проверяем, что оба значения — конечные числа (InputNumber обычно даёт number или null)
    if (!Number.isFinite(amount) || !Number.isFinite(price)) {
      form.setFieldsValue({ total: null })
      return
    }

    // Считаем и округляем до 2 знаков как number
    // const total = amount >= 0 ? +(amount * price).toFixed(2) : null
    form.setFieldsValue({
      total: amount >= 0 ? +(amount * price).toFixed(2) : null,
    })
  }, [price, amount, form])

  if (assetAdded) {
    return (
      <AssetWasAdded
        resultAsset={assetRef.current}
        coin={coin}
        closeAssetDrawer={closeAssetDrawer}
        setCoin={setCoin}
        setAssetAdded={setAssetAdded}
      />
    )
  }

  const assetButton = () => form.resetFields(['amount', 'date', 'total'])

  function onFinish (asset) {
    const resultAsset = {
      id: coin.id,
      amount: asset.amount,
      price: asset.price,
      date: asset.date?.$d ?? new Date(),
    }
    assetRef.current = resultAsset
    // setResultAsset(asset)
    setAssetAdded(true)
    assetButton()
    addCoinToPortfolio(resultAsset)
  }

  return (
    <>
      <SelectAssetForm setCoin={setCoin} />
      <Divider />
      {coin && (
        <Form
          form={form}
          name='add-asset'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 10 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          validateMessages={validateMessages}
        >
          <CoinIfo coin={coin} />

          <Divider />

          <Form.Item
            label='Amount'
            name='amount'
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber
              placeholder='Enter coin amount'
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label='Price'
            name='price'
            rules={[{ required: true, type: 'number' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label='Date & Time' name='date'>
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format='YYYY-MM-DD HH:mm'
            />
          </Form.Item>

          <Form.Item label='Total' name='total'>
            <InputNumber disabled style={{ width: '100%' }} />
          </Form.Item>

          <Flex style={{ gap: '20px', marginLeft: '90px' }}>
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Add Asset
              </Button>
            </Form.Item>
            <Form.Item>
              <Button htmlType='button' onClick={assetButton}>
                Reset
              </Button>
            </Form.Item>
          </Flex>
        </Form>
      )}
    </>
  )
}
