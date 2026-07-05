import {
  CheckOutlined,
  ExperimentOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Space, Typography } from 'antd'

const themes = [
  {
    key: 'dark-modern',
    label: 'Dark Modern',
    description: 'Контрастная темная тема',
    icon: <MoonOutlined />,
  },
  {
    key: 'dark-glass',
    label: 'Dark Glass',
    description: 'Glassmorphism с глубиной',
    icon: <ExperimentOutlined />,
  },
  {
    key: 'light-modern',
    label: 'Light Modern',
    description: 'Светлая премиальная тема',
    icon: <SunOutlined />,
  },
]

export default function ThemeSwitcher({ themeName, setThemeName }) {
  const currentTheme = themes.find((theme) => theme.key === themeName)

  const menuItems = themes.map((theme) => ({
    key: theme.key,
    label: (
      <Space className='theme-switcher-item' size={12}>
        <span className='theme-switcher-icon'>{theme.icon}</span>

        <Space direction='vertical' size={0}>
          <Typography.Text>{theme.label}</Typography.Text>
          <Typography.Text type='secondary'>
            {theme.description}
          </Typography.Text>
        </Space>

        {theme.key === themeName && <CheckOutlined />}
      </Space>
    ),
  }))

  return (
    <Dropdown
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: [themeName],
        onClick: ({ key }) => setThemeName(key),
      }}
      placement='bottomRight'
      trigger={['click']}
    >
      <Button className='header-icon-button theme-trigger' type='text'>
        <Space size={8}>
          {currentTheme?.icon}
          <Typography.Text>{currentTheme?.label ?? 'Theme'}</Typography.Text>
        </Space>
      </Button>
    </Dropdown>
  )
}
