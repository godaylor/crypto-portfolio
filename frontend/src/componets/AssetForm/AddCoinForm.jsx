import { useEffect, useRef, useState } from 'react'

import { Button, DatePicker, Divider, Flex, Form, InputNumber } from 'antd'

import CoinInfo from '../CoinInfo'
import CoinAddedMessage from './CoinAddedMessage'
import SelectCoinForm from './SelectCoinForm'

import { useCrypto } from '../../context/CryptoContext'

const validateMessages = {
  required: '${label} is required!',
  types: {
    number: '${label} is not valid number',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
}

export default function AddCoinForm({ closeCoinDrawer }) {
  const [coin, setCoin] = useState(null)
  const [form] = Form.useForm()

  const { addCoinToPortfolio } = useCrypto()

  const [isCoinAdded, setIsCoinAdded] = useState(false)

  // Следим за количеством монет и ценой, чтобы автоматически считать итоговую стоимость покупки.
  const amount = Form.useWatch('amount', form)
  const price = Form.useWatch('price', form)

  const coinToAddRef = useRef()

  // ======================================
  // После выбора новой монеты подставляем её текущую цену и пересчитываем итоговую сумму.
  // ======================================

  useEffect(() => {
    if (!coin) {
      form.setFieldsValue({
        price: null,
        total: null,
      })
      return
    }

    // Сохраняем количество монет, которое пользователь уже ввёл.
    const currentAmount = form.getFieldValue('amount')

    const currentCoinPrice = +coin.price.toFixed(2)

    form.setFieldsValue({
      price: currentCoinPrice,
      total: +(currentAmount * currentCoinPrice).toFixed(2),
    })
  }, [coin, form])

  // ======================================
  // Если пользователь меняет количество монет или цену, пересчитываем итоговую стоимость покупки.
  // ======================================

  useEffect(() => {
    // Если одно из полей пустое, не рассчитываем итоговую стоимость.
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

  // После успешного добавления монеты показываем экран подтверждения.
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

  // Очищаем только те поля, которые пользователь заполняет вручную.
  const resetFormFields = () => form.resetFields(['amount', 'date', 'total'])

  // Создаём новую покупку монеты и добавляем её в портфель пользователя.
  function saveCoin(formValues) {
    const { amount, price, date } = formValues

    const coinToAdd = {
      id: coin.id,
      amount,
      price,
      date: date?.toDate?.() ?? new Date(),
    }

    // Сохраняем данные о покупке монеты.
    coinToAddRef.current = coinToAdd

    // Показываем экран успешного добавления монеты.
    setIsCoinAdded(true)

    // Очищаем поля формы.
    resetFormFields()

    // Добавляем монету в портфель.
    addCoinToPortfolio(coinToAdd)
  }

  return (
    <>
      <SelectCoinForm setCoin={setCoin} />

      <Divider />

      {coin && (
        <Form
          form={form}
          name='add-coin'
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 10 }}
          style={{ maxWidth: 600 }}
          onFinish={saveCoin}
          validateMessages={validateMessages}
        >
          <CoinInfo coin={coin} />

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

          <Flex
            style={{
              gap: 20,
              marginLeft: 90,
            }}
          >
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Add Coin
              </Button>
            </Form.Item>

            <Form.Item>
              <Button htmlType='button' onClick={resetFormFields}>
                Reset
              </Button>
            </Form.Item>
          </Flex>
        </Form>
      )}
    </>
  )
}
