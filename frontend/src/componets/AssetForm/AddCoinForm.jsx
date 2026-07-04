import { useEffect, useRef, useState } from 'react'

import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  InputNumber,
  Space,
  Typography,
} from 'antd'

import CoinInfo from '../CoinInfo'
import CoinAddedMessage from './CoinAddedMessage'
import SelectCoinForm from './SelectCoinForm'

import { useCrypto } from '../../context/CryptoContext'

const validateMessages = {
  required: 'Поле "${label}" обязательно для заполнения',
  types: {
    number: 'Поле "${label}" должно быть числом',
  },
  number: {
    range: 'Поле "${label}" должно быть от ${min} до ${max}',
  },
}

export default function AddCoinForm({ closeCoinDrawer }) {
  const [coin, setCoin] = useState(null)
  const [form] = Form.useForm()

  const { addCoinToPortfolio } = useCrypto()

  const [isCoinAdded, setIsCoinAdded] = useState(false)

  const amount = Form.useWatch('amount', form)
  const price = Form.useWatch('price', form)

  const coinToAddRef = useRef()

  useEffect(() => {
    if (!coin) {
      form.setFieldsValue({
        price: null,
        total: null,
      })
      return
    }

    const currentAmount = form.getFieldValue('amount')
    const currentCoinPrice = +coin.price.toFixed(2)

    form.setFieldsValue({
      price: currentCoinPrice,
      total: +(currentAmount * currentCoinPrice).toFixed(2),
    })
  }, [coin, form])

  useEffect(() => {
    if (!Number.isFinite(amount) || !Number.isFinite(price)) {
      form.setFieldsValue({
        total: null,
      })
      return
    }

    const total = amount >= 0 ? +(amount * price).toFixed(2) : null

    form.setFieldsValue({
      total,
    })
  }, [amount, price, form])

  if (isCoinAdded) {
    return (
      <CoinAddedMessage
        coinToAdd={coinToAddRef.current}
        coin={coin}
        closeCoinDrawer={closeCoinDrawer}
        setCoin={setCoin}
        setIsCoinAdded={setIsCoinAdded}
      />
    )
  }

  const resetFormFields = () => form.resetFields(['amount', 'date', 'total'])

  function saveCoin(formValues) {
    const { amount, price, date } = formValues

    const coinToAdd = {
      id: coin.id,
      amount,
      price,
      date: date?.toDate?.() ?? new Date(),
    }

    coinToAddRef.current = coinToAdd
    setIsCoinAdded(true)
    resetFormFields()
    addCoinToPortfolio(coinToAdd)
  }

  return (
    <Space className='add-coin-form-wrapper' direction='vertical' size={20}>
      <Space direction='vertical' size={4}>
        <Typography.Title level={4}>Новая покупка</Typography.Title>
        <Typography.Text type='secondary'>
          Выберите монету и укажите параметры сделки.
        </Typography.Text>
      </Space>

      <SelectCoinForm setCoin={setCoin} />

      {coin && (
        <Card className='selected-coin-card'>
          <CoinInfo coin={coin} />
        </Card>
      )}

      {coin && (
        <Form
          className='add-coin-form'
          form={form}
          name='add-coin'
          layout='vertical'
          onFinish={saveCoin}
          validateMessages={validateMessages}
        >
          <Form.Item
            label='Количество'
            name='amount'
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber
              placeholder='Введите количество'
              style={{ width: '100%' }}
              addonAfter={coin.symbol}
            />
          </Form.Item>

          <Form.Item
            label='Цена за монету'
            name='price'
            rules={[{ required: true, type: 'number' }]}
          >
            <InputNumber
              placeholder='Введите цену покупки'
              style={{ width: '100%' }}
              addonAfter='USD'
            />
          </Form.Item>

          <Form.Item label='Дата и время' name='date'>
            <DatePicker
              placeholder='Выберите дату и время'
              showTime={{ format: 'HH:mm' }}
              format='YYYY-MM-DD HH:mm'
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label='Итого' name='total'>
            <InputNumber
              disabled
              style={{ width: '100%' }}
              addonAfter='USD'
            />
          </Form.Item>

          <Flex justify='flex-end' gap={12}>
            <Button htmlType='button' onClick={resetFormFields}>
              Сбросить
            </Button>

            <Button type='primary' htmlType='submit'>
              Добавить монету
            </Button>
          </Flex>
        </Form>
      )}
    </Space>
  )
}
