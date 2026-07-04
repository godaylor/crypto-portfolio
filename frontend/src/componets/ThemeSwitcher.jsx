import {
  CheckOutlined,
  DesktopOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Space, Tag, Typography } from 'antd'

const menuItems = [
  {
    key: 'dark-modern',
    label: (
      <Space className='theme-switcher-item'>
        <MoonOutlined />
        <span>Темная современная</span>
        <CheckOutlined />
      </Space>
    ),
  },
  {
    key: 'dark-glass',
    disabled: true,
    label: (
      <Space className='theme-switcher-item'>
        <DesktopOutlined />
        <span>Темное стекло</span>
        <Tag>скоро</Tag>
      </Space>
    ),
  },
  {
    key: 'light-modern',
    disabled: true,
    label: (
      <Space className='theme-switcher-item'>
        <DesktopOutlined />
        <span>Светлая современная</span>
        <Tag>скоро</Tag>
      </Space>
    ),
  },
]

export default function ThemeSwitcher() {
  return (
    <Dropdown
      menu={{ items: menuItems, selectable: true, selectedKeys: ['dark-modern'] }}
      placement='bottomRight'
      trigger={['click']}
    >
      <Button className='header-icon-button' type='text'>
        <Space size={8}>
          <MoonOutlined />
          <Typography.Text>Тема</Typography.Text>
        </Space>
      </Button>
    </Dropdown>
  )
}
