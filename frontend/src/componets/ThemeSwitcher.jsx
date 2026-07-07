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

function getClassName(...classNames) {
  return classNames.filter(Boolean).join(' ')
}

export default function ThemeSwitcher({
  themeName,
  setThemeName,
  className = '',
  placement = 'bottomRight',
  showLabel = true,
  variant = 'header',
}) {
  const currentTheme = themes.find((theme) => theme.key === themeName)
  const triggerClassName = getClassName(
    'header-icon-button',
    'theme-trigger',
    `theme-trigger-${variant}`,
    !showLabel && 'is-icon-only'
  )

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
      overlayClassName='theme-switcher-dropdown'
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: [themeName],
        onClick: ({ key }) => setThemeName(key),
      }}
      placement={placement}
      trigger={['click']}
    >
      <Button
        className={getClassName('theme-switcher', className, triggerClassName)}
        type='text'
        aria-label={`Theme: ${currentTheme?.label ?? 'Theme'}`}
      >
        <Space className='theme-trigger-content' size={8}>
          <span className='theme-trigger-icon'>{currentTheme?.icon}</span>
          {showLabel && (
            <Typography.Text className='theme-trigger-label'>
              {currentTheme?.label ?? 'Theme'}
            </Typography.Text>
          )}
        </Space>
      </Button>
    </Dropdown>
  )
}
