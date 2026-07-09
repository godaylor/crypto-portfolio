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
import {
  CalendarOutlined,
  DollarOutlined,
  FieldNumberOutlined,
  RiseOutlined,
  WalletOutlined,
} from '@ant-design/icons'

import { useCrypto } from '../../context/CryptoContext'
import CoinAddedMessage from './CoinAddedMessage'
import SelectCoinForm from './SelectCoinForm'

const validateMessages = {
  required: '${label} is required',
  types: {
    number: '${label} must be a number',
  },
  number: {
    range: '${label} must be greater than ${min}',
  },
}

function FormSection({ eyebrow, title, description, children }) {
  return (
    <section className='asset-form-section'>
      <Space direction='vertical' size={3}>
        <Typography.Text className='asset-form-eyebrow'>
          {eyebrow}
        </Typography.Text>
        <Typography.Title level={5}>{title}</Typography.Title>
        {description && (
          <Typography.Text type='secondary'>{description}</Typography.Text>
        )}
      </Space>

      <div className='asset-form-section-body'>{children}</div>
    </section>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function SelectedCoinSummary({ coin }) {
  const changeStatus = coin.priceChange1d >= 0 ? 'positive' : 'negative'

  return (
    <Card className='selected-coin-card' bordered={false}>
      <Flex className='selected-coin-summary' align='center' gap={14}>
        <img className='selected-coin-icon' src={coin.icon} alt={coin.name} />

        <div className='selected-coin-copy'>
          <Typography.Text className='selected-coin-label'>
            Selected asset
          </Typography.Text>
          <Typography.Title level={4}>{coin.name}</Typography.Title>
          <Typography.Text type='secondary'>{coin.symbol}</Typography.Text>
        </div>

        <div className='selected-coin-market'>
          <Typography.Text>{formatCurrency(coin.price)}</Typography.Text>
          <span className={`selected-coin-change is-${changeStatus}`}>
            <RiseOutlined />
            {coin.priceChange1d >= 0 ? '+' : ''}
            {coin.priceChange1d.toFixed(2)}%
          </span>
        </div>
      </Flex>
    </Card>
  )
}

export default function AddCoinForm({ closeCoinDrawer, onCoinAddedSuccess }) {
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
    const total = Number.isFinite(currentAmount)
      ? +(currentAmount * currentCoinPrice).toFixed(2)
      : null

    form.setFieldsValue({
      price: currentCoinPrice,
      total,
    })
  }, [coin, form])

  useEffect(() => {
    if (!Number.isFinite(amount) || !Number.isFinite(price)) {
      form.setFieldsValue({
        total: null,
      })
      return
    }

    const total = amount > 0 && price > 0 ? +(amount * price).toFixed(2) : null

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
    onCoinAddedSuccess?.({ coin, coinToAdd })
  }

  return (
    <Space className='add-coin-form-wrapper' direction='vertical' size={18}>
      <Space className='add-coin-form-intro' direction='vertical' size={5}>
        <Typography.Title level={4}>New purchase</Typography.Title>
        <Typography.Text type='secondary'>
          Choose an asset, enter the purchase details, and the dashboard will
          update immediately.
        </Typography.Text>
      </Space>

      <FormSection
        eyebrow='Step 1'
        title='Asset'
        description='Start with the coin or token you want to add to this portfolio.'
      >
        <SelectCoinForm setCoin={setCoin} />
      </FormSection>

      {coin && <SelectedCoinSummary coin={coin} />}

      {coin && (
        <FormSection
          eyebrow='Step 2'
          title='Purchase details'
          description='The current market price is prefilled, but you can adjust it to match your entry.'
        >
          <Form
            className='add-coin-form'
            form={form}
            name='add-coin'
            layout='vertical'
            onFinish={saveCoin}
            validateMessages={validateMessages}
          >
            <div className='asset-form-grid'>
              <Form.Item
                label='Amount'
                name='amount'
                rules={[{ required: true, type: 'number', min: 0.00000001 }]}
              >
                <InputNumber
                  min={0.00000001}
                  placeholder='Enter amount'
                  style={{ width: '100%' }}
                  addonBefore={<FieldNumberOutlined />}
                  addonAfter={coin.symbol}
                />
              </Form.Item>

              <Form.Item
                label='Buy price'
                name='price'
                rules={[{ required: true, type: 'number', min: 0.00000001 }]}
              >
                <InputNumber
                  min={0.00000001}
                  placeholder='Enter buy price'
                  style={{ width: '100%' }}
                  addonBefore={<DollarOutlined />}
                  addonAfter='USD'
                />
              </Form.Item>

              <Form.Item label='Date and time' name='date'>
                <DatePicker
                  placeholder='Select date and time'
                  showTime={{ format: 'HH:mm' }}
                  format='YYYY-MM-DD HH:mm'
                  style={{ width: '100%' }}
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>

              <Form.Item label='Estimated value' name='total'>
                <InputNumber
                  disabled
                  style={{ width: '100%' }}
                  addonBefore={<WalletOutlined />}
                  addonAfter='USD'
                />
              </Form.Item>
            </div>

            <div className='asset-total-preview'>
              <Typography.Text type='secondary'>Transaction value</Typography.Text>
              <Typography.Title level={4}>
                {Number.isFinite(amount) && Number.isFinite(price)
                  ? formatCurrency(amount * price)
                  : 'Enter amount and price'}
              </Typography.Title>
            </div>

            <Flex className='asset-form-actions' justify='flex-end' gap={12}>
              <Button htmlType='button' onClick={resetFormFields}>
                Reset
              </Button>

              <Button type='primary' htmlType='submit'>
                Add to portfolio
              </Button>
            </Flex>
          </Form>
        </FormSection>
      )}

      {!coin && (
        <div className='asset-form-empty-state'>
          <WalletOutlined />
          <Typography.Text type='secondary'>
            Purchase fields will appear here after you select an asset.
          </Typography.Text>
        </div>
      )}
    </Space>
  )
}
