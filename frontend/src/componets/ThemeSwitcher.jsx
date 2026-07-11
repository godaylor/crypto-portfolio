import { CheckOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Dropdown, Space, Typography } from 'antd'

import { appThemes } from '../theme'

const themeOptions = [
  { key: 'premium-dark', icon: <MoonOutlined /> },
  { key: 'apple-light', icon: <SunOutlined /> },
].map((option) => ({ ...option, ...appThemes[option.key] }))

export default function ThemeSwitcher({
  themeName,
  setThemeName,
  className = '',
  placement = 'bottomRight',
  showLabel = false,
}) {
  const currentTheme = themeOptions.find((option) => option.key === themeName)

  const items = themeOptions.map((option) => ({
    key: option.key,
    label: (
      <Space className='theme-menu-item' size={11}>
        <span className='theme-menu-icon'>{option.icon}</span>
        <Space direction='vertical' size={0}>
          <Typography.Text strong>{option.label}</Typography.Text>
          <Typography.Text type='secondary'>{option.description}</Typography.Text>
        </Space>
        {option.key === themeName && <CheckOutlined className='theme-menu-check' />}
      </Space>
    ),
  }))

  return (
    <Dropdown
      overlayClassName='theme-switcher-dropdown'
      menu={{
        items,
        selectable: true,
        selectedKeys: [themeName],
        onClick: ({ key }) => setThemeName(key),
      }}
      placement={placement}
      trigger={['click']}
    >
      <Button
        className={`theme-switcher ${className}`.trim()}
        icon={currentTheme?.icon}
        type='text'
        aria-label={`Theme: ${currentTheme?.label ?? 'Theme'}`}
      >
        {showLabel ? currentTheme?.label : null}
      </Button>
    </Dropdown>
  )
}
