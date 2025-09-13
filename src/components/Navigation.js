import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconUpload, IconFile, IconCopy } from '@arco-design/web-react/icon';

/**
 * 全局导航组件
 * 提供应用的主要导航功能，支持响应式设计
 */
const Navigation = () => {
  const location = useLocation();
  
  // 导航菜单配置
  const navItems = [
    {
      path: '/',
      label: '文件上传',
      icon: <IconUpload />,
      description: '上传文件到服务器'
    },
    {
      path: '/list',
      label: '文件下载',
      icon: <IconFile />,
      description: '查看和下载文件'
    },
    {
      path: '/clipboard',
      label: '在线剪贴板',
      icon: <IconCopy />,
      description: '保存和分享文本内容'
    }
  ];

  return (
    <nav className="global-navigation">
      <div className="nav-container">
        {/* 品牌标识 */}
        <div className="nav-brand">
          <div style={{
            width: '40px',
            height: '40px',
            background: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            🐧
          </div>
          <h1>企鹅的文件站</h1>
        </div>
        
        {/* 导航链接 */}
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              title={item.description}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;